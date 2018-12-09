import appStateStore from './app';
import { handleApp } from './app';
import { categoriesHandling } from './categories';
import { operatorsHandling } from './operators';
import { searchHandling } from './search';
import { StateView } from './store';

export { StateView, Store } from './store';
export { appStateStore, AppState, AppAction, AppActionType } from './app';
export { CategoriesState, CategoryAction } from './categories';
export { SearchState, SearchAction } from './search';
export {
	OperatorState,
	OperatorsState,
	OperatorActionType,
	OperatorAction,
	OperatorsAction,
} from './operators';

export const categoriesStore = appStateStore.select('categories');
export const searchStore = appStateStore.select('search');
export const operatorsStore = appStateStore.select('operators');

const updateApp = appStateStore.createUpdater(handleApp);
const updateCategoies = categoriesStore.createUpdater(categoriesHandling);
const updateSearch = searchStore.createUpdater(searchHandling);
const updateOperatorsState = operatorsStore.createUpdater(operatorsHandling);

export const update = StateView.mergeUpdaters(
	updateApp,
	updateCategoies,
	updateSearch,
	updateOperatorsState
);
