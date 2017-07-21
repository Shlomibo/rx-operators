import { Operators } from './operators';

export const transformationOperators: Operators = {
	buffer: {
		categories: [
			'data',
			'time',
			'transformation',
		],
		img: 'buffer.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-buffer',
		description: `Buffers the incoming Observable values until the given \`closingNotifier\` Observable emits \
a value at which point it emits the buffer on the output Observable and starts a new buffer internally, \
awaiting the next \`timeclosingNotifier\` emits.`,
	},

	bufferTime: {
		categories: [
			'data',
			'time',
			'transformation',
		],
		img: 'bufferTime.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-bufferTime',
		description: `It is like calling \`buffer(interval(time))\`.  \

Buffers values from the source for a specific time duration \`bufferTimeSpan\`. Unless the optional argument
\`bufferCreationInterval\` is given, it emits and resets the buffer every \`bufferTimeSpan\` milliseconds.  \

If \`bufferCreationInterval\` is given, this operator opens the buffer every \`bufferCreationInterval\` milliseconds \
and closes (emits and resets) the buffer every \`bufferTimeSpan\` milliseconds.  \

When the optional argument \`maxBufferSize\` is specified, the buffer will be closed either after \`bufferTimeSpan\` \
milliseconds or when it contains \`maxBufferSize\` elements.`,
	},

	bufferCount: {
		categories: [
			'data',
			'time',
			'transformation',
		],
		img: 'bufferCount.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-bufferCount',
		description: 'Buffers the source Observable values until the size hits the maximum \`bufferSize\` given.',
	},

	bufferToggle: {
		categories: [
			'data',
			'time',
			'transformation',
			'filter',
		],
		img: 'bufferToggle.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-bufferToggle',
		description: `Collects values from the past as an array. Starts collecting only when \`opening\` emits, \
and calls the \`closingSelector\` function to get an Observable that tells when to close the buffer.`,
	},

	bufferWhen: {
		categories: [
			'data',
			'time',
			'transformation',
		],
		img: 'bufferWhen.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-bufferWhen',
		description: `Opens a buffer immediately, then closes the buffer when the observable returned by calling \
\`closingSelector\` function emits a value.  \

When it closes the buffer, it immediately opens a new buffer and repeats the process.`,
	},

	window: {
		categories: [
			'subscription',
			'transformation',
		],
		img: 'window.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-window',
		description: "Returns an Observable that emits windows of items it collects from the source Observable. \
The output Observable emits connected, non-overlapping windows.  \
It emits the current window and opens a new one whenever the Observable \`windowBoundaries\` emits an item. \
Because each window is an Observable, the output is a higher-order Observable.  \
It's like buffer, but emits a nested Observable instead of an array.",
	},

	windowCount: {
		categories: [
			'subscription',
			'transformation',
		],
		img: 'windowCount.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-windowCount',
		description: 'Branch out the source Observable values as a nested Observable with each nested Observable \
emitting at most \`windowSize\` values.',
	},

	windowTime: {
		categories: [
			'subscription',
			'transformation',
			'filter',
		],
		img: 'windowTime.png',
		url: 'http://reactivex.io/rxjs/file/es6/operator/windowTime.js.html',
		description: "Branch out the source Observable values as a nested Observable periodically in time.  \
It's like \`bufferTime\`, but emits a nested Observable instead of an array.",
	},

	windowToggle: {
		categories: [
			'subscription',
			'transformation',
			'filter',
		],
		img: 'windowToggle.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-windowToggle',
		description: `Returns an Observable that emits windows of items it collects from the source Observable.  \

The output Observable emits windows that contain those items emitted by the source Observable between the time when \
the \`openings\` Observable emits an item and when the Observable returned by \`closingSelector\` emits an item.`,
	},

	windowWhen: {
		categories: [
			'subscription',
			'transformation',
		],
		img: 'windowWhen.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-windowWhen',
		description: `Returns an Observable that emits windows of items it collects from the source Observable.  \

The output Observable emits connected, non-overlapping windows. It emits the current window and opens \
a new one whenever the Observable produced by the specified \`closingSelector\` function emits an item.  \

The first window is opened immediately when subscribing to the output Observable.`,
	},

	concatMap: {
		categories: [
			'subscription',
			'transformation',
			'data',
			'time',
		],
		img: 'concatMap.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-concatMap',
		description: 'Projects each source value to an Observable which is merged in the output Observable, \
in a serialized fashion, waiting for each projected observable to complete before merging the next.',
	},

	concatMapTo: {
		categories: [
			'subscription',
			'transformation',
			'data',
			'time',
		],
		img: 'concatMapTo.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-concatMapTo',
		description: 'Projects each source value to the ***same*** Observable which is merged multiple times in \
a serialized fashion on the output Observable.',
	},

	exhaustMap: {
		categories: [
			'subscription',
			'transformation',
			'data',
			'time',
			'filter',
		],
		img: 'exhaustMap.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-exhaustMap',
		description: `Returns an Observable that emits items based on applying a function that you supply to \
each item emitted by the source Observable, where that function returns an (so-called "inner") Observable.  \

When it projects a source value to an Observable, the output Observable begins emitting the items emitted \
by that projected Observable.  \

*However, \`exhaustMap\` ignores every new projected Observable if the previous projected Observable has \
not yet completed.* Once that one completes, it will accept and flatten the next projected Observable and \
repeat this process.`,
	},

	mergeMap: {
		categories: [
			'transformation',
			'data',
		],
		img: 'mergeMap.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-mergeMap',
		description: 'Projects each source value to an Observable which is merged with all projected observables, \
in the output Observable.',
	},

	mergeMapTo: {
		categories: [
			'transformation',
			'data',
		],
		img: 'mergeMapTo.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-mergeMapTo',
		description: 'Projects each source value to the ***same*** Observable which is merged multiple times \
in the output Observable.',
	},

	expand: {
		categories: [
			'subscription',
			'transformation',
			'data',
			'time',
		],
		img: 'expand.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-expand',
		description: `Recursively projects each source value to an Observable which is merged in \
the output Observable.  \

It's similar to \`mergeMap\`, but applies the projection function to every source value as well as every output \
value.  \

It's recursive.`,
	},

	switchMap: {
		categories: [
			'subscription',
			'transformation',
			'data',
			'filter',
		],
		img: 'switchMap.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-switchMap',
		description: `Projects each source value to an Observable which is merged in the output Observable, \
emitting values only from the most recently projected Observable.  \

It's like m\`ergeMap\`, only that whenever new source value is emitted, the observable projected from \
the previous value is unsubscribed.`,
	},

	switchMapTo: {
		categories: [
			'subscription',
			'transformation',
			'data',
			'filter',
		],
		img: 'switchMapTo.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-switchMapTo',
		description: `Maps each source value to the ***same*** given Observable \`innerObservable\` regardless \
of the source value, and then flattens those resulting Observables into one single Observable, \
which is the output Observable.  \

The output Observables emits values only from the most recently emitted instance of innerObservable.`,
	},

	groupBy: {
		categories: [
			'subscription',
			'transformation',
		],
		img: 'groupBy.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-groupBy',
		description: 'Groups the items emitted by an Observable according to a specified criterion, \
and emits these grouped items as \`GroupedObservables\`, one \`GroupedObservable\` per group.',
	},

	partition: {
		categories: [
			'subscription',
			'transformation',
		],
		img: 'partition.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-partition',
		description: "Splits the source Observable into two, one with values that satisfy a predicate, \
and another with values that don't satisfy the predicate.",
	},

	map: {
		categories: [
			'transformation',
			'data',
		],
		img: 'map.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-map',
		description: 'Similar to the well known \`Array.prototype.map\` function, \
this operator applies a projection to each value and emits that projection in the output Observable.',
	},

	mapTo: {
		categories: [
			'transformation',
			'data',
		],
		img: 'mapTo.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-mapTo',
		description: 'Emits the ***same*** given constant value on the output Observable \
every time the source Observable emits a value.',
	},

	pluck: {
		categories: [
			'transformation',
			'data',
		],
		img: 'pluck.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-pluck',
		description: `Given a list of strings describing a path to an object property, \
retrieves the value of a specified nested property from all values in the source Observable.  \

If a property can't be resolved, it will return \`undefined\` for that value.`,
	},

	scan: {
		categories: [
			'transformation',
			'data',
		],
		img: 'scan.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-scan',
		description: `Applies an accumulator function over the source Observable, \
and returns each intermediate result, with an optional seed value.  \

It's like reduce, but emits the current accumulation whenever the source emits a value.  \

Especially useful for evolving state over time.`,
	},

	pairwise: {
		categories: [
			'transformation',
			'data',
		],
		img: 'pairwise.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-pairwise',
		description: `Puts the current value and previous value together as an array, and emits that.  \

The Nth emission from the source Observable will cause the output Observable to emit an array [(N-1)th, Nth] \
of the previous and the current value, as a pair.  \

For this reason, pairwise emits on the second and subsequent emissions from the source Observable, \
but not on the first emission, because there is no previous value in that case.`,
	},

	mergeScan: {
		categories: [
			'transformation',
			'subscription',
			'data',
		],
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-mergeScan',
		description: `Applies an accumulator function over the source Observable where the accumulator \
function itself returns an Observable, then each intermediate Observable returned is \
merged into the output Observable.  \

It's like scan, but the Observables returned by the accumulator are merged into the outer Observable.`,
	},

	delay: {
		categories: [
			'transformation',
			'time',
		],
		img: 'delay.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-delay',
		description: `Delays the emission of items from the source Observable by a given timeout or until a given \
Date.  \

It time shifts each item by some specified amount of milliseconds.`,
	},

	delayWhen: {
		categories: [
			'transformation',
			'time',
		],
		img: 'delayWhen.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-delayWhen',
		description: `Time shifts each emitted value from the source Observable by a time span determined by \
another Observable.  \

When the source emits a value, the \`delayDurationSelector\` function is called with the source value as argument, \
and should return an Observable, called the "duration" Observable.  \

The source value is emitted on the output Observable only when the duration Observable emits a value or completes.  \

It's like delay, but the time span of the delay duration is determined by a second Observable.`,
	},

	materialize: {
		categories: [
			'transformation',
			'data',
			'completion',
			'error',
		],
		img: 'materialize.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-materialize',
		description: `Represents all of the notifications from the source Observable \
as next emissions marked with their original types within \`Notification\` objects.  \

It wraps *next*, *error* and *complete* emissions in \`Notification\` objects, \
emitted as next on the output Observable.`,
	},

	dematerialize: {
		categories: [
			'transformation',
			'data',
			'completion',
			'error',
		],
		img: 'dematerialize.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-dematerialize',
		description: `Converts an Observable of \`Notification\` objects into the emissions that they represent.  \

It unwraps \`Notification\` objects as actual *next*, *error* and *complete* emissions. The opposite of materialize.`,
	},

	subscribeOn: {
		categories: [
			'transformation',
			'subscription',
		],
		img: 'subscribeOn.png',
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-subscribeOn',
		description: 'Returns an observable that subscribes asynchronously to the source-observable \
on the provided *scheduler*.',
	},

	observeOn: {
		categories: [
			'transformation',
			'subscription',
		],
		url: 'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-observeOn',
		description: 'Returns an observable that emits asynchronously values from the source-observable \
on the provided *scheduler*.',
	},
};
