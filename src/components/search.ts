import { fromEvent, merge, Observable, of } from 'rxjs';
import { Element, Component } from './types';
import { searchStore, update } from '../state';
import { SearchAction } from '../state';
import {
	createSideEffect,
	SideEffect,
	bind,
	combineSideEffects,
} from '../utils/side-effects';
import {
	debounceTime,
	withLatestFrom,
	filter,
	map,
	switchMap,
	share,
	merge as mergeWith,
} from 'rxjs/operators';
import JQuery = require('jquery');

export function search(root: Element): Component {
	return updateSearch(
		root,
		searchStore.state.pipe(map(state => state.search))
	);
}

function createSearch(): JQuery<HTMLElement> {
	return JQuery(/*html*/ `
	<div class="input-group">
	  <span class="input-group-addon">
	    <span class="glyphicon glyphicon-search"></span>
	  </span>
	  <input class="form-control search" type="text" value="" />
	</div>`);
}

function updateSearch(
	root: JQuery<HTMLElement>,
	searches: Observable<string>
): Component {
	const creation = bind(
		createSideEffect(create, root),
		map(root => root.find('input.search'))
	);

	const searcheStateUpdates = bind(creation, switchMap(searchStateFromInput));

	const uiUpdates = bind(
		searches.pipe(map(createSideEffect.from)),
		withLatestFrom(creation),
		map(mixed => combineSideEffects(mixed)),
		filter(([ search, el ]) => el.val() !== search),
		map(([ search, el ]) =>
			createSideEffect((searchStr, el) => el.val(searchStr), search, el)
		)
	);

	return {
		updates: merge(searcheStateUpdates, uiUpdates),
	};
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
