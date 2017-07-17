import * as $ from 'jquery';
import * as _ from 'lodash';
import * as marked from 'marked';
import 'rxjs/add/observable/concat';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/expand';
import { Observable } from 'rxjs/Observable';
import '../img';
import { aggregationOprators } from './aggregation';
import { categories as catDefinition, CategoryDisplay, CategoryName } from './categories';
import { combinationOperators } from './combination';
import { conditionalOperators } from './conditional';
import { creationOperators } from './creation';
import { errorHandlingOperators } from './error-handling';
import { filteringOperators } from './filtering';
import { multicastOperators } from './multicast';
import { transformationOperators } from './transformation';
import { utilityOperators } from './utility';

export interface OperatorData {
	categories: CategoryName[];
	img?: string;
	description: string;
}

const categories = <CategoryName[]>Object.keys(catDefinition);
export const operators = {
	...combinationOperators,
	...errorHandlingOperators,
	...filteringOperators,
	...multicastOperators,
	...transformationOperators,
	...creationOperators,
	...conditionalOperators,
	...aggregationOprators,
	...utilityOperators,
};

/**
 * A function that based on a root-element, category-display-stream and seach-stream,
 *    returns UI-updating stream
 * @param root The root element that operator elements would be appended to
 * @param categoryDisplay A stream of functions to determine if operator should be displayed,
 *    based on the displayed categories
 * @param search A stream of operator searches
 * @returns A stream of UI-changes
 */
export function allOperators(
	root: JQuery<HTMLElement>,
	categoryDisplay: Observable<(categories: CategoryName[]) => boolean>,
	search: Observable<string>
): Observable<() => void> {
	// A stream of operators data
	const operatorsData = Observable.from(
		_(operators)
			.toPairs()
			.orderBy([([name]) => name])
			.map(([name, data]: [string, OperatorData]) => ({ name, data }))
			.value()
	);

	// Merge map each operator to its UI-updating stream
	return operatorsData.mergeMap(({ name, data }) => {
		const { ui, uiChanges } = Operator(name, data, categoryDisplay, search);

		return uiChanges.startWith(() => root.append(ui));
	});
}

/**
 * Creates operator UI-handling stream
 * @param name Name of the operator
 * @param data Operator's data
 * @param categoryDisplay A stream of functions to determine if operator should be displayed
 * @param search A stream of operator searches
 */
function Operator(
	name: string,
	data: OperatorData,
	categoryDisplay: Observable<(categories: CategoryName[]) => boolean>,
	search: Observable<string>
) {
	const CAT_HIDDEN = 'cat-hidden';

	// A set of operator's categories
	const opCategories = new Set(data.categories);

	const ui = $(`<li id="${ name }" class="operator panel panel-default">
		<div class="panel-heading">${ name }</div>
		<div class="container-fluid panel-body">
		<ul class="categories  col-sm-4 col-md-8 col-lg-3"></ul>
			<div class="operator-desc col-sm-8 col-md-8 col-lg-9">
			</div>
		</div>
	</li>`);

	if (data.img) {
		ui.find('.operator-desc')
			.append(`<img class="img-rounded" src="../img/${ data.img }">`);
	}

	// Append operator's categories marker
	ui.find('.categories')
		.append(
		...categories.map(category => categoryMarker(category, opCategories.has(category))),
	);

	// A stream that convert operator description to HTML, then add it to the UI
	const mdConversion = mdToHtml(data.description)
		.map(html => () => ui.find('.operator-desc')
			.prepend(html),
	);

	// Streams that notify when operator is viewed/hidden by search
	const [viewBySearch, filterBySearch] = search.map(search => search.toLowerCase())
		.map(search =>
			name.toLowerCase()
				.startsWith(search)
		)
		.distinctUntilChanged()
		.share()
		.partition(filterredBySearch => filterBySearch);

	// Search handling stream
	const searchHandling = viewBySearch.map(() => () => ui.removeClass('hidden'))
		.merge(filterBySearch.map(() => () => ui.addClass('hidden')));

	// Streams that notify when operator should be displayed/hidden by current categories' state
	const [opDisplayed, opHidden] = categoryDisplay.map(shouldDisplay => shouldDisplay(data.categories))
		.distinctUntilChanged()
		.share()
		.partition(isDisplayed => isDisplayed);

	// Category view handling stream
	const categoryViewHandling = searchHandling.merge(
		opDisplayed.map(() => () => ui.removeClass(CAT_HIDDEN)),
		opHidden.map(() => () => ui.addClass(CAT_HIDDEN))
	);
	return {
		ui,
		// Add markdown description, only then handle the rest
		uiChanges: Observable.concat(
			mdConversion,
			categoryViewHandling,
		),
	};
}

/**
 * Creates category marker element, from category name and activation status
 * @param category Category name
 * @param isActive Is category part of operator's categories
 * @returns Category marker html element
 */
function categoryMarker(category: CategoryName, isActive: boolean) {
	const catElement = $(`<li class="category cat-${ category }" title="${ category }"></li>`);

	if (!isActive) {
		catElement.addClass('cat-inactive');
	}
	return catElement;
}
function mdToHtml(md: string): Observable<string> {
	return Observable.of<string>(marked(md));
}
