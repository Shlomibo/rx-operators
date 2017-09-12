import { DOMSource, ul, VNode } from '@cycle/dom';
import isolate from '@cycle/isolate';
import * as _ from 'lodash';
import 'rxjs/add/operator/combineAll';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/shareReplay';
import { Observable } from 'rxjs/Observable';
import {
	Category,
	CategoryProps,
	CategorySinks,
	CategorySources,
} from './category';
import {
	Action,
	ActionDescriptor,
	Reducer,
	StateSource,
} from '../state/action';
import {
	categoriesReducer,
	CategoriesState,
	categoryActions,
} from '../state/categories';
import {
	CategoryData,
	CategoryName,
	categories,
	CategoryDisplay,
} from '../data/categories';

export type DataWithDisplay = CategoryData & { display: boolean };
// export type CategoriesState = Record<CategoryName, boolean>;

interface CategoriesSources {
	DOM: DOMSource;
	state: StateSource<CategoriesState>;
}
interface CategoriesSinks {
	DOM: Observable<VNode>;
	state: Observable<Reducer<CategoriesState>>;
}

export interface IsolatedSources {
	DOM: DOMSource;
	state: StateSource<any>;
}
export interface IsolatedSinks {
	DOM: Observable<VNode>;
	state: Observable<Reducer<any>>;
}
export type CategoriesComponent = (sources: IsolatedSources) => IsolatedSinks;
export function makeCategories(scope: string | object): CategoriesComponent {
	return isolate(Categories, scope);
}
function Categories(sources: CategoriesSources): CategoriesSinks {
	const { categoriesDOM, clicks } = intent(sources);

	return {
		DOM: categoriesDOM.map(categoies => categoriesView(categoies)),
		state: clicks.let(categoriesReducer),
	};
}

interface Intentions {
	categoriesDOM: Observable<VNode[]>;
	clicks: Observable<ActionDescriptor<CategoryName | undefined>>;
}
interface CategoriesSink {
	name: CategoryName;
	category: CategorySinks;
}
function intent({ DOM, state }: CategoriesSources): Intentions {
	const categoriesDOM = DOM.select('ul.container-fluid');

	const categoriesSinks: Observable<CategoriesSink[]> = state.state$
		.filter(state => !!state)
		.map(displayOutOfState)
		.map(categoryDisplay =>
			_(categoryDisplay)
				.toPairs()
				.map(([ name, { description, display: initialDisplay }
				]: [CategoryName, DataWithDisplay]) => ({
					name,
					category: Category({
						DOM: categoriesDOM,
						props: {
							name,
							display: categoryDisplay[name].display,
							description: categoryDisplay[name].description,
						},
					}),
				}))
				.value()
		)
		.shareReplay();

	return {
		categoriesDOM: categoriesSinks.map(catSinks =>
			catSinks.map(({ category }) => category.DOM)
		),

		clicks: categoriesSinks
			.switchMap(sinks =>
				Observable.from(sinks).mergeMap(({ name, category }) =>
					category.clicks.mapTo(name)
				)
			)
			.map(name => categoryActions.categoryClicked(name)),
	};
}

function displayOutOfState({
	effects,
	usage,
}: CategoriesState): Record<CategoryName, DataWithDisplay> {
	return _(effects).concat(usage).map(withCatData).reduce((
		catDisplay,
		[
			name,
			dataWithDisplay,
		]
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
				...categories[name],
			},
		];
	}
}

function categoriesView(categories: VNode[]): VNode {
	return ul('.container-fluid', {}, categories);
}
