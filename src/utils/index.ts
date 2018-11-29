import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';

export function debug(
	message: string,
	...args: any[]
): <T>(obs: Observable<T>) => Observable<T> {
	return process.env.NODE_ENV !== 'production'
		? <T>(obs: Observable<T>) =>
				obs
					.do(value => console.log({ message, value, args }))
					.catch<T, T>(({ err, source }) => {
						console.error(message, err);
						throw err;
					})
		: obs => obs;
}

export function breakOn(...args: any[]): <T>(obs: Observable<T>) => Observable<T> {
	return process.env.NODE_ENV !== 'production'
		? <T>(obs: Observable<T>) =>
				obs
					.do(value => {
						// tslint:disable-next-line:no-debugger
						debugger;
					})
					.catch<T, T>((err, source) => {
						// tslint:disable-next-line:no-debugger
						debugger;
						throw err;
					})
		: obs => obs;
}
