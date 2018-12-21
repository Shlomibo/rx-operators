import { Iterable as It } from '@reactivex/ix-es2015-cjs';
import { combineLatest, fromEvent, merge, Observable } from 'rxjs';
import { Component, Element } from './types';
import { OperatorData } from '../data/operators';
import { CategoriesState } from '../state/categories';
import { operatorHandling, OperatorState } from '../state/operators';
import { StateView } from '../state/store';
import {
	SideEffect,
	bind,
	lift,
	combineSideEffects,
} from '../utils/side-effects';
import { Entry } from '../utils/types';
import {
	categories as allCategories,
	CategoryName,
	CategoryData,
} from '../data/categories';
import jQuery = require('jquery');
import {
	scan,
	map,
	share,
	first,
	switchMap,
	withLatestFrom,
	distinctUntilChanged,
	filter,
} from 'rxjs/operators';
import { debug } from '../utils';

export interface OperatorDataWithName extends OperatorData {
	name: string;
}

export interface Operator extends Component {
	name: string;
}

const SEL_DOCS_LINK = 'docs-link';

export function operator(
	root: Element,
	id: string,
	name: string,
	url: string,
	categories: CategoryName[],
	opState: StateView<OperatorState>,
	search: Observable<string>,
	catState: Observable<CategoriesState>,
	description?: string,
	img?: string,
	playWithUrl?: string
): Operator {
	// WTF?!
	// catState = catState.pipe(share());

	const updateState = opState.createUpdater(operatorHandling);

	const catDisplay = catState.pipe(map(state => state.displaySelection));
	const activeCategories = catState.pipe(
		debug(`op ${name} cat-sate`),
		map(({ active }) =>
			It.from(categories)
				.map(
					cat =>
						[ cat, allCategories[cat] ] as Entry<
							CategoryName,
							CategoryData
						>
				)
				.map(([ cat, { type } ]) => ({
					name: cat,
					isActive: type === active,
				}))
				.toArray()
		)
	);

	const state: Observable<
		OperatorProps
	> = combineLatest(
		opState.state,
		search.pipe(
			map(
				searchStr =>
					!searchStr ||
					name.toLowerCase().includes(searchStr.toLowerCase())
			),
			distinctUntilChanged()
		),
		catDisplay.pipe(
			map(dispSelection => dispSelection(categories)),
			distinctUntilChanged()
		),
		activeCategories.pipe(debug(`op ${name} cat-activation`)),
		(opState, isSearched, isCatDisplayed, catActivation) => ({
			isCollapsed: opState.collapsed,
			isOperatorDisplayed: isSearched,
			isCategoryDisplayed: isCatDisplayed,
			categories: catActivation,
		})
	);

	const ui = state.pipe(
		debug('operator ' + name),
		scan<OperatorProps, [OperatorProps, Element]>(
			([ , el ], state) => [
				state,
				el ||
					createOperatorView(
						id,
						name,
						url,
						description,
						img,
						playWithUrl,
						state
					),
			],
			[ , ] as any
		),
		share()
	);

	const uiAttachment = ui.pipe(
		first(),
		debug(`op ${name} ui attach`),
		map(([ , el ]) =>
			SideEffect.create((root, el) => root.append(el), root, el)
		)
	);

	const stateUpdates = bind(
		uiAttachment,
		switchMap(el => fromEvent(el.find('.panel-heading'), 'click')),
		map(ev => ev.target && jQuery(ev.target)),
		filter(target => !!target && !target.is(`.${SEL_DOCS_LINK}`)),
		map(el => SideEffect.create(updateState, { name: 'collapse' }))
	);

	const uiUpdates = bind(
		lift(state),
		withLatestFrom(uiAttachment),
		map(mixed => combineSideEffects(mixed)),
		map(([ state, el ]) => SideEffect.create(updateView, el, state))
	);

	return {
		name,
		updates: merge(uiUpdates, stateUpdates),
	};
}

const CLS_COLLAPSED = 'collapse';
const CLS_CAT_INACTIVE = 'cat-inactive';
const CLS_CAT_HIDDEN = 'cat-hidden';
const CLS_OP_HIDDEN = 'hidden';

function updateView(
	el: Element,
	{
		isOperatorDisplayed,
		isCategoryDisplayed,
		categories,
		isCollapsed,
	}: OperatorProps
): Element {
	el
		.toggleClass(CLS_OP_HIDDEN, !isOperatorDisplayed)
		.toggleClass(CLS_CAT_HIDDEN, !isCategoryDisplayed);

	el.find('.operator-desc').toggleClass(CLS_COLLAPSED, isCollapsed);

	const categoriesRoot = el.find('ul.categories');

	categoriesRoot.empty();
	categoriesRoot.append(categories.map(categoryMarker));

	return el;
}

function createOperatorView(
	id: string,
	name: string,
	url: string,
	description: string | undefined,
	img: string | undefined,
	playWithUrl: string | undefined,
	state: OperatorProps
): Element {
	const result = jQuery(/*html*/ `
	<li id="${id}" class="operator panel panel-default">
	  <div class="panel-heading container-fluid">
		<div class="col-sm-6 col-lg-5">
			<ul class="categories"></ul>
		</div>
		<h3 class="col-sm-6 col-lg-7">
		  <a class="${SEL_DOCS_LINK}" href="${url} target="_blank">
		    <code>${name}</code>
		  </a>
		</h3>
	  </div>
	</li>`);

	result.append(
		operatorDisplay(description, 'panel-body', false, img, playWithUrl)
	);

	return updateView(result, state);
}

interface OperatorProps {
	isOperatorDisplayed: boolean;
	isCategoryDisplayed: boolean;
	categories: CategoryMarker[];
	isCollapsed: boolean;
}

interface CategoryMarker {
	name: CategoryName;
	isActive: boolean;
}

function categoryMarker({ name, isActive }: CategoryMarker): Element {
	const result = jQuery(
		/*html*/ `<li class="category cat-${name}" title="${name}"></li>`
	);

	return isActive
		? result.addClass(CLS_CAT_INACTIVE)
		: result.removeClass(CLS_CAT_INACTIVE);
}

function operatorDisplay(
	html: string | undefined,
	selector: string | undefined,
	isCollapsed: boolean,
	imgSource: string | undefined,
	playWithUrl: string | undefined
): Element {
	const descColCount = !!imgSource ? 6 : 12;

	const imgUI =
		imgSource &&
		jQuery(
			/*html*/ `<img class="col-sm-6 image-rounded" src="./img/${imgSource}" />`
		);

	const playWithLink =
		playWithUrl &&
		jQuery(
			/*html*/ `<a href="${playWithUrl}" title="Play with operator on RxJS Marbles" target="_blank"></a>`
		);

	if (imgUI && playWithLink) {
		playWithLink.append(imgUI);
	}

	// const imgChildren = !!imgUI ? [ playWithLink || imgUI ] : [];

	const result = jQuery(/*html*/ `
	<div class="operator-desc container-fluid ${selector || ''}">
	  <div class="col-sm-${descColCount}">${html || ''}</div>
	</div>`);

	if (playWithLink || imgUI) {
		result.append(playWithLink || imgUI!);
	}

	return result.toggleClass(CLS_COLLAPSED, isCollapsed);
}
