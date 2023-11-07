export type InstalledDetails = browser.runtime._OnInstalledDetails;
export type UpdateAvailableDetails = browser.runtime._OnUpdateAvailableDetails;

export class AddonSetupEvent
{
	public addEventListener<V extends AddonSetupEventName>(event: V, listener: AddonSetupEventListener[V]) : void
	{
		const isEvent = <V extends AddonSetupEventName>(variant: V, event: AddonSetupEventName, listener: any) : listener is AddonSetupEventListener[V] => variant === event;
		if(isEvent("Installed", event, listener))
		{
			browser.runtime.onInstalled.addListener(listener);
			return;
		}
		if(isEvent("Startup", event, listener))
		{
			browser.runtime.onStartup.addListener(listener);
			return;
		}
		if(isEvent("Suspend", event, listener))
		{
			browser.runtime.onSuspend.addListener(listener);
			return;
		}
		if(isEvent("SuspendCanceled", event, listener))
		{
			browser.runtime.onSuspendCanceled.addListener(listener);
			return;
		}
		if(isEvent("UpdateAvailable", event, listener))
		{
			browser.runtime.onUpdateAvailable.addListener(listener);
			return;
		}
	}
}

type AddonSetupEventName = keyof AddonSetupEventList;
type AddonSetupEventListener = AddonSetupEventList;
interface AddonSetupEventList
{
	"Startup": () => void,
	"Installed": (details: InstalledDetails) => void,
	"Suspend": () => void,
	"SuspendCanceled": () => void,
	"UpdateAvailable": (details: UpdateAvailableDetails) => void
}