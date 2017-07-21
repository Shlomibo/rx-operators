import * as React from 'react';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { createSideEffect, SideEffect } from '../utils/side-effects';
import { render } from 'react-dom';
import { RXComponent, RXComponentProps } from '../utils/reactive-react';

export interface SearchProps extends RXComponentProps<string> {
	id: string;
}
export class Search extends RXComponent()<string> {
	public props: SearchProps;
	private readonly _searchSubject: BehaviorSubject<string>;

	constructor(props: SearchProps) {
		super(props);
		this._searchSubject = new BehaviorSubject('');
	}

	public render() {
		return (
			<div id={this.props.id} className='input-group'>
				<span className='input-group-addon'><span className='glyphicon glyphicon-search'></span></span>
				<input type='text'
					onInput={({ target }) => this._searchSubject.next((target as HTMLInputElement).value)}
					className='form-control'
					placeholder="map, filter, etc'"
				/>
			</div>
		);
	}

	static get notification() {
		return (search: Search) => search._searchSubject.debounceTime(350);
	}
}
