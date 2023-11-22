import { MessageFailure, MessageFailureVariant } from "./MessageFailure";

export function isFailure<V1 extends symbol, V2 extends Exclude<MessageFailureVariant, V2>, R>(variant: symbol, failure: R | MessageFailure<V2, any>): failure is MessageFailure<V2, any>;
export function isFailure<V1 extends V2, V2 extends Exclude<MessageFailureVariant, V2>, R>(variant: V1, failure: R | MessageFailure<V2, any>): failure is MessageFailure<V1, any>;
export function isFailure<V1 extends V2, V2 extends Exclude<MessageFailureVariant, V2>, R>(variant: V1 | symbol, failure: R | MessageFailure<V2, any>): failure is MessageFailure<V1, any>
{
	if(failure instanceof MessageFailure && variant === MessageFailure.Any) return true;
	if(failure instanceof MessageFailure && variant === failure.variant) return true;
	return false;
}
