import { TypedError } from "../../classes/TypedError";
import { Debug } from "../../classes/Debug";
import { NetRequestRule } from "./NetRequestBlock";

type BackgroundApiErrorVariant = keyof BackgroundApiErrorList;
type BackgroundApiErrorInfo = BackgroundApiErrorList;

export class BackgroundApiError<V extends BackgroundApiErrorVariant> extends TypedError<V, BackgroundApiErrorInfo[V]>
{
	private scope = "BackgroundApiErrorScope" as const; // to differentiate from other errors inherited from `TypeError`, important because of duck typing.
	
	constructor(variant: V, message: string, info: BackgroundApiErrorInfo[V], debug: Debug)
	{
		super(variant, message, info, null, debug);
	}
}

type BrowserTab = browser.tabs.Tab;
type ObjectKey = string | number | symbol;

export interface BackgroundApiErrorList
{
	"BrowserStorage": { key: ObjectKey, reason: unknown },
	
	"MessageListenerIsNotFound": {},
	
	"NetRequestBlock": { method: string, reason: unknown },
	"RuleWasNotFound": { id: number, rules: NetRequestRule[] },
	"RegexpIsNotSupported": { regexp: string, reason: unknown },
	
	"NoTabsWasFound": { url: string },
	"NotificationSendWasntSuccessful": { tabs: BrowserTab[], results: unknown[] } // TODO what type `results` has?
}