import { DOMSource, li, VNode } from '@cycle/dom';
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';
import { CLS_CAT_INACTIVE } from './app';
import { CategoryName } from '../data/categories';
import { classSelector } from '../helpers/selectors';

export interface CategoryProps {
	name: CategoryName;
	description: string;
	display: boolean;
}
export interface CategorySources {
	DOM: DOMSource;
	props: Observable<CategoryProps>;
}
export interface CategorySinks {
	DOM: Observable<VNode>;
	clicks: Observable<any>;
}
export function Category({ DOM, props }: CategorySources): CategorySinks {
	const vdom = props.map(categoryView);
	const clicks = props.switchMap(({ name }) =>
		Observable.from(DOM.select(`.cat-${name}`).events('click'))
	);

	return {
		DOM: vdom,
		clicks,
	};
}

function categoryView({ name, description, display }: CategoryProps): VNode {
	const activation = display ? '' : classSelector(`.${CLS_CAT_INACTIVE}`);

	return li(
		`.category.btn.cat-${name}${activation}`,
		{
			title: name,
		},
		[name]
	);
}
