import * as $ from 'jquery';
import * as _ from 'lodash';
import * as marky from 'marky-markdown';
import 'rxjs/add/observable/concat';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/expand';
import { Observable } from 'rxjs/Observable';
import '../img';
import { categories as catDefinition, CategoryDisplay, CategoryName } from './categories';
import { combinationOperators } from './combination';
import { creationOperators } from './creation';
import { errorHandlingOperators } from './error-handling';
import { filteringOperators } from './filtering';
import { multicastOperators } from './multicast';
import { transformationOperators } from './transformation';

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
};

export function Operator(
	name: string,
	data: OperatorData,
	categoryDisplay: Observable<CategoryDisplay[]>,
) {
	const CAT_HIDDEN = 'cat-hidden';
	const opCategories = new Set(data.categories);
	const ui = $(`<li id="${ name }" class="operator panel panel-default">
		<div class="panel-heading">${ name }</div>
		<div class="container-fluid panel-body">
		<ul class="categories  col-sm-4 col-md-3 col-lg-2"></ul>
			<div class="operator-desc col-sm-8 col-md-9 col-lg-10">
			</div>
		</div>
	</li>`);

	if (data.img) {
		ui.find('.operator-desc')
			.append(`<img class="img-rounded" src="../img/${ data.img }">`);
	}
	ui.find('.categories')
		.append(
		...categories.map(category => categoryMarker(category, opCategories.has(category))),
	);

	const mdConversion = mdToHtml(data.description)
		.map(html => () => ui.find('.operator-desc')
			.prepend(html),
	);

	const [opDisplayed, opHidden] = categoryDisplay.map(catDisplay =>
		_(catDisplay).filter(({ display }) => display)
			.some(({ name }) => data.categories.includes(name))
	)
		.distinctUntilChanged()
		.share()
		.partition(isDisplayed => isDisplayed);

	const uiHandling = opDisplayed.map(() => () => ui.removeClass(CAT_HIDDEN))
		.merge(
		opHidden.map(() => () => ui.addClass(CAT_HIDDEN)),
	);
	return {
		ui,
		uiChanges: Observable.concat(
			mdConversion,
			uiHandling,
		),
	};
}

export function allOperators(
	root: JQuery<HTMLElement>,
	categoryDisplay: Observable<CategoryDisplay[]>
): Observable<() => void> {
	const operatorsData = Observable.from(
		_(operators)
			.toPairs()
			.orderBy([([name]) => name])
			.map(([name, data]: [string, OperatorData]) => ({ name, data }))
			.value()
	)
		.share();

	return operatorsData.mergeMap(({ name, data }) => {
		const { ui, uiChanges } = Operator(name, data, categoryDisplay);
		return Observable.of(() => root.append(ui))
			.concat(uiChanges);
	});
}
function categoryMarker(category: CategoryName, isActive: boolean) {
	const catElement = $(`<li class="category cat-${ category }" title="${ category }"></li>`);

	if (!isActive) {
		catElement.addClass('cat-inactive');
	}
	return catElement;
}
function mdToHtml(md: string): Observable<string> {
	return Observable.of<string>(marky(md));
}
