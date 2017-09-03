import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/never';
import { Subscription } from 'rxjs/Subscription';
import { Observer } from 'rxjs/Observer';

export type ObservableMerger<T> = (source: Observable<T>) => void;
export interface MergedObservable<T> {
	observable: Observable<T>;
	merger: ObservableMerger<T>;
}
export function mergedObservables<T>(): MergedObservable<T> {
	let observers = Observable.empty<T>(),
		subscriptions = 0,
		subscription = new Subscription(() => void 0);

	const subject = new Subject<T>();

	return {
		observable: Observable.create((observer: Observer<T>) => {
			const subjectSubscription = subscription.add(subject.subscribe(observer));

			// If this is a first subscription
			// Subscribe to all merged observable, and clear them
			if (subscriptions === 0) {
				subscription = subscription.add(
					observers.let(incompletable).subscribe(subject)
				);
				observers = Observable.empty<T>();
			}
			subscriptions++;

			return subjectSubscription.add(() => {
				subscriptions--;
				if (subscriptions === 0) {
					subscription.unsubscribe();
				}
			});
		}),

		merger: observable => {
			// If there's no active subscription, just merge the observable into the pending observable
			if (subscriptions === 0) {
				observers = observers.merge(observable);
			}
			else {
				// Else, subscribe the given observable onto the output subject
				subscription = subscription.add(
					observable.let(incompletable).subscribe(subject)
				);
			}
		},
	};
}

function incompletable<T>(observable: Observable<T>): Observable<T> {
	return observable.merge(Observable.never<T>());
}
