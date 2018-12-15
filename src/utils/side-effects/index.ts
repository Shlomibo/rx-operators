import { Observable } from 'rxjs';
import { TypeCondition } from '../types';
import { merge, OperatorFunction, of, empty, isObservable } from 'rxjs';
import { map, switchMap, share } from 'rxjs/operators';
import {
	FunctioningFunctionalSide,
	MergedFunctionalSide,
} from './functional-side';
import {
	pureKey,
	SideEffect,
	SideEffectTypedFunc,
	TypedSideEffect,
	suppressedKey,
	SideEffectMetadata,
	functionalSideKey,
	from as fromFunc,
	buildSideEffect,
	isSideEffect,
	suppress,
} from './common';
import { MaybeSideEffect } from './bind';

export { SideEffect, TypedSideEffect, isSideEffect } from './common';
export { bind } from './bind';
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

// tslint:disable-next-line:no-namespace
export namespace createSideEffect {
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

	export const from = fromFunc;
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

				currentSE = isSideEffect(result) ? result : undefined;
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
			results.pipe(
				map(
					item =>
						isSideEffect(item)
							? item
							: createSideEffect.from(item) as any
				)
			)
		);
	};
}

export function lift<T>(
	observable: Observable<T>
): Observable<SideEffect<TypeCondition<T, SideEffect, SideEffect<T>, T>>> {
	return observable.pipe(
		map(item => (isSideEffect(item) ? item : createSideEffect.from(item)))
	) as any;
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

	const first = firstOrArgs as MaybeSideEffect<T1>,
		second = maybeSecond as MaybeSideEffect<T2>;

	if (isSideEffect(first) && isSideEffect(second)) {
		return combineSEs(first, second);
	}
	else if (isSideEffect(first)) {
		return buildSideEffect(
			new MergedFunctionalSide<T1, T2>(
				{ functional: first[functionalSideKey] },
				{ result: second as T2 }
			),
			{
				...first.metadata,
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
	else if (isSideEffect(second)) {
		return buildSideEffect(
			new MergedFunctionalSide(
				{ result: first as T1 },
				{ functional: second[functionalSideKey] }
			),
			{
				...second.metadata,
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
			{ functional: first[functionalSideKey] },
			{ functional: second[functionalSideKey] }
		),
		{
			...first.metadata,
			...second.metadata,
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
