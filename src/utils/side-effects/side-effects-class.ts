import {
	SideEffectMetadata,
	pureKey,
	suppressedKey,
	SideEffectTypedFunc,
} from './common';
import { Observable, of, empty, AsyncSubject, combineLatest } from 'rxjs';
// @ts-ignore
import { debug } from '..';

export function isSideEffect<T = unknown>(
	val: unknown
): val is SideEffectBase<T> {
	return val instanceof SideEffectBase;
}

abstract class SideEffectBase<T = unknown> {
	public abstract get didRun(): boolean;
	public abstract get completed(): Observable<T>;

	constructor(
		public readonly metadata: SideEffectMetadata,
		public readonly args: any[],
		public readonly sideEffectFunc: (...args: any[]) => T
	) {}

	public abstract invoke(): void;
	public abstract clone(): SideEffectBase<T>;

	public suppress(): SideEffectBase<never> {
		return new SuppressedSideEffect(this);
	}

	public merge<T2>(se: SideEffectBase<T2>): SideEffectBase<[T, T2]> {
		return SideEffectBase.merge(this, se);
	}

	public static merge<T1, T2>(
		se1: SideEffectBase<T1>,
		se2: SideEffectBase<T2>
	): SideEffectBase<[T1, T2]> {
		return new MergedSideEffect(se1, se2);
	}

	public abstract map<R>(projection: (val: T) => R): SideEffectBase<R>;

	public abstract getResult(throwIfDidnt: false): T | undefined;
	public abstract getResult(throwIfDidnt?: true): T;

	public static from<T>(value: T): SideEffectBase<T> {
		return new PureSideEffect(value);
	}

	public static create<T, TArgs extends any[]>(
		sideEffectFunc: SideEffectTypedFunc<TArgs, T>,
		...args: TArgs
	): SideEffectBase<T>;
	public static create<T, TArgs extends any[]>(
		metadata: SideEffectMetadata,
		sideEffectFunc: SideEffectTypedFunc<TArgs, T>,
		...args: TArgs
	): SideEffectBase<T>;
	public static create<T, TArgs extends any[]>(
		metadataOrFunc: SideEffectMetadata | ((...args: TArgs) => T),
		sideEffectFuncOrArg: SideEffectTypedFunc<TArgs, T> | unknown,
		...args: any[]
	): SideEffectBase<T> {
		let metadata: SideEffectMetadata;
		let sideEffectFunc: SideEffectTypedFunc<TArgs, T>;

		if (typeof metadataOrFunc === 'function') {
			metadata = {};
			sideEffectFunc = metadataOrFunc;
			args.unshift(sideEffectFuncOrArg);
		}
		else if (
			typeof metadataOrFunc === 'object' &&
			typeof sideEffectFuncOrArg === 'function'
		) {
			metadata = metadataOrFunc;
			sideEffectFunc = sideEffectFuncOrArg as SideEffectTypedFunc<
				TArgs,
				T
			>;
		}
		else {
			throw new Error('Invalid arguments');
		}

		return new SideEffect(metadata, args, sideEffectFunc);
	}
}
export default SideEffectBase;

class SuppressedSideEffect extends SideEffectBase<never> {
	private readonly _sideEffect: SideEffectBase<unknown>;

	public get didRun() {
		return true;
	}

	public get completed() {
		return empty();
	}

	constructor(sideEffect: SideEffectBase<unknown>) {
		if (sideEffect.metadata[suppressedKey]) {
			throw new Error('Suppressed side effect should not be suppressed!');
		}

		super(
			{
				...sideEffect.metadata,
				[suppressedKey]: true,
			},
			sideEffect.args,
			((...args: any[]) => this.invoke()) as any
		);

		this._sideEffect = sideEffect;
	}

	public invoke() {
		this._sideEffect.invoke();
	}
	public clone(): SuppressedSideEffect {
		return this;
	}

	public suppress() {
		return this;
	}

	public map<R>(projection: (val: never) => R): never {
		throw new Error('Suppressed side effect');
	}

	public getResult(throwIfDidnt?: boolean): never {
		throw new Error('Suppressed side effect!');
	}
}

class PureSideEffect<T> extends SideEffectBase<T> {
	public get didRun() {
		return true;
	}

	public get completed() {
		return of(this.value);
	}

	constructor(public readonly value: T) {
		super(
			{
				[pureKey]: true,
				[suppressedKey]: false,
			},
			[ value ],
			() => value
		);
	}

	public invoke() {}

	public clone(): this {
		return new PureSideEffect(this.value) as any;
	}

	public getResult(throwIfDidnt?: boolean) {
		return this.value;
	}

	public map<R>(projection: (val: T) => R) {
		return new PureSideEffect(projection(this.value));
	}
}

const didRunKey = Symbol('didRun');
const resultKey = Symbol('result');
const completionKey = Symbol('completion');
class SideEffect<T, TArgs extends any[]> extends SideEffectBase<T> {
	private readonly [completionKey] = new AsyncSubject<T>();
	private [didRunKey] = false;
	private [resultKey]: () => T | undefined;

	public get didRun() {
		return this[didRunKey];
	}

	public get completed() {
		return this[completionKey].asObservable(); // .pipe(debug('se-completion'));
	}

	constructor(
		metadata: SideEffectMetadata,
		args: TArgs,
		sideEffectFunc: (...args: TArgs) => T
	) {
		super(
			{
				...metadata,
				[pureKey]: false,
				[suppressedKey]: false,
			},
			args,
			sideEffectFunc
		);
	}

	public invoke() {
		if (!this[didRunKey]) {
			this[didRunKey] = true;

			try {
				const result = this.sideEffectFunc(...this.args);

				this[resultKey] = () => result;

				this[completionKey].next(result);
				this[completionKey].complete();
			} catch (e) {
				this[resultKey] = () => {
					throw e;
				};
				this[completionKey].error(e);
			}
		}
	}

	public clone() {
		return new SideEffect<T, TArgs>(
			this.metadata,
			this.args as TArgs,
			this.sideEffectFunc
		);
	}

	public map<R>(projection: (val: T) => R) {
		return new SideEffect<R, TArgs>(
			this.metadata,
			this.args as TArgs,
			(...args: TArgs) => {
				this.invoke();
				return projection(this.getResult());
			}
		);
	}

	public getResult(throwIfDidnt: false): T | undefined;
	public getResult(throwIfDidnt?: true): T;
	public getResult(throwIfDidnt?: boolean) {
		if (!this[resultKey] && throwIfDidnt) {
			throw new Error('Side effect did not run yet');
		}
		else if (!this[resultKey]) {
			return;
		}

		return this[resultKey]();
	}
}

class MergedSideEffect<T1, T2> extends SideEffectBase<[T1, T2]> {
	public get didRun() {
		return this._se1.didRun && this._se2.didRun;
	}

	public get completed() {
		return combineLatest(this._se1.completed, this._se2.completed);
	}

	constructor(
		private readonly _se1: SideEffectBase<T1>,
		private readonly _se2: SideEffectBase<T2>
	) {
		super(
			{
				..._se1.metadata,
				..._se2.metadata,
				[suppressedKey]:
					_se1.metadata[suppressedKey] ||
					_se2.metadata[suppressedKey],
				[pureKey]: _se1.metadata[pureKey] && _se2.metadata[pureKey],
			},
			[ _se1.args, _se2.args ],
			(se1Args, se2Args) => {
				this.invoke();

				return [ _se1.getResult(), _se2.getResult() ];
			}
		);
	}

	public clone() {
		return new MergedSideEffect(this._se1, this._se2);
	}

	public getResult(throwIfDidnt: false): [T1, T2] | undefined;
	public getResult(throwIfDidnt?: true): [T1, T2];
	public getResult(throwIfDidnt?: boolean) {
		if (throwIfDidnt !== false && !this.didRun) {
			throw new Error('Side effect did not run yet');
		}
		else if (!this.didRun) {
			return;
		}

		return [ this._se1.getResult(), this._se2.getResult() ] as [T1, T2];
	}

	public invoke() {
		this._se1.invoke();
		this._se2.invoke();
	}

	public map<R>(projection: (val: [T1, T2]) => R) {
		return new SideEffect<R, [any[], any[]]>(
			this.metadata,
			this.args as [any[], any[]],
			(se1Args, se2Args) =>
				projection(this.sideEffectFunc(se1Args, se2Args))
		);
	}
}
