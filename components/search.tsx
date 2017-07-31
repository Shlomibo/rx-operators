import * as React from 'react';

export interface SearchProps {
	onInput: (val: string) => void;
}
export function Search({ onInput }: SearchProps) {
	return (
		<div className="input-group">
			<span className="input-group-addon">
				<span className="glyphicon glyphicon-search" />
			</span>
			<input
				type="text"
				onInput={({ target }) => onInput((target as HTMLInputElement).value)}
				className="form-control"
				placeholder="map, filter, etc'"
			/>
		</div>
	);
}
