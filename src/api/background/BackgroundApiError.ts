import { BackgroundApiErrorList } from "./BackgroundApiErrorList";
import { TypedError } from "../../ex/TypedError";

type BackgroundApiErrorVariant = keyof BackgroundApiErrorList;
type BackgroundApiErrorInfo = BackgroundApiErrorList;

export class BackgroundApiError<V extends BackgroundApiErrorVariant> extends TypedError<V, BackgroundApiErrorInfo[V]>
{
	private scope = "BackgroundApiErrorScope" as const; // to differentiate from other errors inherited from `TypeError`, important because of duck typing.
	
	constructor(variant: V, message: string, info: BackgroundApiErrorInfo[V])
	{
		super(variant, message, info);
	}
}