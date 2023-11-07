import { TypedError } from "../TypedError";

export type MessageFailureVariant = string;
export type MessageFailureInfo = any;

export class MessageFailure<V extends MessageFailureVariant, I extends MessageFailureInfo> extends TypedError<V, I>
{
	private scope = "MessageFailureScope" as const; // to differentiate from other errors inherited from `TypeError`, important because of duck typing.
	
	constructor(variant: V, message: string, info: I)
	{
		super(variant, message, info);
	}
}