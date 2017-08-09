import * as React from 'react';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/mapTo';
import { reactEventObserver, RXComponent } from '../utils/reactive-react';
import { Observable } from 'rxjs/Observable';

export interface SearchProps {
	onInput: (valObservable: Observable<string>) => void;
	reset?: Observable<any>;
}
interface SearchState {
	value: string;
}
type KeyboardEvent = React.KeyboardEvent<HTMLInputElement>;
export class Search extends RXComponent<SearchProps, SearchState> {
	private readonly _onKeyDown = reactEventObserver<KeyboardEvent>();
	private readonly _onInput = reactEventObserver<string>();

	constructor(props: SearchProps) {
		super(props);
		const INIT_STATE = {
			value: '',
		};

		this.state = INIT_STATE;

		const reset = Observable.merge(
			props.reset || Observable.empty(),
			this._onKeyDown.asObservable().map(e => e.key).filter(key => key === 'Escape')
		).mapTo(INIT_STATE);

		const input = this._onInput.asObservable().map(value => ({ value })),
			statesObservable = Observable.merge(input, reset).share();

		props.onInput(statesObservable.map(({ value }) => value));

		this.subscribe(statesObservable);
	}

	public render() {
		const { value } = this.state;

		return (
			<SearchUI onInput={this._onInput} value={value} keyDown={this._onKeyDown} />
		);
	}
}

interface SearchUIProps {
	onInput: (val: string) => void;
	keyDown: (e: KeyboardEvent) => void;
	value: string;
}
function SearchUI({ onInput, keyDown, value }: SearchUIProps) {
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
				value={value}
				onKeyDown={keyDown}
			/>
		</div>
	);
}
