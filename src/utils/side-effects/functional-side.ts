import { AsyncSubject, combineLatest, empty, Observable, of, race } from 'rxjs';
import { map } from 'rxjs/operators';

export interface FunctionalSide<T> {
	cancel(): void;
	result(item: T): void;
	error(err: any): void;
	clone(): FunctionalSide<T>;
	readonly completed: Observable<T>;
	readonly cancelled: Observable<true>;
}

export class FunctioningFunctionalSide<T> implements FunctionalSide<T> {
	private readonly _chainedFunctionality?: FunctionalSide<T>;
	private readonly _completion = new AsyncSubject<T>();
	private readonly _cancellation = new AsyncSubject<true>();

	public readonly completed: Observable<T>;
	public readonly cancelled: Observable<true>;
	constructor(chainedFunctionality?: FunctionalSide<any>) {
		this._chainedFunctionality = chainedFunctionality;

		this.completed = this._completion.asObservable();
		this.cancelled = this._cancellation.asObservable();

		if (chainedFunctionality) {
			this.completed = combineLatest(
				this.completed,
				chainedFunctionality.completed,
				thisCompletion => thisCompletion
			);

			this.cancelled = race(
				this.cancelled,
				chainedFunctionality.cancelled
			);
		}
	}

	public clone() {
		return new FunctioningFunctionalSide<T>(this._chainedFunctionality);
	}

	public cancel() {
		this._cancellation.next(true);
		this._cancellation.complete();

		this._completion.complete();
	}

	public error(err: any) {
		this._cancellation.complete();

		this._completion.error(err);
	}

	public result(result: T) {
		this._cancellation.complete();

		this._completion.next(result);
		this._completion.complete();
	}
}

export class SuppressedFunctionalSide<T> implements FunctionalSide<T> {
	public readonly completed = empty();
	public readonly cancelled = empty();

	public clone() {
		return new SuppressedFunctionalSide();
	}
	public cancel() {}
	public error(err: any) {}
	public result(item: T) {}
}

type ResultOrFunctional<T> =
	| {
			functional?: undefined;
			result: T;
		}
	| {
			functional: FunctionalSide<T>;
		};

export class MergedFunctionalSide<T1, T2> implements FunctionalSide<[T1, T2]> {
	public readonly completed: Observable<[T1, T2]>;
	public readonly cancelled: Observable<true>;

	constructor(
		private readonly first: ResultOrFunctional<T1>,
		private readonly second: ResultOrFunctional<T2>
	) {
		if (!first.functional && !second.functional) {
			this.completed = of([ first.result, second.result ] as [T1, T2]);
			this.cancelled = empty();
		}
		else if (first.functional && second.functional) {
			this.completed = combineLatest(
				first.functional.completed,
				second.functional.completed
			);
			this.cancelled = race(
				first.functional.cancelled,
				second.functional.cancelled
			);
		}
		else if (first.functional) {
			this.completed = first.functional.completed.pipe(
				map(item => [ item, (second as any).result ] as [T1, T2])
			);
			this.cancelled = first.functional.cancelled;
		}
		else {
			this.completed = second.functional!.completed.pipe(
				map(item => [ (first as any).result, item ] as [T1, T2])
			);
			this.cancelled = second.functional!.cancelled;
		}
	}

	public clone() {
		return new MergedFunctionalSide(this.first, this.second);
	}

	public cancel() {
		if (this.first.functional) {
			this.first.functional.cancel();
		}

		if (this.second.functional) {
			this.second.functional.cancel();
		}
	}

	public error(err: any) {
		if (this.first.functional) {
			this.first.functional.error(err);
		}

		if (this.second.functional) {
			this.second.functional.error(err);
		}
	}

	public result(result: [T1, T2]) {
		const [ first, second ] = result;

		if (this.first.functional) {
			this.first.functional.result(first);
		}

		if (this.second.functional) {
			this.second.functional.result(second);
		}
	}
}
