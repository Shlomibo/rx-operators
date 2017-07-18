import { OperatorData } from './operators';

export const utilityOperators: Record<string, OperatorData> = {
	do: {
		categories: [
			'utility',
			'debug',
		],
		img: 'do.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-do',
		description: `Intercepts each emission on the source and runs a function, but returns
an output which is identical to the source.

\`do\` is useful for debugging your Observables for the correct values.

> **Note**, while \`do\` may be used to produce side effects by your observable (otherwise than debugging),
this is highly discouraged.  \

An *observable* with side-effects is observable that is coupled to its location and may not be used freely.  \

It is also not clear what would happen on resubscribing such observable, and would require hacks to be done properly.  \

***DON'T USE \`do\` IN SUCH WAY***`
	},

	timeInterval: {
		categories: [
			'utility',
			'data',
		],
		img: 'timeInterval.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-timeInterval',
		description: `Returns an observable that emits for each item emitted from *source observable* an object,
where the item emitted from the *source observable* is the \`value\` property, and an \`interval\` property,
that contains the time passed since the *previous emission* in *miliseconds*.`
	},

	timestamp: {
		categories: [
			'utility',
			'data',
		],
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-timestamp',
		description: `Returns an observable that emits for each item emitted from *source observable* an object,
where the item emitted from the *source observable* is the \`value\` property, and a \`timestamp\` property,
that contains the time passed since [*epoch time*](https://en.wikipedia.org/wiki/Unix_time) in *miliseconds*.`
	},

	timeout: {
		categories: [
			'utility',
			'error',
		],
		img: 'timeout.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-timeout',
		description: `Returns an observable that mirror the *source observable*, but emit an \`error\` if
the \`timeout\` provided is a number, and the *source observabe* does not emit \`next\` for longer than
\`timeout\` time in miliseconds.

If \`timeout\` is \`Date\`, then the *output observable* would mirrot the *source observable* until that1 given date.  \

At which point it would emit an \`error\` (unless it is already completed).`
	},

	timeoutWith: {
		categories: [
			'utility',
			'time',
			'subscription'
		],
		img: 'timeoutWith.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-timeoutWith',
		description: `Returns an observable that mirror the *source observable*, until a spcified \`timeout\` is
reached.

If the specified \`timeout\` is a number, then once the *source observable* fails to deliver a \`next\` notification
within the specified timeout in *miliseconds* (from the previous emission), the *source observable* is unsubscribed,
and the replacement \`withObservable\` observable is subscribed instead (effectively, replacing the *source
observable* with \`withObservable\`).

If the specified \`timeout\` is a \`Date\`, then the replacement would occur on the specified date, unless *source
observable* had already completed.

> It's like [\`timeout\`](#timeout), but instead of emitting an \`error\`, a second observable is subscribed.`
	}
};
