import { Operators } from './operators';

export const filteringOperators: Operators = {
	debounce: {
		categories: ['filter', 'time'],
		img: 'debounce.png',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-debounce',
		description: `Delays values emitted by the source Observable, but drops previous pending delayed emissions \
if a new value arrives on the source Observable.  \

This operator keeps track of the most recent value from the source Observable, and spawns a duration Observable \
by calling the \`durationSelector\` function.  \

The value is emitted only when the duration Observable emits a value or completes, and if no other value was \
emitted on the source Observable since the duration Observable was spawned.  \

If a new value appears before the duration Observable emits, the previous value will be dropped \
and will not be emitted on the output Observable.`,
	},

	audit: {
		categories: ['filter', 'time'],
		img: 'audit.png',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-audit',
		description: `It is similar to throttle, but emits the last value from the silenced time window, \
instead of the first value.  \

\`audit\` emits the most recent value from the source Observable on the output Observable as soon as \
its internal timer becomes disabled, and ignores source values while the timer is enabled.  \

Initially, the timer is disabled. As soon as the first source value arrives, the timer is enabled \
by calling the \`durationSelector\` function with the source value, which returns the "duration" Observable.  \

When the duration Observable emits a value or completes, the timer is disabled, \
then the most recent source value is emitted on the output Observable, \
and this process repeats for the next source value.`,
	},

	auditTime: {
		categories: ['filter', 'time'],
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-auditTime',
		description: 'It is just like using `audit(Observable.interval(time))`.',
	},

	sample: {
		categories: ['filter', 'time', 'completion'],
		img: 'sample.png',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-sample',
		description: `Emits the most recently emitted value from the source Observable whenever another \
Observable, the \`notifier\`, emits.  \

Whenever the \`notifier\` Observable emits a value or completes, sample looks at the source Observable \
and emits whichever value it has most recently emitted since the previous sampling, \
unless the source has not emitted anything since the previous sampling.  \

The \`notifier\` is subscribed to as soon as the output Observable is subscribed.`,
	},

	sampleTime: {
		categories: ['filter', 'time', 'completion'],
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-sampleTime',
		description: 'It is just like using `sample(Observable.interval(time))`.',
	},

	debounceTime: {
		categories: ['filter', 'time'],
		img: 'debounceTime.png',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-debounceTime',
		description: `Delays values emitted by the source Observable, but drops previous pending delayed \
emissions if a new value arrives on the source Observable.  \

This operator keeps track of the most recent value from the source Observable, \
and emits that only when \`dueTime\` enough time has passed without any other value appearing on the source \
Observable.  \

If a new value appears before \`dueTime\` silence occurs, \
the previous value will be dropped and will not be emitted on the output Observable.  \

This is a rate-limiting operator, because it is impossible for more than one value to be emitted \
in any time window of duration \`dueTime\`, but it is also a delay-like operator since output emissions \
do not occur at the same time as they did on the source Observable.  \

Optionally takes a \`IScheduler\` for managing timers.`,
	},

	throttle: {
		categories: ['filter'],
		img: 'throttle.png',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-throttle',
		description: `It's like throttleTime, but the silencing duration is determined by a second Observable.\


Seriously, go read about \`throttleTime\`, then come back here.\


\`throttle\` emits the source Observable values on the output Observable when its internal timer is disabled, \
and ignores source values when the timer is enabled.  \

Initially, the timer is disabled. As soon as the first source value arrives, \
it is forwarded to the output Observable, and then the timer is enabled by calling the \`durationSelector\` \
function with the source value, which returns the "duration" Observable.  \

When the duration Observable emits a value or completes, the timer is disabled, and this process repeats \
for the next source value.`,
	},

	throttleTime: {
		categories: ['filter'],
		img: 'throttleTime.png',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-throttleTime',
		description: `Emits the source Observable values on the output Observable when its internal timer is \
disabled, and ignores source values when the timer is enabled.  \

Initially, the timer is disabled. As soon as the first source value arrives, it is forwarded to \
the output Observable, and then the timer is enabled.  \

After \`duration\` milliseconds has passed, the timer is disabled, and this process repeats for the next source value.`,
	},

	distinct: {
		categories: ['filter'],
		img: 'distinct.png',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-distinct',
		description: `Returns an Observable that emits all items emitted by the source Observable that are \
distinct by comparison from previous items.\


If a \`keySelector\` function is provided, then it will project each value from the source observable into \
a new value that it will check for equality with previously projected values.  \

If a \`keySelector\` function is not provided, it will use each value from the source observable directly \
with an equality check against previous values.`,
	},

	distinctUntilChanged: {
		categories: ['filter'],
		img: 'distinctUntilChanged.png',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-distinctUntilChanged',
		description: `Returns an Observable that emits all items emitted by the source Observable \
that are distinct by comparison from the previous item.\


If a \`comparator\` function is provided, then it will be called for each item to test for whether or not \
that value should be emitted.\


If a \`comparator\` function is not provided, an equality check is used by default.`,
	},

	distinctUntilKeyChanged: {
		categories: ['filter'],
		img: 'distinctUntilKeyChanged.png',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-distinctUntilKeyChanged',
		description: `Returns an Observable that emits all items emitted by the source Observable \
that are distinct by comparison from the previous item, \
using a property accessed by using the key provided to check if the two items are distinct.\


If a \`comparator\` function is provided, then it will be called for each item to test whether or not \
that value should be emitted.\


If a \`comparator\` function is not provided, an equality check is used by default.`,
	},

	single: {
		categories: ['filter', 'error'],
		img: 'single.png',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-single',
		description: `Returns an Observable that emits the single item emitted by the source Observable that \
matches a specified \`predicate\`, if that Observable emits one such item.  \

If the source Observable emits more than one such item or no such items, throws of an \`IllegalArgumentException\` \
or \`NoSuchElementException\` respectively.`,
	},

	first: {
		categories: ['filter', 'completion'],
		img: 'first.png',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-first',
		description:
			'Emits only the first value. Or emits only the first value that passes some test.',
	},

	elementAt: {
		categories: ['filter', 'completion'],
		img: 'elementAt.png',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-elementAt',
		description: `Returns an Observable that emits the item at the specified \`index\` in the source Observable, \
or a default value if that index is out of range and the \`defaultargument\` is provided.  \

If the default argument is not given and the index is out of range, \
the output Observable will emit an \`ArgumentOutOfRangeError\` error.`,
	},

	last: {
		categories: ['filter'],
		img: 'last.png',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-last',
		description: `Returns an Observable that emits only the last item emitted by the source Observable.  \

It optionally takes a \`predicate\` function as a parameter, in which case, rather than emitting the last item \
from the source Observable, the resulting Observable will emit the last item from the source Observable that \
satisfies the predicate.`,
	},

	filter: {
		categories: ['filter'],
		img: 'filter.png',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-filter',
		description: `It is similar to the well-known \`Array.prototype.filter\` method.  \

This operator takes values from the source Observable, passes them through a predicate function and \
only emits those values that yielded \`true\`.`,
	},

	ignoreElements: {
		categories: ['filter'],
		img: 'ignoreElements.png',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-ignoreElements',
		description:
			'Ignores all items emitted by the source Observable and only passes calls of `complete` \
or `error`.',
	},

	skip: {
		categories: ['filter'],
		img: 'skip.png',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-skip',
		description:
			'Returns an Observable that skips the first `count` items emitted by the source Observable.',
	},

	skipUntil: {
		categories: ['filter'],
		img: 'skipUntil.png',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-skipUntil',
		description:
			'Returns an Observable that skips items emitted by the source Observable until \
a second Observable emits an item.',
	},

	skipWhile: {
		categories: ['filter'],
		img: 'skipWhile.png',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-skipWhile',
		description:
			'Returns an Observable that skips all items emitted by the source Observable \
as long as a specified condition holds `true`, \
but emits all further source items as soon as the condition becomes `false`.',
	},

	take: {
		categories: ['filter', 'completion'],
		img: 'take.png',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-take',
		description: `Returns an Observable that emits only the first \`count\` values emitted by \
the source Observable.  \

If the source emits fewer than \`count\` values then all of its values are emitted. After that, it completes, \
regardless if the source completes.`,
	},

	takeLast: {
		categories: ['filter', 'time'],
		img: 'takeLast.png',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-takeLast',
		description: `Returns an Observable that emits at most the last \`count\` values emitted by \
the source Observable.  \

If the source emits fewer than count values then all of its values are emitted.  \

This operator must wait until the *complete* notification emission from the source in order to emit \
the *next* values on the output Observable, because otherwise it is impossible to know whether or not \
more values will be emitted on the source. For this reason, all values are emitted synchronously, \
followed by the complete notification.`,
	},

	takeUntil: {
		categories: ['filter', 'completion'],
		img: 'takeUntil.png',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-takeUntil',
		description: `Lets values pass until a second Observable, \`notifier\`, emits something.  \

Then, it completes.`,
	},

	takeWhile: {
		categories: ['filter', 'completion'],
		img: 'takeWhile.png',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-takeWhile',
		description: `Takes values from the source only while they pass the condition given.  \

When the first value does not satisfy, it completes.`,
	},
};
