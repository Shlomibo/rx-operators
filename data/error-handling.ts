import { Operators } from './operators';

export const errorHandlingOperators: Operators = {
	catch: {
		categories: ['error', 'subscription'],
		img: 'catch.png',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-catch',
		description: `Catches errors on the source observable, and returning a (might be new) observable, \
or throwing an error.

This method sends the source observable to \`selector\` (\`catch\`\\\`s argument) as the second argument,
so you may resubscribe to it.  \

***Note:*** Forgetting to return the source observable would leave it unsubscibed.

---

#### Example

\`\`\` typescript
const errorHandlingObservable = Observable.throw(new Error('An error'))
  .startWith('An item')
  .catch((err, source) => {
    console.warn(err.message);
    return source;
  });

errorHandlingObservable.subscribe({
  next: item => console.log(item),
  error: err => console.error(err),
  complete: () => console.log('Done!'),
});
\`\`\`
Would print:

info: \`An item\`  \

warning: \`An error\`  \

info: \`An item\`  \

warning: \`An error\`  \

info: \`An item\`  \

warning: \`An error\`  \

...

*No* error messages, *nor* \`Done!\` would be logged..`,
	},

	retry: {
		categories: ['error', 'subscription'],
		img: 'retry.png',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-retry',
		description: `Returns an Observable that mirrors the source Observable with the exception of an error.  \

If the source Observable calls error, this method will resubscribe to the source Observable for a maximum \
of \`count\` resubscriptions (given as a number parameter) rather than propagating the error call.`,
	},

	retryWhen: {
		categories: ['error', 'subscription'],
		img: 'retryWhen.png',
		url:
			'http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-retryWhen',
		description: `Retry an observable sequence on error based on custom criteria.


Returns an Observable that mirrors the source Observable with the exception of an error.  \

This operator gets \`notifier\` which is a function that accpets an oversvable of errors, \
and returns an observable.  \
If the source Observable emits an error, it will me emitted on the observable sent to \`notifier\`.  \

If if the observable the returned from \`notifier\` emits *complete* or *error* then the output obervable \
would emit complete or error.  \

Otherwise, in case *next* was emitted, this method will resubscribe to the source Observable.`,
	},
};
