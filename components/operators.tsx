import * as _ from 'lodash';
import * as React from 'react';
import 'rxjs/add/observable/merge';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { DisplaySelection } from './app';
import { OperatorData, operators, Operators } from '../data/operators';
import { getParser } from '../markdown';
import { reactEventObserver, RXComponent, StateUpdate } from '../utils/reactive-react';
import {
	categories as categoriesData,
	CategoryDisplay,
	CategoryName,
} from '../data/categories';

export interface OperatorsProps {
	operators: Operators;
	categoryDisplay: Observable<DisplaySelection>;
	search: string;
}
export function Operators({ operators, categoryDisplay, search }: OperatorsProps) {
	categoryDisplay = categoryDisplay.share();

	const operatorsMarkup = _(operators)
		.toPairs()
		.map(([name, data]: [string, OperatorData]) => ({
			name,
			...data,
		}))
		.map(opData => (
			<Operator
				key={opData.name}
				{...opData}
				categoryDisplay={categoryDisplay}
				search={search}
			/>
		))
		.value();

	return <ul className="operators">{operatorsMarkup}</ul>;
}

interface OperatorProps extends OperatorData {
	name: string;
	categoryDisplay: Observable<(categories: CategoryName[]) => boolean>;
	search: string;
}
interface OperatorState {
	collapsed: 'collapse' | '';
	catDisplay: 'cat-hidden' | '';
	description?: string;
}
class Operator extends RXComponent<OperatorProps, OperatorState> {
	private readonly _clicked = reactEventObserver();

	constructor(props: OperatorProps) {
		super(props);
		const { categoryDisplay, search, name, categories, description } = props;
		this.state = {
			collapsed: 'collapse',
			catDisplay: '',
		};

		const descriptionGeneration = mdToHtml(description).map(
			descHtml => ({ description: descHtml } as StateUpdate<OperatorState>)
		);

		const collapseHandling = this._clicked
			.asObservable()
			.scan((collapse: boolean) => !collapse, true)
			.map(collapse => (collapse ? 'collapse' : ''))
			.map(collapsed => ({ collapsed } as StateUpdate<OperatorState>));

		const categoryHandling = categoryDisplay
			.map(shouldBeDisplayed => shouldBeDisplayed(categories))
			.distinctUntilChanged()
			.map(shouldDisplay => (shouldDisplay ? '' : 'cat-hidden'))
			.map(catDisplay => ({ catDisplay } as StateUpdate<OperatorState>));

		this.subscribe(
			Observable.merge(descriptionGeneration, collapseHandling, categoryHandling)
		);
	}

	public render() {
		const { url, categories, img, name, playWithUrl, search } = this.props;
		const { collapsed, catDisplay, description } = this.state;
		const display = name.toLowerCase().includes(search) ? '' : 'hidden';

		const categoriesUI = _(categoriesData)
			.keys()
			.map((category: CategoryName) => (
				<CategoryMarker
					key={category}
					name={category}
					isActive={categories.includes(category)}
				/>
			))
			.value();

		return (
			<OperatorUI
				name={name}
				url={url}
				description={description}
				img={img}
				categoryDisplay={catDisplay}
				display={display}
				headerClick={this._clicked}
				categories={categoriesUI}
				collapsed={collapsed}
				playWithUrl={playWithUrl}
			/>
		);
	}
}

interface OperatorUIProps {
	name: string;
	url: string;
	description?: string;
	img?: string;
	playWithUrl?: string;
	categoryDisplay: string;
	display: string;
	headerClick: () => void;
	categories: JSX.Element[];
	collapsed: string;
}
function OperatorUI({
	name,
	categoryDisplay,
	display,
	headerClick,
	categories,
	url,
	collapsed,
	description,
	img,
	playWithUrl,
}: OperatorUIProps) {
	const id = name.replace(' ', '-');
	return (
		<li
			id={id}
			className={`operator panel panel-default ${categoryDisplay} ${display}`}
		>
			<div className="panel-heading container-fluid" onClick={headerClick}>
				<div className="col-sm-6 col-lg-5">
					<ul className="categories">{categories}</ul>
				</div>
				<h3 className="col-sm-6 col-lg-7">
					<a href={url} target="_blank" onClick={e => e.stopPropagation()}>
						<code>{name}</code>
					</a>
				</h3>
			</div>

			<OperatorDescription
				className={`panel-body ${collapsed}`}
				html={description}
				img={img}
				playWithUrl={playWithUrl}
			/>
		</li>
	);
}

interface CategoryMarkerProperties {
	name: CategoryName;
	isActive: boolean;
}
function CategoryMarker({ name, isActive }: CategoryMarkerProperties) {
	const inactivation = isActive ? '' : 'cat-inactive';

	return <li className={`category cat-${name} ${inactivation}`} title={name} />;
}
interface OperatorDescriptionProperties {
	html?: string;
	img?: string;
	playWithUrl?: string;
	className?: string;
}
function OperatorDescription({
	html = '',
	className = '',
	img,
	playWithUrl,
}: OperatorDescriptionProperties) {
	const descColCount = !!img ? 6 : 12;

	const imgUI = img && <img className="col-sm-6 image-rounded" src={`./img/${img}`} />;
	const playWithLink = playWithUrl && (
		<a href={playWithUrl} title="Play with operator on RxJS Marbles" target="_blank">
			{imgUI}
		</a>
	);

	return (
		<div className={`operator-desc container-fluid ${className}`}>
			<div
				className={`col-sm-${descColCount}`}
				dangerouslySetInnerHTML={{ __html: html }}
			/>
			{playWithLink || imgUI}
		</div>
	);
}

const parser = getParser();
function mdToHtml(md: string): Observable<string> {
	return Observable.of(parser.render(md));
}
