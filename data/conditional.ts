import { OperatorData } from './operators';

export const conditionalOperators: Record<string, OperatorData> = {
	defaultIfEmpty: {
		categories: [
			'conditional',
			'data',
		],
		img: 'defaultIfEmpty.png',
		description: `Emits a given value if the source Observable *completes* without emitting any \`next\`
value,  \

Otherwise mirrors the source Observable.`
	},

	every: {
		categories: [
			'conditional',
			'data',
			'filter',
			'completion',
		],
		img: 'every.png',
		description: `Returns an Observable that emits whether or not every item of the source satisfies
the condition specified.

No \`next\` is emitted as long as every item from the *source observable* sutisfies the condition.  \

If an item fails the contions, the *output observable* would emit a single \`next\` with \`false\` value
and then \`complete\`.  \

Otherwise, when the *source observable* would complete, the *output observable* would emit a
single \`next\` with \`true\` value before it's complete.`
	},

	find: {
		categories: [
			'conditional',
			'filter',
			'completion',
		],
		img: 'find.png',
		description: `Emits only the first value emitted by the *source Observable* that meets some condition.

\`find\` searches for the first item in the *source Observable* that matches the specified \`predicate\`,
and returns the first occurrence in the source.

Unlike [\`first\`](#first), the \`predicate\` is required in \`find\`, and does not emit an error
if a valid value is not found.`
	},

	findIndex: {
		categories: [
			'conditional',
			'data',
			'filter',
			'completion',
		],
		img: 'findIndex.png',
		description: `Emits only the index of the first value emitted by the *source Observable*
that meets some condition.

> It's like [\`find\`](#find), but emits the *index* of the found value, not the *value* itself.

\`findIndex\` searches for the first item in the *source Observable* that matches the specified \`predicate\`,
and returns the (zero-based) index of the first occurrence in the source.  \

Unlike [\`first\`](#first), the \`predicate\` is required in findIndex, but the *output observable* does not
emit an error if a valid value is not found.`
	},

	isEmpty: {
		categories: [
			'conditional',
			'data',
			'filter',
			'completion',
		],
		img: 'isEmpty.png',
		description: `Returns an observable that emits \`true\` if the *source observable* completes without
emitting any \`next\`.  \

Otherwise, \`false\` is emitted for the first \`next\` emission, followed by \`complete\`.`
	}
};
