import { TypedError } from "../../ex/TypedError";
import { Debug } from "../../ex/Debug";
import { NetRequestRule } from "./NetRequestBlock";

type BackendApiErrorVariant = keyof BackendApiErrorList;
type BackendApiErrorInfo = BackendApiErrorList;

export class BackendApiError<V extends BackendApiErrorVariant> extends TypedError<V, BackendApiErrorInfo[V]>
{
	private scope = "BackendApiErrorScope" as const; // to differentiate from other errors inherited from `TypeError`, important because of duck typing.
	
	constructor(variant: V, message: string, info: BackendApiErrorInfo[V], debug: Debug)
	{
		super(variant, message, info, null, debug);
	}
}

type BrowserTab = browser.tabs.Tab;
type ObjectKey = string | number | symbol;

export interface BackendApiErrorList
{
	"BrowserStorage": { key: ObjectKey, reason: unknown },
	
	"MessageListenerIsNotFound": {},
	
	"NetRequestBlock": { reason: unknown },
	"RuleWasNotFound": { id: number, rules: NetRequestRule[] },
	"RegexpIsNotSupported": { regexp: string, reason: unknown },
	
	"NoTabsWasFound": { url: string },
	"NotificationSendWasntSuccessful": { tabs: BrowserTab[], results: unknown[] } // TODO what type `results` has?
}