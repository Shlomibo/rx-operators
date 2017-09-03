import { div, DOMSource, h5, main, nav, VNode } from '@cycle/dom';
import * as _ from 'lodash';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/empty';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Categories, CategoriesState, DataWithDisplay } from './categories';
import { Operators } from './operators';
import { Search } from './search';
import { categoriesStateHandling, typeOperatorSelection } from '../app-logic';
import { operators, Operators as OperatorsType } from '../data/operators';
import { mergedObservables } from '../utils/observable-merger';
import {
	CategoryName,
	categories,
	CategoryData,
	initialDisplayOutOfName,
	CategoryDisplay,
} from '../data/categories';

export const CLS_CAT_INACTIVE = 'cat-inactive';

export type DisplaySelection = (categories: CategoryName[]) => boolean;
export interface AppSources {
	DOM: DOMSource;
}
export interface AppSinks {
	DOM: Observable<VNode>;
}
export function App(sources: AppSources): AppSinks {
	const catStateInit = _(categories)
		.toPairs()
		.map(([name, data]: [CategoryName, CategoryData]) => ({
			name,
			data: {
				...data,
				display: initialDisplayOutOfName(name).display,
			} as DataWithDisplay,
		}))
		.reduce(
			(state, { name, data }) => {
				state[name] = data;
				return state;
			},
			({} as any) as CategoriesDataAndState
		);

	const { uiProps } = intent(sources, catStateInit);

	return {
		DOM: uiProps.map(appView),
	};
}

type CategoriesDataAndState = Record<CategoryName, DataWithDisplay>;
interface Intentions {
	uiProps: Observable<AppProps>;
}
function intent({ DOM }: AppSources, catStateInit: CategoriesDataAndState): Intentions {
	const { observable: catClicks, merger: mergeCategoryClicks } = mergedObservables<
		CategoryName
	>();

	const catState = categoriesStateHandling(catClicks);

	const displayUpdates = catState.map(({ active, effects, usage }) => {
		switch (active) {
			case 'effects': {
				usage = usage.map(({ name }) => ({ name, display: false }));
				break;
			}
			case 'usage': {
				effects = effects.map(({ name }) => ({ name, display: false }));
				break;
			}
			default: {
				throw new Error('Unknow category type');
			}
		}

		return _(effects).concat(usage).reduce((state, { name, display }) => {
			state[name] = display;
			return state;
		}, ({} as any) as CategoriesState);
	});
	const { DOM: categoriesDOMSink, clicks } = Categories({
		DOM,
		categoryDisplay: catStateInit,
		categoriesState: displayUpdates,
	});
	mergeCategoryClicks(clicks);

	const { DOM: searchDOMSink, searches } = Search({ DOM, reset: Observable.empty() });
	const { DOM: operatorsDOMSink } = Operators({
		DOM,
		operators,
		categoryDisplay: catState.map(({ active: activeType, ...categories }) => {
			const activeCategories = categories[activeType];
			const selectedCategories = _(activeCategories)
				.filter(({ display }) => display)
				.map(({ name }) => name)
				.value();

			return typeOperatorSelection[activeType](selectedCategories);
		}),
		search: searches,
	});

	return {
		uiProps: Observable.combineLatest(
			categoriesDOMSink,
			operatorsDOMSink,
			searchDOMSink,
			(categoriesView, operatorsView, searchView) => ({
				categoriesView,
				operatorsView,
				searchView,
			})
		),
	};
}

interface AppProps {
	categoriesView: VNode;
	operatorsView: VNode;
	searchView: VNode;
}
function appView({ categoriesView, operatorsView, searchView }: AppProps): VNode {
	return div('', {}, [
		nav('.navbar.navbar-default.navbar-fixed-top', {}, [
			div('.container', {}, [
				h5('.col-md-8', {}, 'RX operators'),
				div('.col-md-4', {}, searchView),
			]),
			div('.categories', {}, categoriesView),
		]),
		main('', {}, operatorsView),
	]);
}
