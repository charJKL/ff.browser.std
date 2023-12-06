import { Message, MessagePacket, MessagePacketResponse, MessageSender, MessageArgs, CanOmitArgs, Supported, SupportedMessages, SupportedNotifications, NotificationBlueprint, ObjectAlike} from "../Message";
import { NotificationListener, NotificationFilter } from "../Message";
import { ResolveOverloadArgsException } from "../../exceptions/ResolveOverloadArgsException";
import { Debug } from "../../classes/Debug";
import { MultiMap, IComparable } from "../../classes/MultiMap";
import { MessageError } from "../MessageError";
import { isNotNull } from "../../functions/isNull";
import { isFalse } from "../../functions/isBoolean";

// TODO this doesn't make sense, remove this:
// We dont use buildin `ResolveType` because then type hiting provided by IDE will be ugly.
// Intellisense resolve type to certain level not deeper.
export type ResolveReturn<T> = T extends (...any: unknown[]) => infer R ? R | MessageError<"FatalResponse"> : unknown; 
type SendResponse = (response?: {}) => void;

export class ScriptComm<SM extends SupportedMessages, SN extends SupportedNotifications>
{
	private $debug: undefined | Debug;
	private $listeners: MultiMap<keyof SN, NotificationListenerRecord>;
	
	public constructor(debug?: Debug)
	{
		this.$debug = debug;
		browser.runtime.onMessage.addListener(this.dispatchNotification.bind(this));
		this.$listeners = new MultiMap();
	}
	
	public async sendMessage<V extends Supported<SM>>(variant: CanOmitArgs<SM,V>) : Promise<ResolveReturn<SM[V]>>;
	public async sendMessage<V extends Supported<SM>>(variant: V, args: MessageArgs<SM[V]>) : Promise<ResolveReturn<SM[V]>>;
	public async sendMessage<V extends Supported<SM>>(arg0: unknown, arg1?: unknown) : Promise<unknown>
	{
		function resolveArgs(iArgs: IArguments, arg0: unknown, arg1: unknown) : [V, Exclude<MessageArgs<SM[V]>, undefined>]
		{
			if(iArgs.length === 1) return [arg0 as V, {} as Exclude<MessageArgs<SM[V]>, undefined>];
			if(iArgs.length === 2) return [arg0 as V, arg1 as Exclude<MessageArgs<SM[V]>, undefined>];
			throw new ResolveOverloadArgsException("ScriptComm.sendMessage()");
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

	public addNotificationListener<V extends Supported<SN>>(variant: V, listener: NotificationListener<SN[V]>) : void
	public addNotificationListener<V extends Supported<SN>>(variant: V, filter: NotificationFilter<SN[V]> | null, listener: NotificationListener<SN[V]>) : void
	public addNotificationListener<V extends Supported<SN>>(arg0: unknown, arg1: unknown, arg2?: unknown) : void
	{
		function resolveArgs(iArgs: IArguments, arg0: unknown, arg1: unknown, arg2: unknown) : [V, NotificationFilter<SN[V]> | null, NotificationListener<SN[V]>]
		{
			if(iArgs.length === 2) return [arg0 as V, null, arg1 as NotificationListener<SN[V]>];
			if(iArgs.length === 3) return [arg0 as V, arg1 as  NotificationFilter<SN[V]> | null, arg2 as NotificationListener<SN[V]>];
			throw new ResolveOverloadArgsException("ScriptComm.addNotificationListener()");
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
			throw new ResolveOverloadArgsException("ScriptComm.addNotificationListener()");
		}
		const [variant, filter, listener] = resolveArgs(arguments, arg0, arg1, arg2);
		this.$listeners.delete(variant, new NotificationListenerRecord(filter, listener)); 
	}

	private async dispatchNotification(packet: MessagePacket, sender: MessageSender, sendResponse: SendResponse) 
	{
		this.$debug?.logFunction("ScriptComm.dispatchNotification(), packet.variant=$0, packet.data=$1", Debug.ScriptNotification, packet.variant, packet.data);
		const listeners = this.$listeners.get(packet.variant);
		this.$debug?.log("ScriptComm.dispatchNotification(), variant=$0, count=$1, listeners=$2", packet.variant, listeners?.length, listeners);
		listeners.forEach(record => this.dispatchNotificationFilter(record.filter, record.listener, packet.data));
		this.$debug?.endFunction();
	}
	
	private async dispatchNotificationFilter(filter: NotificationFilter<NotificationBlueprint> | null, listener: NotificationListener<NotificationBlueprint>, data: ObjectAlike)
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
