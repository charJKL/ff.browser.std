import { TypedError } from "../ex/TypedError";
import { Debug } from "../ex/Debug";

type MessageErrorVariant = "FatalResponse";
type MessageErrorInfo = {};

export class MessageError<V extends MessageErrorVariant> extends TypedError<V, MessageErrorInfo>
{
	private scope = "MessageErrorScope" as const; // to differentiate from other errors inherited from `TypeError`, important because of duck typing.
	
	constructor(variant: V, message: string, info: MessageErrorInfo, debug: Debug)
	{
		super(variant, message, info, null, debug);
	}
}