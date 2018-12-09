import { Observable } from 'rxjs';

export interface Action<TAction extends string, T = undefined> {
	name: TAction;
	payload?: T;
}
