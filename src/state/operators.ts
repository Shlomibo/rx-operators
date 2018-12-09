import { Action } from './store';
import { fromObjectEntries, iterateObect } from '../utils';
import { operators } from '../data/operators';
import { Entry } from '../utils/types';
export type OperatorActionType = 'collapse';

export type OperatorAction = Action<OperatorActionType, boolean | undefined>;
export type OperatorsAction = Action<
	OperatorActionType,
	OperatorsActionPayload
>;

export interface OperatorsActionPayload {
	name: string;
	collapse?: boolean;
}

export interface OperatorState {
	collapsed: boolean;
}
export interface OperatorsState {
	[name: string]: OperatorState;
}

export const initOperatorsState: OperatorsState = fromObjectEntries(
	iterateObect(operators).map(
		([ name ]) =>
			[ name, { collapsed: false } ] as Entry<string, OperatorState>
	)
);

export function operatorsHandling(
	action: OperatorsAction,
	state: OperatorsState
): OperatorsState {
	switch (action.name) {
		case 'collapse':
			if (!action.payload || !state[action.payload.name]) {
				return state;
			}

			return {
				...state,
				[action.payload.name]: {
					collapsed:
						typeof action.payload.collapse === 'boolean'
							? action.payload.collapse
							: !state[action.payload.name].collapsed,
				},
			};

		default:
			return state;
	}
}

export function operatorHandling(
	action: OperatorAction,
	state: OperatorState
): OperatorState {
	switch (action.name) {
		case 'collapse':
			return {
				collapsed:
					typeof action.payload === 'boolean'
						? action.payload
						: !state.collapsed,
			};

		default:
			return state;
	}
}
