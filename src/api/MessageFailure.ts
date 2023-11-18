import { TypedError } from "../ex/TypedError";

export type MessageFailureVariant = string;
export type MessageFailureInfo = any;

export class MessageFailure<V extends MessageFailureVariant, I extends MessageFailureInfo> extends TypedError<V, I> // TODO should message extend TypedError? I don't thing so.
{
	private scope = "MessageFailureScope" as const; // to differentiate from other errors inherited from `TypedError`, important because of duck typing.
	
	constructor(variant: V, message: string, info: I)
	{
		super(variant, message, info, null);
	}
}