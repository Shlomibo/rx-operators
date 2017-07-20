import * as _ from 'lodash';
import * as marked from 'marked';
import * as React from 'react';
import { render } from 'react-dom';
import 'rxjs/add/observable/merge';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { categories as categoriesData, categories, CategoryName } from '../data/categories';
import { OperatorData, operators } from '../data/operators';
import { createSideEffect, SideEffect } from '../side-effects';
import { ReplaySubject } from 'rxjs/ReplaySubject';

/**
 * A function that based on a root-element, category-display-stream and seach-stream,
 *    returns UI-updating stream
 * @param root The root element that operator elements would be appended to
 * @param categoryDisplay A stream of functions to determine if operator should be displayed,
 *    based on the displayed categories
 * @param search A stream of operator searches
 * @returns A stream of UI-changes
 */
export function allOperators(
	root: Element,
	categoryDisplay: Observable<(categories: CategoryName[]) => boolean>,
	search: Observable<string>
): Observable<SideEffect> {

	const uiChanges = new ReplaySubject<SideEffect>(undefined, 1000);

	const creation = createSideEffect(
		'operators',
		Observable.hotBindCallback(render),
		<Operators operators={operators} categoryDisplay={categoryDisplay} search={search} uiUpdates={uiChanges} />,
		root
	);

	return Observable.of(creation)
		.concat(creation.completed.mergeAll()
			.mergeMapTo(uiChanges));
}

interface CategoryMarkerProperties {
	name: CategoryName;
	isActive: boolean;
}
function CategoryMarker({ name, isActive }: CategoryMarkerProperties) {
	const inactivation = isActive ? '' : 'cat-inactive';

	return <li className={`category cat-${ name } ${ inactivation }`} title={name}></li>;
}
interface OperatorDescriptionProperties {
	html?: string;
	img?: string;
	className?: string;
}
function OperatorDescription({ html = '', className = '', img }: OperatorDescriptionProperties) {
	return (
		<div className={`operator-desc ${ className }`}>
			<div dangerouslySetInnerHTML={{ __html: html }}></div>
			{img && <img className='image-rounded' src={`./img/${ img }`} />}
		</div>
	);
}

interface OperatorsProperties {
	operators: Record<string, OperatorData>;
	categoryDisplay: Observable<(categories: CategoryName[]) => boolean>;
	search: Observable<string>;
	uiUpdates: Observer<SideEffect>;
}
function Operators({
	operators,
	categoryDisplay,
	search,
	uiUpdates,
}: OperatorsProperties) {
	return (
		<ul className='operators'> {
			_(operators)
				.toPairs()
				.map(([name, data]: [string, OperatorData]) => ({
					name,
					...data
				}))
				.map(opData => (
					<Operator key={opData.name} {...opData}
						categoryDisplay={categoryDisplay}
						search={search}
						uiUpdates={uiUpdates}
					/>
				))
				.value()
		}
		</ul>
	);
}
interface OperatorProperties extends OperatorData {
	name: string;
	categoryDisplay: Observable<(categories: CategoryName[]) => boolean>;
	search: Observable<string>;
	uiUpdates: Observer<SideEffect>;
}
interface OperatorStateTemplate {
	collapsed: 'collapse' | '';
	catDisplay: 'cat-hidden' | '';
	display: 'hidden' | '';
	description?: string;
}
type OperatorState = Readonly<OperatorStateTemplate>;
class Operator extends React.Component {
	public props: Readonly<OperatorProperties>;
	public state: OperatorState;
	private _cleanup: Subscription;
	private readonly _clicked = new Subject<any>();
	private readonly _uiHandling: Observable<SideEffect>;
	private readonly _handlingObserver: Observer<SideEffect>;

	constructor(props: OperatorProperties) {
		super(props);
		this.state = {
			collapsed: 'collapse',
			catDisplay: '',
			display: '',
		};
		this._handlingObserver = props.uiUpdates;

		const SIDE_EFFECT = 'operator-ui';

		const {
			categoryDisplay,
			search,
		} = props;

		const setState: (state: Partial<OperatorState>) => Observable<any> =
			Observable.hotBindCallback(this.setState.bind(this));
		const {
			name,
			categories,
			description,
		} = props;

		const descriptionGeneration = mdToHtml(description)
			.map(descHtml => createSideEffect(
				SIDE_EFFECT,
				setState,
				{ description: descHtml }
			));

		const collapseHandling = this._clicked.scan((collapse: boolean) => !collapse, true)
			.map(collapse => collapse ? 'collapse' : '')
			.map(collapsed => createSideEffect(
				SIDE_EFFECT,
				setState,
				{ collapsed }
			));

		const categoryHandling = categoryDisplay.map(shouldBeDisplayed => shouldBeDisplayed(categories))
			.distinctUntilChanged()
			.map(shouldDisplay => shouldDisplay ? '' : 'cat-hidden')
			.map(catDisplay => createSideEffect(
				SIDE_EFFECT,
				setState,
				{ catDisplay }
			));

		const searchHandling = search.map(searchTerm => searchTerm.toLowerCase())
			.map(searchTerm => name.toLowerCase().includes(searchTerm))
			.distinctUntilChanged()
			.map(shouldDisplay => shouldDisplay ? '' : 'hidden')
			.map(display => createSideEffect(
				SIDE_EFFECT,
				setState,
				{ display }
			));

		this._uiHandling = Observable.merge(
			descriptionGeneration,
			collapseHandling,
			categoryHandling,
			searchHandling
		);
	}

	public componentWillMount() {
		this._cleanup = this._uiHandling.subscribe(this._handlingObserver);
	}

	public render() {
		const {
			url,
			categories,
			img,
			name,
		} = this.props;
		const {
			collapsed,
			catDisplay,
			display,
			description,
		} = this.state;

		return (
			<li id={name} className={`operator panel panel-default ${ catDisplay } ${ display }`}>
				<div className='panel-heading' onClick={() => this._clicked.next()}>
					<h3><a href={url} target='_blank' onClick={e => e.stopPropagation()}><code>{name}</code></a></h3>
				</div>

				<div className={`container-fluid panel-body ${ collapsed }`}>
					<ul className='categories  col-sm-4 col-md-8 col-lg-3'>{
						_(categoriesData)
							.keys()
							.map((category: CategoryName) =>
								<CategoryMarker key={category} name={category} isActive={categories.includes(category)} />
							)
					}</ul>
					<OperatorDescription className='col-sm-8 col-md-8 col-lg-9' html={description} img={img} />
				</div>
			</li>
		);
	}

	public componentWillUnmount() {
		this._cleanup.unsubscribe();
	}
}

function mdToHtml(md: string): Observable<string> {
	return Observable.of<string>(marked(md));
}
