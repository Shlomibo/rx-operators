import { div, DOMSource, input, span, VNode } from '@cycle/dom';
import isolate from '@cycle/isolate';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/filter';
import { Observable } from 'rxjs/Observable';
import { Action, ActionDescriptor, Reducer, StateSource } from '../state/action';
import { searchActions, searchReducer, SearchState } from '../state/search';

export interface SearchSources {
	DOM: DOMSource;
	state: StateSource<SearchState>;
}
interface SearchSinks {
	DOM: Observable<VNode>;
	state: Observable<Reducer<SearchState>>;
}

interface IsolatedSources {
	DOM: DOMSource;
	state: StateSource<any>;
}
export interface IsolatedSinks {
	DOM: Observable<VNode>;
	state: Observable<Reducer<any>>;
}
export type SearchComponent = (sources: IsolatedSources) => IsolatedSinks;
export function makeSearch(scope: string | object): SearchComponent {
	return isolate(Search, scope);
}
function Search(sources: SearchSources): SearchSinks {
	const { search } = intent(sources);

	const vdom = sources.state.state$.map(searchView);

	return {
		DOM: vdom,
		state: search.let(searchReducer),
	};
}

interface Intentions {
	search: Observable<Action<any>>;
}
function intent({ DOM, state }: SearchSources): Intentions {
	const searches = Observable.from(DOM.select('.search').events('input'))
		.map(ev => (ev.target as HTMLInputElement).value)
		.debounceTime(250)
		.map(search => searchActions.search(search));

	const reset = Observable.from(DOM.select('.search').events('keydown'))
		.map((ev: KeyboardEvent) => ev.key)
		.filter(key => key === 'Escape')
		.mapTo(searchActions.reset());

	return {
		search: Observable.merge<Action<any>>(searches, reset),
	};
}

function searchView({ search }: SearchState): VNode {
	return div('.input-group', {}, [
		span('.input-group-addon', {}, [span('.glyphicon.glyphicon-search')]),
		input('.form-control.search', {
			attrs: {
				type: 'text',
			},
			props: {
				value: search,
			},
		}),
	]);
}
