import { NetRequestRule } from "./NetRequestBlock";
type BrowserTab = browser.tabs.Tab;



type ObjectKey = string | number | symbol;

export interface BackgroundApiErrorList
{
	"BrowserStorage": { key: ObjectKey, reason: any },
	
	"MessageListenerIsNotFound": {},
	
	"NetRequestBlock": { method: string, reason: any },
	"RuleWasNotFound": { id: number, rules: NetRequestRule[] },
	"RegexpIsNotSupported": { regexp: string, reason: any },
	
	"NoTabsWasFound": { url: string },
	"NotificationSendWasntSuccessful": { tabs: BrowserTab[], results: any[] } // TODO what type `results` has?
}