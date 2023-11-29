import { useState, useEffect, useRef } from "react";
import { ScriptComm, ResolveReturn } from "../api/script/ScriptComm";
import { SupportedMessages, CanOmitArgs, MessageArgs, ObjectAlike } from "../api/Message";
import { NotificationFilter } from "../api/Message";
import { SupportedNotifications, NotificationData } from "../api/Message";
import { ResolveOverloadArgsException } from "../exceptions/ResolveOverloadArgsException";

export type BackgroundState<T> = [Waiting | T, (state: T) => void];
export type Notification<T> = { wasRaised: boolean } & Partial<T>;

export class ScriptCommReact<SM extends SupportedMessages, SN extends SupportedNotifications>
{
	private $scriptComm: ScriptComm<SM, SN>;
	
	constructor(scriptComm: ScriptComm<SM, SN>)
	{
		this.$scriptComm = scriptComm;
	}
	
	public useBackgroundState<V extends keyof SM>(variant: CanOmitArgs<SM, V>) : BackgroundState<ResolveReturn<SM[V]>>;
	public useBackgroundState<V extends keyof SM>(variant: V, args: MessageArgs<SM[V]>) : BackgroundState<ResolveReturn<SM[V]>>;
	public useBackgroundState<V extends keyof SM>(variant: V, args?: MessageArgs<SM[V]>) : BackgroundState<ResolveReturn<SM[V]>>
	{
		const [data, setData] = useState<ResolveReturn<SM[V]> | Waiting>(new Waiting());
		
		useEffect(() => {
			let ignore = false;
			this.$scriptComm.sendMessage(variant, args).then(thenHandler).catch(catchHandler)
			function thenHandler(data: ResolveReturn<SM[V]>)
			{
				if(ignore == true) return;
				setData(data)
			}
			function catchHandler()
			{
				// const messageError = new MessageError("FatalResponse", "", {}, this.$debug) // TODO can't return `MessageError` because it's not background error, it's frontend. Also for the same reason I don't have access to this.$debug.
			}
			return () => { ignore = true; }
		}, [variant]);
		
		return [data, setData];
	}
	
	public useNotification<V extends keyof SN>(variant: V) : Notification<NotificationData<SN[V]>>;
	public useNotification<V extends keyof SN>(variant: V, filter?: NotificationFilter<SN[V]>) : Notification<NotificationData<SN[V]>>;
	public useNotification<V extends keyof SN>(arg0: any, arg1?: any) : Notification<NotificationData<SN[V]>>
	{
		function resolveArgs(iArgs: IArguments, arg0: any, arg1: any, ) : [V, NotificationFilter<SN[V]> | null]
		{
			if(iArgs.length == 1) return [arg0, null];
			if(iArgs.length == 2) return [arg0, arg1];
			throw new ResolveOverloadArgsException("ScriptCommReact.useNotification()");
		}
		const [variant, filter] = resolveArgs(arguments, arg0, arg1);
		const [data, setData] = useState<NotificationData<SN[V]>>(null as any);
		const wasRaised = useRef(false);

		useEffect(() => {
			this.$scriptComm.addNotificationListener(variant, filter, onNotification); // TODO here filter is dependency, should be in array.
			function onNotification(args: ObjectAlike)
			{
				setData(args);
				wasRaised.current = true;
			}
			return () => this.$scriptComm.removeNotificationListener(variant, onNotification);
		}, [variant]);
		
		const notification = { wasRaised: wasRaised.current, ...data };
		if(wasRaised.current == true) wasRaised.current = false;
		return notification;
	}
	
	public async sendMessage<V extends keyof SM>(variant: CanOmitArgs<SM, V>) :Promise<ResolveReturn<SM[V]>>;
	public async sendMessage<V extends keyof SM>(variant: V, args: MessageArgs<SM[V]>) : Promise<ResolveReturn<SM[V]>>;
	public async sendMessage<V extends keyof SM>(variant: V, args?: MessageArgs<SM[V]>) : Promise<ResolveReturn<SM[V]>>
	{
		return await this.$scriptComm.sendMessage(variant, args);
	}
}

export function isWaiting(data: any) : data is Waiting
{
	if(data instanceof Waiting) return true;
	return false;
}

export function wasRaised<T extends Notification<any>>(notification: T) : notification is Required<T>
{
	if(notification.wasRaised == true) return true;
	return false;
}

export class Waiting
{
	private desc = "Waiting on response"
}