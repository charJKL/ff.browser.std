import { NetRequestRule } from "./NetRequestBlock";
type BrowserTab = browser.tabs.Tab;

export interface BackgroundApiErrorList
{
	"KeyDoesntExist": {map: Map<any, any>, key: any},
	"MessageListenerIsNotFound": {},
	"BrowserStorage": {method: string, reason: any },
	"NoTabsFound": {url: string},
	"NotificationWasntSuccessful": {tabs: BrowserTab[], results: any[] } // TODO what type `results` has?
	"BrowserApiProblem": {},
	"NetRequestBlock": { method: string, reason: any },
	"RegexpNotSupported": { regexp: string, reason: string },
	"RuleDoesntExist": { rules: NetRequestRule[] , ruleId: number }
}

