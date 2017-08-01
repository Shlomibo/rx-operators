import * as _ from 'lodash';
import 'rxjs/add/observable/concat';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/expand';
import { Observable } from 'rxjs/Observable';
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
import '../img';

export interface OperatorData {
	categories: CategoryName[];
	img?: string;
	url: string;
	playWithUrl?: string;
	description: string;
}

const categories = <CategoryName[]>Object.keys(catDefinition);
export type Operators = Record<string, OperatorData>;
export const operators: Operators = {
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
