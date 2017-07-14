import { OperatorData } from './operators';

export const multicastOperators: Record<string, OperatorData> = {
	multicast: {
		categories: [
			'multicast',
			'subscription',
		],
		img: 'multicast.png',
		description: 'Share source utilizing the provided \`Subject\`.',
	},

	publish: {
		categories: [
			'multicast',
			'subscription',
		],
		img: 'publish.png',
		description: `Returns a \`ConnectableObservable\`, which is a variety of Observable that waits \
until its \`connect\` method is called before it begins emitting items to those Observers that have \
subscribed to it.  \

It's like \`multicast\`, when provided with a simple \`Subject\`.`,
	},

	publishBehavior: {
		categories: [
			'multicast',
			'subscription',
		],
		description: `Returns a \`ConnectableObservable\`, which is a variety of Observable that waits \
until its \`connect\` method is called before it begins emitting items to those Observers that have \
subscribed to it.  \

It's like \`multicast\`, when provided with a \`BehaviorSubject\`.  \

The returned-observable, would repeat the last emitted value from the source-observable whenever it is subscribed.`,
	},

	publishLast: {
		categories: [
			'multicast',
			'subscription',
			'filter',
			'time',
		],
		description: `Returns a \`ConnectableObservable\`, which is a variety of Observable that waits \
until its \`connect\` method is called before it begins emitting items to those Observers that have \
subscribed to it.  \

It's like \`multicast\`, when provided with an \`AsyncSubject\`.  \

The returned-observable, would continue to repeat (to its subscribers) the last emitted value
from the source-observable once the source-observable completes.`,
	},

	publishReplay: {
		categories: [
			'multicast',
			'subscription',
			'data',
			'time',
		],
		description: `Returns a \`ConnectableObservable\`, which is a variety of Observable that waits \
until its \`connect\` method is called before it begins emitting items to those Observers that have \
subscribed to it.  \

It's like \`multicast\`, when provided with a \`ReplaySubject\`.  \

The returned-observable, would replay its source-observable emissions every time it is subscribed.`,
	},

	share: {
		categories: [
			'multicast',
			'subscription',
		],
		img: 'share.png',
		description: `Returns a new Observable that multicasts (shares) the original Observable.  \

As long as there is at least one Subscriber this Observable will be subscribed and emitting data.  \

When all subscribers have unsubscribed, it will unsubscribe from the source Observable.  \
Because the Observable is multicasting it makes the stream hot.\


This is an alias for \`.publish().refCount()\`  \

For each \`.publish*\` operator variety, there is an equivalent \`.share*\` operator \
which is an alias for \`.publish*(…).refCount() \`.`,
	},
};
