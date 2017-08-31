import { DOMSource, li, VNode } from '@cycle/dom';
import * as _ from 'lodash';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/mergeMap';
import { Observable } from 'rxjs/Observable';
import { category, CategoryProps, CategorySinks } from './category';
import { CategoryData, CategoryName } from '../data/categories';

export type DataWithDisplay = CategoryData & { display: boolean };
export type CategoriesState = Record<CategoryName, boolean>;

export interface CategoriesSources {
	categoryDisplay: Record<CategoryName, DataWithDisplay>;
	displayUpdates: Observable<CategoriesState>;
	DOM: DOMSource;
}
export interface CategoriesSinks {
	categoryClicks: Observable<CategoryName>;
	DOM: Observable<VNode>;
}
export function categories(sources: CategoriesSources): CategoriesSinks {
	const { categoryClicks, categoriesDOM } = intent(sources);

	return {
		categoryClicks,
		DOM: categoriesDOM.startWith(categoriesView()),
	};
}

interface Intentions {
	categoryClicks: Observable<CategoryName>;
	categoriesDOM: Observable<VNode>;
}
function intent({ DOM, displayUpdates, categoryDisplay }: CategoriesSources): Intentions {
	const updates = displayUpdates.share();

	const categoriesDOM = DOM.select('li.container-fluid');

	const categoriesSinks = Observable.from(
		_(categoryDisplay)
			.toPairs()
			.map(
				(
					[name, { description, display: initialDisplay }]: [
						CategoryName,
						DataWithDisplay
					]
				) => ({
					name,
					category: category({
						DOM: categoriesDOM,
						props: updates
							.let(getCategoryUpdates(name))
							.startWith(initialDisplay)
							.distinctUntilChanged()
							.map(display => ({
								name,
								display,
								description,
							})),
					}),
				})
			)
			.value()
	);

	return {
		categoryClicks: categoriesSinks.mergeMap(({ name, category }) =>
			category.clicks.mapTo(name)
		),
		categoriesDOM: categoriesSinks.mergeMap(({ category }) => category.DOM),
	};
}
function getCategoryUpdates(name: CategoryName) {
	return (updates: Observable<CategoriesState>) =>
		updates.map(categories => categories[name]);
}

function categoriesView(): VNode {
	return li('.container-fluid');
}
