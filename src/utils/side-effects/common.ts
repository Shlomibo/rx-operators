export const pureKey = Symbol('pure');
export const suppressedKey = Symbol('suppressed');
export const functionalSideKey = Symbol('functionalSide');

export interface SideEffectMetadata {
	[key: string]: any;
	[pureKey]?: boolean;
	[suppressedKey]?: boolean;
}

export type SideEffectFunc<T = any> = (...args: any[]) => T;
export type SideEffectTypedFunc<TArgs extends any[], T> = (...args: TArgs) => T;
