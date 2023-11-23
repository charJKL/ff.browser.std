import { Message, MessagePacket, MessagePacketResponse, MessageSender, NotificationListener, MessageListenerArgs, CanOmitArgs, SupportedMessages, SupportedNotifications} from "../Message";
import { ResolveOverloadArgsException } from "../../exceptions/ResolveOverloadArgsException";
import { Debug } from "../../classes/Debug";
import { isUndefined } from "../../functions/isUndefined";
import { MultiMap } from "../../classes/MultiMap";
import { MessageError } from "../MessageError";

// We dont use building `ResolveType` because then type hiting provided by IDE will be ugly.
// Intellisense resolve type to certain level not deeper.
export type ResolveReturn<T> = T extends (...any: any) => infer R ? R | MessageError<"FatalResponse"> : any; 

type SendResponse = (response?: {}) => void;
export class ScriptComm<SM extends SupportedMessages, SN extends SupportedNotifications>
{
	private $debug: undefined | Debug;
	private $listeners: MultiMap<keyof SN, NotificationListener>;
	
	public constructor(debug?: Debug)
	{
		this.$debug = debug;
		browser.runtime.onMessage.addListener(this.dispatchNotification.bind(this));
		this.$listeners = new MultiMap();
	}
	
	public async sendMessage<V extends keyof SM>(variant: CanOmitArgs<SM,V>) : Promise<ResolveReturn<SM[V]>>;
	public async sendMessage<V extends keyof SM>(variant: V, args: MessageListenerArgs<SM[V]>) : Promise<ResolveReturn<SM[V]>>;
	public async sendMessage<V extends keyof SM>(arg0: any, arg1?: any) : Promise<any>
	{
		function resolveArgs(iArgs: IArguments, arg0: any, arg1: any) : [V, MessageListenerArgs<SM[V]>]
		{
			if(iArgs.length == 1) return [arg0 as V, {} as MessageListenerArgs<SM[V]>];
			if(iArgs.length == 2) return [arg0 as V, arg1 as MessageListenerArgs<SM[V]>];
			throw new ResolveOverloadArgsException("ScriptComm::sendMessage()");
		}
		const [variant, args] = resolveArgs(arguments, arg0, arg1);
		
		this.$debug?.logFunction("ScriptComm.sendMessage(), variant=$0, args=$1", Debug.ScriptMessage, variant, args);
		const packet = Message.prepare(variant, args);
		const response = await browser.runtime.sendMessage(packet) as MessagePacketResponse; // TODO what if sendMessage throw browser internal exception? is that event possible if I don't fuck up?
		const result = Message.unpack(response);
		this.$debug?.log("ScriptComm.sendMessage(), response=$0, result=$1", response, result);
		this.$debug?.endFunction();
		return result;
	}

	public addNotificationListener<V extends keyof SN>(variant: V, listener: SN[V])
	{
		this.$listeners.set(variant, listener);
	}
	
	public removeNotificationListener<V extends keyof SN>(variant: V, listener: SN[V])
	{
		this.$listeners.delete(variant, listener);
	}

	private async dispatchNotification(packet: MessagePacket, sender: MessageSender, sendResponse: SendResponse) 
	{
		this.$debug?.logFunction("ScriptComm.dispatchNotification(), packet.variant=$0, packet.data=$1", Debug.ScriptNotification, packet.variant, packet.data);
		const listeners = this.$listeners.get(packet.variant);
		this.$debug?.log("ScriptComm.dispatchNotification(), variant=$0, count=$1, listeners=$2", packet.variant, listeners?.length, listeners);
		if(isUndefined(listeners)) return;
		listeners.forEach(async l => await l(packet.data)); // TODO okey, but how to filter notification for specific rule, e.g.: id=23
		this.$debug?.endFunction();
	}
}

