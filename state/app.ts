import { categoriesReducer, CategoriesState } from './categories';
import { searchReducer, SearchState } from './search';

export interface AppState {
	search: SearchState;
	categories: CategoriesState;
}
