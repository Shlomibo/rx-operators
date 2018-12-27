import {
	Subject,
	Subscription,
	Subscriber,
	ObjectUnsubscribedError,
} from 'rxjs';

interface LinkedList<T> {
	value: T;
	next?: LinkedList<T>;
}
function* iterateList<T>(list?: LinkedList<T>) {
	while (list) {
		yield list.value;
		list = list.next;
	}
}

export type SubjectCtor<T, TSubject extends Subject<T>> = new (
	...args: any[]
) => TSubject;

export function isSubjectCtor(
	val: unknown
): val is SubjectCtor<unknown, Subject<unknown>> {
	return typeof val === 'function' && val.prototype instanceof Subject;
}

export function fastReplaySubjectMixin<
	T,
	TSubject extends SubjectCtor<T, Subject<T>> = SubjectCtor<T, Subject<T>>
>(
	// tslint:disable-next-line:variable-name
	Base: TSubject
) {
	return class FastReplaySubject extends Base {
		private _emissions?: LinkedList<T>;
		private _lastEmission?: LinkedList<T>;
		private _emissionsCount = 0;

		public get emissionsCount() {
			return this._emissionsCount;
		}

		private _maxSize = Number.MAX_SAFE_INTEGER;

		public get maxSize() {
			return this._maxSize;
		}
		public set maxSize(value: number) {
			if (value < 0 || value > Number.MAX_SAFE_INTEGER || isNaN(value)) {
				throw new Error('Invalid maxSize ' + value);
			}

			while (this._emissionsCount > value) {
				if (!this._emissions) {
					throw new Error('WTF?!');
				}

				this._emissions = this._emissions.next;
				this._emissionsCount--;
			}

			this._maxSize = value;
		}

		constructor(...args: any[]) {
			super(...args);
		}

		public next(value: T) {
			const last: LinkedList<T> = { value };

			if (this._lastEmission && this._emissions) {
				this._lastEmission = this._lastEmission.next = last;
			}
			else {
				this._emissions = this._lastEmission = last;
			}

			if (this._emissionsCount < this._maxSize) {
				this._emissionsCount++;
			}
			else if (!this._emissions.next) {
				this._emissions = this._lastEmission = undefined;
			}
			else {
				this._emissions = this._emissions.next;
			}

			super.next(value);
		}

		public _subscribe(subscriber: Subscriber<T>): Subscription {
			if (this.closed) {
				throw new ObjectUnsubscribedError();
			}

			for (const prevEmission of iterateList(this._emissions)) {
				subscriber.next(prevEmission);
			}

			return super._subscribe(subscriber);
		}
	};
}

// tslint:disable-next-line:variable-name
export const FastReplaySubject = fastReplaySubjectMixin(Subject);
