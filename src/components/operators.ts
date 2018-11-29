import { VNode, ul, DOMSource } from '@cycle/dom';
import { Observable } from 'rxjs/Observable';
import { DisplaySelection } from './app';
import { Operators as OperatorsType, OperatorData } from '../data/operators';
import 'rxjs/add/operator/mergeAll';
import 'rxjs/add/operator/combineAll';
import * as _ from 'lodash';
import { Operator } from './operator';
import { StateSource, select, BANG } from '../state/action';
import { Reducer } from 'cycle-onionify';
import isolate from '@cycle/isolate';

export interface OperatorsState {
	search: string;
	categoryDisplay: DisplaySelection;
}

export interface IsolatedSources {
	DOM: DOMSource;
	state: StateSource<any>;
	operators: OperatorsType;
}
export interface IsolatedSinks {
	DOM: Observable<VNode>;
}
export type OperatorsComponent = (sources: IsolatedSources) => IsolatedSinks;
export function makeOperators(scope: string | object): OperatorsComponent {
	return isolate(Operators, scope);
}

interface OperatorsSources {
	DOM: DOMSource;
	state: StateSource<OperatorsState>;
	operators: OperatorsType;
}
interface OperatorsSinks {
	DOM: Observable<VNode>;
}

function Operators({
	DOM,
	state: stateSource,
	operators,
}: OperatorsSources): OperatorsSinks {
	const state = stateSource.state$.share(),
		categoryDisplay = state.let(select('categoryDisplay')).let(BANG),
		search = state.let(select('search')).let(BANG);

	return {
		DOM: Observable.from(
			_(operators)
				.toPairs()
				.map(([ name, data
				]: [string, OperatorData]) => ({
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
