import { div, DOMSource, h5, main, nav, VNode } from '@cycle/dom';
import * as _ from 'lodash';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/empty';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { makeCategories, DataWithDisplay } from './categories';
import { makeOperators, OperatorsState } from './operators';
import { makeSearch } from './search';
import { operators, Operators as OperatorsType } from '../data/operators';
import {
	Reducer,
	StateReducers,
	StateSource,
	simpleLens,
} from '../state/action';
import { AppState } from '../state/app';
import { mergedObservables } from '../utils/observable-merger';
import { Lens } from 'cycle-onionify';
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
	state: StateSource<AppState>;
}
export interface AppSinks {
	DOM: Observable<VNode>;
	state: Observable<Reducer<AppState>>;
}
export function App(sources: AppSources): AppSinks {
	const { uiProps, states } = intent(sources);

	return {
		DOM: uiProps.map(appView),
		state: states,
	};
}

const Categories = makeCategories({
	DOM: null,
	state: simpleLens<AppState, 'categories'>('categories'),
});
const Search = makeSearch({
	DOM: null,
	state: simpleLens<AppState, 'search'>('search'),
});
const opStateLens: Lens<AppState, OperatorsState> = {
		get: state => state && opState(state),
		set: (state, opState) =>
			(opState && mergeOpState(state, opState)) || state,
	},
	Operators = makeOperators({
		DOM: null,
		state: opStateLens,
	});

function opState({
	search: { search },
	categories: { displaySelection },
}: AppState): OperatorsState {
	return {
		search,
		categoryDisplay: displaySelection,
	};
}
function mergeOpState(
	state: AppState | undefined,
	opState: OperatorsState
): AppState {
	const { search, categories } = state || ({} as Partial<AppState>);

	return {
		...state as AppState,
		search: {
			...search,
			search: opState.search,
		},
		categories: {
			...categories as AppState['categories'],
			displaySelection: opState.categoryDisplay,
		},
	};
}

type CategoriesDataAndState = Record<CategoryName, DataWithDisplay>;
interface Intentions {
	uiProps: Observable<AppProps>;
	states: Observable<Reducer<AppState>>;
}
function intent(sources: AppSources): Intentions {
	const { DOM, state } = sources;

	const statesSource = state.state$.filter(
		state => !!state && Object.keys(state).length > 0
	);

	const { DOM: categoriesDOMSink, state: catStates } = Categories(sources);

	const { DOM: searchDOMSink, state: searchStates } = Search(sources);
	const { DOM: operatorsDOMSink } = Operators({
		...sources,
		operators,
	});

	const states = Observable.merge(searchStates, catStates);

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

		states,
	};
}

interface AppProps {
	categoriesView: VNode;
	operatorsView: VNode;
	searchView: VNode;
}
function appView({
	categoriesView,
	operatorsView,
	searchView,
}: AppProps): VNode {
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
