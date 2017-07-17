import * as $ from 'jquery';
import * as _ from 'lodash';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/multicast';
import 'rxjs/add/operator/partition';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/startWith';
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

/**
 * @var categories All the categories
 */
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
/**
 * @var typeInitialization Category initialization by category-type
 */
const typeInitialization: Record<CategoryType, (cat: CategoryName) => boolean> = {
	effects: cat => true,
	usage: cat => false,
};
type DisplaySelection = (categories: CategoryName[]) => boolean;
/**
 * @var typeOperatorSelection Mappping from category-type to functions, that returns functions to determine
 *    operator viewability
 */
const typeOperatorSelection: Record<CategoryType, (selected: CategoryName[]) => DisplaySelection> = {
	usage: selected => opCategories => _(opCategories)
		.filter(category => categories[category].type === 'usage')
		.some(opCategory => selected.includes(opCategory)),
	effects: selected => opCategories => selected.length === EFFECTS_CATEGORIES_COUNT ||
		selected.every(selectedCat => opCategories.includes(selectedCat)),
};

/**
 * Creates stream of functions to determine operators viewability, and UI-changes stream to add and
 *    update categories UI
 * @param {JQuery} root Root element that categories should be appended to
 * @returns {[Observable.<Function>, Observable.<Function>]} A tuple of display-determining functions stream,
 *    and UI-changes stream.
 */
export function allCategories(
	root: JQuery<HTMLElement>
): [Observable<DisplaySelection>, Observable<() => void>] {
	// Clicks subject, to multicast all category-click from
	const clicksSubject = new Subject<CategoryName>(),
		[operatorsHandling, clickStreamsMerger] = getClicksMerger(clicksSubject);

	// An observable to add categories UI
	const categoryCreation = Observable.from(
		_(categories)
			.toPairs()
			.map(([name, data]: [CategoryName, CategoryData]) => ({ name, data }))
			.value()
	)
		.map(({ name, data }) => Category(name, data, clickStreamsMerger));

	return [
		// A stream of functions to check if an operator should be viewed
		operatorsHandling,
		// A stream to create and update the UI
		categoryCreation.mergeMap(({ ui, uiChanges }) =>
			// UI changes, started by appending categories UI element
			uiChanges.startWith(() => root.append(ui))
		),
	];
}
/**
 * Creates UI-manipulating stream for specific category, and hooks everything needed to it
 * @param name The name of the category
 * @param data Category's metata
 * @param activationByClicks A functions that receives category's clicks stream, and returns a stream
 *   of currently selected categories
 * @returns An object with 'ui' property containing the category UI element, and 'uiChanges' property
 *    containing a UI-changes stream
 */
function Category(
	name: CategoryName,
	data: CategoryData,
	activationByClicks: (clicks: Observable<CategoryName>) => Observable<CategoryName[]>
): {
	ui: JQuery<HTMLElement>;
	uiChanges: Observable<() => void>;
} {
	const CLS_INACTIVE = 'cat-inactive';

	// Check if the category should be initialized as active
	const isCategoryActive = typeInitialization[data.type](name),
	// Set CSS class accordingly
		inactivation = isCategoryActive ? '' : CLS_INACTIVE;

	// Create the UI element to be added to the DOM
	const ui = $(`<li class="category btn cat-${ name } ${ inactivation }"
					  title="${ data.description }">${ name }</li>`),
		// Get clicks stream from the UI
		click = Observable.fromEvent(ui[0], 'click'),
		// And category activation stream from category-clicks
		activation = activationByClicks(click.mapTo(name));

	// Partition the activation stream according to currently activated categories
	const [activate, deactivate] = activation.map(activated => activated.includes(name))
		.distinctUntilChanged()
		.share()
		.partition(isActive => isActive);

	return {
		// The UI element
		ui,
		// A stream the append the category UI, and manipulate it
		uiChanges: activate.map(() => () => ui.removeClass(CLS_INACTIVE))
			.merge(
			deactivate.map(() => () => ui.addClass(CLS_INACTIVE)),
		),
	};
}

type CategoryState = Record<CategoryType, CategoryDisplay[]> & {
	active: CategoryType,
};
/**
 * Based on the supplied subject, creates a stateful display-determination-functions stream, and a function to merge
 *    a category-stream into that stream
 * @param clicksSubject The subject to merge category-stream through
 * @returns A tuple with an Observable that produce functions that check if specific category
 */
function getClicksMerger(
	clicksSubject: Subject<CategoryName>
): [
		Observable<DisplaySelection>,
		(catClicks: Observable<CategoryName>) => Observable<CategoryName[]>
] {
	// A function that map category-display object, from category-name
	const displayOutOfName = (name: CategoryName) => ({
		name,
		display: typeInitialization[categories[name].type](name),
	});

	// A function to create category-filter (a filtering function) from category-type
	const byTypeFilter = (type: CategoryType) => (name: CategoryName) => categories[name].type === type;

	// Lodash wrapper to category-names
	const categoryNames = _(categories)
			.keys(),
		effectCategories = categoryNames.filter(byTypeFilter('effects')),
		usageCategories = categoryNames.filter(byTypeFilter('usage'));

	// Initial categoy state
	const categoriesState: CategoryState = {
			effects: effectCategories.map(displayOutOfName)
				.value(),
			usage: usageCategories.map(displayOutOfName)
				.value(),
			active: 'effects',
		};

	// The category handling stream is created from the multicast subject
	const catHandling = clicksSubject.asObservable()
		// Scanned to update categories-state, based on clicked category
		.scan(categoryHandling, categoriesState)
		// Mapped to current active-categories, and active category-type
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
		// A stream of operator-viewability functions
		catHandling.map(({ selectedCategories, active: activeType }) =>
			typeOperatorSelection[activeType](selectedCategories)),

		// A function that creates an observable that multicasts given category-clicks stream,
		//    and returns currently active categories
		function mergeClicks(clicks: Observable<CategoryName>): Observable<CategoryName[]> {
			return Observable.create((observer: Observer<CategoryName[]>) => {
				const subscription = catHandling.pluck<{}, CategoryName[]>('selectedCategories')
					.subscribe(observer)
					.add(clicks.subscribe(clicksSubject));

				return subscription;
			});
		}];

	/**
	 * Categories' state handling
	 * @param param Current categories' state
	 * @param category Clicked category
	 * @returns New categories' state
	 */
	function categoryHandling(
		{ effects, usage }: CategoryState,
		category: CategoryName
	): CategoryState {
		const activeType = categories[category].type;

		switch (activeType) {
			case 'effects': {
				effects = typeHandling(effects, category);
				break;
			}
			case 'usage': {
				usage = typeHandling(usage, category);
				break;
			}
			default: {
				throw new Error('Unknown category-type');
			}
		}

		return {
			effects,
			usage,
			active: activeType,
		};
	}

	/**
	 * Handles categories of specific type: Smart toggle the clicked category
	 * @param typeState An array of category-display objects, representing the current state of all categories
	 *    in a specific category-type
	 * @param clickedCategory The clicked category
	 * @returns An array of category-display objects, representing the new state of all categories
	 *    in a specific category-type
	 */
	function typeHandling(typeState: CategoryDisplay[], clickedCategory: CategoryName): CategoryDisplay[] {
		// All categories excluding the clicked one
		const filteredCategories = typeState.filter(({ name }) => name !== clickedCategory);

		// Current category type considerred full, if all categories are displayed
		const isTypeFull = typeState.every(({ display }) => display) ||
			// or if all categories, but the clicked category, are non-displayed.
			filteredCategories.every(({ display }) => !display);

		// If the category-type isn't full, return state, with the selected category-display flipped
		return !isTypeFull
			? typeState.map(({ name, display }) => name !== clickedCategory
				? { name, display }
				: { name, display: !display }
			)
			// Otherwise, the whole category type is flipped, except of the selected category
			: typeState.map(({ name, display }) => ({
				name,
				display: name === clickedCategory || !display
			}));
	}
}
