import { Operators } from './operators';

export const multicastOperators: Operators = {
	connect: {
		categories: ['subscription', 'multicast'],
		img: 'multicast.png',
		url: 'http://reactivex.io/rxjs/manual/overview.html#multicasted-observables',
		description: `**This *method* applies only to \`ConnectableObservable\`s, which are observables
that are created with [\`multicast\`](#multicast), or one of the [\`publish\`](#publish)/[\`share\`](#share)
operator varieties.**

Cause the \`ConnectableObservable\` to subscribe to its source observable, regardless of how many
observers subscribed to it.  \
Returns a \`Subscription\` that can be used to unsubscribe from the source observable.

> Warms up (makes it hot) a \`ConnectableObservable\`.

If you're looking for more automatic way to warm up a \`ConnectableObservable\` use
[\`refCount\`](#refCount).`
	},

	refCount: {
		categories: ['subscription', 'multicast'],
		img: 'multicast.png',
		url: 'http://reactivex.io/rxjs/manual/overview.html#reference-counting',
		description: `**This *method* applies only to \`ConnectableObservable\`s, which are observables
that are created with [\`multicast\`](#multicast), or one of the [\`publish\`](#publish)/[\`share\`](#share)
operator varieties.**

Returns an Observable that keeps track of how many subscribers it has.  \

When the number of subscribers increases from \`0\` to \`1\`, it will call \`connect()\`,
starting the execution.  \

When the number of subscribers decreases back from \`1\` to \`0\`, that is, when the output observable is
fully unsubscribed, it would \`unsubscribe\` from the subscription retuned from \`connect\`.

---

If you were created the \`ConnectableObservable\` by calling one of the \`publish\` operators, you can
replace it with a similar \`share\` operator, instead of calling \`refCount\`.`
	},

	multicast: {
		categories: ['multicast', 'subscription'],
		img: 'multicast.png',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-multicast',
		description: `Creates a
[\`ConnectableObservable\`](http://reactivex.io/rxjs/manual/overview.html#multicasted-observables)
utilizing the provided \`Subject\`.`,
	},

	publish: {
		categories: ['multicast', 'subscription'],
		img: 'publish.png',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-publish',
		description: `Returns a \`ConnectableObservable\`, which is a variety of Observable that waits \
until its \`connect\` method is called before it begins emitting items to those Observers that have \
subscribed to it.  \

It's like \`multicast\`, when provided with a simple \`Subject\`.`,
	},

	publishBehavior: {
		categories: ['multicast', 'subscription'],
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-publishBehavior',
		description: `Returns a \`ConnectableObservable\`, which is a variety of Observable that waits \
until its \`connect\` method is called before it begins emitting items to those Observers that have \
subscribed to it.  \

It's like \`multicast\`, when provided with a \`BehaviorSubject\`.  \

The returned-observable, would repeat the last emitted value from the source-observable whenever it is subscribed.`,
	},

	publishLast: {
		categories: ['multicast', 'subscription', 'filter', 'time'],
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-publishLast',
		description: `Returns a \`ConnectableObservable\`, which is a variety of Observable that waits \
until its \`connect\` method is called before it begins emitting items to those Observers that have \
subscribed to it.  \

It's like \`multicast\`, when provided with an \`AsyncSubject\`.  \

The returned-observable, would continue to repeat (to its subscribers) the last emitted value
from the source-observable once the source-observable completes.`,
	},

	publishReplay: {
		categories: ['multicast', 'subscription', 'data', 'time'],
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-publishReplay',
		description: `Returns a \`ConnectableObservable\`, which is a variety of Observable that waits \
until its \`connect\` method is called before it begins emitting items to those Observers that have \
subscribed to it.  \

It's like \`multicast\`, when provided with a \`ReplaySubject\`.  \

The returned-observable, would replay its source-observable emissions every time it is subscribed.`,
	},

	share: {
		categories: ['multicast', 'subscription'],
		img: 'share.png',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-share',
		description: `Returns a new Observable that multicasts (shares) the original Observable.  \

As long as there is at least one Subscriber this Observable will be subscribed and emitting data.  \

When all subscribers have unsubscribed, it will unsubscribe from the source Observable.  \
Because the Observable is multicasting it makes the stream hot.\


This is an alias for \`.publish().refCount()\`  \

For each \`.publish*\` operator variety, there is an equivalent \`.share*\` operator \
which is an alias for \`.publish*(…).refCount() \`.`,
	},
};
