import { MessageFailure, MessageFailureVariant, MessageFailureInfo } from "./MessageFailure";

export function isFailure<V extends MessageFailureVariant, I extends MessageFailureInfo>(variant: V, failure: any) : failure is MessageFailure<V, I>
{
	if(failure instanceof MessageFailure && failure.variant === variant) return true;
	return false;
}