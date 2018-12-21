import { Iterable as It } from '@reactivex/ix-es2015-cjs';
import { merge, Observable, of } from 'rxjs';
import { category } from './category';
import { Component, Element } from './types';
import { iterateObect } from '../utils';
import { SideEffect, bind } from '../utils/side-effects';
import { CategoryAction, update, CategoriesState } from '../state';
import {
	CategoryData,
	CategoryName,
	categories as allCategories,
	CategoryDisplay,
} from '../data/categories';
import jQuery = require('jquery');
import {
	share,
	mergeMap,
	map,
	mapTo,
	combineLatest,
	startWith,
} from 'rxjs/operators';

export type DataWithDisplay = CategoryData & { display: boolean };

export function categories(
	root: Element,
	state: Observable<CategoriesState>
): Component {
	const creation = of(
		SideEffect.create(
			(root, result) => {
				root.append(result);

				return result;
			},
			root,
			categoriesView()
		)
	).pipe(share());

	const displayState = state.pipe(map(displayOutOfState), share());

	const categoriesHandling = bind(
		creation,
		combineLatest(displayState),
		mergeMap(([ root, state ]) => {
			const categories = iterateObect(state).map(([ name ]) => {
				const catState = displayState.pipe(
					startWith(state),
					map(state => state[name])
				);

				return category(name, root, catState);
			});

			const catView = merge(...categories.map(cat => cat.updates));
			const catEvents = merge(
				...categories.map(cat => cat.clicks.pipe(mapTo(cat.name)))
			).pipe(
				map(
					clickedCat =>
						({
							name: 'categoryClicked',
							payload: clickedCat,
						} as CategoryAction)
				),
				map(action => SideEffect.create(update, action))
			);

			return merge(catView, catEvents);
		})
	);

	return {
		updates: categoriesHandling,
	};
}

type StateWithDisplay = Record<CategoryName, DataWithDisplay>;

function displayOutOfState({
	effects,
	usage,
}: CategoriesState): StateWithDisplay {
	return It.from(effects).concat(usage).map(withCatData).reduce((
		catDisplay,
		[ name, dataWithDisplay ]
	) => {
		catDisplay[name] = dataWithDisplay;

		return catDisplay;
	}, {} as Record<CategoryName, DataWithDisplay>);

	function withCatData({
		name,
		display,
	}: CategoryDisplay): [CategoryName, DataWithDisplay] {
		return [
			name,
			{
				display,
				...allCategories[name],
			},
		];
	}
}

function categoriesView(): Element {
	return jQuery(/*html*/ `<ul class="container-fluid"></ul>`);
}
