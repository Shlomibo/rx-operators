import { a, code, div, DOMSource, h3, img, li, ul, VNode } from '@cycle/dom';
import { Observable } from 'rxjs/Observable';
import virtualizeHtml from 'snabbdom-virtualize/strings';
import { categories, CategoryName } from '../data/categories';
import { OperatorData } from '../data/operators';
import { getParser } from '../markdown';
import {
	classSelector,
	ClassSelector,
	IdSelector,
	idSelector,
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
		displaySelector: '',
		categoryDisplaySelector: '',
		collapsedClass: classSelector('.collapse'),
		categories: categoryNames.map(name => ({
			name,
			isActive: operatorCategories.has(name),
		})),
	};

	const collapseState = Observable.from(
		DOM.select(`${id} .panel-heading`).events('click')
	).scan(
		({ collapsedClass }) => ({
			collapsedClass: collapsedClass === '' ? classSelector('.collapse') : '',
		}),
		initialProps
	);
	const catDisplayState = categoryDisplay
		.map(shouldBeDisplayed => shouldBeDisplayed(categories))
		.distinctUntilChanged()
		.map(display => (display ? '' : classSelector('cat-hidden')))
		.map(categoryDisplaySelector => ({ categoryDisplaySelector }));
	const searchDisplayState = search
		.map(search => !search || name.toLowerCase().includes(search))
		.distinctUntilChanged()
		.map(displayed => (displayed ? '' : classSelector('.hidden')))
		.map(displaySelector => ({ displaySelector }));

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
		uiProps: propsState,
	};
}

interface OperatorProps {
	id: IdSelector;
	name: string;
	url: string;
	description?: string;
	img?: string;
	playWithUrl?: string;
	categoryDisplaySelector: ClassSelector;
	displaySelector: ClassSelector;
	categories: CategoryMarkerProps[];
	collapsedClass: ClassSelector;
}
function operatorView({
	id,
	name,
	url,
	description,
	img,
	playWithUrl,
	categoryDisplaySelector,
	displaySelector,
	categories,
	collapsedClass,
}: OperatorProps): VNode {
	return li(
		`${id}.operator.panel.panel-default${categoryDisplaySelector}${displaySelector}`,
		{},
		[
			div('.panel-heading.container-fluid', {}, [
				div('.col-sm-6.col-lg-5', {}, ul('.categories')),
				h3(
					'.col-sm-6.col-lg-7',
					{},
					a(
						'',
						{
							href: url,
							target: '_blank',
							onClick: 'return false;',
						},
						code('', {}, name)
					)
				),
			]),

			operatorDisplay({
				html: description,
				selector: classSelector(`panel-body${collapsedClass}`),
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
	const inactivation = isActive ? '' : classSelector('.cat-inactive');

	return li(`.category.cat-${name}${inactivation}`, {
		title: name,
	});
}

interface OperatorDescriptionProperties {
	html?: string;
	img?: string;
	playWithUrl?: string;
	selector?: ClassSelector;
}
function operatorDisplay({
	html = '',
	selector = '',
	img: imgSource,
	playWithUrl,
}: OperatorDescriptionProperties): VNode {
	const descColCount = !!img ? 6 : 12;

	const imgUI =
		imgSource &&
		img('.col-sm-6.image-rounded', {
			src: `./img/${imgSource}`,
		});
	const playWithLink =
		playWithUrl &&
		a(
			'',
			{
				href: playWithUrl,
				title: 'Play with operator on RxJS Marbles',
				target: '_blank',
			},
			imgUI
		);

	const descriptionUI = !!html ? [virtualizeHtml(html)] : [];
	const imgChildren = !!imgUI ? [playWithLink || imgUI] : [];

	return div(`.operator-desc.container-fluid${selector}`, {}, [
		div(`.col-sm-${descColCount}`, {}, descriptionUI),
		imgChildren,
	]);
}
