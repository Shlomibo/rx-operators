import {
	ConnectableObservable,
	Observable,
	Subscription,
	MonoTypeOperatorFunction,
	Subject,
	UnaryFunction,
	isObservable,
} from 'rxjs';
import { startWith, multicast } from 'rxjs/operators';
import {
	FastReplaySubject,
	SubjectCtor,
	fastReplaySubjectMixin,
	isSubjectCtor,
} from './fast-replay-subject';

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

export function subscribeWith<T>(
	...connectables: ConnectableObservable<any>[]
): MonoTypeOperatorFunction<T> {
	return observable =>
		new Observable<T>(observer => {
			const mainSubscription = observable.subscribe(observer);

			const connectedSubscription = connectables.reduce(
				(sub, connectable) => {
					const currentSub = connectable.connect();
					return sub ? sub.add(currentSub) : currentSub;
				},
				undefined as Subscription | undefined
			)!;

			return mainSubscription.add(connectedSubscription);
		});
}

export function publishFastReplay<T>(
	subjectClass?: SubjectCtor<any, Subject<any>>,
	subjectFactory?: (ctor: SubjectCtor<any, Subject<any>>) => Subject<any>
): UnaryFunction<Observable<T>, ConnectableObservable<T>>;
export function publishFastReplay<T>(
	observable: Observable<T>,
	subjectClass?: SubjectCtor<any, Subject<any>>,
	subjectFactory?: (ctor: SubjectCtor<any, Subject<any>>) => Subject<any>
): ConnectableObservable<T>;
export function publishFastReplay<T>(
	obsOrClass?: Observable<T> | SubjectCtor<any, Subject<any>>,
	classOrFactory?:
		| SubjectCtor<any, Subject<any>>
		| ((ctor: SubjectCtor<any, Subject<any>>) => Subject<any>),
	subjectFactory?: (ctor: SubjectCtor<any, Subject<any>>) => Subject<any>
):
	| ConnectableObservable<T>
	| UnaryFunction<Observable<T>, ConnectableObservable<T>> {
	let observable: undefined | Observable<T>;
	let subjectClass: undefined | SubjectCtor<any, Subject<any>>;

	if (
		isObservable(obsOrClass) &&
		(classOrFactory == null || isSubjectCtor(classOrFactory)) &&
		(subjectFactory == null || !isSubjectCtor(subjectFactory))
	) {
		observable = obsOrClass;
		subjectClass = classOrFactory;
	}
	else if (
		(obsOrClass == null || isSubjectCtor(obsOrClass)) &&
		(classOrFactory == null || !isSubjectCtor(classOrFactory)) &&
		!subjectFactory
	) {
		observable = undefined;
		subjectClass = obsOrClass;
		subjectFactory = classOrFactory;
	}
	else {
		throw new Error('Invalid arguments');
	}

	const fastReplayClass = subjectClass
		? fastReplaySubjectMixin(subjectClass)
		: FastReplaySubject;
	const fastReplayFactory = subjectFactory
		? () => subjectFactory!(fastReplayClass)
		: () => new fastReplayClass();

	return observable ? impl(observable) : impl;

	function impl(observable: Observable<T>) {
		return multicast(fastReplayFactory)(observable);
	}
}
