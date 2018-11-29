export type OneOrMany<T extends any[]> = T extends [infer U] ? U : T;
