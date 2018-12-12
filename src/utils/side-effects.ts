import {
	merge,
	AsyncSubject,
	OperatorFunction,
	of,
	never,
	empty,
	pipe,
	combineLatest,
	race,
} from 'rxjs';
import {
	first,
	map,
	switchMap,
	defaultIfEmpty,
	catchError,
	startWith,
	filter,
	share,
} from 'rxjs/operators';
import { Entry, TypeCondition } from './types';
import { Observable } from 'rxjs';
import { materialize, dematerialize } from 'rxjs/operators';

const pureKey = Symbol('pure');
const suppressedKey = Symbol('suppressed');
const functionalSideKey = Symbol('functionalSide');

export interface SideEffectMetadata {
	[key: string]: any;
	[pureKey]?: boolean;
	[suppressedKey]?: boolean;
}

export type SideEffectFunc<T = any> = (...args: any[]) => T;
export type SideEffectTypedFunc<TArgs extends any[], T> = (...args: TArgs) => T;
export interface SideEffect<T = any> {
	(): void;
	args: any[];
	sideEffect: SideEffectFunc<T>;
	completed: Observable<T>;
	cancelled: Observable<true>;
	[functionalSideKey]: FunctionalSide<T>;
	cancel(): void;
	clone(): SideEffect<T>;
	cloneEffect(): SideEffect<T>;
	metadata: SideEffectMetadata;
	resultFromRanEffect(throwIfDidntRun?: true): T;
	resultFromRanEffect(throwIfDidntRun: false): T | undefined;
}
export interface TypedSideEffect<TArgs extends any[], T> extends SideEffect<T> {
	args: TArgs;
	sideEffect: SideEffectTypedFunc<TArgs, T>;
	clone(): TypedSideEffect<TArgs, T>;
	cloneEffect(): TypedSideEffect<TArgs, T>;
}

interface FunctionalSide<T> {
	cancel(): void;
	result(item: T): void;
	error(err: any): void;
	clone(): FunctionalSide<T>;
	readonly completed: Observable<T>;
	readonly cancelled: Observable<true>;
}

class FunctioningFunctionalSide<T> implements FunctionalSide<T> {
	private readonly _chainedFunctionality?: FunctionalSide<T>;
	private readonly _completion = new AsyncSubject<T>();
	private readonly _cancellation = new AsyncSubject<true>();

	public readonly completed: Observable<T>;
	public readonly cancelled: Observable<true>;
	constructor(chainedFunctionality?: FunctionalSide<any>) {
		this._chainedFunctionality = chainedFunctionality;

		this.completed = this._completion.asObservable();
		this.cancelled = this._cancellation.asObservable();

		if (chainedFunctionality) {
			this.completed = merge(
				this.completed,
				chainedFunctionality.completed.pipe(
					materialize(),
					filter(({ kind }) => kind !== 'next'),
					dematerialize()
				)
			);

			this.cancelled = merge(
				this.cancelled,
				chainedFunctionality.cancelled,
				first()
			);
		}
	}

	public clone() {
		return new FunctioningFunctionalSide<T>(this._chainedFunctionality);
	}

	public cancel() {
		this._cancellation.next(true);
		this._cancellation.complete();

		this._completion.complete();
	}

	public error(err: any) {
		this._cancellation.complete();

		this._completion.error(err);
	}

	public result(result: T) {
		this._cancellation.complete();

		this._completion.next(result);
		this._completion.complete();
	}
}

class SuppressedFunctionalSide<T> implements FunctionalSide<T> {
	public readonly completed = empty();
	public readonly cancelled = empty();

	public clone() {
		return new SuppressedFunctionalSide();
	}
	public cancel() {}
	public error(err: any) {}
	public result(item: T) {}
}

class MergedFunctionalSide<T1, T2> implements FunctionalSide<[T1, T2]> {
	public readonly completed: Observable<[T1, T2]>;
	public readonly cancelled: Observable<true>;

	constructor(
		private readonly first: FunctionalSide<T1>,
		private readonly second: FunctionalSide<T2>
	) {
		this.completed = combineLatest(first.completed, second.completed);
		this.cancelled = race(first.cancelled, second.cancelled);
	}

	public clone() {
		return new MergedFunctionalSide(this.first, this.second);
	}

	public cancel() {
		this.first.cancel();
		this.second.cancel();
	}

	public error(err: any) {
		this.first.error(err);
		this.second.error(err);
	}

	public result(result: [T1, T2]) {
		const [ first, second ] = result;

		this.first.result(first);
		this.second.result(second);
	}
}

const sideEffects = new WeakSet<SideEffect>();

/**
 * Creates side effect function, that can be introspcted, and having side-effect-completion observable
 *
 * @param sideEffect The side-effect causing function
 * @param args Arguments for that function
 *
 * @return SideEffect function
 */
export function createSideEffect<TArgs extends any[], T>(
	sideEffect: SideEffectTypedFunc<TArgs, T>,
	...args: TArgs
): TypedSideEffect<TArgs, T>;
/**
 * Creates side effect function, that can be introspcted, and having side-effect-completion observable
 *
 * @param type A string represting the side effect (for later discrimination)
 * @param sideEffect The side-effect causing function
 * @param args Arguments for that function
 *
 * @return SideEffect function
 */
export function createSideEffect<TArgs extends any[], T>(
	metadata: SideEffectMetadata,
	sideEffect: SideEffectTypedFunc<TArgs, T>,
	...args: TArgs
): TypedSideEffect<TArgs, T>;
export function createSideEffect<TArgs extends any[], T = any>(
	sideEffectOrMetadata: SideEffectTypedFunc<TArgs, T> | SideEffectMetadata,
	argOrSideEffect: any | SideEffectTypedFunc<TArgs, T>,
	...args: TArgs
): TypedSideEffect<TArgs, T> {
	let sideEffect: SideEffectTypedFunc<TArgs, T>, metadata: SideEffectMetadata;

	// Infer which overload was called
	if (typeof sideEffectOrMetadata === 'object') {
		metadata = sideEffectOrMetadata;
		sideEffect = argOrSideEffect;
	}
	else {
		sideEffect = sideEffectOrMetadata;
		metadata = {};
		args.unshift(argOrSideEffect);
	}

	return buildSideEffect(
		new FunctioningFunctionalSide(),
		{
			...metadata,
			[pureKey]: false,
			[suppressedKey]: false,
		},
		sideEffect,
		args
	);
}

function buildSideEffect<TArgs extends any[], T>(
	functionalSide: FunctionalSide<T>,
	metadata: SideEffectMetadata,
	sideEffect: SideEffectTypedFunc<TArgs, T>,
	args: TArgs
): TypedSideEffect<TArgs, T> {
	// Side effect state, an subjects to consume completion/cancellation
	let didRun = false,
		didCancel = false,
		result: () => T | undefined;

	// Assign SideEffect properties to sideEffectsFunc
	Object.assign(sideEffectFunc, {
		[functionalSideKey]: functionalSide,
		metadata,
		sideEffect,
		args,
		completed: functionalSide.completed,
		cancelled: functionalSide.cancelled,

		cloneEffect: () =>
			buildSideEffect(functionalSide.clone(), metadata, sideEffect, args),
		clone(this: TypedSideEffect<TArgs, T>) {
			return buildSideEffect(functionalSide, metadata, sideEffect, args);
		},

		cancel: () => {
			didCancel = true;
			functionalSide.cancel();
		},

		resultFromRanEffect(
			this: TypedSideEffect<TArgs, T>,
			throwIfDidntRun?: boolean
		) {
			throwIfDidntRun =
				typeof throwIfDidntRun === 'boolean' ? throwIfDidntRun : true;

			if (!didRun && throwIfDidntRun) {
				throw new Error('Side effect did not run');
			}
			else if (!didRun) {
				return;
			}

			return result();
		},
	});

	sideEffects.add(sideEffectFunc as any);

	return sideEffectFunc as TypedSideEffect<TArgs, T>;

	/**
	 * A wrapper around the side effect to check cancellation, and send back result
	 */
	function sideEffectFunc(): void {
		if (!didCancel && !didRun) {
			didRun = true;
			try {
				const runResult = sideEffect(...(args as any));

				if (didCancel) {
					return;
				}

				result = () => runResult;

				functionalSide.result(runResult);
			} catch (err) {
				result = () => {
					throw err;
				};

				functionalSide.error(err);
			}
		}
	}
}

// tslint:disable-next-line:no-namespace
export namespace createSideEffect {
	export function from<T>(val: T): TypedSideEffect<[T], T> {
		const result = buildSideEffect(
			new FunctioningFunctionalSide<T>(),
			{ [pureKey]: true },
			val => val,
			[ val ] as [T]
		);

		result();

		return result;
	}

	export function cancelled<T>(): SideEffect<T> {
		const se = createSideEffect(() => {
			throw new Error('Should not run');
		});
		se.cancel();

		return se;
	}

	export function fail<T>(err: any): SideEffect<T> {
		return createSideEffect(err => {
			throw err;
		}, err);
	}

	export function isSideEffect<T>(val: any): val is SideEffect<T> {
		return typeof val === 'function' && sideEffects.has(val);
	}
}

type HigherOrderSideEffect<TArgs extends any[], T> = TypedSideEffect<
	TArgs,
	SideEffect<T>
>;

function flatSideEffect<TArgs extends any[], T>(
	se:
		| HigherOrderSideEffect<TArgs, T>
		| HigherOrderSideEffect<TArgs, HigherOrderSideEffect<any[], T>>
): TypedSideEffect<TArgs, T> {
	return createSideEffect(
		se.metadata,
		(...args: TArgs) => {
			let currentSE: SideEffect | undefined = se;
			let result: any;

			do {
				currentSE();
				result = currentSE.resultFromRanEffect();

				currentSE = createSideEffect.isSideEffect(result)
					? result
					: undefined;
			} while (currentSE);

			return result;
		},
		...se.args
	);
}

export function flattenSE<TArgs extends any[], T>(): OperatorFunction<
	| HigherOrderSideEffect<TArgs, T>
	| HigherOrderSideEffect<TArgs, HigherOrderSideEffect<any[], T>>,
	SideEffect<T>
> {
	return obs => obs.pipe(map(flatSideEffect));
}

export interface Box<T> {
	item: T;
}
export type CancellationHandling<T> = () => Box<T> | undefined;
export interface FailureHandling<T> {
	ifCancelled?: CancellationHandling<T>;
	ifFailed?: (err: any) => T;
}

export function bindOperator<T, R, TArgs extends any[]>(
	operator: (...args: TArgs) => OperatorFunction<T, R>
): (...args: TArgs) => OperatorFunction<SideEffect<T>, SideEffect<R>> {
	return (...args: TArgs) => bindOperation(operator(...args));
}

export function bindOperation<T, R>(
	operator: OperatorFunction<T, R>,
	cancellationHandling?: CancellationHandling<T>
): OperatorFunction<SideEffect<T>, SideEffect<R>> {
	return obs => {
		obs = obs.pipe(share());

		const results = obs.pipe(
			switchMap(se => {
				if (!cancellationHandling || !se.cancelled) {
					return se.completed;
				}

				const handleCancellation = cancellationHandling();

				return handleCancellation
					? of(handleCancellation.item)
					: empty();
			}),
			operator
		);

		return merge(
			obs.pipe(map(suppress)),
			results.pipe(map(createSideEffect.from))
		);
	};
}

type MaybeSideEffect<T> = T | SideEffect<T>;
export function bind<T>(
	observable: Observable<SideEffect<T>> | SideEffect<T>
): Observable<SideEffect<T>>;
export function bind<T, R>(
	observable: Observable<SideEffect<T>> | SideEffect<T>,
	operation1: OperatorFunction<T, MaybeSideEffect<R>>
): Observable<SideEffect<R>>;
export function bind<T, A, R>(
	observable: Observable<SideEffect<T>> | SideEffect<T>,
	operation1: OperatorFunction<T, MaybeSideEffect<A>>,
	operation2: OperatorFunction<A, MaybeSideEffect<R>>
): Observable<SideEffect<R>>;
export function bind<T, A, B, R>(
	observable: Observable<SideEffect<T>> | SideEffect<T>,
	operation1: OperatorFunction<T, MaybeSideEffect<A>>,
	operation2: OperatorFunction<A, MaybeSideEffect<B>>,
	operation3: OperatorFunction<B, MaybeSideEffect<R>>
): Observable<SideEffect<R>>;
export function bind<T, A, B, C, R>(
	observable: Observable<SideEffect<T>> | SideEffect<T>,
	operation1: OperatorFunction<T, MaybeSideEffect<A>>,
	operation2: OperatorFunction<A, MaybeSideEffect<B>>,
	operation3: OperatorFunction<B, MaybeSideEffect<C>>,
	operation4: OperatorFunction<C, MaybeSideEffect<R>>
): Observable<SideEffect<R>>;
export function bind<T, A, B, C, D, R>(
	observable: Observable<SideEffect<T>> | SideEffect<T>,
	operation1: OperatorFunction<T, MaybeSideEffect<A>>,
	operation2: OperatorFunction<A, MaybeSideEffect<B>>,
	operation3: OperatorFunction<B, MaybeSideEffect<C>>,
	operation4: OperatorFunction<C, MaybeSideEffect<D>>,
	operation5: OperatorFunction<D, MaybeSideEffect<R>>
): Observable<SideEffect<R>>;
export function bind<T, A, B, C, D, E, R>(
	observable: Observable<SideEffect<T>> | SideEffect<T>,
	operation1: OperatorFunction<T, MaybeSideEffect<A>>,
	operation2: OperatorFunction<A, MaybeSideEffect<B>>,
	operation3: OperatorFunction<B, MaybeSideEffect<C>>,
	operation4: OperatorFunction<C, MaybeSideEffect<D>>,
	operation5: OperatorFunction<D, MaybeSideEffect<E>>,
	operation6: OperatorFunction<E, MaybeSideEffect<R>>
): Observable<SideEffect<R>>;
export function bind<T, A, B, C, D, E, F, R>(
	observable: Observable<SideEffect<T>> | SideEffect<T>,
	operation1: OperatorFunction<T, MaybeSideEffect<A>>,
	operation2: OperatorFunction<A, MaybeSideEffect<B>>,
	operation3: OperatorFunction<B, MaybeSideEffect<C>>,
	operation4: OperatorFunction<C, MaybeSideEffect<D>>,
	operation5: OperatorFunction<D, MaybeSideEffect<E>>,
	operation6: OperatorFunction<E, MaybeSideEffect<F>>,
	operation7: OperatorFunction<F, MaybeSideEffect<R>>
): Observable<SideEffect<R>>;
export function bind<T, A, B, C, D, E, F, G, R>(
	observable: Observable<SideEffect<T>> | SideEffect<T>,
	operation1: OperatorFunction<T, MaybeSideEffect<A>>,
	operation2: OperatorFunction<A, MaybeSideEffect<B>>,
	operation3: OperatorFunction<B, MaybeSideEffect<C>>,
	operation4: OperatorFunction<C, MaybeSideEffect<D>>,
	operation5: OperatorFunction<D, MaybeSideEffect<E>>,
	operation6: OperatorFunction<E, MaybeSideEffect<F>>,
	operation7: OperatorFunction<F, MaybeSideEffect<G>>,
	operation8: OperatorFunction<G, MaybeSideEffect<R>>
): Observable<SideEffect<R>>;
export function bind<T, A, B, C, D, E, F, G, H, R>(
	observable: Observable<SideEffect<T>> | SideEffect<T>,
	operation1: OperatorFunction<T, MaybeSideEffect<A>>,
	operation2: OperatorFunction<A, MaybeSideEffect<B>>,
	operation3: OperatorFunction<B, MaybeSideEffect<C>>,
	operation4: OperatorFunction<C, MaybeSideEffect<D>>,
	operation5: OperatorFunction<D, MaybeSideEffect<E>>,
	operation6: OperatorFunction<E, MaybeSideEffect<F>>,
	operation7: OperatorFunction<F, MaybeSideEffect<G>>,
	operation8: OperatorFunction<G, MaybeSideEffect<H>>,
	operation9: OperatorFunction<H, MaybeSideEffect<R>>
): Observable<SideEffect<R>>;
export function bind<T, A, B, C, D, E, F, G, H, I, R>(
	observable: Observable<SideEffect<T>> | SideEffect<T>,
	operation1: OperatorFunction<T, MaybeSideEffect<A>>,
	operation2: OperatorFunction<A, MaybeSideEffect<B>>,
	operation3: OperatorFunction<B, MaybeSideEffect<C>>,
	operation4: OperatorFunction<C, MaybeSideEffect<D>>,
	operation5: OperatorFunction<D, MaybeSideEffect<E>>,
	operation6: OperatorFunction<E, MaybeSideEffect<F>>,
	operation7: OperatorFunction<F, MaybeSideEffect<G>>,
	operation8: OperatorFunction<G, MaybeSideEffect<H>>,
	operation9: OperatorFunction<H, MaybeSideEffect<I>>,
	operation10: OperatorFunction<I, MaybeSideEffect<R>>
): Observable<SideEffect<R>>;
export function bind<T, A, B, C, D, E, F, G, H, I, J, R>(
	observable: Observable<SideEffect<T>> | SideEffect<T>,
	operation1: OperatorFunction<T, MaybeSideEffect<A>>,
	operation2: OperatorFunction<A, MaybeSideEffect<B>>,
	operation3: OperatorFunction<B, MaybeSideEffect<C>>,
	operation4: OperatorFunction<C, MaybeSideEffect<D>>,
	operation5: OperatorFunction<D, MaybeSideEffect<E>>,
	operation6: OperatorFunction<E, MaybeSideEffect<F>>,
	operation7: OperatorFunction<F, MaybeSideEffect<G>>,
	operation8: OperatorFunction<G, MaybeSideEffect<H>>,
	operation9: OperatorFunction<H, MaybeSideEffect<I>>,
	operation10: OperatorFunction<I, MaybeSideEffect<J>>,
	operation11: OperatorFunction<J, MaybeSideEffect<R>>
): Observable<SideEffect<R>>;
export function bind<T, A, B, C, D, E, F, G, H, I, J, K, R>(
	observable: Observable<SideEffect<T>> | SideEffect<T>,
	operation1: OperatorFunction<T, MaybeSideEffect<A>>,
	operation2: OperatorFunction<A, MaybeSideEffect<B>>,
	operation3: OperatorFunction<B, MaybeSideEffect<C>>,
	operation4: OperatorFunction<C, MaybeSideEffect<D>>,
	operation5: OperatorFunction<D, MaybeSideEffect<E>>,
	operation6: OperatorFunction<E, MaybeSideEffect<F>>,
	operation7: OperatorFunction<F, MaybeSideEffect<G>>,
	operation8: OperatorFunction<G, MaybeSideEffect<H>>,
	operation9: OperatorFunction<H, MaybeSideEffect<I>>,
	operation10: OperatorFunction<I, MaybeSideEffect<J>>,
	operation11: OperatorFunction<J, MaybeSideEffect<K>>,
	operation12: OperatorFunction<K, MaybeSideEffect<R>>
): Observable<SideEffect<R>>;
export function bind<T, R>(
	observable: Observable<SideEffect<T>> | SideEffect<T>,
	...operations: OperatorFunction<any, any>[]
): Observable<SideEffect<R>>;
export function bind<T, R>(
	observable: Observable<SideEffect<T>> | SideEffect<T>,
	...operations: OperatorFunction<any, any>[]
): Observable<SideEffect<R>> {
	if (operations.length === 0) {
		return observable as any;
	}

	if (createSideEffect.isSideEffect(observable)) {
		observable = of(observable);
	}

	return operations.reduce((inputObs: Observable<SideEffect>, operation) => {
		inputObs = share<SideEffect>()(inputObs);

		return merge(
			map(suppress)(inputObs),
			inputObs.pipe(
				switchMap(
					maybeSe =>
						createSideEffect.isSideEffect(maybeSe)
							? maybeSe.completed
							: of(maybeSe)
				),
				operation
			)
		);
	}, observable);
}

export function lift<T>(
	observable: Observable<T>
): Observable<SideEffect<TypeCondition<T, SideEffect, SideEffect<T>, T>>> {
	return observable.pipe(
		map(
			item =>
				createSideEffect.isSideEffect(item)
					? item
					: createSideEffect.from(item)
		)
	) as any;
}

function suppress<T>(se: SideEffect<T>): SideEffect<never>;
function suppress<TArgs extends any[], T>(
	se: TypedSideEffect<TArgs, T>
): TypedSideEffect<TArgs, never>;
function suppress<TArgs extends any[], T>(
	se: TypedSideEffect<TArgs, T>
): TypedSideEffect<TArgs, never> {
	if (se.metadata[suppressedKey]) {
		return se as any;
	}

	return buildSideEffect<TArgs, never>(
		new SuppressedFunctionalSide<T>(),
		{
			...se.metadata,
			[suppressedKey]: true,
		},
		(...args: TArgs) => se() as never,
		se.args
	);
}

export function combineSideEffects<T1, T2>(
	args: [MaybeSideEffect<T1>, MaybeSideEffect<T2>]
): SideEffect<[T1, T2]>;
export function combineSideEffects<T1, T2>(
	first: MaybeSideEffect<T1>,
	second: MaybeSideEffect<T2>
): SideEffect<[T1, T2]>;
export function combineSideEffects<T1, T2>(
	firstOrArgs:
		| MaybeSideEffect<T1>
		| [MaybeSideEffect<T1>, MaybeSideEffect<T2>],
	maybeSecond?: MaybeSideEffect<T2>
): SideEffect<[T1, T2]> {
	if (arguments.length === 1) {
		if (!Array.isArray(firstOrArgs) || firstOrArgs.length < 2) {
			throw new Error('Missing argument');
		}

		[ firstOrArgs, maybeSecond ] = firstOrArgs;
	}

	const first = firstOrArgs,
		second = maybeSecond;

	if (
		createSideEffect.isSideEffect(first) &&
		createSideEffect.isSideEffect(second)
	) {
		return combineSEs(first, second);
	}
	else if (createSideEffect.isSideEffect(first)) {
		return buildSideEffect(
			new FunctioningFunctionalSide(first[functionalSideKey]),
			{
				first: first.metadata,
				[suppressedKey]: first.metadata[suppressedKey],
				[pureKey]: first.metadata[pureKey],
			},
			([ firstArgs, sec ]: [any[], T2]) => {
				first();

				return [ first.resultFromRanEffect(), second ] as [T1, T2];
			},
			[ [ first.args, second ] ]
		);
	}
	else if (createSideEffect.isSideEffect(second)) {
		return buildSideEffect(
			new FunctioningFunctionalSide(second[functionalSideKey]),
			{
				second: second.metadata,
				[suppressedKey]: second.metadata[suppressedKey],
				[pureKey]: second.metadata[pureKey],
			},
			([ first, secArgs ]: [T1, any[]]) => {
				second();

				return [ first, second.resultFromRanEffect() ] as [T1, T2];
			},
			[ [ first, second.args ] ]
		);
	}
	else {
		return createSideEffect.from([ first, second ] as [T1, T2]);
	}
}

function combineSEs<T1, T2>(first: SideEffect<T1>, second: SideEffect<T2>) {
	return buildSideEffect(
		new MergedFunctionalSide(
			first[functionalSideKey],
			second[functionalSideKey]
		),
		{
			first: first.metadata,
			second: second.metadata,
			[suppressedKey]:
				first.metadata[suppressedKey] || second.metadata[suppressedKey],
			[pureKey]: first.metadata[pureKey] && second.metadata[pureKey],
		},
		([ firstArgs, secArgs ]: [any[], any[]]) => {
			first();
			second();

			return [
				first.resultFromRanEffect(),
				second.resultFromRanEffect(),
			] as [T1, T2];
		},
		[ [ first.args, second.args ] as [any[], any[]] ]
	);
}
