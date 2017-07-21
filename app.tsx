import 'bootstrap/dist/css/bootstrap.css';
import * as _ from 'lodash';
import * as React from 'react';
import { render } from 'react-dom';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/shareReplay';
import { Observable } from 'rxjs/Observable';
import { App } from './components/app';
import './style/style.less';
import { createSideEffect } from './utils/side-effects';

// Shared replaying document-ready stream
const ready = Observable.fromEvent(document, 'DOMContentLoaded')
	.shareReplay();

// UI handling stream
const handling = ready.map(() => {
	return createSideEffect(
		Observable.hotBindCallback(render),
		<App />,
		document.body
	);
})
	.catch((err, source) => {
		// Log the error, then resubscribe
		console.error("WE'RE DOOMED!!!", err);
		return source;
	});

handling.subscribe({
	next: changeUI => changeUI(),
	error: err => console.error('WTF!!!', err),
	complete: () => console.warn('UI handling died'),
});
