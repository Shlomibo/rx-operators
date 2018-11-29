export enum ClassSelectorEnum {}
export type ClassSelector = '' | (string & ClassSelectorEnum);
export enum IdSelectorEnum {}
export type IdSelector = string & IdSelectorEnum;

export const isClassSelector = isSelector<ClassSelector>('\\.'),
	classSelector = asSelector<ClassSelector>('.', isClassSelector),
	joinClasses = joinSelectors<ClassSelector>('.', classSelector),
	isIdSelector = isSelector<IdSelector>('#'),
	idSelector = asSelector<IdSelector>('#', isIdSelector);

function isSelector<T extends string>(regexPrefix: string) {
	const prefixRX = new RegExp(String.raw`^(${regexPrefix}[\w-_]*)?$`);
	return function isSelector(selector: string): selector is T {
		return typeof selector === 'string' && !!selector.match(prefixRX);
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
function joinSelectors<T extends string>(
	prefix: string,
	createSelector: (selector: string) => T
) {
	return function joinSelectors(...selectors: string[]) {
		return selectors.map(selector => createSelector(selector)).join('') as T;
	};
}
