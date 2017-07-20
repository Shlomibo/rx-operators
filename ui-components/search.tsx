import * as React from 'react';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { createSideEffect, SideEffect } from '../side-effects';
import { render } from 'react-dom';

export function createSearch(root: Element): [Observable<SideEffect>, Observable<string>] {
	const searchesSubject = new Subject<string>();
	return [
		Observable.of(createSideEffect(
			'search',
			Observable.hotBindCallback(render),
			<Search />,
			root
		)),

		searchesSubject.debounceTime(350),
	];

	function Search() {
		return (
			<div className='input-group'>
				<span className='input-group-addon'><span className='glyphicon glyphicon-search'></span></span>
				<input type='text'
					id='search'
					onInput={({ target }) => searchesSubject.next((target as HTMLInputElement).value)}
					className='form-control'
					placeholder="map, filter, etc'"
				/>
			</div>
		);
	}
}
