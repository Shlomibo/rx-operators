import { Observable, MonoTypeOperatorFunction } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export function debug<T>(
	message: string,
	...args: any[]
): MonoTypeOperatorFunction<T> {
	return process.env.NODE_ENV !== 'production'
		? (obs: Observable<T>) =>
				obs.pipe(
					tap(value => console.log({ message, value, args })),
					catchError<T, T>(({ err, source }) => {
						console.error(message, err);
						throw err;
					})
				)
		: obs => obs;
}

export function breakOn<T>(...args: any[]): MonoTypeOperatorFunction<T> {
	return process.env.NODE_ENV !== 'production'
		? (obs: Observable<T>) =>
				obs.pipe(
					tap(value => {
						// tslint:disable-next-line:no-debugger
						debugger;
					}),
					catchError<T, T>((err, source) => {
						// tslint:disable-next-line:no-debugger
						debugger;
						throw err;
					})
				)
		: obs => obs;
}
