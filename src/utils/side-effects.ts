import { Observable, AsyncSubject, OperatorFunction } from 'rxjs';
import { first, takeUntil, map } from 'rxjs/operators';
import { OneOrMany } from './types';

export interface SideEffectMetadata {
	[key: string]: any;
}

export type SideEffectFunc<T = any> = (...args: any[]) => T;
export type SideEffectTypedFunc<TArgs extends any[], T> = (...args: TArgs) => T;
export interface SideEffect<T = any> {
	(): void;
	args: any[];
	sideEffect: SideEffectFunc<T>;
	completed: Observable<T>;
	cancelled: Observable<true>;
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
	...args: any[]
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

	// Side effect state, an subjects to consume completion/cancellation
	let didRun = false,
		didCancel = false,
		result: () => T | undefined;
	const completed = new AsyncSubject<T>(),
		cancellation = new AsyncSubject<true>();

	// Assign SideEffect properties to sideEffectsFunc
	Object.assign(sideEffectFunc, {
		metadata,
		sideEffect,
		args,
		completed: completed.asObservable(),
		cancelled: cancellation.pipe(takeUntil(completed), first()),

		cloneEffect: () => createSideEffect(metadata, sideEffect, ...args),
		clone(this: TypedSideEffect<TArgs, T>) {
			const se = this.cloneEffect();

			if (this.cancelled) {
				se.cancel();
			}

			return se;
		},

		cancel: () => {
			didCancel = true;
			completed.complete();
			cancellation.next(true);
			cancellation.complete();
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

				completed.next(runResult);
				completed.complete();
			} catch (err) {
				result = () => {
					throw err;
				};

				completed.error(err);
			}

			cancellation.complete();
		}
	}
}

// tslint:disable-next-line:no-namespace
export namespace createSideEffect {
	export function from<T>(val: T): TypedSideEffect<[T], T> {
		return createSideEffect(val => val, val);
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

export function unwrap<T>(): OperatorFunction<
	SideEffect<SideEffect<T>>,
	SideEffect<T>
> {
	return obs => obs.pipe(map(se => unwrapped(se)));
}

function unwrapped<T>(se: SideEffect<SideEffect<T>>): SideEffect<T> {
	const result = createSideEffect(args => {
		if (se.cancelled) {
			return cancelResult();
		}

		se();
		const resultSE = se.resultFromRanEffect();

		if (resultSE.cancelled) {
			return cancelResult();
		}

		resultSE();
		return resultSE.resultFromRanEffect();
	}, ...se.args);

	return result;

	function cancelResult(): T {
		result.cancel();

		return undefined as any;
	}
}

export interface Box<T> {
	item: T;
}
export interface FailureHandling<T> {
	ifCancelled?: () => Box<T> | undefined;
	ifFailed?: (err: any) => T;
}
export function bind<T, R>(
	projection: (item: T) => R | SideEffect<R>,
	failureHandling?: FailureHandling<T>
): OperatorFunction<SideEffect<T>, SideEffect<R>> {
	return obs => obs.pipe(map(firstSE => combineSEs(firstSE, projection)));

	function combineSEs(
		firstSE: SideEffect<T>,
		secondSE: (item: T) => R | SideEffect<R>
	): SideEffect<R> {
		const result = createSideEffect((...args) => {
			let seResult: T;

			try {
				if (!firstSE.cancelled) {
					firstSE();
					seResult = firstSE.resultFromRanEffect();
				}
				else {
					if (!failureHandling || !failureHandling.ifCancelled) {
						cancelResult();
						return;
					}
					else {
						const handlingResult = failureHandling.ifCancelled();

						if (!handlingResult) {
							cancelResult();
							return;
						}

						seResult = handlingResult.item;
					}
				}
			} catch (err) {
				if (!failureHandling || !failureHandling.ifFailed) {
					throw err;
				}

				seResult = failureHandling.ifFailed(err);
			}

			const secondSEOrVal = secondSE(seResult);

			if (!createSideEffect.isSideEffect(secondSEOrVal)) {
				return secondSEOrVal;
			}
			else {
				secondSEOrVal();
				return secondSEOrVal.resultFromRanEffect();
			}
		}, ...firstSE.args);

		if (firstSE.cancelled) {
			result.cancel();
		}

		return result as SideEffect<R>;

		function cancelResult() {
			result.cancel();
		}
	}
}

/**
 * Converts a function that receives callback-argument, to a function that returns an observable.
 *
 * @param callbackFunc The function that expects a callback
 * @returns A function that receive the same number of arguments as the source-function (except of the callback)
 *    and when called, calls the supplied function immidiately (unlike bindCallback), and returns an Observable
 */
export function hotBindCallback<TArgs extends any[], TResults extends any[]>(
	fn: (cb: (...results: TResults[]) => void, ...args: TArgs) => void
): (...args: TArgs) => Observable<OneOrMany<TResults>> {
	return (...args) => {
		const doneSubject = new AsyncSubject<OneOrMany<TResults>>();
		try {
			fn((...results: TResults) => {
				const result = results.length === 1 ? results[0] : results;
				doneSubject.next(result);
				doneSubject.complete();
			}, ...args);
		} catch (err) {
			doneSubject.error(err);
		}

		return doneSubject.pipe(first());
	};
}
