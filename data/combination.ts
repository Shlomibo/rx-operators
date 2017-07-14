import { OperatorData } from './operators';

export const combinationOperators: Record<string, OperatorData> = {
	combineLatest: {
		categories: [
			'combination',
			'data',
		],
		img: 'combineLatest.png',
		description: `Combines the values from this Observable with values from Observables passed as arguments.  \

This is done by subscribing to each Observable, in order, and collecting an array of each of \
the most recent values any time any of the input Observables emits.`,
	},

	combineAll: {
		categories: [
			'combination',
			'data',
			'time',
			'completion',
			'subscription',
		],
		img: 'combineAll.png',
		description: `Takes an Observable of Observables, and collects all Observables from it.  \

Once the outer Observable completes, it subscribes to all collected Observables and combines their values \
using the \`combineLatest\` operator.`,
	},

	concat: {
		categories: [
			'combination',
			'completion',
			'subscription',
		],
		img: 'concat.png',
		description: `Creates an output Observable which sequentially emits all values from every \
given input Observable after the current Observable.  \

It concatenates multiple Observables together by sequentially emitting their values, one Observable after the other.`,
	},

	concatAll: {
		categories: [
			'combination',
			'completion',
		],
		img: 'concatAll.png',
		description: `Converts a higher-order Observable into a first-order Observable by \
concatenating the inner Observables in order.  \

It flattens an Observable-of-Observables by putting one inner Observable after the other.`,
	},

	exhaust: {
		categories: [
			'combination',
			'completion',
			'subscription',
			'filter',
		],
		img: 'exhaust.png',
		description: `Subscribes to an Observable that emits Observables, also known as a higher-order Observable.  \

Each time it observes one of these emitted inner Observables, the output Observable begins emitting the \
items emitted by that inner Observable.  \

So far, it behaves like \`mergeAll\`. However, \`exhaust\` **ignores** every new inner Observable if \
the previous Observable has not yet completed. Once that one completes, it will accept and flatten the \
next inner Observable and repeat this process.  \

It flattens an Observable-of-Observables by dropping the next inner Observables while the current inner \
is still executing.`,
	},

	forkJoin: {
		categories: [
			'combination',
			'completion',
			'filter',
			'time',
			'data',
		],
		img: 'forkJoin.png',
		description: 'When all observables complete, emit the last value from each.',
	},

	merge: {
		categories: [
			'combination',
		],
		img: 'merge.png',
		description: `Subscribes to each given input Observable (either the source or an Observable given as argument),\
 and simply forwards (without doing any transformation) all the values from all the input Observables to \
the output Observable. The output Observable only completes once all input Observables have completed.  \

Any error delivered by an input Observable will be immediately emitted on the output Observable.  \

It flattens multiple Observables together by blending their values into one Observable.`,
	},

	mergeAll: {
		categories: [
			'combination',
			'completion',
		],
		img: 'mergeAll.png',
		description: `Subscribes to an Observable that emits Observables, also known as a higher-order Observable.  \

Each time it observes one of these emitted inner Observables, it subscribes to that and delivers all \
the values from the inner Observable on the output Observable. The output Observable only completes once all \
inner Observables have completed.  \

Any error delivered by a inner Observable will be immediately emitted on the output Observable.  \

It flattens an Observable-of-Observables.`,
	},

	race: {
		categories: [
			'combination',
			'completion',
			'filter',
		],
		img: 'race.png',
		description: 'Returns an Observable that mirrors the first source Observable to emit an item \
from the combination of this Observable and supplied Observables.',
	},

	startWith: {
		categories: [
			'combination',
			'data',
		],
		img: 'startWith.png',
		description: 'Returns an Observable that emits the items you specify as arguments before it begins \
to emit items emitted by the source Observable.',
	},

	switch: {
		categories: [
			'combination',
			'completion',
			'filter',
			'subscription',
		],
		img: 'switch.png',
		description: `Subscribes to an Observable that emits Observables, also known as a higher-order Observable.  \

Each time it observes one of these emitted inner Observables, the output Observable subscribes to the \
inner Observable and begins emitting the items emitted by that.  \

So far, it behaves like \`mergeAll\`. However, when a new inner Observable is emitted, \`switch\` **unsubscribes** \
from the earlier-emitted inner Observable and subscribes to the new inner Observable, \
and begins emitting items from it.`,
	},

	withLatestFrom: {
		categories: [
			'combination',
			'data',
			'filter',
		],
		img: 'withLatestFrom.png',
		description: `Combines each value from the source Observable (the instance) with the latest values from \
the other input Observables only when the source emits a value.  \

All input Observables **must emit** at least one value before the output Observable will emit a value.`,
	},

	zip: {
		categories: [
			'combination',
			'data',
			'time',
		],
		img: 'zip.png',
		description: `After all observables emit a value, emit all these values as an array.  \

Could be used to syncronize the emissions of one observable with the emission of other.`,
	},

	zipAll: {
		categories: [
			'combination',
			'data',
			'time',
		],
		img: 'zipAll.png',
		description: 'Converts higher order observable into simple observable, \
merging the emitted observable using zip.',
	},
};
