import { Message, MessagePacket, MessagePacketResponse, MessageSender, MessageArgs, CanOmitArgs, Supported, SupportedMessages, SupportedNotifications, NotificationBlueprint, MessageBlueprint} from "../Message";
import { NotificationListener, NotificationFilter } from "../Message";
import { ResolveOverloadArgsException } from "../../exceptions/ResolveOverloadArgsException";
import { Debug } from "../../ex/Debug";
import { MultiMap, IComparable } from "../../ex/MultiMap";
import { MessageError } from "../MessageError";
import { isNotNull } from "../../ex/functions/isNull";
import { isFalse } from "../../ex/functions/isTrue";


type SendResponse = (response?: {}) => void;
export type FrontendCommReturn<B extends MessageBlueprint> = MessageError<"FatalResponse"> | ReturnType<B> ;

export class FrontendComm<SM extends SupportedMessages, SN extends SupportedNotifications>
{
	private $debug: undefined | Debug;
	private $listeners: MultiMap<keyof SN, NotificationListenerRecord>;
	
	public constructor(debug?: Debug)
	{
		this.$debug = debug;
		browser.runtime.onMessage.addListener(this.dispatchNotification.bind(this));
		this.$listeners = new MultiMap();
	}
	
	public async sendMessage<V extends Supported<SM>>(variant: CanOmitArgs<SM,V>) : Promise<FrontendCommReturn<SM[V]>>;
	public async sendMessage<V extends Supported<SM>>(variant: V, args: MessageArgs<SM[V]>) : Promise<FrontendCommReturn<SM[V]>>;
	public async sendMessage<V extends Supported<SM>>(arg0: unknown, arg1?: unknown) : Promise<unknown>
	{
		function resolveArgs(iArgs: IArguments, arg0: unknown, arg1: unknown) : [V, MessageArgs<SM[V]>]
		{
			if(iArgs.length === 1) return [arg0 as V, {} as MessageArgs<SM[V]>];
			if(iArgs.length === 2) return [arg0 as V, arg1 as MessageArgs<SM[V]>];
			throw new ResolveOverloadArgsException("FrontendComm.sendMessage()");
		}
		const [variant, args] = resolveArgs(arguments, arg0, arg1);
		
		this.$debug?.logFunction("FrontendComm.sendMessage(), variant=$0, args=$1", Debug.ScriptMessage, variant, args);
		const packet = Message.prepare(variant, args);
		const response = await browser.runtime.sendMessage(packet) as MessagePacketResponse; // TODO what if sendMessage throw browser internal exception? is that event possible if I don't fuck up?
		const result = Message.unpack(response);
		this.$debug?.log("FrontendComm.sendMessage(), response=$0, result=$1", response, result);
		this.$debug?.endFunction();
		return result;
	}

	public addNotificationListener<V extends Supported<SN>>(variant: V, listener: NotificationListener<SN[V]>) : void
	public addNotificationListener<V extends Supported<SN>>(variant: V, filter: NotificationFilter<SN[V]> | null, listener: NotificationListener<SN[V]>) : void
	public addNotificationListener<V extends Supported<SN>>(arg0: unknown, arg1: unknown, arg2?: unknown) : void
	{
		function resolveArgs(iArgs: IArguments, arg0: unknown, arg1: unknown, arg2: unknown) : [V, NotificationFilter<SN[V]> | null, NotificationListener<SN[V]>]
		{
			if(iArgs.length === 2) return [arg0 as V, null, arg1 as NotificationListener<SN[V]>];
			if(iArgs.length === 3) return [arg0 as V, arg1 as  NotificationFilter<SN[V]> | null, arg2 as NotificationListener<SN[V]>];
			throw new ResolveOverloadArgsException("FrontendComm.addNotificationListener()");
		}
		const [variant, filter, listener] = resolveArgs(arguments, arg0, arg1, arg2);
		this.$listeners.set(variant, new NotificationListenerRecord(filter, listener));
	}
	
	public removeNotificationListener<V extends Supported<SN>>(variant: V, listener: NotificationListener<SN[V]>) : void;
	public removeNotificationListener<V extends Supported<SN>>(variant: V, filter: NotificationFilter<SN[V]>, listener: NotificationListener<SN[V]>) : void;
	public removeNotificationListener<V extends Supported<SN>>(arg0: unknown, arg1: unknown, arg2?: unknown) : void
	{
		function resolveArgs(iArgs: IArguments, arg0: unknown, arg1: unknown, arg2: unknown) : [V, NotificationFilter<SN[V]> | null, NotificationListener<SN[V]>]
		{
			if(iArgs.length === 2) return [arg0 as V, null, arg1 as NotificationListener<SN[V]>];
			if(iArgs.length === 3) return [arg0 as V, arg1 as  NotificationFilter<SN[V]> | null, arg2 as NotificationListener<SN[V]>];
			throw new ResolveOverloadArgsException("FrontendComm.addNotificationListener()");
		}
		const [variant, filter, listener] = resolveArgs(arguments, arg0, arg1, arg2);
		this.$listeners.delete(variant, new NotificationListenerRecord(filter, listener)); 
	}

	private async dispatchNotification(packet: MessagePacket, sender: MessageSender, sendResponse: SendResponse) 
	{
		this.$debug?.logFunction("FrontendComm.dispatchNotification(), packet.variant=$0, packet.data=$1", Debug.ScriptNotification, packet.variant, packet.data);
		const listeners = this.$listeners.get(packet.variant);
		this.$debug?.log("FrontendComm.dispatchNotification(), variant=$0, count=$1, listeners=$2", packet.variant, listeners?.length, listeners);
		listeners.forEach(record => this.dispatchNotificationFilter(record.filter, record.listener, packet.data));
		this.$debug?.endFunction();
	}
	
	private async dispatchNotificationFilter(filter: NotificationFilter<NotificationBlueprint> | null, listener: NotificationListener<NotificationBlueprint>, data: unknown)
	{
		if(isNotNull(filter) && isFalse(filter(data))) return;
		await listener(data);
	}
}

class NotificationListenerRecord implements IComparable<NotificationListenerRecord>
{
	public $filter: NotificationFilter<NotificationBlueprint> | null;
	public $listener: NotificationListener<NotificationBlueprint>
	
	public constructor(filter: NotificationFilter<NotificationBlueprint> | null, listener: NotificationListener<NotificationBlueprint>)
	{
		this.$filter = filter;
		this.$listener = listener;
	}
		
	public isEqual(this: NotificationListenerRecord, listener: NotificationListenerRecord) : boolean
	{
		return this.listener === listener.listener && this.filter === listener.filter;
	}
	
	public get filter() 
	{
		return this.$filter;
	}
	
	public get listener()
	{
		return this.$listener;
	}
}
