import { Observable } from 'rxjs';
import {
	FunctionalSide,
	FunctioningFunctionalSide,
	SuppressedFunctionalSide,
} from './functional-side';

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
export interface SideEffect<T = any> {
	(): void;
	args: any[];
	sideEffect: SideEffectFunc<T>;
	completed: Observable<T>;
	cancelled: Observable<true>;
	[functionalSideKey]: FunctionalSide<T>;
	cancel(): void;
	clone(): SideEffect<T>;
	cloneEffect(): SideEffect<T>;
	metadata: SideEffectMetadata;
	resultFromRanEffect(throwIfDidntRun?: true): T;
	resultFromRanEffect(throwIfDidntRun: false): T | undefined;
	readonly didRun: boolean;
}
export interface TypedSideEffect<TArgs extends any[], T> extends SideEffect<T> {
	args: TArgs;
	sideEffect: SideEffectTypedFunc<TArgs, T>;
	clone(): TypedSideEffect<TArgs, T>;
	cloneEffect(): TypedSideEffect<TArgs, T>;
}

const sideEffects = new WeakSet<SideEffect>();

export function buildSideEffect<TArgs extends any[], T>(
	functionalSide: FunctionalSide<T>,
	metadata: SideEffectMetadata,
	sideEffect: SideEffectTypedFunc<TArgs, T>,
	args: TArgs
): TypedSideEffect<TArgs, T> {
	// Side effect state, an subjects to consume completion/cancellation
	let didRun = false,
		didCancel = false,
		result: () => T | undefined;

	// Assign SideEffect properties to sideEffectsFunc
	Object.assign(sideEffectFunc, {
		[functionalSideKey]: functionalSide,
		metadata,
		sideEffect,
		args,
		completed: functionalSide.completed,
		cancelled: functionalSide.cancelled,

		cloneEffect: () =>
			buildSideEffect(functionalSide.clone(), metadata, sideEffect, args),
		clone(this: TypedSideEffect<TArgs, T>) {
			return buildSideEffect(functionalSide, metadata, sideEffect, args);
		},

		cancel: () => {
			didCancel = true;
			functionalSide.cancel();
		},

		resultFromRanEffect(
			this: TypedSideEffect<TArgs, T>,
			throwIfDidntRun?: boolean
		) {
			throwIfDidntRun =
				typeof throwIfDidntRun === 'boolean' ? throwIfDidntRun : true;

			if (!didRun && throwIfDidntRun) {
				throw new Error('Side effect did not run');
			}
			else if (!didRun) {
				return;
			}

			return result();
		},
	});

	Object.defineProperty(sideEffectFunc, 'didRun', {
		configurable: true,
		get: () => didRun,
	});

	sideEffects.add(sideEffectFunc as any);

	return sideEffectFunc as TypedSideEffect<TArgs, T>;

	/**
	 * A wrapper around the side effect to check cancellation, and send back result
	 */
	function sideEffectFunc(): void {
		if (!didCancel && !didRun) {
			didRun = true;
			try {
				const runResult = sideEffect(...(args as any));

				if (didCancel) {
					return;
				}

				result = () => runResult;

				functionalSide.result(runResult);
			} catch (err) {
				result = () => {
					throw err;
				};

				functionalSide.error(err);
			}
		}
	}
}

export function from<T>(val: T): TypedSideEffect<[T], T> {
	const result = buildSideEffect(
		new FunctioningFunctionalSide<T>(),
		{ [pureKey]: true },
		val => val,
		[ val ] as [T]
	);

	result();

	return result;
}

export function isSideEffect<T>(val: any): val is SideEffect<T> {
	return typeof val === 'function' && sideEffects.has(val);
}

export function suppress<T>(se: SideEffect<T>): SideEffect<never>;
export function suppress<TArgs extends any[], T>(
	se: TypedSideEffect<TArgs, T>
): TypedSideEffect<[TypedSideEffect<TArgs, T>], never>;
export function suppress<TArgs extends any[], T>(
	se: TypedSideEffect<TArgs, T>
): TypedSideEffect<[TypedSideEffect<TArgs, T>], never> {
	if (se.metadata[suppressedKey]) {
		return se as any;
	}

	return buildSideEffect<TArgs, never>(
		new SuppressedFunctionalSide<T>(),
		{
			...se.metadata,
			[suppressedKey]: true,
		},
		(...args: TArgs) => se() as never,
		[ se ] as any
	) as any;
}
