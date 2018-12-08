import {
	bindCallback,
	Observable,
	ReplaySubject,
	Subject,
	MonoTypeOperatorFunction,
} from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
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
	clone: SideEffect<T>;
	metadata: SideEffectMetadata;
}
export interface TypedSideEffect<TArgs extends any[], T> extends SideEffect<T> {
	args: TArgs;
	sideEffect: SideEffectTypedFunc<TArgs, T>;
	clone: TypedSideEffect<TArgs, T>;
}

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
		didCancel = false;
	const completed = new ReplaySubject<T>(),
		cancellation = new ReplaySubject<true>();

	// Assign SideEffect properties to sideEffectsFunc
	Object.assign(sideEffectFunc, {
		metadata,
		sideEffect,
		args,
		completed: completed.asObservable(),
		cancelled: cancellation.pipe(takeUntil(completed), first()),

		clone: () => createSideEffect(metadata, sideEffect, ...args),

		cancel: () => {
			didCancel = true;
			cancellation.next(true);
		},
	});

	return sideEffectFunc as TypedSideEffect<TArgs, T>;

	/**
	 * A wrapper around the side effect to check cancellation, and send back result
	 */
	function sideEffectFunc(): void {
		if (!didCancel && !didRun) {
			didRun = true;
			try {
				completed.next(sideEffect(...(args as any)));
				completed.complete();
			} catch (err) {
				completed.error(err);
			}
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
		const doneSubject = new ReplaySubject<OneOrMany<TResults>>();
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
