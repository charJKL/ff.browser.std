import { TypedError} from "../classes/TypedError";

export function isSuccess<T>(result: T) : result is Exclude<T, TypedError<any, any>>
{
	if(result instanceof TypedError) return false;
	return true;
}