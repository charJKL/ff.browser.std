import { TypedError } from "../../ex/TypedError";
import { Debug } from "../../ex/Debug";
import { BackgroundApiErrorList } from "./BackgroundApiErrorList";

type BackgroundApiErrorVariant = keyof BackgroundApiErrorList;
type BackgroundApiErrorInfo = BackgroundApiErrorList;

export class BackgroundApiError<V extends BackgroundApiErrorVariant> extends TypedError<V, BackgroundApiErrorInfo[V]>
{
	private scope = "BackgroundApiErrorScope" as const; // to differentiate from other errors inherited from `TypeError`, important because of duck typing.
	
	constructor(variant: V, message: string, info: BackgroundApiErrorInfo[V], debug: Debug)
	{
		super(variant, message, info, debug);
	}
}