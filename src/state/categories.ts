import { Iterable as It } from '@reactivex/ix-es2015-cjs';
import { Action } from './action';
import { Entry } from '../utils/types';
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

type CategoriesActionType = 'init' | 'categoryClicked';

export type CategoryAction = Action<CategoriesActionType, CategoryName>;

export function categoriesHandling(
	action: CategoryAction,
	state: CategoriesState
): CategoriesState {
	switch (action.name) {
		case 'init':
			return initCategories();

		case 'categoryClicked':
			if (!action.payload) {
				return state;
			}

			return categoryHandling(state, action.payload);

		default:
			return state;
	}
}

const EFFECTS_CATEGORIES_COUNT = It.from(Object.entries(categories) as Entry<
	CategoryName,
	CategoryData
>[]).count(([ , data ]: [string, CategoryData]) => data.type === 'effects');

/**
 * @var typeOperatorSelection Mappping from category-type to functions, that returns functions to determine
 *    operator viewability
 */
const typeOperatorSelection: Record<
	CategoryType,
	(selected: CategoryName[]) => DisplaySelection
> = {
	usage: selected => opCategories =>
		It.from(opCategories)
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
const categoryNames = It.from(Object.keys(categories) as CategoryName[]),
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

export const initialCategories: CategoriesState = {
	effects: effectCategories.map(initialDisplayOutOfName).toArray(),
	usage: usageCategories.map(initialDisplayOutOfName).toArray(),
	active: 'effects',
	displaySelection: typeOperatorSelection.effects(effectCategories.toArray()),
};

function initCategories(): CategoriesState {
	return {
		...initialCategories,
	};
}
