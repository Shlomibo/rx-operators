import { OperatorData } from './operators';

export const creationOperators: Record<string, OperatorData> = {
	bindCallback: {
		categories: [
			'creation',
		],
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#static-method-bindCallback',
		description: `If you want to consume node's callbacks, use \
[\`bindNodeCallback\`](#bindNodeCallback)

Give it a function \`f\` of type \`f(x, callback)\` and it will return a function \`g\` that \
when called as \`g(x)\` will output an Observable of the data passed to the callback.

\`bindCallback\` returns a function that takes the same parameters as the *function argument*, \
except the last one (the *callback*).  \

When the returned function is called with arguments, it will return an Observable.

If the *function argument* calls its *callback* with one argument, the Observable will emit that value. \
If on the other hand the *callback* is called with multiple values, resulting Observable will emit \
an array with these arguments.

After the *value* is emitted, the observable is **complete**.`
	},

	bindNodeCallback: {
		categories: [
			'creation',
		],
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#static-method-bindNodeCallback',
		description: `It's just like [\`bindCallback\`](#bindCallback), but the callback is expected \
to be of type \`callback(error, result)\`.

\`bindNodeCallback\` returns a function that takes the same parameters as the *function argument*, \
except the last one (the *callback*).

When the *returned function* is called with arguments, it will return an Observable.  \

If the *function argument* calls its callback with error parameter present, the *output Observable* \
will error with that error.  \

If error parameter is not passed, Observable will emit the other value. \
If there are more parameters (third and so on), the *output Observable* will emit an array with all arguments, \
except the first error argument.

After the *value* is emitted, the observable is **complete**.`
	},

	create: {
		categories: [
			'creation',
			'subscription',
		],
		img: 'create.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#static-method-create',
		description: `Creates a new Observable, that will execute the specified function when an Observer \
**subscribes** to it.

The provided function can, **and should** return \`subscription\`, which when executed, releases \
any resources consumed when subscribed, and may cancel ongoing operations.`
	},

	defer: {
		categories: [
			'creation',
			'subscription',
		],
		img: 'defer.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#static-method-defer',
		description: `\`defer\` allows you to create the Observable only when the Observer subscribes,
and create a fresh Observable for each Observer.

It waits until an Observer subscribes to it, and then it generates an Observable, an Observable factory function
(a function that creates the new observable).  \

It does this afresh for each subscriber, so although each subscriber may think it is subscribing to the \
same Observable, in fact each subscriber gets its own individual Observable.

> Creates the Observable lazily, that is, only when it is subscribed.`
	},

	empty: {
		categories: [
			'creation',
		],
		img: 'empty.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#static-method-empty',
		description: `Creates an Observable that emits no items to the Observer and immediately emits a
complete notification.

This static operator is useful for creating a simple Observable that only emits the complete notification.
It can be used for composing with other Observables, such as in a [\`mergeMap\`](#mergeMap).`
	},

	from: {
		categories: [
			'creation'
		],
		img: 'from.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#static-method-from',
		description: `Creates an Observable from an Array, an array-like object, a Promise, an iterable object,
or an Observable-like object.

Convert various other objects and data types into Observables. \`from\` converts a Promise or an array-like
or an iterable object into an Observable that emits the items in that promise or array or iterable.
A String, in this context, is treated as an array of characters.  \

Observable-like objects (contains a function named with the ES2015 Symbol for Observable) can also be
converted through this operator.

> Converts almost anything to an Observable.`
	},

	fromEvent: {
		categories: [
			'creation',
		],
		img: 'fromEvent.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#static-method-fromEvent',
		description: `Creates an Observable by attaching an event listener to an *event target*,
which may be an object with \`addEventListener\` and \`removeEventListener\`, a Node.js \`EventEmitter\`,
a jQuery style EventEmitter, a \`NodeList\` from the DOM, or an \`HTMLCollection\` from the DOM.

The event handler is attached when the output Observable is subscribed,
and removed when the Subscription is unsubscribed.`
	},

	fromEventPattern: {
		categories: [
			'creation',
			'subscription'
		],
		img: 'fromEventPattern.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#static-method-fromEventPattern',
		description: `Creates an Observable from an API based on *addHandler*/*removeHandler* functions.

Creates an Observable by using the provided \`addHandler\` and \`removeHandler\` functions to add and remove
the handlers, with an optional \`selector\` function to project the event arguments to a result.

The addHandler is called when the output Observable is subscribed, and removeHandler is called when
the Subscription is unsubscribed.

> Converts any addHandler/removeHandler API to an Observable.`
	},

	fromPromise: {
		categories: [
			'creation',
		],
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#static-method-fromPromise',
		description: `Converts an ES2015 Promise or a Promises/A+ spec compliant Promise to an Observable.

If the Promise resolves with a value, the output Observable emits that resolved value as a \`next\`,
and then completes.  \

If the Promise is rejected, then the output Observable emits the corresponding Error as an \`error\`.`
	},

	interval: {
		categories: [
			'creation',
			'time',
		],
		img: 'interval.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#static-method-interval',
		description: `Creates an Observable that emits sequential numbers every specified interval of time,
as long as it subscribed.

The first emission is not sent immediately, but only after the first period has passed.`
	},

	never: {
		categories: [
			'creation'
		],
		img: 'never.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#static-method-never',
		description: `Creates an Observable that has no emissions to the Observer.

This static operator is useful for creating a simple Observable that emits nothing;
no \`next\`, nor \`error\` nor \`complete\`.  \

It can be used for testing purposes or for composing with other Observables.

* **Note** that by never emitting a complete notification, this Observable keeps the subscription from
being disposed automatically.  \

Subscriptions need to be manually disposed.

> An Observable that never emits anything.`
	},

	of: {
		categories: [
			'creation',
			'data',
		],
		img: 'of.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#static-method-of',
		description: `This static operator is useful for creating a simple Observable that only emits
the arguments given, and then \`complete\` notification.  \

It can be used for composing with other Observables, such as with [\`concat\`](#concat).

> Emits the arguments you provide, then completes.`
	},

	range: {
		categories: [
			'creation'
		],
		img: 'range.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#static-method-range',
		description: `Creates an Observable that emits a sequence of numbers within the specified range.

\`range\` operator emits a range of sequential integers, in order, where you select the \`start\` of
the range and the \`count\` of emitted numbers.`
	},

	throw: {
		categories: [
			'creation',
			'error',
		],
		img: 'throw.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#static-method-throw',
		description: `Creates an Observable that emits nothing but an \`error\`.

This static operator is useful for creating a simple Observable that only emits the \`error\` notification.  \

It can be used for composing with other Observables, such as in a [\`mergeMap\`](#mergeMap).`
	},

	timer: {
		categories: [
			'creation',
			'time'
		],
		img: 'timer.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#static-method-timer',
		description: `Creates an Observable that starts emitting after an \`initialDelay\` and emits
increasing numbers after each \`period\` of time thereafter.

> It's like [\`interval\`](#interval), but you can specify when should the emissions start.

\`timer\` returns an Observable that emits an infinite sequence of ascending integers, with a constant interval
of time, \`period\`, of your choosing between those emissions.  \

The first emission happens after the specified \`initialDelay\`. The initial delay may be a \`Date\`.

If \`period\` is not specified, the output Observable emits only one value, \`0\`.  \

Otherwise, it emits an infinite sequence.`
	}
};
