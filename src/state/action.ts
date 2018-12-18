export interface Action<TAction extends string, T = undefined> {
	name: TAction;
	payload?: T;
}
