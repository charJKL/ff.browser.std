import { Debug, isUndefined } from "../..";
import { ResolveOverloadArgsException } from "../../exceptions/ResolveOverloadArgsException";
import { Message, MessagePacket, MessagePacketResponse, MessageSender, NotificationListener, MessageListenerArgs, CanOmitArgs, SupportedMessages, SupportedNotifications} from "../Message";

type SendResponse = (response?: {}) => void;

export class ScriptComm<SM extends SupportedMessages, SN extends SupportedNotifications>
{
	private $debug: undefined | Debug;
	private $listeners: Map<keyof SN, NotificationListener>;
	
	public constructor(debug?: Debug)
	{
		this.$debug = debug;
		browser.runtime.onMessage.addListener(this.dispatchNotification.bind(this));
		this.$listeners = new Map();
	}
	
	public async sendMessage<V extends keyof SM>(variant: CanOmitArgs<SM,V>) : Promise<ReturnType<SM[V]>>;
	public async sendMessage<V extends keyof SM>(variant: V, args: MessageListenerArgs<SM[V]>) : Promise<ReturnType<SM[V]>>;
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
		const response = await browser.runtime.sendMessage(packet) as MessagePacketResponse; 
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
		this.$listeners.delete(variant); // TODO map is not enought here, beouse there may be multiple listners for notifications.
	}

	private async dispatchNotification(packet: MessagePacket, sender: MessageSender, sendResponse: SendResponse) 
	{
		this.$debug?.log("ScriptComm.dispatchNotification(), packet=$0", Debug.ScriptNotification, packet);
		const listener = this.$listeners.get(packet.variant);
		if(isUndefined(listener)) return;
		await listener(packet.data);
	}
}

