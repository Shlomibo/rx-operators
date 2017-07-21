import * as _ from 'lodash';
import * as marked from 'marked';
import * as React from 'react';
import 'rxjs/add/observable/merge';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { DisplaySelection } from './app';
import { categories as categoriesData, CategoryDisplay, CategoryName } from '../data/categories';
import { OperatorData, operators, Operators } from '../data/operators';
import { RXComponent, StateUpdate } from '../utils/reactive-react';

export interface OperatorsProps {
	operators: Operators;
	categoryDisplay: Observable<DisplaySelection>;
	search: Observable<string>;
}
export function Operators({ operators, categoryDisplay, search }: OperatorsProps) {
	categoryDisplay = categoryDisplay.share();
	search = search.share();

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
					/>
				))
				.value()
		}
		</ul>
	);
}

interface OperatorProps extends OperatorData {
	name: string;
	categoryDisplay: Observable<(categories: CategoryName[]) => boolean>;
	search: Observable<string>;
}
interface OperatorState {
	collapsed: 'collapse' | '';
	catDisplay: 'cat-hidden' | '';
	display: 'hidden' | '';
	description?: string;
}
class Operator extends RXComponent<OperatorProps, OperatorState> {
	private readonly _clicked = new Subject<any>();

	constructor(props: OperatorProps) {
		super(props);
		this.state = {
			collapsed: 'collapse',
			catDisplay: '',
			display: '',
		};

		const {
			categoryDisplay,
			search,
			name,
			categories,
			description,
		} = props;

		const descriptionGeneration = mdToHtml(description)
			.map(descHtml => ({ description: descHtml }) as StateUpdate<OperatorState>);

		const collapseHandling = this._clicked.scan((collapse: boolean) => !collapse, true)
			.map(collapse => collapse ? 'collapse' : '')
			.map(collapsed => ({ collapsed }) as StateUpdate<OperatorState>);

		const categoryHandling = categoryDisplay.map(shouldBeDisplayed => shouldBeDisplayed(categories))
			.distinctUntilChanged()
			.map(shouldDisplay => shouldDisplay ? '' : 'cat-hidden')
			.map(catDisplay => ({ catDisplay }) as StateUpdate<OperatorState>);

		const searchHandling = search.map(searchTerm => searchTerm.toLowerCase())
			.map(searchTerm => name.toLowerCase().includes(searchTerm))
			.distinctUntilChanged()
			.map(shouldDisplay => shouldDisplay ? '' : 'hidden')
			.map(display => ({ display }) as StateUpdate<OperatorState>);

		this.subscribe(Observable.merge(
			descriptionGeneration,
			collapseHandling,
			categoryHandling,
			searchHandling,
		));
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
							.value()
					}</ul>
					<OperatorDescription className='col-sm-8 col-md-8 col-lg-9' html={description} img={img} />
				</div>
			</li>
		);
	}
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

function mdToHtml(md: string): Observable<string> {
	return Observable.of<string>(marked(md));
}
