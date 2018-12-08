import appStateStore from './app';
import { categoriesHandling } from './categories';
import { searchHandling } from './search';
import { StateView } from './store';

export { appStateStore } from './app';

export const categoriesStore = appStateStore.select('categories');
export const searchStore = appStateStore.select('search');

const updateCategoies = categoriesStore.createUpdater(categoriesHandling);
const updateSearch = searchStore.createUpdater(searchHandling);

export const update = StateView.mergeUpdaters(updateCategoies, updateSearch);
