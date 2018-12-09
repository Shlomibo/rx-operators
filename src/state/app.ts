import { CategoriesState, initialCategories } from './categories';
import { SearchState, emptySearch } from './search';
import Store from './store';
import { OperatorsState, initOperatorsState } from './operators';

export interface AppState {
	search: SearchState;
	categories: CategoriesState;
	operators: OperatorsState;
}

export const appStateStore = new Store<AppState>({
	search: emptySearch,
	categories: initialCategories,
	operators: initOperatorsState,
});
export default appStateStore;
