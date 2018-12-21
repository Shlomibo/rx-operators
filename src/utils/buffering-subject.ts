import { Subject, Subscription, PartialObserver, Observable } from 'rxjs';

type State = 'run' | 'error' | 'completed';
export default class BufferingSubject<T> extends Subject<T> {
	private readonly _buffer: T[] = [];
	private _err?: any;
	private _state: State = 'run';
	private _isSubscribed = false;

	private get _buffered() {
		return new Observable(obs => {
			for (const item of this._buffer) {
				obs.next(item);
			}

			if (this._state === 'error') {
				obs.error(this._err);
			}
			else if (this._state === 'completed') {
				obs.complete();
			}
		});
	}

	public next(val: T) {
		if (this._state !== 'run') {
			return;
		}

		if (this._isSubscribed) {
			return super.next(val);
		}

		this._buffer.push(val);
	}

	public error(err: any) {
		if (this._state !== 'run') {
			return;
		}

		this._err = err;
		this._state = 'error';

		if (this._isSubscribed) {
			return super.error(err);
		}
	}

	public complete() {
		if (this._state !== 'run') {
			return;
		}

		this._state = 'completed';

		if (this._isSubscribed) {
			return super.complete();
		}
	}
	public subscribe(observer?: PartialObserver<T>): Subscription;
	public subscribe(
		next?: (value: T) => void,
		error?: (error: any) => void,
		complete?: () => void
	): Subscription;
	public subscribe(...args: any[]): Subscription {
		const subscription = super.subscribe(...args);

		if (this._isSubscribed) {
			return subscription;
		}

		this._isSubscribed = true;

		return this._buffered.subscribe(this).add(subscription);
	}
}
