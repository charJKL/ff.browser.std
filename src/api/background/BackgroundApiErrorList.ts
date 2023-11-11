
type BrowserTab = browser.tabs.Tab;

export interface BackgroundApiErrorList
{
	"KeyDoesntExist": {map: Map<any, any>, key: any},
	"MessageListenerIsNotFound": {},
	"BrowserStorage": {reason: string},
	"NoTabsFound": {url: string},
	"NotificationWasntSuccessful": {tabs: BrowserTab[], results: any[] } // TODO what type `results` has?
	"BrowserApiProblem": {}
}

