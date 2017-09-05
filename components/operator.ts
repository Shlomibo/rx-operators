import { a, code, div, DOMSource, h3, img, li, ul, VNode } from '@cycle/dom';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/scan';
import { Observable } from 'rxjs/Observable';
import virtualizeHtml from 'snabbdom-virtualize/strings';
import { categories, CategoryName } from '../data/categories';
import { OperatorData } from '../data/operators';
import { getParser } from '../markdown';
import { debug } from '../utils/index';
import {
	classSelector,
	ClassSelector,
	IdSelector,
	idSelector,
	joinClasses,
} from '../helpers/selectors';

export interface OperatorDataWithName extends OperatorData {
	name: string;
}
export interface OperatorSources {
	DOM: DOMSource;
	categoryDisplay: Observable<(categories: CategoryName[]) => boolean>;
	search: Observable<string>;
	operatorData: OperatorDataWithName;
}
export interface OperatorSinks {
	DOM: Observable<VNode>;
}
export function Operator(sources: OperatorSources): OperatorSinks {
	const { uiProps } = intent(sources);

	return {
		DOM: uiProps.map(props => operatorView(props)),
	};
}

const categoryNames = Object.keys(categories) as CategoryName[];
const parser = getParser();

interface Intentions {
	uiProps: Observable<OperatorProps>;
}
function intent({
	DOM,
	categoryDisplay,
	search,
	operatorData,
}: OperatorSources): Intentions {
	const { name, categories, description } = operatorData;
	const id = idSelector(name);
	const operatorCategories = new Set(categories);

	const initialProps: OperatorProps = {
		id,
		...operatorData,
		description: parser.render(description),
		isOperatorDisplayed: true,
		isCategoryDisplayed: true,
		isCollapsed: true,
		categories: categoryNames.map(name => ({
			name,
			isActive: operatorCategories.has(name),
		})),
	};

	const collapseState = Observable.from(
		DOM.select(`${id} .panel-heading`).events('click')
	).scan(
		({ isCollapsed }) => ({
			isCollapsed: !isCollapsed,
		}),
		initialProps
	);
	const catDisplayState = categoryDisplay
		.map(shouldBeDisplayed => shouldBeDisplayed(categories))
		.distinctUntilChanged()
		.map(isCategoryDisplayed => ({ isCategoryDisplayed }));
	const searchDisplayState = search
		.map(search => !search || name.toLowerCase().includes(search))
		.distinctUntilChanged()
		.map(isOperatorDisplayed => ({ isOperatorDisplayed }));

	const propsState = Observable.merge<Pick<OperatorProps, keyof OperatorProps>>(
		collapseState,
		catDisplayState,
		searchDisplayState
	).scan(
		(state, update) => ({
			...state,
			...update,
		}),
		initialProps
	);

	return {
		uiProps: propsState.startWith(initialProps),
	};
}

interface OperatorProps {
	id: IdSelector;
	name: string;
	url: string;
	description?: string;
	img?: string;
	playWithUrl?: string;
	isCategoryDisplayed: boolean;
	isOperatorDisplayed: boolean;
	categories: CategoryMarkerProps[];
	isCollapsed: boolean;
}
function operatorView({
	id,
	name,
	url,
	description,
	img,
	playWithUrl,
	isCategoryDisplayed,
	isOperatorDisplayed,
	categories,
	isCollapsed,
}: OperatorProps): VNode {
	return li(
		`${id}.operator.panel.panel-default`,
		{
			key: name,
			class: {
				'cat-hidden': !isCategoryDisplayed,
				hidden: !isOperatorDisplayed,
			},
		},
		[
			div('.panel-heading.container-fluid', {}, [
				div(
					'.col-sm-6.col-lg-5',
					{},
					ul('.categories', {}, categories.map(categoryMarker))
				),
				h3('.col-sm-6.col-lg-7', {}, [
					a(
						'',
						{
							props: {
								href: url,
								target: '_blank',
							},
							on: {
								click: (ev: Event) => ev.preventDefault(),
							},
						},
						code('', {}, name)
					),
				]),
			]),
			operatorDisplay({
				html: description,
				selector: classSelector('.panel-body'),
				isCollapsed,
				img,
				playWithUrl,
			}),
		]
	);
}

interface CategoryMarkerProps {
	name: CategoryName;
	isActive: boolean;
}
function categoryMarker({ name, isActive }: CategoryMarkerProps): VNode {
	return li(`.category.cat-${name}`, {
		key: name,
		class: { 'cat-inactive': !isActive },
		props: { title: name },
	});
}

interface OperatorDescriptionProperties {
	html?: string;
	img?: string;
	playWithUrl?: string;
	selector?: ClassSelector;
	isCollapsed: boolean;
}
function operatorDisplay({
	html = '',
	selector = '',
	isCollapsed,
	img: imgSource,
	playWithUrl,
}: OperatorDescriptionProperties): VNode {
	const descColCount = !!img ? 6 : 12;

	const imgUI =
		imgSource &&
		img('.col-sm-6.image-rounded', {
			props: { src: `./img/${imgSource}` },
		});
	const playWithLink =
		playWithUrl &&
		a(
			'',
			{
				props: {
					href: playWithUrl,
					title: 'Play with operator on RxJS Marbles',
					target: '_blank',
				},
			},
			[imgUI]
		);

	const descriptionUI = !!html ? virtualizeHtml(html) : [];
	const imgChildren = !!imgUI ? [playWithLink || imgUI] : [];

	return div(
		`.operator-desc.container-fluid${selector}`,
		{
			class: {
				collapse: isCollapsed,
			},
		},
		[div(`.col-sm-${descColCount}`, {}, descriptionUI), ...imgChildren]
	);
}
