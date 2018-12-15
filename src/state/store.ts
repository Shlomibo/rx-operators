import { Key, KeyOf, Merge, ArgTypes } from '../utils/types';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export interface Action<TAction extends string, TPayload = unknown> {
	name: TAction;
	payload?: TPayload;
}

export type Reducer<T, TAction extends Action<string>> = (
	action: TAction,
	state: T
) => T | Promise<T>;
export type Updater<TAction extends Action<string>> = (
	action?: TAction
) => Promise<void>;

export abstract class StateView<T> {
	public readonly state: Observable<T>;
	public abstract readonly current: T;

	constructor(state: Observable<T>) {
		this.state = state;
	}

	public select<TKey extends Key>(key: TKey): StateView<KeyOf<T, TKey>> {
		return new KeyView(this as any, key as never);
	}

	public abstract createUpdater<TAction extends Action<string>>(
		cb: Reducer<T, TAction>
	): Updater<TAction>;

	public static mergeReducers<
		T,
		TReducers extends Reducer<T, Action<string>>[]
	>(
		...reducers: TReducers
	): Reducer<
		T,
		Merge<
			Action<string>,
			ArgTypes<
				Action<string>,
				Reducer<T, Action<string>>,
				TReducers,
				Action<string>
			>
		>
	> {
		return reducers.reduce(
			(prevReducer, currentReducer) => async (action, state) =>
				currentReducer(
					action,
					await Promise.resolve(prevReducer(action, state))
				)
		);
	}

	public static mergeUpdaters<TUpdaters extends Updater<Action<string>>[]>(
		...updaters: TUpdaters
	): Updater<
		Merge<
			Action<string>,
			ArgTypes<
				Action<string>,
				Updater<Action<string>>,
				TUpdaters,
				Action<string>
			>
		>
	> {
		return action =>
			updaters.reduce(
				(prom, updater) => prom.then(() => updater(action)),
				Promise.resolve()
			);
	}
}

class KeyView<T extends object, TKey extends keyof T> extends StateView<
	T[TKey]
> {
	private readonly _parent: StateView<T>;
	private readonly _key: TKey;
	public get current() {
		return this._parent.current[this._key];
	}

	constructor(parent: StateView<T>, key: TKey) {
		super(parent.state.pipe(map(state => state[key])));

		this._parent = parent;
		this._key = key;
	}

	public createUpdater<TAction extends Action<string>>(
		cb: (action: TAction, state: T[TKey]) => T[TKey] | Promise<T[TKey]>
	): Updater<TAction> {
		return this._parent.createUpdater<TAction>(async (action, state) => ({
			...state,
			[this._key]: await Promise.resolve(cb(action, state[this._key])),
		}));
	}
}

export class Store<T> extends StateView<T> {
	private readonly _store: BehaviorSubject<T>;
	public get current() {
		return this._store.value;
	}

	constructor(initState: T) {
		const state = new BehaviorSubject(initState);

		super(state.asObservable());
		this._store = state;
	}

	public createUpdater<TAction extends Action<string>>(
		cb: (action: TAction, state: T) => T | Promise<T>
	): Updater<TAction> {
		return async action =>
			action &&
			this._store.next(
				await Promise.resolve(cb(action, this._store.getValue()))
			);
	}
}

export default Store;
