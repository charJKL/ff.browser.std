import { Message, SupportedMessages, SupportedNotifications, MessageListener, MessageSender, MessagePacket } from "../Message";
import { MessageFailure } from "../MessageFailure";
import { BackgroundApiError } from "./BackgroundApiError";
import { Debug } from "../../ex/Debug";
import { isUndefined } from "../..";

type SendResponse = (response?: {}) => void;
type ExtendedMessageListener<L extends MessageListener> = (sender: MessageSender, ...args: Parameters<L>) => ReturnType<L> | Promise<ReturnType<L>>;

type BrowserTab = browser.tabs.Tab;

export class BackgroundComm<SM extends SupportedMessages, SN extends SupportedNotifications>
{
	private $debug: undefined | Debug ;
	private $listeners: Map<keyof SM, ExtendedMessageListener<any>>;
	
	public constructor(debug?: Debug)
	{
		browser.runtime.onMessage.addListener(this.dispatchMessage.bind(this));
		this.$debug = debug;
		this.$listeners = new Map();
	}
	
	public addMessageListener<V extends keyof SM>(variant: V, listener: ExtendedMessageListener<SM[V]>)
	{
		this.$listeners.set(variant, listener);
	}
	
	public async sendNotification<V extends keyof SN>(tabUrl: string, variant: V, ...args: Parameters<SN[V]>) : Promise<boolean | BackgroundApiError<"NoTabsFound"> | BackgroundApiError<"NotificationWasntSuccessful">>
	{
		const WantedUrlIsntOnpenedOnAnyTab = "Wanted url isn't opened on any tab.";
		const NotificationWasntSendSucessfulToAllTabs = "Notification wasnt send sucessfule to all tabs.";
		this.$debug?.info("BackgroundComm:sendNotification()", "tabUrl=", tabUrl, "variant=", variant, "args=", args);
		const tabs = await browser.tabs.query({url: tabUrl}); // TODO should BackgroundComm use directly `browser.tabs`? or had inject `BrowserTabs`?
		if(tabs.length == 0) return new BackgroundApiError("NoTabsFound", WantedUrlIsntOnpenedOnAnyTab, {url: tabUrl});
		const results = tabs.map(async function sendNotifiactionToTabs(tab: BrowserTab)
		{
			if(isUndefined(tab.id)) return;
			const packet = Message.prepare(variant, args);
			return await browser.tabs.sendMessage(tab.id, packet);
		});
		const wasErrorOccuredDuringSending = (value) => true; // TODO how to resolve if `browser.tabs.sendMessage` was not sucessful?
		if(results.find(wasErrorOccuredDuringSending)) return new BackgroundApiError("NotificationWasntSuccessful", NotificationWasntSendSucessfulToAllTabs, {tabs: tabs, results: results})
		return true;
	}
	
	public async dispatchMessage(packet: MessagePacket, sender: MessageSender, sendResponse: SendResponse)
	{
		this.$debug?.info("BackgroundComm:dispatchRequest()", "packet=", packet, "packet.variant=", packet.variant, "packet.data=", packet.data);
		const listener = this.$listeners.get(packet.variant) ?? this.defaultErrorListener; // TODO what to do when listener for this event is not set?
		const result = await listener(sender, ...packet.data);
		const response = Message.pack(result);
		return Promise.resolve(response);
	}
	
	private async defaultErrorListener() : Promise<MessageFailure<"MissingListener", {}>>
	{
		const ThereIsNoListenerForThisMessage = "There is no listener for this message.";
		return new MessageFailure("MissingListener", ThereIsNoListenerForThisMessage, {});
	}
}