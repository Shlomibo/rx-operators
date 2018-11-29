import { makeDOMDriver } from '@cycle/dom';
import { run } from '@cycle/rxjs-run';
import 'bootstrap/dist/css/bootstrap.css';
import 'core-js/shim';
import onionify from 'cycle-onionify';
import { App } from './components/app';
import './style/style.less';

const statefullApp = onionify(App, 'state');

run(statefullApp, { DOM: makeDOMDriver('#app') });
