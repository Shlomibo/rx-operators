import * as React from 'react';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';

export type StateUpdate<TState> = Pick<TState, keyof TState>;
export abstract class RXComponent<TProp = {}, TState = {}> extends React.Component<TProp, TState> {
	private __cleanup?: Subscription;
	private _observable: Observable<TState>;

	protected subscribe(observable: Observable<StateUpdate<TState>>) {
		this._observable = observable;
	}

	protected get _cleanup() {
		return this.__cleanup;
	}
	protected set _cleanup(sub: Subscription | undefined) {
		if (sub) {
			this.__cleanup = !!this.__cleanup
				? this.__cleanup.add(sub)
				: sub;
		}
	}

	public componentWillMount() {
		if (this._observable) {
			this._cleanup = this._observable.subscribe({
				next: state => this.setState(state),
				error: err => console.error(err),
				complete: () => console.warn('State stream completed', this),
			});
		}
	}

	public componentWillUnmount() {
		if (this._cleanup) {
			this._cleanup.unsubscribe();
		}
		this.__cleanup = undefined;
	}
}

export interface ReactEventObserver<T = Event> {
	(event: T): void;
	asObservable(): Observable<T> & {
		ofValue(): Observable<string>;
	};
}
export function reactEventObserver<T = Event>(): ReactEventObserver<T> {
	const eventSubject = new Subject<T>();

	return Object.assign(observeEvent, {
		asObservable() {
			const observable = eventSubject.asObservable();

			return Object.assign(observable, {
				ofValue() {
					return observable.map(({ target }: any) => (target as HTMLInputElement).value);
				},
			});
		},
	});

	function observeEvent(event: T): void {
		eventSubject.next(event);
	}
}
