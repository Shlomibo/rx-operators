import * as $ from 'jquery';
import * as _ from 'lodash';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/partition';
import 'rxjs/add/operator/share';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';

export type CategoryName = 'data' |
	'time' |
	'error' |
	'completion' |
	'subscription' |
	'combination' |
	'filter' |
	'multicast' |
	'transformation' |
	'creation' |
	'conditional';
export type CategoryType = 'effects' | 'usage';

export interface CategoryData {
	type: CategoryType;
	description: string;
}
export interface CategoryDisplay {
	name: CategoryName;
	display: boolean;
}

export const categories = <Record<CategoryName, CategoryData>>_({
	data: {
		type: 'effects',
		description: 'Do you want to change what is emitted?',
	},
	time: {
		type: 'effects',
		description: 'Do you want to change when data is emitted?',
	},
	error: {
		type: 'effects',
		description: 'Do you want to change if and when errors are emitted?',
	},
	completion: {
		type: 'effects',
		description: 'Do you want to change when an observable is completed?',
	},
	filter: {
		type: 'effects',
		description: 'Do you want to change which data is emitted?',
	},
	subscription: {
		type: 'effects',
		description: 'Do you want to change the way, or when, subscription is made to the source observable?',
	},
	combination: {
		type: 'usage',
		description: 'Operators that combines two or more observable',
	},
	multicast: {
		type: 'usage',
		description: 'Operators that multicasts the source observable',
	},
	transformation: {
		type: 'usage',
		description: 'Operators that transforms an observable',
	},
	creation: {
		type: 'effects',
		description: 'Creates observables from common structures and patterns, values or thin air.'
	},
	conditional: {
		type: 'usage',
		description: 'Conditional and boolean operators'
	}
})
	.toPairs<CategoryData>()
	.orderBy([
		([, { type }]) => type,
	])
	.reduce((categories, [name, data]) => {
		categories[name] = data;
		return categories;
	}, <Partial<Record<CategoryName, CategoryData>>>{ });

const typeInitialization: Record<CategoryType, (cat: CategoryName) => boolean> = {
	effects: cat => true,
	usage: cat => false,
};
export function Category(
	name: CategoryName,
	data: CategoryData,
	activationFn: (clicks: Observable<CategoryName>) => Observable<CategoryDisplay[]>) {
	const CLS_INACTIVE = 'cat-inactive';

	const inactivation = typeInitialization[data.type](name) ? '' : CLS_INACTIVE;
	const ui = $(`<li class="category btn cat-${ name } ${ inactivation }"
					  title="${ data.description }">${ name }</li>`),
		click = Observable.fromEvent(ui[0], 'click'),
		activation = activationFn(click.mapTo(name));

	const [activate, deactivate] = activation.map(display =>
		display.find(({ name: catName }) => name === catName)
	)
		.pluck<CategoryDisplay | undefined, boolean>('display')
		.distinctUntilChanged()
		.share()
		.partition(isActive => isActive);

	return {
		ui,
		click,
		uiChanges: activate.map(() => () => ui.removeClass(CLS_INACTIVE))
			.merge(
			deactivate.map(() => () => ui.addClass(CLS_INACTIVE)),
		),
	};
}
export function allCategories(
	root: JQuery<HTMLElement>
): [Observable<CategoryDisplay[]>, Observable<() => void>] {
	const clicksSubject = new Subject<CategoryName>(),
		[categoryHandling, mergeClicks] = getClicksMerger(clicksSubject);

	const categoryCreation = Observable.from(
		_(categories)
			.toPairs()
			.map(([name, data]: [CategoryName, CategoryData]) => ({ name, data }))
			.value()
	)
		.map(({ name, data }) => Category(name, data, mergeClicks));

	return [
		categoryHandling,
		categoryCreation.mergeMap(({ ui, uiChanges }) =>
			Observable.of(() => root.append(ui))
				.concat(uiChanges)
		),
	];
}

function getClicksMerger(
	clicksSubject: Subject<CategoryName>
): [Observable<CategoryDisplay[]>, (catClicks: Observable<CategoryName>) => Observable<CategoryDisplay[]>] {
	const displayOutOfName = (name: CategoryName) => ({
		name,
		display: typeInitialization[categories[name].type](name),
	}),
		byTypeFilter = (type: CategoryType) => (name: CategoryName) => categories[name].type === type,
		categoryNames = _(categories)
			.keys(),
		effectCategories = categoryNames.filter(byTypeFilter('effects')),
		usageCategories = categoryNames.filter(byTypeFilter('usage')),
		categoriesState = {
			effects: effectCategories.map(displayOutOfName)
				.value(),
			usage: usageCategories.map(displayOutOfName)
				.value(),
		};

	const catHandling = clicksSubject.asObservable()
		.scan(categoryHandling, categoriesState)
		.map(({ effects, usage }) => [
			...effects,
			...usage,
		]);

	return [
		catHandling,
		function mergeClicks(clicks: Observable<CategoryName>): Observable<CategoryDisplay[]> {
			return Observable.create((observer: Observer<CategoryDisplay[]>) => {
				const subscription = catHandling.subscribe(observer)
					.add(clicks.subscribe(clicksSubject));

				return subscription;
			});
		}];

	function categoryHandling(
		{ effects, usage }: Record<CategoryType, CategoryDisplay[]>,
		category: CategoryName
	): Record<CategoryType, CategoryDisplay[]> {
		return {
			effects: effectsHandling(effects, category),
			usage: usageHandling(usage, category),
		};
	}

	function usageHandling(typeState: CategoryDisplay[], category: CategoryName): CategoryDisplay[] {
		if (categories[category].type !== 'usage') {
			return typeState;
		}

		// Toggle the clicked category
		return typeState.map(({ name, display }) => ({
			name,
			display: name === category
			? !display
			: display
		}));
	}
	function effectsHandling(typeState: CategoryDisplay[], category: CategoryName): CategoryDisplay[] {
		if (categories[category].type !== 'effects') {
			return typeState;
		}

		const filteredCategories = typeState.filter(({ name }) => name !== category),
		isTypeFull = typeState.every(({ display }) => display) ||
		filteredCategories.every(({ display }) => !display);

		// If the category-type isn't full, return state, with the selected category-display flipped
		return !isTypeFull
			? typeState.map(({ name, display }) => name !== category
				? { name, display }
				: { name, display: !display }
			)
			// Otherwise, the whole category type is non-displayed except of the selected category
			: typeState.map(({ name, display }) => ({
				name,
				display: name === category || !display
			}));
	}
}
