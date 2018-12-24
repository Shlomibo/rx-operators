import {
	ConnectableObservable,
	Observable,
	Subscription,
	MonoTypeOperatorFunction,
	Subject,
} from 'rxjs';
import { startWith, multicast } from 'rxjs/operators';

export function syncedRefCount<T>(
	connectable: ConnectableObservable<T>
): Observable<T> {
	let firstSubEmissions: undefined | T[];
	let count = 0;
	let subscription: undefined | Subscription;

	return new Observable<T>(obs => {
		let currentSubscription: Subscription;
		count++;

		if (count > 1) {
			if (firstSubEmissions!.length > 0) {
				currentSubscription = connectable
					.pipe(startWith(...firstSubEmissions!))
					.subscribe(obs);
			}
			else {
				currentSubscription = connectable.subscribe(obs);
			}
		}
		else {
			firstSubEmissions = [];
			let subscribing = true;
			currentSubscription = connectable.subscribe({
				...obs,
				next: item => {
					if (subscribing) {
						firstSubEmissions!.push(item);
					}

					try {
						obs.next(item);
					} catch (e) {
						obs.error(e);
					}
				},
			});

			subscription = connectable.connect();
			subscribing = false;
		}

		return () => {
			count--;

			if (count === 0) {
				const innerSub = subscription!;
				firstSubEmissions = undefined;
				subscription = undefined;

				innerSub.unsubscribe();
			}

			currentSubscription.unsubscribe();
		};
	});
}

export function shareSync<T>(
	subjectFactory?: () => Subject<T>
): MonoTypeOperatorFunction<T> {
	subjectFactory = subjectFactory || (() => new Subject<T>());

	return obs => syncedRefCount(multicast(subjectFactory!)(obs));
}

export const share = shareSync;

// export function share<T>(): MonoTypeOperatorFunction<T> {
// 	return obs => syncedRefCount(multicast(() => new Subject<T>())(obs));
// }
