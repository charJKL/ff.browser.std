import { Message, SupportedMessages, SupportedNotifications, MessageBlueprint, MessageArgs, NotificationData, MessageSender, MessagePacket } from "../Message";
import { BackgroundApiError } from "./BackgroundApiError";
import { Debug } from "../../classes/Debug";
import { isNotUndefined, isUndefined } from "../../functions/isUndefined";
import { MessageError } from "../MessageError";
import { MissingListenerException } from "../../exceptions/MissingListenerException";
import { ResolveOverloadArgsException } from "../../exceptions/ResolveOverloadArgsException";
import { isArray, isNotArray } from "../../functions/isArray";

type BrowserTab = browser.tabs.Tab;
type SendResponse = (response?: {}) => void;

type AllowListenerBeAsync<T> = Promise<T> | T;
export type MessageCommArgs<B extends MessageBlueprint> = {sender: MessageSender} & MessageArgs<B>;
export type MessageCommReturn<B extends MessageBlueprint> = AllowListenerBeAsync<ReturnType<B>>;
export type MessageCommListenerBefore<B extends MessageBlueprint> = (args: MessageCommArgs<B>) => MessageCommArgs<B> | void;
export type MessageCommListener<B extends MessageBlueprint> = (args: MessageCommArgs<B>) => MessageCommReturn<B>;
export type MessageCommListenerAfter<B extends MessageBlueprint> = (args: MessageCommArgs<B>, result: MessageCommReturn<B>) => MessageCommReturn<B>;
export type MessageCommListenerChain<B extends MessageBlueprint> = [MessageCommListenerBefore<B>, MessageCommListener<B>, ...MessageCommListenerAfter<B>[]]

export class BackgroundComm<SM extends SupportedMessages, SN extends SupportedNotifications>
{
	private $debug: Debug ;
	private $listeners: Map<keyof SM, MessageCommListenerChain<any>>;
	
	public constructor(debug: Debug)
	{
		browser.runtime.onMessage.addListener(this.dispatchMessage.bind(this));
		this.$listeners = new Map();
		this.$debug = debug;
	}
	
	public addMessageListener<V extends keyof SM>(variant: V, listeners: MessageCommListenerChain<SM[V]>) : void;
	public addMessageListener<V extends keyof SM>(variant: V, listener: MessageCommListener<SM[V]>) : void;
	public addMessageListener<V extends keyof SM>(arg0: V, arg1: unknown) : void
	{
		function resolveArgs(iArgs: IArguments, arg0: unknown, arg1: unknown) : [V, MessageCommListenerChain<SM[V]>]
		{
			if(isNotArray(arg1)) return [arg0 as V, [arg1] as unknown as MessageCommListenerChain<SM[V]>];
			if(isArray(arg1)) return [arg0 as V, arg1 as MessageCommListenerChain<SM[V]>];
			throw new ResolveOverloadArgsException("BackgroundComm.addMessageListener()");
		}
		const [variant, listeners] = resolveArgs(arguments, arg0, arg1);
		this.$listeners.set(variant, listeners);
	}
	
	static WantedUrlIsntOnpenedOnAnyTab = "Wanted url isn't opened on any tab.";
	static NotificationWasntSendSucessfulToAllTabs = "Notification wasnt send sucessfule to all tabs.";
	public async sendNotification<V extends keyof SN>(tabUrl: string, variant: V, args: NotificationData<SN[V]>) : Promise<boolean | BackgroundApiError<"NoTabsWasFound"> | BackgroundApiError<"NotificationSendWasntSuccessful">>
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
			const listeners = this.$listeners.get(packet.variant);
			if(isUndefined(listeners) || listeners.isEmpty()) throw new MissingListenerException(`There is missing listener for ${packet.variant}.`);
			console.log(listeners);
			const result = await listeners.reduce(async (result: unknown, listener) => await listener({sender, ...packet.data}, result) ?? result, undefined);
			console.log(result);
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