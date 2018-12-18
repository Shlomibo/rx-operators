import { Observable, MonoTypeOperatorFunction } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Iterable as It } from '@reactivex/ix-es2015-cjs';
import { Entry, ReadWrite } from './types';

export function debug<T>(
	message: string,
	...args: any[]
): MonoTypeOperatorFunction<T> {
	return process.env.NODE_ENV !== 'production'
		? (obs: Observable<T>) =>
				obs.pipe(
					tap(
						value => console.log({ message, value, args }),
						err => console.error(message, err)
					)
				)
		: obs => obs;
}

export function breakOn<T>(...args: any[]): MonoTypeOperatorFunction<T> {
	return process.env.NODE_ENV !== 'production'
		? (obs: Observable<T>) =>
				obs.pipe(
					tap(
						value => {
							// tslint:disable-next-line:no-debugger
							debugger;
						},
						ex => {
							// tslint:disable-next-line:no-debugger
							debugger;
						}
					)
				)
		: obs => obs;
}

export function isObject(val: unknown): val is object {
	return (
		val != null && (typeof val === 'object' || typeof val === 'function')
	);
}

export function iterateObect<T extends object>(
	obj: T
): It<Entry<keyof T, T[keyof T]>> {
	return It.from(Object.entries(obj));
}
export function fromObjectEntries<T extends object>(
	entries: Iterable<Entry<keyof T, T[keyof T]>>
): T {
	return It.from(entries).reduce(
		(result, [ key, value ]) => {
			result[key] = value;
			return result;
		},
		{} as ReadWrite<Partial<T>>
	) as T;
}
