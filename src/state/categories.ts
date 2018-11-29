import * as _ from 'lodash';
import { ActionDispatcher, Actions, PayloadsType, reduce } from './action';
import {
	CategoryType,
	CategoryDisplay,
	CategoryName,
	categories,
	CategoryData,
	initialDisplayOutOfName,
} from '../data/categories';

export type DisplaySelection = (categories: CategoryName[]) => boolean;

export type CategoriesState = Record<CategoryType, CategoryDisplay[]> & {
	active: CategoryType;
	displaySelection: DisplaySelection;
};

interface CategoriesPayload extends PayloadsType<CategoriesState> {
	categoryClicked: CategoryName;
}

export const categoryActions: Actions<CategoriesPayload> = {
	init: () => 'init',
	categoryClicked: name => ({
		name: 'categoryClicked',
		payload: name!,
	}),
};

const categoriesDispatcher: ActionDispatcher<CategoriesState, CategoriesPayload> = {
	init: () => () => initCategories(),
	categoryClicked: ({ payload: catName }) => state =>
		state && categoryHandling(state, catName!),
};

export const categoriesReducer = reduce(categoriesDispatcher);

function initCategories(): CategoriesState {
	return {
		effects: effectCategories.map(initialDisplayOutOfName).value(),
		usage: usageCategories.map(initialDisplayOutOfName).value(),
		active: 'effects',
		displaySelection: typeOperatorSelection.effects(effectCategories.value()),
	};
}

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
	usage: selected => opCategories =>
		_(opCategories)
			.filter(category => categories[category].type === 'usage')
			.some((opCategory: CategoryName) => selected.includes(opCategory)),
	effects: selected => opCategories =>
		selected.length === EFFECTS_CATEGORIES_COUNT ||
		selected.every(selectedCat => opCategories.includes(selectedCat)),
};

// A function to create category-filter (a filtering function) from category-type
const byTypeFilter = (type: CategoryType) => (name: CategoryName) =>
	categories[name].type === type;

// Lodash wrapper to category-names
const categoryNames = _(categories).keys() as _.LoDashImplicitArrayWrapper<CategoryName>,
	effectCategories = categoryNames.filter(byTypeFilter('effects')),
	usageCategories = categoryNames.filter(byTypeFilter('usage'));

/**
 * Categories' state handling
 * @param param Current categories' state
 * @param category Clicked category
 * @returns New categories' state
 */
function categoryHandling(
	{ effects, usage, active: previousActive }: CategoriesState,
	category: CategoryName
): CategoriesState {
	const activeType = categories[category].type,
		activationChanged = activeType !== previousActive;

	switch (activeType) {
		case 'effects': {
			// Handle effects
			effects = activationChanged
				? effects.map(({ name }) => ({ name, display: true }))
				: typeHandling(effects, category);
			// Switch off usage
			usage = usage.map(({ name }) => ({ name, display: false }));
			break;
		}
		case 'usage': {
			// Handle usage
			usage = activationChanged
				? usage.map(({ name }) => ({ name, display: true }))
				: typeHandling(usage, category);
			// Switch off effects
			effects = effects.map(({ name }) => ({ name, display: false }));
			break;
		}
		default: {
			throw new Error('Unknown category-type');
		}
	}

	const activeCategories = (activeType === 'effects' ? effects : usage)
		.filter(({ display }) => display)
		.map(({ name }) => name);

	return {
		effects,
		usage,
		active: activeType,
		displaySelection: typeOperatorSelection[activeType](activeCategories),
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
	const filteredCategories = typeState.filter(({ name }) => name !== clickedCategory);

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
