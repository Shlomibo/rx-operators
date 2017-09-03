export enum ClassSelectorEnum {}
export type ClassSelector = '' | (string & ClassSelectorEnum);
export enum IdSelectorEnum {}
export type IdSelector = string & IdSelectorEnum;

export const isClassSelector = isSelector<ClassSelector>('\\.'),
	classSelector = asSelector<ClassSelector>('.', isClassSelector),
	isIdSelector = isSelector<IdSelector>('#'),
	idSelector = asSelector<IdSelector>('#', isIdSelector);

function isSelector<T extends string>(regexPrefix: string) {
	return function isSelector(selector: string): selector is T {
		return (
			typeof selector === 'string' &&
			!!selector.match(new RegExp(String.raw`^(${regexPrefix}[\w-_]*)?$`))
		);
	};
}
function asSelector<T extends string>(
	prefix: string,
	isSelector: (selector: string) => selector is T
) {
	return function asSelector(selector: string): T {
		if (isSelector(selector)) {
			return selector;
		}

		selector = selector.trim().replace(/[^\w-_]/g, '-');

		selector = prefix + (selector[0] === '-' ? selector.substr(1) : selector);

		if (!isSelector(selector)) {
			throw new Error('Conversion to class selector failed');
		}

		return selector;
	};
}
