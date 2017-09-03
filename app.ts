import { makeDOMDriver } from '@cycle/dom';
import { run } from '@cycle/rxjs-run';
import 'bootstrap/dist/css/bootstrap.css';
import 'core-js/shim';
import { App } from './components/app';
import './style/style.less';

run(App, { DOM: makeDOMDriver('#app') });
