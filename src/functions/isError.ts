import { TypedError, TypedErrorVariant } from "../classes/TypedError";

export function isError<V2 extends Exclude<TypedErrorVariant, V2>, R>(variant: symbol, error: R | TypedError<V2, unknown>) : error is TypedError<V2, any>;
export function isError<V1 extends V2, V2 extends Exclude<TypedErrorVariant, V2>, R>(variant: V1, error: R | TypedError<V2, unknown>): error is TypedError<V1, unknown>;
export function isError<V1 extends V2, V2 extends Exclude<TypedErrorVariant, V2>, R>(variant: V1 | symbol, error: R | TypedError<V2, unknown>): error is TypedError<V1, any>
{
	if(error instanceof TypedError && variant === TypedError.Any) return true;
	if(error instanceof TypedError && variant === error.variant) return true;
	return false;
}


