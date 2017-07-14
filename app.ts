import 'bootstrap/dist/css/bootstrap.css';
import * as $ from 'jquery';
import * as _ from 'lodash';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/concatMap';
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

const ready = Observable.fromEvent(document, 'DOMContentLoaded')
	.shareReplay();

const handling = ready.mergeMap(() => {
	const $categories = $('.categories'),
		$operators = $('.operators');

	const [
		handling,
		categoryUI
	] = allCategories($categories);

	const operatorsUI = allOperators($operators, handling);

	return categoryUI.merge(operatorsUI);
})
	.catch((err, source) => {
		console.error("WE'RE DOOMED!!!", err);
		return source;
	});

handling.subscribe({
	next: changeUI => changeUI(),
	error: err => console.error('WTF!!!', err),
	complete: () => console.warn('UI handlingcompleted'),
});
