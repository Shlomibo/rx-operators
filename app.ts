import 'bootstrap/dist/css/bootstrap.css';
import * as $ from 'jquery';
import * as _ from 'lodash';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/groupBy';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/pluck';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/shareReplay';
import { Observable } from 'rxjs/Observable';
import { GroupedObservable } from 'rxjs/operator/groupBy';
import { Subject } from 'rxjs/Subject';
import { allCategories } from './data/categories';
import { allOperators } from './data/operators';
import './style/style.less';

// Shared replaying document-ready stream
const ready = Observable.fromEvent(document, 'DOMContentLoaded')
	.shareReplay();

// UI handling stream
const handling = ready.mergeMap(() => {
	// Streams to notify when the page is page is scrolled/at the top
	const [scrolled, atTop] = Observable.fromEvent(window, 'scroll')
		.map(() => $(document).scrollTop()! > 50)
		.debounceTime(100)
		.distinctUntilChanged()
		.share()
		.partition(isScrolled => isScrolled);

	// Stream that shrinks the categories navbar when the page is scrolled
	const navShrinkHandling = scrolled.map(() => () => $('.navbar').addClass('shrink'))
		.merge(atTop.map(() => () => $('.navbar').removeClass('shrink')));

	const $search = $('#search'),
		// Searches stream
		search = Observable.fromEvent($search[0], 'input')
			.debounceTime(500)
			.map(() => <string>$search.val());

	const $categories = $('.categories'),
		$operators = $('.operators');

	const [
		// Categories' state handling stream
		categoryStateHandling,
		// Categories UI handling stream
		categoryUI,
	] = allCategories($categories);

	// Operators' UI handling
	const operatorsUI = allOperators($operators, categoryStateHandling, search);

	// Returns a stream of all UI changes
	return navShrinkHandling.merge(
		categoryUI,
		operatorsUI
	);
})
	.catch((err, source) => {
		// Log the error, then resubscribe
		console.error("WE'RE DOOMED!!!", err);
		return source;
	});

handling.subscribe({
	next: changeUI => changeUI(),
	error: err => console.error('WTF!!!', err),
	complete: () => console.warn('UI handling died'),
});
