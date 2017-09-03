import { DOMSource, ul, VNode } from '@cycle/dom';
import * as _ from 'lodash';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/combineAll';
import { Observable } from 'rxjs/Observable';
import { Category, CategoryProps, CategorySinks } from './category';
import { CategoryData, CategoryName, categories } from '../data/categories';
import { debug } from '../utils/index';

export type DataWithDisplay = CategoryData & { display: boolean };
export type CategoriesState = Record<CategoryName, boolean>;

export interface CategoriesSources {
	categoryDisplay: Record<CategoryName, DataWithDisplay>;
	categoriesState: Observable<CategoriesState>;
	DOM: DOMSource;
}
export interface CategoriesSinks {
	DOM: Observable<VNode>;
	clicks: Observable<CategoryName>;
}
export function Categories(sources: CategoriesSources): CategoriesSinks {
	const { categoriesDOM, clicks } = intent(sources);

	return {
		DOM: categoriesDOM.map(categoies => categoriesView(categoies)),
		clicks,
	};
}

interface Intentions {
	categoriesDOM: Observable<VNode[]>;
	clicks: Observable<CategoryName>;
}
interface CategoriesSink {
	name: CategoryName;
	category: CategorySinks;
}
function intent({
	DOM,
	categoryDisplay,
	categoriesState,
}: CategoriesSources): Intentions {
	const categoriesDOM = DOM.select('ul.container-fluid');

	const categoriesSinks: Observable<CategoriesSink> = Observable.from(
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
					category: Category({
						DOM: categoriesDOM,
						props: categoriesState
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
	).share();

	return {
		categoriesDOM: categoriesSinks
			.map(({ category }) => category.DOM)
			.combineAll((...nodes: VNode[]) => nodes),

		clicks: categoriesSinks.mergeMap(({ name, category }) =>
			category.clicks.mapTo(name)
		),
	};
}
function getCategoryUpdates(name: CategoryName) {
	return (updates: Observable<CategoriesState>) =>
		updates.map(categories => categories[name]);
}

function categoriesView(categories: VNode[]): VNode {
	return ul('.container-fluid', {}, categories);
}
