import 'bootstrap/dist/css/bootstrap.css';
import 'core-js/shim';
import { fromEvent } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { application } from './components/app';
import '../style/style.less';
import jQuery = require('jquery');

fromEvent(document, 'DOMContentLoaded')
	.pipe(switchMap(x => application(jQuery('body')).updates))
	.subscribe(
		se => {
			se();
		},
		err => console.error(err),
		() => console.warn('backbone collapsed')
	);
