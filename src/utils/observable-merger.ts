import { merge, materialize, dematerialize } from 'rxjs/operators';
import { Observable, Observer, Subject, Subscription } from 'rxjs';

export type ObservableMerger<T> = (source: Observable<T>) => Subscription;
export interface MergedObservable<T> {
	observable: Observable<T>;
	merger: ObservableMerger<T>;
}
export function mergedObservables<T>(): MergedObservable<T> {
	const subject = new Subject<T>();

	return {
		observable: subject.asObservable(),
		merger: observable =>
			observable.pipe(merge(neverComplete<T>())).subscribe(subject),
	};
}

function neverComplete<T>(): Observable<T> {
	return Observable.create((obs: Observer<T>) => {});
}
