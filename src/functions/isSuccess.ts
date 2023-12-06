import { TypedError} from "../classes/TypedError";

export function isSuccess<T>(result: T) : result is Exclude<T, TypedError<string, unknown>>
{
	if(result instanceof TypedError) return false;
	return true;
}