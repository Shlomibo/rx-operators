import { SideEffect } from '.';
import { Observable, OperatorFunction, isObservable, of, merge } from 'rxjs';
import { isSideEffect, suppressedKey, from, suppress } from './common';
import { share, filter, map, switchMap } from 'rxjs/operators';

export type MaybeSideEffect<T> = T | SideEffect<T>;
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
	operation1: OperatorFunction<T, MaybeSideEffect<R>>
): OperatorFunction<Observable<SideEffect<T>>, Observable<SideEffect<R>>>;
export function bind<T, A, R>(
	operation1: OperatorFunction<T, MaybeSideEffect<A>>,
	operation2: OperatorFunction<A, MaybeSideEffect<R>>
): OperatorFunction<Observable<SideEffect<T>>, Observable<SideEffect<R>>>;
export function bind<T, A, B, R>(
	operation1: OperatorFunction<T, MaybeSideEffect<A>>,
	operation2: OperatorFunction<A, MaybeSideEffect<B>>,
	operation3: OperatorFunction<B, MaybeSideEffect<R>>
): OperatorFunction<Observable<SideEffect<T>>, Observable<SideEffect<R>>>;
export function bind<T, A, B, C, R>(
	operation1: OperatorFunction<T, MaybeSideEffect<A>>,
	operation2: OperatorFunction<A, MaybeSideEffect<B>>,
	operation3: OperatorFunction<B, MaybeSideEffect<C>>,
	operation4: OperatorFunction<C, MaybeSideEffect<R>>
): OperatorFunction<Observable<SideEffect<T>>, Observable<SideEffect<R>>>;
export function bind<T, A, B, C, D, R>(
	operation1: OperatorFunction<T, MaybeSideEffect<A>>,
	operation2: OperatorFunction<A, MaybeSideEffect<B>>,
	operation3: OperatorFunction<B, MaybeSideEffect<C>>,
	operation4: OperatorFunction<C, MaybeSideEffect<D>>,
	operation5: OperatorFunction<D, MaybeSideEffect<R>>
): OperatorFunction<Observable<SideEffect<T>>, Observable<SideEffect<R>>>;
export function bind<T, A, B, C, D, E, R>(
	operation1: OperatorFunction<T, MaybeSideEffect<A>>,
	operation2: OperatorFunction<A, MaybeSideEffect<B>>,
	operation3: OperatorFunction<B, MaybeSideEffect<C>>,
	operation4: OperatorFunction<C, MaybeSideEffect<D>>,
	operation5: OperatorFunction<D, MaybeSideEffect<E>>,
	operation6: OperatorFunction<E, MaybeSideEffect<R>>
): OperatorFunction<Observable<SideEffect<T>>, Observable<SideEffect<R>>>;
export function bind<T, A, B, C, D, E, F, R>(
	operation1: OperatorFunction<T, MaybeSideEffect<A>>,
	operation2: OperatorFunction<A, MaybeSideEffect<B>>,
	operation3: OperatorFunction<B, MaybeSideEffect<C>>,
	operation4: OperatorFunction<C, MaybeSideEffect<D>>,
	operation5: OperatorFunction<D, MaybeSideEffect<E>>,
	operation6: OperatorFunction<E, MaybeSideEffect<F>>,
	operation7: OperatorFunction<F, MaybeSideEffect<R>>
): OperatorFunction<Observable<SideEffect<T>>, Observable<SideEffect<R>>>;
export function bind<T, A, B, C, D, E, F, G, R>(
	operation1: OperatorFunction<T, MaybeSideEffect<A>>,
	operation2: OperatorFunction<A, MaybeSideEffect<B>>,
	operation3: OperatorFunction<B, MaybeSideEffect<C>>,
	operation4: OperatorFunction<C, MaybeSideEffect<D>>,
	operation5: OperatorFunction<D, MaybeSideEffect<E>>,
	operation6: OperatorFunction<E, MaybeSideEffect<F>>,
	operation7: OperatorFunction<F, MaybeSideEffect<G>>,
	operation8: OperatorFunction<G, MaybeSideEffect<R>>
): OperatorFunction<Observable<SideEffect<T>>, Observable<SideEffect<R>>>;
export function bind<T, A, B, C, D, E, F, G, H, R>(
	operation1: OperatorFunction<T, MaybeSideEffect<A>>,
	operation2: OperatorFunction<A, MaybeSideEffect<B>>,
	operation3: OperatorFunction<B, MaybeSideEffect<C>>,
	operation4: OperatorFunction<C, MaybeSideEffect<D>>,
	operation5: OperatorFunction<D, MaybeSideEffect<E>>,
	operation6: OperatorFunction<E, MaybeSideEffect<F>>,
	operation7: OperatorFunction<F, MaybeSideEffect<G>>,
	operation8: OperatorFunction<G, MaybeSideEffect<H>>,
	operation9: OperatorFunction<H, MaybeSideEffect<R>>
): OperatorFunction<Observable<SideEffect<T>>, Observable<SideEffect<R>>>;
export function bind<T, A, B, C, D, E, F, G, H, I, R>(
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
): OperatorFunction<Observable<SideEffect<T>>, Observable<SideEffect<R>>>;
export function bind<T, A, B, C, D, E, F, G, H, I, J, R>(
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
): OperatorFunction<Observable<SideEffect<T>>, Observable<SideEffect<R>>>;
export function bind<T, A, B, C, D, E, F, G, H, I, J, K, R>(
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
): OperatorFunction<Observable<SideEffect<T>>, Observable<SideEffect<R>>>;
export function bind<T, R>(
	...operations: OperatorFunction<any, any>[]
): OperatorFunction<Observable<SideEffect<T>>, Observable<SideEffect<R>>>;
export function bind<T, R>(
	observableOrOperation:
		| Observable<SideEffect<T>>
		| SideEffect<T>
		| OperatorFunction<any, any>,
	...operations: OperatorFunction<any, any>[]
):
	| Observable<SideEffect<R>>
	| OperatorFunction<Observable<SideEffect<T>>, Observable<SideEffect<R>>> {
	let observable: Observable<SideEffect<T>> | undefined;

	if (isObservable(observableOrOperation)) {
		observable = observableOrOperation;
	}
	else if (isSideEffect(observableOrOperation)) {
		observable = of(observableOrOperation);
	}
	else if (typeof observableOrOperation === 'function') {
		operations.unshift(observableOrOperation);
		observable = undefined;
	}
	else {
		throw new Error('Invalid argument');
	}

	return observable ? bindObservable(observable) : bindObservable as any;

	function bindObservable(
		observable: Observable<SideEffect<T>>
	): Observable<SideEffect<R>> {
		if (operations.length === 0) {
			return observable as any;
		}

		return operations.reduce(
			(inputObs: Observable<SideEffect>, operation) => {
				inputObs = inputObs.pipe(share());

				return merge(
					inputObs.pipe(filter(se => !se.didRun), map(suppress)),
					inputObs.pipe(
						filter(se => !se.metadata[suppressedKey]),
						switchMap(se => se.completed),
						operation,
						map(
							result =>
								isSideEffect(result) ? result : from(result)
						)
					)
				);
			},
			observable
		) as Observable<SideEffect<R>>;
	}
}
