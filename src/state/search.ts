import { Action } from './action';

export interface SearchState {
	search: string;
}

export type SearchActionType = 'reset' | 'search';
export type SearchAction = Action<SearchActionType, string>;

export function searchHandling(
	searchAction: SearchAction,
	state: SearchState
): SearchState {
	switch (searchAction.name) {
		case 'reset':
			return initSearch();

		case 'search':
			return typeof searchAction.payload === 'string'
				? { search: searchAction.payload }
				: initSearch();

		default:
			return state;
	}
}

export const emptySearch: SearchState = {
	search: '',
};
function initSearch(): SearchState {
	return {
		...emptySearch,
	};
}
