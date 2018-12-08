import { CategoriesState, initialCategories } from './categories';
import { SearchState, emptySearch } from './search';
import Store from './store';

export interface AppState {
	search: SearchState;
	categories: CategoriesState;
}

export const appStateStore = new Store<AppState>({
	search: emptySearch,
	categories: initialCategories,
});
export default appStateStore;
