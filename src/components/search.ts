import { fromEvent, merge, Observable, of } from 'rxjs';
import { Element } from './types';
import { searchStore, update } from '../state';
import { SearchAction } from '../state';
import { createSideEffect, SideEffect } from '../utils/side-effects';
import {
	debounceTime,
	withLatestFrom,
	filter,
	map,
	switchMap,
	share,
} from 'rxjs/operators';
import JQuery = require('jquery');

export function searchComponent(root: Element): Observable<SideEffect> {
	return updateSearch(
		root,
		searchStore.state.pipe(map(state => state.search))
	);
}

function createSearch(): JQuery<HTMLElement> {
	return JQuery(`<div class="input-group">
	  <span class="input-group-addon">
	    <span class="glyphicon glyphicon-search"></span>
	  </span>
	  <input class="form-control search" type="text" value="" />
	</div>`);
}

function updateSearch(
	root: JQuery<HTMLElement>,
	searches: Observable<string>
): Observable<SideEffect> {
	const creation = of(createSideEffect(create, root));

	const ui = creation.pipe(switchMap(se => se.completed), share());

	const searchInput = ui.pipe(map(root => root.find('input.search')));

	const searcheStateUpdates = searchInput.pipe(
		switchMap(searchStateFromInput)
	);

	const uiUpdates = searches.pipe(
		withLatestFrom(searchInput, (search, el) => ({ search, el })),
		filter(({ search, el }) => el.val() !== search),
		map(({ search, el }) =>
			createSideEffect((searchStr, el) => el.val(searchStr), search, el)
		)
	);

	return merge(creation, searcheStateUpdates, uiUpdates);
}

function create(rootEl: Element) {
	const search = createSearch();
	rootEl.append(search);

	return search;
}

function searchStateFromInput(input: JQuery<HTMLInputElement>) {
	const onInput = fromEvent(input, 'input').pipe(
		debounceTime(250),
		map(ev => jQuery(ev.currentTarget as HTMLInputElement).val()),
		map<string, SearchAction>(search => ({
			name: 'search',
			payload: search,
		}))
	);
	const onKeydown = fromEvent(input, 'keydown').pipe(
		map((ev: KeyboardEvent) => ev.key),
		filter(key => key === 'Escape'),
		map<any, SearchAction>(() => ({ name: 'reset' }))
	);

	return merge(onInput, onKeydown).pipe(
		map(action => createSideEffect(update, action))
	);
}
