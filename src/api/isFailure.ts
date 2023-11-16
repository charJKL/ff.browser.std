import { TypedError } from "../ex/TypedError";
import { MessageFailure, MessageFailureVariant } from "./MessageFailure";

export function isFailure<V1 extends symbol, V2 extends Exclude<MessageFailureVariant, V2>, R>(variant: symbol, failure: R | TypedError<V2, any>): failure is TypedError<V2, any>;
export function isFailure<V1 extends V2, V2 extends Exclude<MessageFailureVariant, V2>, R>(variant: V1, failure: R | TypedError<V2, any>): failure is TypedError<V1, any>;
export function isFailure<V1 extends V2, V2 extends Exclude<MessageFailureVariant, V2>, R>(variant: V1 | symbol, failure: R | TypedError<V2, any>): failure is TypedError<V1, any>
{
	if(failure instanceof MessageFailure && variant === MessageFailure.Any) return true;
	if(failure instanceof MessageFailure && variant === failure.variant) return true;
	return false;
}
