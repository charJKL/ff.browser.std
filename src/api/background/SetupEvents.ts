type SupportedEvents = keyof typeof browser.runtime & keyof AddonSetupEventList ;
type AddonSetupEventBlueprint<N extends SupportedEvents> = AddonSetupEventList[N];

export type InstalledDetails = browser.runtime._OnInstalledDetails;
export type UpdateAvailableDetails = browser.runtime._OnUpdateAvailableDetails;

export class SetupEvents
{
	private readonly $onStartup: SetupEvent<"onStartup">;
	private readonly $onInstalled: SetupEvent<"onInstalled">;
	private readonly $onSuspend: SetupEvent<"onSuspend">;
	private readonly $onSuspendCanceled: SetupEvent<"onSuspendCanceled">;
	private readonly $onUpdateAvailable: SetupEvent<"onUpdateAvailable">;
	
	public get onStartup()
	{
		return this.$onStartup;
	}
	
	public get onInstalled()
	{
		return this.$onInstalled;
	}
	
	public get onSuspend()
	{
		return this.$onSuspend;
	}
	
	public get onSuspendCanceled()
	{
		return this.$onSuspendCanceled;
	}
	
	public get onUpdateAvailable()
	{
		return this.$onUpdateAvailable;
	}
	
	constructor(onStarupIsAlsoOnInstalledToHelpDebug: boolean) // TODO I don't like it, use build system `DEBUG` const for this?
	{
		this.$onStartup = new SetupEvent("onStartup");
		this.$onInstalled = new SetupEvent("onInstalled");
		this.$onSuspend = new SetupEvent("onSuspend");
		this.$onSuspendCanceled = new SetupEvent("onSuspendCanceled");
		this.$onUpdateAvailable = new SetupEvent("onUpdateAvailable");
		
		if(onStarupIsAlsoOnInstalledToHelpDebug) this.$onStartup = this.$onInstalled as any;
	}
}

class SetupEvent<N extends SupportedEvents>
{
	private $type : N;
	
	public constructor(type: N)
	{
		this.$type = type;
	}
	
	public add(listener: AddonSetupEventBlueprint<N>) : this
	{
		browser.runtime[this.$type].addListener(listener as () => void);
		return this;
	}
	
	public remove(listener: AddonSetupEventBlueprint<N>) : this
	{
		browser.runtime[this.$type].removeListener(listener as () => void);
		return this;
	}
}

interface AddonSetupEventList
{
	"onStartup": () => void,
	"onInstalled": (details: InstalledDetails) => void,
	"onSuspend": () => void,
	"onSuspendCanceled": () => void,
	"onUpdateAvailable": (details: UpdateAvailableDetails) => void
}