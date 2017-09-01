import 'rxjs/add/operator/first';
import 'rxjs/add/operator/takeUntil';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';
import { BoundCallbackObservable } from 'rxjs/observable/BoundCallbackObservable';
import { Subject } from 'rxjs/Subject';

export interface SideEffectMetadata {
	[key: string]: any;
}
export type SideEffectFunc<T> = (...args: any[]) => T;
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

/**
 * Creates side effect function, that can be introspcted, and having side-effect-completion observable
 *
 * @param sideEffect The side-effect causing function
 * @param args Arguments for that function
 *
 * @return SideEffect function
 */
export function createSideEffect<T = any>(
	sideEffect: SideEffectFunc<T>,
	...args: any[]
): SideEffect<T>;
/**
 * Creates side effect function, that can be introspcted, and having side-effect-completion observable
 *
 * @param type A string represting the side effect (for later discrimination)
 * @param sideEffect The side-effect causing function
 * @param args Arguments for that function
 *
 * @return SideEffect function
 */
export function createSideEffect<T = void>(
	metadata: SideEffectMetadata,
	sideEffect: SideEffectFunc<T>,
	...args: any[]
): SideEffect<T>;
export function createSideEffect<T = void>(
	sideEffectOrMetadata: SideEffectFunc<T> | SideEffectMetadata,
	argOrSideEffect: any | SideEffectFunc<T>,
	...args: any[]
): SideEffect<T> {
	let sideEffect: SideEffectFunc<T>, metadata: SideEffectMetadata;

	// Infer which overload was called
	if (typeof sideEffectOrMetadata === 'function') {
		sideEffect = sideEffectOrMetadata;
		metadata = {};
		args.unshift(argOrSideEffect);
	}
	else {
		metadata = sideEffectOrMetadata;
		sideEffect = argOrSideEffect;
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
		cancelled: cancellation.takeUntil(completed).first(),

		clone: () => createSideEffect(metadata, sideEffect, ...args),

		cancel: () => {
			didCancel = true;
			cancellation.next(true);
		},
	});

	return sideEffectFunc as SideEffect<T>;

	/**
	 * A wrapper around the side effect to check cancellation, and send back result
	 */
	function sideEffectFunc(): void {
		if (!didCancel && !didRun) {
			didRun = true;
			try {
				completed.next(sideEffect(...args));
				completed.complete();
			} catch (err) {
				completed.error(err);
			}
		}
	}
}

Observable.hotBindCallback = <any>function hotBindCallback(
	fn: (...args: any[]) => void,
	...args: any[]
): (...args: any[]) => Observable<any> {
	return (...args) => {
		const doneSubject = new ReplaySubject<any>();
		try {
			fn(...args, (...results: any[]) => {
				const result = results.length === 1 ? results[0] : results;
				doneSubject.next(result);
			});
		} catch (err) {
			doneSubject.error(err);
		}

		return doneSubject.first();
	};
};

declare module 'rxjs/Observable' {
	namespace Observable {
		/**
		 * Converts a function that receives callback-argument, to a function that returns an observable.
		 *
		 * @param callbackFunc The function that expects a callback
		 * @returns A function that receive the same number of arguments as the source-function (except of the callback)
		 *    and when called, calls the supplied function immidiately (unlike bindCallback), and returns an Observable
		 */
		export let hotBindCallback: typeof BoundCallbackObservable.create;
	}
}
