import { fromEvent, merge, of } from 'rxjs';
import { search } from './search';
import { Component, Element } from './types';
import { CategoryName } from '../data/categories';
import {
	searchStore,
	appStateStore as state,
	categoriesStore,
	operatorsStore,
} from '../state';
import { AppState } from '../state/app';
import { update } from '../state/index';
import { bind } from '../utils/side-effects';
import jQuery = require('jquery');
import {
	distinctUntilChanged,
	map,
	withLatestFrom,
	debounceTime,
} from 'rxjs/operators';
import { categories } from './categories';
import { operators } from './operators';
import { SideEffect } from '../utils/side-effects';
export const CLS_CAT_INACTIVE = 'cat-inactive';

export type DisplaySelection = (categories: CategoryName[]) => boolean;

export function application(root: Element): Component {
	const view = createView(state.current);

	const viewCreation = of(
		SideEffect.create((root, view) => root.append(view), root, view.element)
	);

	const searchComp = search(view.searchRoot);
	const categoriesComp = categories(
		view.categoriesRoot,
		categoriesStore.state
	);
	const operatorsComp = operators(
		view.operatorsRoot,
		operatorsStore,
		searchStore.state.pipe(map(state => state.search)),
		categoriesStore.state
	);

	const scrolls = fromEvent(window, 'scroll').pipe(
		debounceTime(100),
		map(ev => document.documentElement.scrollTop),
		map(scroll => scroll > 50),
		distinctUntilChanged()
	);
	const uiUpdates = bind(
		viewCreation,
		withLatestFrom(scrolls),
		map(([ el, isScrolled ]) =>
			SideEffect.create(update, {
				name: 'setScrolled',
				payload: isScrolled,
			})
		)
	);

	return {
		updates: merge(
			uiUpdates,
			searchComp.updates,
			categoriesComp.updates,
			operatorsComp.updates
		),
	};
}

const CLS_SCROLLED = 'shrinked';

interface AppView {
	element: Element;
	readonly searchRoot: Element;
	readonly categoriesRoot: Element;
	readonly operatorsRoot: Element;
}

function createView(state: AppState): AppView {
	const result = jQuery(/*html*/ `
	<div>
	  <nav class="navbar navbar-default navbar-fixed-top">
		<div class="container">
		  <h5 class="col-md-8">RX operators</h5>
		  <div class="col-md-4 search-root"></div>
		</div>
		<div class="categories categories-root"></div>
	  </nav>
	  <main class="operators-root"></main>
	</div>`);

	return updateView(createAppView(result), state);
}

function updateView(view: AppView, { isScrolled }: AppState): AppView {
	view.element.children('nav.navbar').toggleClass(CLS_SCROLLED, isScrolled);

	return view;
}

function createAppView(el: Element): AppView {
	return {
		element: el,
		get searchRoot() {
			return this.element.find('.search-root');
		},
		get categoriesRoot() {
			return this.element.find('.categories-root');
		},
		get operatorsRoot() {
			return this.element.find('.operators-root');
		},
	};
}
