import { Observable } from 'rxjs';
import { TypeCondition } from '../types';
import { map } from 'rxjs/operators';
import { MaybeSideEffect } from './bind';
import SideEffectBase, { isSideEffect } from './side-effects-class';

export { bind } from './bind';
export { isSideEffect } from './side-effects-class';

// tslint:disable-next-line:variable-name
export const SideEffect = SideEffectBase;
export type SideEffect<T = unknown> = SideEffectBase<T>;

export function lift<T>(
	observable: Observable<T>
): Observable<
	SideEffectBase<TypeCondition<T, SideEffectBase, SideEffectBase<T>, T>>
> {
	return observable.pipe(
		map(item => (isSideEffect(item) ? item : SideEffectBase.from(item)))
	) as any;
}

export function combineSideEffects<T1, T2>(
	args: [MaybeSideEffect<T1>, MaybeSideEffect<T2>]
): SideEffectBase<[T1, T2]>;
export function combineSideEffects<T1, T2>(
	first: MaybeSideEffect<T1>,
	second: MaybeSideEffect<T2>
): SideEffectBase<[T1, T2]>;
export function combineSideEffects<T1, T2>(
	firstOrArgs:
		| MaybeSideEffect<T1>
		| [MaybeSideEffect<T1>, MaybeSideEffect<T2>],
	maybeSecond?: MaybeSideEffect<T2>
): SideEffectBase<[T1, T2]> {
	if (arguments.length === 1) {
		if (!Array.isArray(firstOrArgs) || firstOrArgs.length < 2) {
			throw new Error('Missing argument');
		}

		[ firstOrArgs, maybeSecond ] = firstOrArgs;
	}

	const first = firstOrArgs as MaybeSideEffect<T1>,
		second = maybeSecond as MaybeSideEffect<T2>;

	if (isSideEffect(first) && isSideEffect(second)) {
		return first.merge(second);
	}
	else if (isSideEffect(first)) {
		return first.map(result1 => [ result1, second ] as [T1, T2]);
	}
	else if (isSideEffect(second)) {
		return second.map(result2 => [ first, result2 ] as [T1, T2]);
	}
	else {
		return SideEffectBase.from([ first, second ] as [T1, T2]);
	}
}
