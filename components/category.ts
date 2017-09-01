import { VNode, li, DOMSource } from '@cycle/dom';
import { CategoryName } from '../data/categories';
import { CLS_CAT_INACTIVE } from './app';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
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
		'`.category.btn.cat-${name}${activation}`',
		{
			title: display,
		},
		[name]
	);
}
