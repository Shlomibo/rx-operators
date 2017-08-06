import * as $ from 'jquery';
import * as _ from 'lodash';
import * as React from 'react';
import 'rxjs/add/operator/switch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/shareReplay';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';
import { Categories, CategoriesState, DataWithDisplay } from './categories';
import { Operators } from './operators';
import { Search } from './search';
import { operators, Operators as OperatorsType } from '../data/operators';
import { StateUpdate } from '../utils/reactive-react';
import {
	categories,
	CategoryData,
	CategoryDisplay,
	CategoryName,
	CategoryType,
	initialDisplayOutOfName,
} from '../data/categories';
import {
	RXComponent,
	reactEventObserver,
	ReactEventObserver,
} from '../utils/reactive-react';

export const CLS_CAT_INACTIVE = 'cat-inactive';

export interface AppState {
	isScrolled: boolean;
	searchString: string;
}
export class App extends RXComponent<{}, AppState> {
	private readonly _searchInput = reactEventObserver<Observable<string>>();
	private readonly _categoryClicked = reactEventObserver<CategoryName>();
	private readonly _categoriesState: Observable<CategoriesState>;
	private readonly _operatorDisplay: Observable<DisplaySelection>;

	constructor(props: {}) {
		super(props);
		this.state = {
			isScrolled: false,
			searchString: '',
		};

		const categoriesStateStream = categoriesStateHandling(
			this._categoryClicked
		).share();

		this._categoriesState = categoriesStateStream.map(
			({ active, effects, usage }) => {
				switch (active) {
					case 'effects': {
						usage = usage.map(({ name }) => ({ name, display: false }));
						break;
					}
					case 'usage': {
						effects = effects.map(({ name }) => ({ name, display: false }));
						break;
					}
					default: {
						throw new Error('Unknow category type');
					}
				}

				return _(effects).concat(usage).reduce((state, { name, display }) => {
					state[name] = display;
					return state;
				}, ({} as any) as CategoriesState);
			}
		);

		this._operatorDisplay = categoriesStateStream.map(
			({ active: activeType, ...categories }) => {
				const activeCategories = categories[activeType];
				const selectedCategories = _(activeCategories)
					.filter(({ display }) => display)
					.map(({ name }) => name)
					.value();

				return typeOperatorSelection[activeType](selectedCategories);
			}
		);

		const searchState = this._searchInput
			.asObservable()
			.switch()
			.do(x => console.log(x))
			.map(searchString => ({ searchString }));

		// Streams to notify when the page is page is scrolled/at the top
		const scrollState = Observable.fromEvent(window, 'scroll')
			.map(() => $(document).scrollTop()! > 50)
			.debounceTime(100)
			.distinctUntilChanged()
			.map(isScrolled => ({ isScrolled }));

		this.subscribe(Observable.merge<StateUpdate<AppState>>(searchState, scrollState));
	}

	public render() {
		const { searchString } = this.state;

		const categoriesInitialization = _(categories)
			.toPairs()
			.map(([name, data]: [CategoryName, CategoryData]) => ({
				name,
				data:
					{
						...data,
						display: initialDisplayOutOfName(name).display,
					} as DataWithDisplay,
			}))
			.reduce(
				(state, { name, data }) => {
					state[name] = data;
					return state;
				},
				({} as any) as Record<CategoryName, DataWithDisplay>
			);

		return (
			<AppUI
				searched={this._searchInput}
				categoryClicked={this._categoryClicked}
				categories={categoriesInitialization}
				categoriesState={this._categoriesState}
				operators={operators}
				operatorDisplay={this._operatorDisplay}
				searches={searchString}
			/>
		);
	}
}

interface AppUIProps {
	searched: (search: Observable<string>) => void;
	categoryClicked: (category: CategoryName) => void;
	categories: Record<CategoryName, DataWithDisplay>;
	categoriesState: Observable<CategoriesState>;
	operators: OperatorsType;
	operatorDisplay: Observable<DisplaySelection>;
	searches: string;
}
function AppUI({
	searched,
	categoryClicked,
	categories,
	categoriesState,
	operators,
	operatorDisplay,
	searches,
}: AppUIProps) {
	return (
		<div>
			<nav className="navbar navbar-default navbar-fixed-top">
				<div className="container">
					<h5 className="col-md-8">RX operators</h5>
					<div className="col-md-4">
						<Search onInput={searched} />
					</div>
				</div>
				<div className="categories">
					<Categories
						categoryClicks={categoryClicked}
						categoryDisplay={categories}
						displayUpdates={categoriesState}
					/>
				</div>
			</nav>
			<main>
				<Operators
					operators={operators}
					categoryDisplay={operatorDisplay}
					search={searches}
				/>
			</main>
		</div>
	);
}

type CategoryState = Record<CategoryType, CategoryDisplay[]> & {
	active: CategoryType;
};
export type DisplaySelection = (categories: CategoryName[]) => boolean;

const EFFECTS_CATEGORIES_COUNT = _(categories)
	.toPairs()
	.filter(([, data]: [string, CategoryData]) => data.type === 'effects')
	.value().length;

/**
 * @var typeOperatorSelection Mappping from category-type to functions, that returns functions to determine
 *    operator viewability
 */
const typeOperatorSelection: Record<
	CategoryType,
	(selected: CategoryName[]) => DisplaySelection
> = {
	usage:
		selected => opCategories =>
			_(opCategories)
				.filter(category => categories[category].type === 'usage')
				.some(opCategory => selected.includes(opCategory)),
	effects:
		selected => opCategories =>
			selected.length === EFFECTS_CATEGORIES_COUNT ||
			selected.every(selectedCat => opCategories.includes(selectedCat)),
};

function categoriesStateHandling(
	clicksObserver: ReactEventObserver<CategoryName>
): Observable<CategoryState> {
	// A function to create category-filter (a filtering function) from category-type
	const byTypeFilter = (type: CategoryType) => (name: CategoryName) =>
		categories[name].type === type;

	// Lodash wrapper to category-names
	const categoryNames = _(categories).keys(),
		effectCategories = categoryNames.filter(byTypeFilter('effects')),
		usageCategories = categoryNames.filter(byTypeFilter('usage'));

	// Initial categoy state
	const categoriesState: CategoryState = {
		effects: effectCategories.map(initialDisplayOutOfName).value(),
		usage: usageCategories.map(initialDisplayOutOfName).value(),
		active: 'effects',
	};

	// The category handling stream is created from the multicast subject
	const catHandling = clicksObserver
		.asObservable()
		// Scanned to update categories-state, based on clicked category
		.scan(categoryHandling, categoriesState);

	return catHandling;

	/**
	 * Categories' state handling
	 * @param param Current categories' state
	 * @param category Clicked category
	 * @returns New categories' state
	 */
	function categoryHandling(
		{ effects, usage, active: previousActive }: CategoryState,
		category: CategoryName
	): CategoryState {
		const activeType = categories[category].type,
			activationChanged = activeType !== previousActive;

		switch (activeType) {
			case 'effects': {
				effects = activationChanged
					? effects.map(({ name }) => ({ name, display: true }))
					: typeHandling(effects, category);
				break;
			}
			case 'usage': {
				usage = activationChanged
					? usage.map(({ name }) => ({ name, display: true }))
					: typeHandling(usage, category);
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
	function typeHandling(
		typeState: CategoryDisplay[],
		clickedCategory: CategoryName
	): CategoryDisplay[] {
		// All categories excluding the clicked one
		const filteredCategories = typeState.filter(
			({ name }) => name !== clickedCategory
		);

		// Current category type considerred full, if all categories are displayed
		const isTypeFull =
			typeState.every(({ display }) => display) ||
			// or if all categories, but the clicked category, are non-displayed.
			filteredCategories.every(({ display }) => !display);

		// If the category-type isn't full, return state, with the selected category-display flipped
		return !isTypeFull
			? typeState.map(
					({ name, display }) =>
						name !== clickedCategory
							? { name, display }
							: { name, display: !display }
				)
			: // Otherwise, the whole category type is flipped, except of the selected category
				typeState.map(({ name, display }) => ({
					name,
					display: name === clickedCategory || !display,
				}));
	}
}
