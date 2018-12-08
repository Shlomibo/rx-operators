import { Observable } from 'rxjs';

export interface Action<TAction extends string, T = undefined> {
	name: TAction;
	payload?: T;
}

// export type Actions<Payloads extends PayloadsType<{}>> = {
// 	[name in keyof Payloads]: (
// 		payload?: Payloads[name]
// 	) => ActionDescriptor<Payloads[name]>
// };
// export interface PayloadsType<State extends object> {
// 	init: State;
// 	[name: string]: any;
// }

// export type ReducerProducer<State extends object, T = undefined> = (
// 	action: Action<T>
// ) => Reducer<State>;

// export type ActionDispatcher<
// 	State extends object,
// 	Payloads extends PayloadsType<State>
// > = { [key in keyof Payloads]: ReducerProducer<State, Payloads[key]> };

// export function reduce<
// 	State extends object,
// 	Payloads extends PayloadsType<State>
// >(
// 	dispatcher: ActionDispatcher<State, Payloads>
// ): (actions: Observable<ActionDescriptor<any>>) => Observable<Reducer<State>> {
// 	return (actions: Observable<ActionDescriptor<any>>) =>
// 		actions.startWith('init').map(action => {
// 			const actName = actionName(action);

// 			if (!isIn(actName, dispatcher)) {
// 				throw new Error(`Invalid action '${actName}'`);
// 			}

// 			const dispatchedReducer = dispatcher[actName](createAction(action));

// 			if (!dispatchedReducer) {
// 				throw new Error(`Missing dispatcher for ${actName}`);
// 			}

// 			return dispatchedReducer; // safeReducer(dispatchedReducer, dispatcher.init(action as any));
// 		});
// }

// function safeReducer<State extends object>(
// 	reducer: Reducer<State>,
// 	initReducer: Reducer<State>
// ): Reducer<State> {
// 	return (state?: State) => {
// 		return !!state ? reducer(state) : initReducer(undefined as any);
// 	};
// }

// function actionName(action: ActionDescriptor<any>): string {
// 	return typeof action === 'string' ? action : action.name;
// }
// function isIn<ObjType extends object>(
// 	key: string,
// 	obj: ObjType
// ): key is keyof ObjType {
// 	return key in obj;
// }
// function createAction<T>(action: ActionDescriptor<T>): Action<T> {
// 	return typeof action === 'object' ? action : { name: action };
// }

// export type StateReducers<State extends object> = {
// 	[name in keyof State]?: Reducer<State[name]> | StateReducers<State[name]>
// };

// export function simpleLens<State extends object, Key extends keyof State>(
// 	key: Key
// ): Lens<State, State[Key]> {
// 	return {
// 		get: state => state && state[key],
// 		set: (state, childState) => ({
// 			...state as any,
// 			[key]: childState,
// 		}),
// 	};
// }

// export function select<State extends object, Key extends keyof State>(
// 	key: Key
// ): (
// 	source: Observable<State | undefined>
// ) => Observable<State[Key] | undefined> {
// 	return source =>
// 		source.map(state => state && state[key]).distinctUntilChanged();
// }

// export function BANG<T>(
// 	source: Observable<T | null | undefined>
// ): Observable<T> {
// 	return source.filter(item => item != null) as Observable<T>;
// }
