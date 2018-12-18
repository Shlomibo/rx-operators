import { aggregationOprators } from './aggregation';
import { combinationOperators } from './combination';
import { conditionalOperators } from './conditional';
import { creationOperators } from './creation';
import { errorHandlingOperators } from './error-handling';
import { filteringOperators } from './filtering';
import { multicastOperators } from './multicast';
import { transformationOperators } from './transformation';
import { utilityOperators } from './utility';
import '../../img';
import { iterateObect } from '../utils/index';
import { CategoryName } from './categories';

export interface OperatorData {
	categories: CategoryName[];
	img?: string;
	url: string;
	playWithUrl?: string;
	description: string;
}

export type Operators = Record<string, OperatorData>;
export const operators: Operators = iterateObect({
	...combinationOperators,
	...errorHandlingOperators,
	...filteringOperators,
	...multicastOperators,
	...transformationOperators,
	...creationOperators,
	...conditionalOperators,
	...aggregationOprators,
	...utilityOperators,
})
	// Order operators by name
	.orderBy(([ name ]) => name)
	.reduce(
		(operators, [ name, data ]) => {
			operators[name] = data;
			return operators;
		},
		{} as Operators
	);
