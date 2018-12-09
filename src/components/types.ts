import JQuery = require('jquery');
import { Observable } from 'rxjs';
import { SideEffect } from '../utils/side-effects';

export type Element = JQuery<HTMLElement>;

export interface Component {
	updates: Observable<SideEffect>;
	events(event: string): Observable<Event>;
}
