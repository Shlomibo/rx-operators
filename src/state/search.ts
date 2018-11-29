import { Action, ActionDispatcher, Actions, reduce } from './action';

export interface SearchState {
	search: string;
}

interface SearchPayloads {
	init: SearchState;
	reset: undefined;
	search: string;
}
export const searchActions: Actions<SearchPayloads> = {
	init: () => 'init',
	reset: () => 'reset',
	search: (search: string) => ({
		name: 'search',
		payload: search,
	}),
};

const searchDispatcher: ActionDispatcher<SearchState, SearchPayloads> = {
	init: () => () => ({ search: '' }),
	reset: () => () => ({ search: '' }),
	search: ({ payload: search }) => () => ({ search: search! }),
};

export const searchReducer = reduce(searchDispatcher);
