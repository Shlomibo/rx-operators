import { Operators } from './operators';

export const aggregationOprators: Operators = {
	count: {
		categories: ['aggregation', 'data', 'filter'],
		img: 'count.png',
		playWithUrl: 'http://rxmarbles.com/#count',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-count',
		description: `Counts the number of emissions on the source and emits that number when the source completes.

\`count\` transforms an Observable that emits values into an Observable that emits a single value
that represents the number of values emitted by the **source Observable**.  \

If the *source Observable* terminates with an error, \`count\` will pass this error notification along without
emitting a value first.  \

If the *source Observable* does not terminate at all, \`count\` will neither emit a value nor terminate.

This operator takes an optional \`predicate\` function as argument, in which case the output emission will
represent the number of *source values* that matched \`true\` with the \`predicate\`.`,
	},

	max: {
		categories: ['aggregation', 'filter'],
		img: 'max.png',
		playWithUrl: 'http://rxmarbles.com/#max',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-max',
		description: `The \`max\` operator operates on an Observable that emits numbers
(or it can take a \`compare\` function that compares between two items), and when *source Observable* completes,
it emits a **single** item: the item with the largest value.`,
	},

	min: {
		categories: ['aggregation', 'filter'],
		img: 'min.png',
		playWithUrl: 'http://rxmarbles.com/#min',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-min',
		description: `The \`min\` operator operates on an Observable that emits numbers
(or it can take a \`compare\` function that compares between two items), and when *source Observable* completes,
it emits a **single** item: the item with the smallest value.`,
	},

	reduce: {
		categories: ['aggregation', 'data', 'filter'],
		img: 'reduce.png',
		playWithUrl: 'http://rxmarbles.com/#reduce',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-reduce',
		description: `Applies an accumulator function over the *source Observable*, and returns
the accumulated result when the *source* **completes**, given an optional seed value.

> Combines together all values emitted on the source, using an accumulator function that knows how to join
a new source value into the accumulation from the past.

Like \`Array.prototype.reduce()\`, \`reduce\` applies an \`accumulator\` function against an accumulation
and each value of the *source Observable* to reduce it to a single value, emitted on
the *output Observable*.

Note that \`reduce\` will only emit one value, only when the *source Observable* completes.  \

It is equivalent to applying operator scan followed by operator last.`,
	},

	toArray: {
		categories: ['aggregation', 'data'],
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-toArray',
		description: `Returns an observable that once *source observable* is completed, would return
an array with all emitted \`next\` data items.`,
	},
};
