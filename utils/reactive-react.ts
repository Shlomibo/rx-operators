import * as React from 'react';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';

export type CTor<T> = new (...args) => T;
export interface RXComponentProps<T> {
	notification: Observable<T> | ((source: InternalRXComponent<T>) => Observable<T>);
	token?: any;
}
export interface Notification<T> {
	dataStream: Observable<T>;
	token: any;
}

abstract class InternalRXComponent<T> extends React.Component { }

export function RXComponent() {
	const creationSubject = new ReplaySubject<Notification<any>>();
	abstract class RXComponent<TNotification> extends InternalRXComponent<TNotification> {
		public props: RXComponentProps<TNotification>;

		constructor(...args) {
			super(...args);
		}

		public componentWillMount() {
			if (super.componentWillMount) {
				super.componentWillMount();
			}

			const notification = typeof this.props.notification === 'function'
				? this.props.notification(this)
				: this.props.notification!;

			creationSubject.next({
				dataStream: notification,
				token: this.props.token,
			});
		}

		public static componentCreated<T = any>(
			filter?: (token) => boolean
		): Observable<Notification<T>> {
			return !!filter
				? creationSubject.filter(({ token }) => filter(token))
				: creationSubject.asObservable();
		}
	}

	return RXComponent;
}
