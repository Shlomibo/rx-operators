import { Operators } from './operators';

export const conditionalOperators: Operators = {
	defaultIfEmpty: {
		categories: ['conditional', 'data'],
		img: 'defaultIfEmpty.png',
		playWithUrl: 'http://rxmarbles.com/#defaultIfEmpty',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-defaultIfEmpty',
		description: `Emits a given value if the source Observable *completes* without emitting any \`next\`
value,  \

Otherwise mirrors the source Observable.`,
	},

	every: {
		categories: ['conditional', 'data', 'filter', 'completion'],
		img: 'every.png',
		playWithUrl: 'http://rxmarbles.com/#every',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-every',
		description: `Returns an Observable that emits whether or not every item of the source satisfies
the condition specified.

No \`next\` is emitted as long as every item from the *source observable* sutisfies the condition.  \

If an item fails the contions, the *output observable* would emit a single \`next\` with \`false\` value
and then \`complete\`.  \

Otherwise, when the *source observable* would complete, the *output observable* would emit a
single \`next\` with \`true\` value before it's complete.`,
	},

	find: {
		categories: ['conditional', 'filter', 'completion'],
		img: 'find.png',
		playWithUrl: 'http://rxmarbles.com/#find',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-find',
		description: `Emits only the first value emitted by the *source Observable* that meets some condition.

\`find\` searches for the first item in the *source Observable* that matches the specified \`predicate\`,
and returns the first occurrence in the source.

Unlike [\`first\`](#first), the \`predicate\` is required in \`find\`, and does not emit an error
if a valid value is not found.`,
	},

	findIndex: {
		categories: ['conditional', 'data', 'filter', 'completion'],
		img: 'findIndex.png',
		playWithUrl: 'http://rxmarbles.com/#findIndex',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-findIndex',
		description: `Emits only the index of the first value emitted by the *source Observable*
that meets some condition.

> It's like [\`find\`](#find), but emits the *index* of the found value, not the *value* itself.

\`findIndex\` searches for the first item in the *source Observable* that matches the specified \`predicate\`,
and returns the (zero-based) index of the first occurrence in the source.  \

Unlike [\`first\`](#first), the \`predicate\` is required in findIndex, but the *output observable* does not
emit an error if a valid value is not found.`,
	},

	isEmpty: {
		categories: ['conditional', 'data', 'filter', 'completion'],
		img: 'isEmpty.png',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-isEmpty',
		description: `Returns an observable that emits \`true\` if the *source observable* completes without
emitting any \`next\`.  \

Otherwise, \`false\` is emitted for the first \`next\` emission, followed by \`complete\`.`,
	},

	sequenceEqual: {
		categories: ['conditional', 'data', 'filter', 'completion'],
		img: 'sequenceEqual.png',
		playWithUrl: 'http://rxmarbles.com/#sequenceEqual',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-sequenceEqual',
		description: `> Checks to see of all values emitted by both observables are equal, in order.

\`sequenceEqual\` subscribes to two observables and compare for equality incoming values from each observable.  \

Whenever either observable emits a value, the value is buffered and the buffers are shifted and
compared from the bottom up (from start to end);  \
If any value pair doesn't match, the returned observable will emit \`false\` and complete.

If one of the observables completes, the operator will wait for the other observable to complete;  \

If the other observable emits before completing, the returned observable will emit \`false\` and complete.  \

***Note:*** If one observable never completes nor emits after the other complets, \
the returned observable will never complete.`,
	},
};
