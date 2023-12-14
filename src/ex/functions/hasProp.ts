import { isNotNull } from "./isNull";
import { isNotUndefined } from "./isUndefined";

export function hasProp<S extends string>(value: any, prop: S ) : value is {[Key in S]: unknown}
{
	return isNotUndefined(value) && isNotNull(value) && isNotUndefined(value[prop]);
}
