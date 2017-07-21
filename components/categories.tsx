import * as _ from 'lodash';
import * as React from 'react';
import { Observable } from 'rxjs/Observable';
import { CLS_CAT_INACTIVE } from './app';
import { CategoryData, CategoryName } from '../data/categories';
import { RXComponent } from '../utils/reactive-react';

export type DataWithDisplay = CategoryData & { display: boolean };
export interface CategoriesProps {
	categoryClicks: (category: CategoryName) => void;
	categoryDisplay: Record<CategoryName, DataWithDisplay>;
	displayUpdates: Observable<CategoriesState>;
}
export type CategoriesState = Record<CategoryName, boolean>;
export class Categories extends RXComponent<CategoriesProps, CategoriesState> {
	constructor(props: CategoriesProps) {
		super(props);
		this.state = _(props.categoryDisplay)
			.toPairs()
			.map(([name, { display }]: [CategoryName, { display: boolean }]) => ({
				name,
				display
			}))
			.reduce((state, { name, display }) => {
				state[name] = display;
				return state;
			}, {} as any as CategoriesState);

		this.subscribe(props.displayUpdates);
	}

	public render() {
		return (
			<ul className='container-fluid'>{
				_(this.props.categoryDisplay)
					.toPairs()
					.map(([name, { description }]: [CategoryName, DataWithDisplay]) => (
						<Category key={name}
							name={name}
							description={description}
							display={this.state[name]}
							click={() => this.props.categoryClicks(name)}
						/>
					))
					.value()
			}</ul>
		);
	}
}

interface CategoryProps {
	name: CategoryName;
	description: string;
	display: boolean;
	click: () => void;
}
function Category({ name, description, display, click }: CategoryProps) {
	const activation = display ? '' : CLS_CAT_INACTIVE;

	return (
		<li key={name}
			className={`category btn cat-${ name } ${ activation }`}
			title={description}
			onClick={click}
		>
			{name}
		</li>
	);
}
