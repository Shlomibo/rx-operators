import { Iterable as It } from '@reactivex/ix-es2015-cjs';
import * as _ from 'lodash';
import { Observable, Observer, Subject } from 'rxjs';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/multicast';
import 'rxjs/add/operator/partition';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/startWith';
import { iterateObect } from '../utils/index';

export type CategoryName =
	| 'data'
	| 'time'
	| 'higher-order'
	| 'error'
	| 'completion'
	| 'subscription'
	| 'combination'
	| 'filter'
	| 'multicast'
	| 'transformation'
	| 'creation'
	| 'conditional'
	| 'aggregation'
	| 'utility'
	| 'debug';
export type CategoryType = 'effects' | 'usage';

export interface CategoryData {
	type: CategoryType;
	description: string;
}
export interface CategoryDisplay {
	name: CategoryName;
	display: boolean;
}

export type CategoriesData = Record<CategoryName, CategoryData>;
/**
 * @var categories All the categories
 */
export const categories = iterateObect({
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
		description:
			'Do you want to change the way, or when, subscription is made to the source observable?',
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
	'higher-order': {
		type: 'effects',
		description: 'Operator to use on higher-order observable',
	},
	aggregation: {
		type: 'effects',
		description: 'Do you want to produce a value from finite observable?',
	},
	creation: {
		type: 'effects',
		description:
			'Creates observables from common structures and patterns, values or thin air.',
	},
	debug: {
		type: 'effects',
		description: 'Looking for something usefull to debug?',
	},
	conditional: {
		type: 'usage',
		description: 'Conditional and boolean operators',
	},
	utility: {
		type: 'usage',
		description: 'Utility operators.',
	},
})
	.orderBy(([ , { type } ]) => type)
	.reduce(
		(categories, [ name, data ]) => {
			categories[name] = data as CategoryData;
			return categories;
		},
		{} as Partial<Record<CategoryName, CategoryData>>
	) as CategoriesData;

/**
 * @var typeInitialization Category initialization by category-type
 */
const typeInitialization: Record<
	CategoryType,
	(cat: CategoryName) => boolean
> = {
	effects: cat => true,
	usage: cat => false,
};

// A function that map category-display object, from category-name
export function initialDisplayOutOfName(name: CategoryName) {
	return {
		name,
		display: typeInitialization[categories[name].type](name),
	};
}
