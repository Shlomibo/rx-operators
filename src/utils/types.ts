export type OneOrMany<T extends any[]> = T extends [infer U] ? U : T;

export type ElementOf<T, TAlt = never> = T extends (infer U)[] ? U : TAlt;

export type KeyOf<T, TKey, TAlt = never> = T extends object
	? TKey extends keyof T ? T[TKey] : TAlt
	: TAlt;

export type Key = string | number | symbol;
export type Entry<TKey extends Key, TValue> = [TKey, TValue];
export type KeysOf<T, TKeys extends Key, TAlt = never> = T extends object
	? { [K in TKeys]: KeyOf<T, K, TAlt> }
	: TAlt;

export type ReadWrite<T> = {
	-readonly [K in keyof T]: T[K];
};

export type Merge<TType, TTypes extends TType[]> =
	TTypes extends [infer T1, infer T2, infer T3, infer T4, infer T5] ? T1 | T2 | T3 | T4 | T5 :
	TTypes extends [infer T1, infer T2, infer T3, infer T4] ? T1 | T2 | T3 | T4 :
	TTypes extends [infer T1, infer T2, infer T3] ? T1 | T2 | T3 :
	TTypes extends [infer T1, infer T2] ? T1 | T2 :
	TTypes extends [infer T1] ? T1 :
	TType;

export type FirstArg<T, TAlt = never> = T extends (arg: infer TArg, ...args: any[]) => any ? TArg : TAlt;

export type ArgTypes<T, TFunc extends (arg: T, ...args: any[]) => any, TFuncs extends TFunc[], TAlt = never> =
	TFuncs extends [infer T1, infer T2, infer T3, infer T4, infer T5] ?
		[FirstArg<T1, TAlt>, FirstArg<T2, TAlt>, FirstArg<T3, TAlt>, FirstArg<T4, TAlt>, FirstArg<T5, TAlt>]
	: TFuncs extends [infer T1, infer T2, infer T3, infer T4] ?
		[FirstArg<T1, TAlt>, FirstArg<T2, TAlt>, FirstArg<T3, TAlt>, FirstArg<T4, TAlt>]
	: TFuncs extends [infer T1, infer T2, infer T3] ?
		[FirstArg<T1, TAlt>, FirstArg<T2, TAlt>, FirstArg<T3, TAlt>]
	: TFuncs extends [infer T1, infer T2] ?
		[FirstArg<T1, TAlt>, FirstArg<T2, TAlt>]
	: TFuncs extends [infer T1] ?
		[FirstArg<T1, TAlt>]
	: T[];
