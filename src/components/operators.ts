import { Iterable as It } from '@reactivex/ix-es2015-cjs';
import { merge, Observable, of } from 'rxjs';
import { map, share, switchMap } from 'rxjs/operators';
import { operator } from './operator';
import { Component, Element } from './types';
import { createSideEffect } from '../utils/side-effects';
import { OperatorData, operators as allOperators } from '../data/operators';
import jQuery = require('jquery');
import {
	OperatorsState,
	CategoriesState,
	StateView,
	OperatorState,
} from '../state';

export function operators(
	root: Element,
	operators: StateView<OperatorsState>,
	search: Observable<string>,
	categories: Observable<CategoriesState>
): Component {
	const creation = of(
		createSideEffect(
			(root, el) => root.append(el),
			root,
			jQuery(/*html*/ `<ul class="operators"></ul>`)
		)
	);

	const uiRoot = creation.pipe(switchMap(se => se.completed), share());

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
			uiRoot.pipe(
				map(root =>
					operator(
						root,
						name,
						name,
						opData.url,
						opData.categories,
						opState,
						search,
						categories
					)
				)
			)
		)
		.toArray();

	return {
		updates: merge(
			creation,
			...opComponents.map(compObservable =>
				compObservable.pipe(switchMap(comp => comp.updates))
			)
		),
	};
}
