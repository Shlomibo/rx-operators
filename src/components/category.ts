import { fromEvent, merge, Observable } from 'rxjs';
import { CLS_CAT_INACTIVE } from './app';
import { Component, Element } from './types';
import { CategoryName } from '../data/categories';
import { createSideEffect } from '../utils/side-effects';
import {
	scan,
	share,
	map,
	first,
	skipWhile,
	withLatestFrom,
	filter,
	switchMap,
} from 'rxjs/operators';
import jQuery = require('jquery');

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
	clicks: Observable<unknown>;
}

export function category(
	name: CategoryName,
	root: Element,
	catData: Observable<CategoryProps>
): Category {
	const elementTracking = catData.pipe(
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
		),
		share()
	);

	const creation = elementTracking.pipe(
		first(({ isNew }) => isNew),
		map(({ el }) =>
			createSideEffect((root, el) => root.append(el), root, el!)
		)
	);

	const viewUpdates = elementTracking.pipe(
		skipWhile(({ isNew }) => isNew),
		map(({ el, state }) =>
			createSideEffect(
				(el, state) => el.replaceWith(createCategoryView(name, state)),
				el,
				state
			)
		)
	);

	return {
		name,
		updates: merge(creation, viewUpdates),
		clicks: creation.pipe(
			switchMap(se => se.completed),
			switchMap(el => fromEvent(el, 'click'))
		),
	};
}

function createCategoryView(
	name: CategoryName,
	{ description, display }: CategoryProps
) {
	const result = jQuery(/*html*/ `
	<li title="${name}" alt="${description}">
	  class="category btn ${catgoryClassName(name)}"
	  ${name}
	</li>`);

	return display
		? result.addClass(CLS_CAT_INACTIVE)
		: result.removeClass(CLS_CAT_INACTIVE);
}
function catgoryClassName(name: string) {
	return `cat-${name}`;
}
