import { Message, SupportedMessages, SupportedNotifications, Supported, MessageBlueprint, MessageArgs, NotificationData, MessageSender, MessagePacket, MessageBlueprintParametered } from "../Message";
import { BackendApiError } from "./BackendApiError";
import { Debug } from "../../ex/Debug";
import { MessageError } from "../MessageError";
import { MissingListenerException } from "../../exceptions/MissingListenerException";
import { isUndefined } from "../../ex/functions/isUndefined";
import { isObject } from "../../ex/functions/isObject";
import { ArrayEx } from "../../ex";

type BrowserTab = browser.tabs.Tab;
type SendResponse = (response?: {}) => void;

type AllowListenerBeAsync<T> = Promise<T> | T;
export type MessageCommArgs<B extends MessageBlueprint> = B extends MessageBlueprintParametered ? {sender: MessageSender} & MessageArgs<B> : {sender: MessageSender};
export type MessageCommReturn<B extends MessageBlueprint> = AllowListenerBeAsync<ReturnType<B>>;
export type MessageCommListener<B extends MessageBlueprint> = (args: MessageCommArgs<B>) => MessageCommReturn<B>;

export class BackendComm<SM extends SupportedMessages, SN extends SupportedNotifications>
{
	private $debug: Debug ;
	private $listeners: Map<Supported<SM>, MessageCommListener<MessageBlueprint>>;
	
	public constructor(debug: Debug)
	{
		browser.runtime.onMessage.addListener(this.dispatchMessage.bind(this));
		this.$listeners = new Map();
		this.$debug = debug;
	}
	
	public addMessageListener<V extends Supported<SM>>(variant: V, listener: MessageCommListener<SM[V]>) : void
	{
		this.$listeners.set(variant, listener);
	}
	
	static WantedUrlIsntOnpenedOnAnyTab = "Wanted url isn't opened on any tab.";
	static NotificationWasntSendSucessfulToAllTabs = "Notification wasnt send sucessfule to all tabs.";
	public async sendNotification<V extends Supported<SN>>(tabUrl: string, variant: V, args: NotificationData<SN[V]>) : Promise<boolean | BackendApiError<"NoTabsWasFound"> | BackendApiError<"NotificationSendWasntSuccessful">>
	{
		this.$debug?.log("BackendComm.sendNotification(), tabUrl=$0, variant=$1, args=$2", Debug.BackgroundNotification, tabUrl, variant, args);
		const tabs = await browser.tabs.query({url: tabUrl}); // TODO should BackendComm use directly `browser.tabs`? or had inject `BrowserTabs`?
		if(ArrayEx.isEmpty(tabs)) return new BackendApiError("NoTabsWasFound", BackendComm.WantedUrlIsntOnpenedOnAnyTab, {url: tabUrl}, this.$debug);
		const results = tabs.map(async function sendNotifiactionToTabs(tab: BrowserTab)
		{
			if(isUndefined(tab.id)) return;
			const packet = Message.prepare(variant, args);
			const result = await browser.tabs.sendMessage(tab.id, packet);
			return result;
		});
		const wasErrorOccuredDuringSending = (v: unknown) => v instanceof Error;
		if(results.find(wasErrorOccuredDuringSending)) return new BackendApiError("NotificationSendWasntSuccessful", BackendComm.NotificationWasntSendSucessfulToAllTabs, {tabs: tabs, results: results}, this.$debug)
		return true;
	}
	
	private async dispatchMessage(packet: MessagePacket, sender: MessageSender, sendResponse: SendResponse)
	{
		try
		{
			this.$debug?.log("BackendComm.dispatchRequest(), packet=$0", Debug.BackgroundMessage, packet);
			const listener = this.$listeners.get(packet.variant);
			if(isUndefined(listener)) throw new MissingListenerException(`There is missing listener for ${packet.variant}.`);
			const args = isObject(packet.data) ? {sender, ...packet.data} : {sender};
			const result = await listener(args);
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
}