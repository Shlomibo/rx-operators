import { CategoriesState, initialCategories } from './categories';
import { initOperatorsState, OperatorsState } from './operators';
import { emptySearch, SearchState } from './search';
import Store, { Action } from './store';

export type AppActionType = 'setScrolled';
export type AppAction = Action<AppActionType, boolean>;

export function handleApp(action: AppAction, state: AppState): AppState {
	switch (action.name) {
		case 'setScrolled':
			return {
				...state,
				isScrolled: !!action.payload,
			};

		default:
			return state;
	}
}

export interface AppState {
	isScrolled: boolean;
	search: SearchState;
	categories: CategoriesState;
	operators: OperatorsState;
}

export const appStateStore = new Store<AppState>({
	isScrolled: false,
	search: emptySearch,
	categories: initialCategories,
	operators: initOperatorsState,
});
export default appStateStore;
