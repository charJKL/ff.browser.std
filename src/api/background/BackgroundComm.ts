import { Message, SupportedMessages, SupportedNotifications, MessageListener, MessageListenerArgs, MessageSender, MessagePacket } from "../Message";
import { BackgroundApiError } from "./BackgroundApiError";
import { Debug } from "../../classes/Debug";
import { isUndefined } from "../../functions/isUndefined";
import { MessageError } from "../MessageError";
import { MissingListenerException } from "../../exceptions/MissingListenerException";

type BrowserTab = browser.tabs.Tab;
type SendResponse = (response?: {}) => void;
type ExtendedMessageListener<L extends MessageListener> = (args: {sender: MessageSender} & MessageListenerArgs<L>) => Promise<ReturnType<L>> | ReturnType<L>;

export class BackgroundComm<SM extends SupportedMessages, SN extends SupportedNotifications>
{
	private $debug: Debug ;
	private $listeners: Map<keyof SM, ExtendedMessageListener<any>>;
	
	public constructor(debug: Debug)
	{
		browser.runtime.onMessage.addListener(this.dispatchMessage.bind(this));
		this.$listeners = new Map();
		this.$debug = debug;
	}
	
	public addMessageListener<V extends keyof SM>(variant: V, listener: ExtendedMessageListener<SM[V]>)
	{
		this.$listeners.set(variant, listener);
	}
	
	static WantedUrlIsntOnpenedOnAnyTab = "Wanted url isn't opened on any tab.";
	static NotificationWasntSendSucessfulToAllTabs = "Notification wasnt send sucessfule to all tabs.";
	public async sendNotification<V extends keyof SN>(tabUrl: string, variant: V, args: MessageListenerArgs<SN[V]>) : Promise<boolean | BackgroundApiError<"NoTabsWasFound"> | BackgroundApiError<"NotificationSendWasntSuccessful">>
	{
		this.$debug?.log("BackgroundComm.sendNotification(), tabUrl=$0, variant=$1, args=$2", Debug.BackgroundNotification, tabUrl, variant, args);
		const tabs = await browser.tabs.query({url: tabUrl}); // TODO should BackgroundComm use directly `browser.tabs`? or had inject `BrowserTabs`?
		if(tabs.length == 0) return new BackgroundApiError("NoTabsWasFound", BackgroundComm.WantedUrlIsntOnpenedOnAnyTab, {url: tabUrl}, this.$debug);
		const results = tabs.map(async function sendNotifiactionToTabs(tab: BrowserTab)
		{
			if(isUndefined(tab.id)) return;
			const packet = Message.prepare(variant, args);
			const result = await browser.tabs.sendMessage(tab.id, packet);
			return result;
		});
		const wasErrorOccuredDuringSending = (v: any) => v instanceof Error;
		if(results.find(wasErrorOccuredDuringSending)) return new BackgroundApiError("NotificationSendWasntSuccessful", BackgroundComm.NotificationWasntSendSucessfulToAllTabs, {tabs: tabs, results: results}, this.$debug)
		return true;
	}
	
	private async dispatchMessage(packet: MessagePacket, sender: MessageSender, sendResponse: SendResponse)
	{
		try
		{
			this.$debug?.log("BackgroundComm.dispatchRequest(), packet=$0", Debug.BackgroundMessage, packet);
			const listener = this.$listeners.get(packet.variant) ?? this.defaultErrorListener.bind(this, packet);
			const result = await listener({sender, ...packet.data});
			const response = Message.pack(result);
			return Promise.resolve(response);
		}
		catch(e)
		{
			this.$debug?.log("Background script exception $0", Debug.Fatal, e);
			const result = new MessageError("FatalResponse", "Fatal error occur during response.", {}, this.$debug);
			const response = Message.pack(result);
			return Promise.resolve(response);
		}
	}
	
	private defaultErrorListener(packet: MessagePacket) : void
	{
		throw new MissingListenerException(`There is missing listener for ${packet.variant}.`);
	}
}