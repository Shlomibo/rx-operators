import 'rxjs/add/observable/never';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

export type ObservableMerger<T> = (source: Observable<T>) => Subscription;
export interface MergedObservable<T> {
	observable: Observable<T>;
	merger: ObservableMerger<T>;
}
export function mergedObservables<T>(): MergedObservable<T> {
	const subject = new Subject<T>();

	return {
		observable: subject.asObservable(),
		merger: observable => observable.let(incompletable).subscribe(subject),
	};
}

function incompletable<T>(observable: Observable<T>): Observable<T> {
	return observable.merge(Observable.never<T>());
}
