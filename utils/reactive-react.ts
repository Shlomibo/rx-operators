import * as React from 'react';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subscription } from 'rxjs/Subscription';

export type StateUpdate<TState> = Pick<TState, keyof TState>;
export abstract class RXComponent<TProp = {}, TState = {}> extends React.Component<TProp, TState> {
	protected _cleanup?: Subscription;

	protected subscribe(observable: Observable<StateUpdate<TState>>) {
		const cleanup = observable.subscribe({
			next: state => this.setState(state),
			error: err => console.error(err),
			complete: () => console.warn('State stream completed', this),
		});

		this._cleanup = !!this._cleanup
			? this._cleanup.add(cleanup)
			: cleanup;
	}

	public componentWillUnmount() {
		if (this._cleanup) {
			this._cleanup.unsubscribe();
		}
	}
}
