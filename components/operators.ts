import { VNode, ul, DOMSource } from '@cycle/dom';
import { Observable } from 'rxjs/Observable';
import { DisplaySelection } from './app';
import { Operators, OperatorData } from '../data/operators';
import 'rxjs/add/operator/mergeAll';
import 'rxjs/add/operator/combineAll';
import * as _ from 'lodash';
import { Operator } from './operator';

export interface OperatorsSources {
	DOM: DOMSource;
	categoryDisplay: Observable<DisplaySelection>;
	search: Observable<string>;
	operators: Operators;
}
export interface OperatorsSinks {
	DOM: Observable<VNode>;
}
export function Operators({
	DOM,
	categoryDisplay,
	search,
	operators,
}: OperatorsSources): OperatorsSinks {
	categoryDisplay = categoryDisplay.share();
	search = search.share();

	return {
		DOM: Observable.from(
			_(operators)
				.toPairs()
				.map(([name, data]: [string, OperatorData]) => ({
					name,
					...data,
				}))
				.map(operatorData =>
					Operator({ DOM, categoryDisplay, search, operatorData })
				)
				.map(({ DOM }) => DOM)
				.value()
		).combineAll((...operators: VNode[]) => operatorsView({ operators })),
	};
}

interface OperatorsProps {
	operators: VNode[];
}
function operatorsView({ operators }: OperatorsProps) {
	return ul('.operators', {}, operators);
}
