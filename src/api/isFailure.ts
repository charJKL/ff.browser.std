import { MessageFailure, MessageFailureVariant } from "./MessageFailure";

// TODO why V2 extends Exclude?
export function isFailure<V2 extends Exclude<MessageFailureVariant, V2>, R>(variant: symbol, failure: R | MessageFailure<V2, unknown>): failure is MessageFailure<V2, unknown>;
export function isFailure<V1 extends V2, V2 extends Exclude<MessageFailureVariant, V2>, R>(variant: V1, failure: R | MessageFailure<V2, unknown>): failure is MessageFailure<V1, unknown>;
export function isFailure<V1 extends V2, V2 extends Exclude<MessageFailureVariant, V2>, R>(variant: V1 | symbol, failure: R | MessageFailure<V2, unknown>): failure is MessageFailure<V1, unknown>
{
	if(failure instanceof MessageFailure && variant === MessageFailure.Any) return true;
	if(failure instanceof MessageFailure && variant === failure.variant) return true;
	return false;
}
