import { TypedError, TypedErrorVariant, TypedErrorInfo } from "./TypedError";

export function isError<V extends TypedErrorVariant, I extends TypedErrorInfo>(variant: V, error: any) : error is TypedError<V, I>
{
	if(error instanceof TypedError && error.variant === variant) return true;
	return false;
}