import { Iterable as It } from '@reactivex/ix-es2015-cjs';
import { merge, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { operator } from './operator';
import { Component, Element } from './types';
import { SideEffect, bind } from '../utils/side-effects';
import { OperatorData, operators as allOperators } from '../data/operators';
import jQuery = require('jquery');
import {
	OperatorsState,
	CategoriesState,
	StateView,
	OperatorState,
} from '../state';
// @ts-ignore
import { share } from '../utils/rx/operators';
// @ts-ignore
import { debug } from '../utils';

export function operators(
	root: Element,
	operators: StateView<OperatorsState>,
	search: Observable<string>,
	categories: Observable<CategoriesState>
): Component {
	const uiRoot = of(
		SideEffect.create(
			(root, el) => {
				root.append(el);
				return el;
			},
			root,
			jQuery(/*html*/ `<ul class="operators"></ul>`)
		)
	);

	const opNames = It.from(Object.keys(operators.current));

	const opComponents = opNames
		.map(
			name =>
				[ name, operators.select(name), allOperators[name] ] as [
					string,
					StateView<OperatorState>,
					OperatorData
				]
		)
		.map(([ name, opState, opData ]) =>
			bind(
				uiRoot,
				map(root =>
					operator(
						root,
						name,
						name,
						opData.url,
						opData.categories,
						opState,
						search,
						categories,
						opData.description,
						opData.img,
						opData.playWithUrl
					)
				)
			)
		)
		.toArray();

	return {
		updates: merge(
			...opComponents.map(compObservable =>
				bind(compObservable, switchMap(comp => comp.updates))
			)
		),
	};
}
