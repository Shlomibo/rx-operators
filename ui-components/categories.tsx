import * as _ from 'lodash';
import * as React from 'react';
import { render } from 'react-dom';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/mergeAll';
import 'rxjs/add/operator/mergeMapTo';
import 'rxjs/add/operator/pluck';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import {
	categories,
	CategoriesData,
	CategoryData,
	CategoryDisplay,
	CategoryName,
	CategoryType
	} from '../data/categories';
import { createSideEffect, SideEffect } from '../side-effects';

type DisplaySelection = (categories: CategoryName[]) => boolean;

/**
 * Creates stream of functions to determine operators viewability, and UI-changes stream to add and
 *    update categories UI
 * @param {JQuery} root Root element that categories should be appended to
 * @returns {[Observable.<Function>, Observable.<Function>]} A tuple of display-determining functions stream,
 *    and UI-changes stream.
 */
export function allCategories(
	root: Element
): [Observable<DisplaySelection>, Observable<SideEffect>] {
	const uiChanges = new Subject<SideEffect>(),
		displaySelection = new Subject<DisplaySelection>();

	const uiCreation = createSideEffect(
		'categories',
		Observable.hotBindCallback(render),
		(<Categories categoriesData={categories}
			uiChanges={uiChanges}
			displaySelection={displaySelection}
			initialDisplay={
				_(categories)
					.keys()
					.map(displayOutOfName)
					.value()
			}
		/>),
		root
	);
	const uiHandling = Observable.of(uiCreation)
		.concat(uiCreation.completed.mergeAll()
			.mergeMapTo(uiChanges));

	return [
		// A stream of functions to check if an operator should be viewed
		displaySelection.asObservable(),

		// A stream to create and update the UI
		uiHandling,
	];
}

/**
 * @var typeInitialization Category initialization by category-type
 */
const typeInitialization: Record<CategoryType, (cat: CategoryName) => boolean> = {
	effects: cat => true,
	usage: cat => false,
};
const EFFECTS_CATEGORIES_COUNT = _(categories)
	.toPairs()
	.filter(([, data]: [string, CategoryData]) => data.type === 'effects')
	.value()
	.length;

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

interface CategoryAndData {
	name: CategoryName;
	data: CategoryData;
}
interface CategoriesProperties {
	uiChanges: Observer<SideEffect>;
	categoriesData: CategoriesData;
	displaySelection: Observer<DisplaySelection>;
	initialDisplay: CategoryDisplay[];
}
class Categories extends React.Component {
	public readonly props: CategoriesProperties;
	private readonly _categories: JSX.Element[];
	private readonly _cleanup: Subscription;

	constructor(props: CategoriesProperties) {
		super(props);
		const {
			categoriesData,
			uiChanges,
			initialDisplay,
			displaySelection,
		} = props;

		const clicksSubject = new Subject<CategoryName>(),
			[clicksMerger, catDisplaySelection] = getClicksMerger(clicksSubject);

		const catDisplay = _(initialDisplay)
			.keyBy(disp => disp.name)
			.value();

		this._categories = _(categoriesData)
			.toPairs()
			.map(([name, data]: [CategoryName, CategoryData]) => (
				<Category key={name} name={name} {...data}
					uiChanges={uiChanges}
					activationByClicks={clicksMerger}
					isActive={catDisplay[name].display} />
			))
			.value();

		this._cleanup = catDisplaySelection.subscribe(displaySelection);
	}

	public render() {
		return (
			<ul className='container-fluid'>
				{this._categories}
			</ul>
		);
	}

	public componentWillUnmount() {
		this._cleanup.unsubscribe();
	}
}

interface CategoryProperties {
	name: CategoryName;
	description: string;
	isActive: boolean;
	uiChanges: Observer<SideEffect>;
	activationByClicks: StreamsMerger;
}
interface CategoryUIState {
	readonly isActive: boolean;
}
class Category extends React.Component {
	public state: CategoryUIState;
	public props: CategoryProperties;
	private _clicks = new Subject<CategoryName>();
	private readonly _cleanup: Subscription;

	constructor(props: CategoryProperties) {
		super(props);
		this.state = { isActive: props.isActive };

		const {
			name,
			activationByClicks,
		} = props;

		const catActivation = activationByClicks(this._clicks);
		this._cleanup = catActivation.map(displayedCategories => displayedCategories.includes(name))
			.distinctUntilChanged()
			.map(isActive => createSideEffect(
				'category',
				Observable.hotBindCallback(this.setState.bind(this)),
				{ isActive }
			))
			.subscribe(props.uiChanges);
	}

	public render() {
		const { name, description } = this.props;
		const { isActive } = this.state;
		const inactivation = isActive ? '' : 'cat-inactive';

		return (
			<li key={name}
				className={`category btn cat-${ name } ${ inactivation }`}
				title={description}
				onClick={() => this._clicks.next(name)}
			>
				{name}
			</li>
		);
	}

	public componentWillUnmount() {
		this._cleanup.unsubscribe();
	}
}

type CategoryState = Record<CategoryType, CategoryDisplay[]> & {
	active: CategoryType,
};
type StreamsMerger = (catClicks: Observable<CategoryName>) => Observable<CategoryName[]>;
type MergerAndStream = [StreamsMerger, Observable<DisplaySelection>];
/**
 * Based on the supplied subject, creates a stateful display-determination-functions stream, and a function to merge
 *    a category-stream into that stream
 * @param clicksSubject The subject to merge category-stream through
 * @returns A tuple with an Observable that produce functions that check if specific category
 */
function getClicksMerger(
	clicksSubject: Subject<CategoryName>
): MergerAndStream {
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
		// A function that creates an observable that multicasts given category-clicks stream,
		//    and returns currently active categories
		function mergeClicks(clicks: Observable<CategoryName>): Observable<CategoryName[]> {
			return Observable.create((observer: Observer<CategoryName[]>) => {
				const subscription = catHandling.pluck<{}, CategoryName[]>('selectedCategories')
					.subscribe(observer)
					.add(clicks.subscribe(clicksSubject));

				return subscription;
			});
		},

		// A stream of operator-viewability functions
		catHandling.map(({ selectedCategories, active: activeType }) =>
			typeOperatorSelection[activeType](selectedCategories)),
	];

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

// A function that map category-display object, from category-name
function displayOutOfName(name: CategoryName) {
	return {
		name,
		display: typeInitialization[categories[name].type](name),
	};
}
