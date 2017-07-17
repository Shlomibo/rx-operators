import * as $ from 'jquery';
import * as _ from 'lodash';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/partition';
import 'rxjs/add/operator/share';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';

export type CategoryName = 'data' |
	'time' |
	'error' |
	'completion' |
	'subscription' |
	'combination' |
	'filter' |
	'multicast' |
	'transformation' |
	'creation' |
	'conditional' |
	'aggregation' |
	'utility' |
	'debug';
export type CategoryType = 'effects' | 'usage';

export interface CategoryData {
	type: CategoryType;
	description: string;
}
export interface CategoryDisplay {
	name: CategoryName;
	display: boolean;
}

export const categories = <Record<CategoryName, CategoryData>>_({
	data: {
		type: 'effects',
		description: 'Do you want to change what is emitted?',
	},
	time: {
		type: 'effects',
		description: 'Do you want to change when data is emitted?',
	},
	error: {
		type: 'effects',
		description: 'Do you want to change if and when errors are emitted?',
	},
	completion: {
		type: 'effects',
		description: 'Do you want to change when an observable is completed?',
	},
	filter: {
		type: 'effects',
		description: 'Do you want to change which data is emitted?',
	},
	subscription: {
		type: 'effects',
		description: 'Do you want to change the way, or when, subscription is made to the source observable?',
	},
	combination: {
		type: 'usage',
		description: 'Operators that combines two or more observable',
	},
	multicast: {
		type: 'usage',
		description: 'Operators that multicasts the source observable',
	},
	transformation: {
		type: 'usage',
		description: 'Operators that transforms an observable',
	},
	aggregation: {
		type: 'effects',
		description: 'Do you want to produce a value from finite observable?'
	},
	creation: {
		type: 'effects',
		description: 'Creates observables from common structures and patterns, values or thin air.'
	},
	debug: {
		type: 'effects',
		description: 'Looking for something usefull to debug?'
	},
	conditional: {
		type: 'usage',
		description: 'Conditional and boolean operators'
	},
	utility: {
		type: 'usage',
		description: 'Utility operators.'
	}
})
	.toPairs<CategoryData>()
	.orderBy([
		([, { type }]) => type,
	])
	.reduce((categories, [name, data]) => {
		categories[name] = data;
		return categories;
	}, <Partial<Record<CategoryName, CategoryData>>>{ });

const EFFECTS_CATEGORIES_COUNT = _(categories)
	.toPairs()
	.filter(([, data]: [string, CategoryData]) => data.type === 'effects')
	.value()
	.length;
const typeInitialization: Record<CategoryType, (cat: CategoryName) => boolean> = {
	effects: cat => true,
	usage: cat => false,
};
type DisplaySelection = (categories: CategoryName[]) => boolean;
const typeOperatorSelection: Record<CategoryType, (selected: CategoryName[]) => DisplaySelection> = {
	usage: selected => opCategories => _(opCategories)
		.filter(category => categories[category].type === 'usage')
		.some(opCategory => selected.includes(opCategory)),
	effects: selected => opCategories => selected.length === EFFECTS_CATEGORIES_COUNT ||
		selected.every(selectedCat => opCategories.includes(selectedCat)),
};
export function Category(
	name: CategoryName,
	data: CategoryData,
	activationFn: (clicks: Observable<CategoryName>) => Observable<CategoryName[]>) {
	const CLS_INACTIVE = 'cat-inactive';

	const inactivation = typeInitialization[data.type](name) ? '' : CLS_INACTIVE;
	const ui = $(`<li class="category btn cat-${ name } ${ inactivation }"
					  title="${ data.description }">${ name }</li>`),
		click = Observable.fromEvent(ui[0], 'click'),
		activation = activationFn(click.mapTo(name));

	const [activate, deactivate] = activation.map(activated => activated.includes(name))
		.distinctUntilChanged()
		.share()
		.partition(isActive => isActive);

	return {
		ui,
		click,
		uiChanges: activate.map(() => () => ui.removeClass(CLS_INACTIVE))
			.merge(
			deactivate.map(() => () => ui.addClass(CLS_INACTIVE)),
		),
	};
}
export function allCategories(
	root: JQuery<HTMLElement>
): [Observable<DisplaySelection>, Observable<() => void>] {
	const clicksSubject = new Subject<CategoryName>(),
		[categoryHandling, mergeClicks] = getClicksMerger(clicksSubject);

	const categoryCreation = Observable.from(
		_(categories)
			.toPairs()
			.map(([name, data]: [CategoryName, CategoryData]) => ({ name, data }))
			.value()
	)
		.map(({ name, data }) => Category(name, data, mergeClicks));

	return [
		categoryHandling,
		categoryCreation.mergeMap(({ ui, uiChanges }) =>
			Observable.of(() => root.append(ui))
				.concat(uiChanges)
		),
	];
}

type CategoryState = Record<CategoryType, CategoryDisplay[]> & {
	active: CategoryType,
};
function getClicksMerger(
	clicksSubject: Subject<CategoryName>
): [
		Observable<DisplaySelection>,
		(catClicks: Observable<CategoryName>) => Observable<CategoryName[]>
] {
	const displayOutOfName = (name: CategoryName) => ({
		name,
		display: typeInitialization[categories[name].type](name),
	}),
		byTypeFilter = (type: CategoryType) => (name: CategoryName) => categories[name].type === type,
		categoryNames = _(categories)
			.keys(),
		effectCategories = categoryNames.filter(byTypeFilter('effects')),
		usageCategories = categoryNames.filter(byTypeFilter('usage')),
		categoriesState: CategoryState = {
			effects: effectCategories.map(displayOutOfName)
				.value(),
			usage: usageCategories.map(displayOutOfName)
				.value(),
			active: 'effects',
		};

	const catHandling = clicksSubject.asObservable()
		.scan(categoryHandling, categoriesState)
		.map(({ active, ...categories }) => {
			const typeCategories = categories[active];
			const selectedCategories = _(typeCategories)
					.filter(({ display }) => display)
					.map(({ name }) => name)
					.value();

			return {
				selectedCategories,
				active,
			};
		});

	return [
		catHandling.map(({ selectedCategories, active }) => typeOperatorSelection[active](selectedCategories)),

		function mergeClicks(clicks: Observable<CategoryName>): Observable<CategoryName[]> {
			return Observable.create((observer: Observer<CategoryName[]>) => {
				const subscription = catHandling.pluck<{}, CategoryName[]>('selectedCategories')
					.subscribe(observer)
					.add(clicks.subscribe(clicksSubject));

				return subscription;
			});
		}];

	function categoryHandling(
		{ effects, usage }: CategoryState,
		category: CategoryName
	): CategoryState {
		const activeType = categories[category].type;
		return {
			effects: activeType !== 'effects'
				? effects
				: typeHandling(effects, category),
			usage: activeType !== 'usage'
				? usage
				: typeHandling(usage, category),
			active: activeType,
		};
	}

	function typeHandling(typeState: CategoryDisplay[], category: CategoryName): CategoryDisplay[] {
		const filteredCategories = typeState.filter(({ name }) => name !== category),
			isTypeFull = typeState.every(({ display }) => display) ||
				filteredCategories.every(({ display }) => !display);

		// If the category-type isn't full, return state, with the selected category-display flipped
		return !isTypeFull
			? typeState.map(({ name, display }) => name !== category
				? { name, display }
				: { name, display: !display }
			)
			// Otherwise, the whole category type is non-displayed except of the selected category
			: typeState.map(({ name, display }) => ({
				name,
				display: name === category || !display
			}));
	}
}
