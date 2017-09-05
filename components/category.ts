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
	props: CategoryProps;
}
export interface CategorySinks {
	DOM: VNode;
	clicks: Observable<any>;
}
export function Category({ DOM, props }: CategorySources): CategorySinks {
	const vdom = categoryView(props);
	const clicks = Observable.from(DOM.select(`.cat-${props.name}`).events('click'));

	return {
		DOM: vdom,
		clicks,
	};
}

function categoryView({ name, description, display }: CategoryProps): VNode {
	return li(
		`.category.btn.cat-${name}`,
		{
			key: name,
			class: { [CLS_CAT_INACTIVE]: !display },
			props: { title: name },
		},
		[name]
	);
}
