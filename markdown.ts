// highlight.js theme
import 'highlight.js/styles/arduino-light.css';
import * as MarkdownIt from 'markdown-it';
import * as container from 'markdown-it-container';
import * as defList from 'markdown-it-deflist';
import * as highlightjs from 'markdown-it-highlightjs';
import * as sub from 'markdown-it-sub';
import * as sup from 'markdown-it-sup';

export function getParser() {
	return new MarkdownIt()
		.use(container)
		.use(defList)
		.use(highlightjs)
		.use(sub)
		.use(sup);
}
