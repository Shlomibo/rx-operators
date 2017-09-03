import {
	CategoryType,
	CategoryDisplay,
	CategoryName,
	categories,
	CategoryData,
	initialDisplayOutOfName,
} from './data/categories';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Observer } from 'rxjs/Observer';
import 'rxjs/add/observable/defer';
import 'rxjs/add/operator/scan';

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
export const typeOperatorSelection: Record<
	CategoryType,
	(selected: CategoryName[]) => DisplaySelection
> = {
	usage: selected => opCategories =>
		_(opCategories)
			.filter(category => categories[category].type === 'usage')
			.some((opCategory: CategoryName) => selected.includes(opCategory)),
	effects: selected => opCategories =>
		selected.length === EFFECTS_CATEGORIES_COUNT ||
		selected.every(selectedCat => opCategories.includes(selectedCat)),
};

export function categoriesStateHandling(
	categoryClicks: Observable<CategoryName>
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
	const catHandling = categoryClicks
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
