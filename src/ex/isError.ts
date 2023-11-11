import { TypedError, TypedErrorVariant, TypedErrorInfo } from "./TypedError";

export function isError<V extends TypedErrorVariant, I extends TypedErrorInfo>(variant: V, error: any) : error is TypedError<V, I>
{
	if(error instanceof TypedError && error.variant === variant) return true;
	return false;
}

export function isAnyError(variant: "Any", error: any) : error is TypedError<any, any> // TODO try merge `isError` ans `isAnyError` to one function.
{
	if(error instanceof TypedError) return true;
	return false;
}