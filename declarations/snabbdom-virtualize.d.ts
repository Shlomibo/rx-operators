declare module 'snabbdom-virtualize' {
	import { VNode } from '@cycle/dom';
	export default function virtualize(html: Element | string): VNode;
}
declare module 'snabbdom-virtualize/nodes' {
	import { VNode } from '@cycle/dom';
	export default function virtualize(html: Element): VNode;
}
declare module 'snabbdom-virtualize/strings' {
	import { VNode } from '@cycle/dom';
	export default function virtualize(html: string): VNode;
}
