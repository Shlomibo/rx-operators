import { Observable, OperatorFunction, merge } from 'rxjs';
import { SideEffect } from '../utils/side-effects';
import { scan, map, share, takeWhile, skipWhile } from 'rxjs/operators';

export type Element = JQuery<HTMLElement>;

export interface Component {
	updates: Observable<SideEffect>;
}

interface Pair<T> {
	prev?: T;
	current: T;
}
export function onFirst<T, R>(
	firstOperation: OperatorFunction<T, R>,
	others: OperatorFunction<Pair<T>, R>
): OperatorFunction<T, R> {
	return obs => {
		const isFirst = obs.pipe(
			scan<T, Pair<T> | undefined>(
				(state, item) => ({
					current: item,
					prev: state && state.current,
				}),
				undefined
			),
			share()
		);

		return merge(
			isFirst.pipe(
				takeWhile(state => !state!.prev),
				map(fromState),
				firstOperation
			),
			isFirst.pipe(skipWhile(state => !!state!.prev), others)
		);
	};

	function fromState(state: Pair<T>) {
		return state.current;
	}
}

export function fromJQEvent(
	jq: Element,
	event: string,
	selector?: string
): Observable<Event> {
	return new Observable<Event>(obs => {
		jq.on(event, selector, handler);
		return () => jq.off(event, handler);

		function handler(ev: JQuery.Event<HTMLElement, any>) {
			obs.next(ev as any);
		}
	});
}
