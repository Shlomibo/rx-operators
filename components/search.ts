import { div, DOMSource, input, span, VNode } from '@cycle/dom';
import 'rxjs/add/observable/from';
import { Observable } from 'rxjs/Observable';

export interface SearchSources {
	DOM: DOMSource;
	reset: Observable<any>;
}
export interface SearchSinks {
	DOM: Observable<VNode>;
	searches: Observable<string>;
}
export function search(sources: SearchSources): SearchSinks {
	const { search } = intent(sources);

	const vdom = search.map(view);

	return {
		DOM: vdom,
		searches: search,
	};
}

interface Intentions {
	search: Observable<string>;
}
function intent({ DOM, reset }: SearchSources): Intentions {
	const searches = Observable.from(DOM.select('input').events('input'))
		.map(ev => (ev.target as HTMLInputElement).value)
		.debounceTime(250);

	const escapeClick = Observable.from(DOM.select('input').events('keydown'))
		.map((ev: KeyboardEvent) => ev.key)
		.filter(key => key === 'Escape');
	const clearSearch = Observable.merge(reset, escapeClick).mapTo('');

	return {
		search: Observable.merge(searches, clearSearch),
	};
}

function view(search: string): VNode {
	return div('.input-group', [
		span('.input-group-addon', [span('.glyphicon.glyphicon-search')]),
		input('.form-control', {
			type: 'text',
			value: search,
		}),
	]);
}
