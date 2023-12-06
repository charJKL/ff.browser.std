import { NetRequestRule } from "./NetRequestBlock";
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