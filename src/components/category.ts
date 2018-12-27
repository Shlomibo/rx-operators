import { fromEvent, merge, Observable } from 'rxjs';
import { CLS_CAT_INACTIVE } from './app';
import { Component, Element } from './types';
import { CategoryName } from '../data/categories';
import { SideEffect, bind } from '../utils/side-effects';
import {
	scan,
	map,
	first,
	skipWhile,
	switchMap,
	refCount,
	multicast,
} from 'rxjs/operators';
import jQuery = require('jquery');

// @ts-ignore
import { debug } from '../utils';
import { publishFastReplay, subscribeWith } from '../utils/rx/operators';
import { FastReplaySubject } from '../utils/rx/fast-replay-subject';

export interface CategoryProps {
	description: string;
	display: boolean;
}

interface ViewState {
	el: Element;
	state: CategoryProps;
	isNew: boolean;
}

export interface Category extends Component {
	name: CategoryName;
	clicks: Observable<SideEffect<Observable<unknown>>>;
}

export function category(
	name: CategoryName,
	root: Element,
	catData: Observable<CategoryProps>
): Category {
	const elementTracking = publishFastReplay(
		catData.pipe(
			scan<CategoryProps, ViewState>(
				({ el }, state) =>
					!!el
						? { isNew: false, el, state }
						: {
								isNew: true,
								el: createCategoryView(name, state),
								state,
							},
				({} as any) as ViewState
			)
		)
	);

	const creation = publishFastReplay(
		elementTracking.pipe(
			first(({ isNew }) => isNew),
			map(({ el }) =>
				SideEffect.create((root, el) => root.append(el), root, el!)
			)
		)
	);

	const viewUpdates = elementTracking.pipe(
		skipWhile(({ isNew }) => isNew),
		map(({ el, state }) =>
			SideEffect.create(
				(el, state) => el.replaceWith(createCategoryView(name, state)),
				el,
				state
			)
		)
	);

	return {
		name,
		updates: merge(creation, viewUpdates).pipe(
			subscribeWith(elementTracking, creation)
		),
		clicks: bind(creation, debug('c0'), map(el => fromEvent(el, 'click'))),
	};
}

function createCategoryView(
	name: CategoryName,
	{ description, display }: CategoryProps
) {
	const result = jQuery(/*html*/ `
	<li title="${name}" alt="${description}"
	  class="category btn ${catgoryClassName(name)}">
	  ${name}
	</li>`);

	return display
		? result.addClass(CLS_CAT_INACTIVE)
		: result.removeClass(CLS_CAT_INACTIVE);
}
function catgoryClassName(name: string) {
	return `cat-${name}`;
}
