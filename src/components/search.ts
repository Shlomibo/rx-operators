import { fromEvent, merge, Observable } from 'rxjs';
import { Element, Component } from './types';
import { searchStore, update } from '../state';
import { SearchAction } from '../state';
import { SideEffect, bind } from '../utils/side-effects';
import {
	debounceTime,
	withLatestFrom,
	filter,
	map,
	combineLatest,
	switchMap,
} from 'rxjs/operators';
import jQuery = require('jquery');
import { publishFastReplay, subscribeWith } from '../utils/rx/operators';

export function search(root: Element): Component {
	return updateSearch(
		root,
		searchStore.state.pipe(
			map(state => {
				return state.search;
			})
		)
	);
}

function createSearch(): JQuery<HTMLElement> {
	return jQuery(/*html*/ `
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
	const creation = publishFastReplay(
		bind(
			SideEffect.create(create, root),
			map(root => {
				return root.find('input.search');
			})
		)
	);

	const searcheStateUpdates = bind(
		creation,
		switchMap(input =>
			searchStateFromInput(input as JQuery<HTMLInputElement>, searches)
		)
	);

	const uiUpdates = bind(
		creation,
		combineLatest(searches),
		filter(([ el, search ]) => {
			return el.val() !== search;
		}),
		map(([ el, search ]) =>
			SideEffect.create(
				{ hidden: true },
				(searchStr: string, el: JQuery<HTMLInputElement>) =>
					el.val(searchStr),
				search,
				el
			)
		)
	);

	return {
		updates: merge(searcheStateUpdates, uiUpdates).pipe(
			subscribeWith(creation)
		),
	};
}

function create(rootEl: Element) {
	const search = createSearch();
	rootEl.append(search);

	return search;
}

function searchStateFromInput(
	input: JQuery<HTMLInputElement>,
	searches: Observable<string>
) {
	const onInput = fromEvent(input, 'input').pipe(
		debounceTime(250),
		map(ev => jQuery(ev.currentTarget as HTMLInputElement).val()),
		withLatestFrom(searches),
		filter(([ ui, state ]) => ui !== state),
		map(([ ui ]) => ui),
		map<string, SearchAction>(search => ({
			name: 'search',
			payload: search,
		}))
	);
	const onKeydown = fromEvent(input, 'keydown').pipe(
		map((ev: KeyboardEvent) => ev.key),
		filter(key => key === 'Escape'),
		withLatestFrom(searches),
		filter(([ , state ]) => '' !== state),
		map<any, SearchAction>(() => ({ name: 'reset' }))
	);

	return merge(onInput, onKeydown).pipe(
		map(action => SideEffect.create({ hidden: true }, update, action))
	);
}
