import { useState, useEffect, useRef } from "react";
import { ScriptComm, ScriptCommReturn } from "../api/script/ScriptComm";
import { SupportedMessages, CanOmitArgs, MessageArgs } from "../api/Message";
import { Supported } from "../api/Message";
import { SupportedNotifications, NotificationBlueprint, NotificationData, NotificationFilter} from "../api/Message";
import { ResolveOverloadArgsException } from "../exceptions/ResolveOverloadArgsException";

type BackgroundVar<T> = Waiting | T;
export type BackgroundState<T> = [BackgroundVar<T>, (state: T) => void];
export type Notification<T> = { wasRaised: boolean } & Partial<T>;

/* eslint-disable react-hooks/rules-of-hooks -- it's special class which is some kind of gate between react and browser.std */
export class ScriptCommReact<SM extends SupportedMessages, SN extends SupportedNotifications>
{
	private $scriptComm: ScriptComm<SM, SN>;
	
	constructor(scriptComm: ScriptComm<SM, SN>)
	{
		this.$scriptComm = scriptComm;
	}
	
	public useBackgroundState<V extends Supported<SM>>(variant: CanOmitArgs<SM, V>) : BackgroundState<ScriptCommReturn<SM[V]>>;
	public useBackgroundState<V extends Supported<SM>>(variant: V, args: MessageArgs<SM[V]>) : BackgroundState<ScriptCommReturn<SM[V]>>;
	public useBackgroundState<V extends Supported<SM>>(arg0: V, arg1?: MessageArgs<SM[V]>) : BackgroundState<ScriptCommReturn<SM[V]>>
	{
		function resolveArgs(iArgs: IArguments, arg0: unknown, arg1: unknown) : [V, MessageArgs<SM[V]>]
		{
			if(iArgs.length === 1) return [arg0 as V, {} as MessageArgs<SM[V]>];
			if(iArgs.length === 2) return [arg0 as V, arg1 as MessageArgs<SM[V]>];
			throw new ResolveOverloadArgsException("ScriptComm.sendMessage()");
		}
		const [variant, args] = resolveArgs(arguments, arg0, arg1);
		const [data, setData] = useState<ScriptCommReturn<SM[V]> | Waiting>(new Waiting());
		
		useEffect(() => {
			let ignore = false;
			this.$scriptComm.sendMessage(variant, args).then(thenHandler).catch(catchHandler)
			function thenHandler(data: ScriptCommReturn<SM[V]>)
			{
				if(ignore === true) return;
				setData(data)
			}
			function catchHandler()
			{
				// const messageError = new MessageError("FatalResponse", "", {}, this.$debug) // TODO can't return `MessageError` because it's not background error, it's frontend. Also for the same reason I don't have access to this.$debug.
			}
			return () => { ignore = true; }
		}, [variant, args]);
		
		return [data, setData];
	}
	
	public useNotification<V extends Supported<SN>>(variant: V) : Notification<NotificationData<SN[V]>>;
	public useNotification<V extends Supported<SN>>(variant: V, filter?: NotificationFilter<SN[V]>) : Notification<NotificationData<SN[V]>>;
	public useNotification<V extends Supported<SN>>(arg0: unknown, arg1?: unknown) : Notification<NotificationData<SN[V]>>
	{
		function resolveArgs(iArgs: IArguments, arg0: unknown, arg1: unknown) : [V, NotificationFilter<SN[V]> | null]
		{
			if(iArgs.length === 1) return [arg0 as V, null as NotificationFilter<SN[V]> | null];
			if(iArgs.length === 2) return [arg0 as V, arg1 as NotificationFilter<SN[V]> | null];
			throw new ResolveOverloadArgsException("ScriptCommReact.useNotification()");
		}
		const [variant, filter] = resolveArgs(arguments, arg0, arg1);
		const [data, setData] = useState<Partial<NotificationData<SN[V]>>>({});
		const wasRaised = useRef(false);

		useEffect(() => {
			this.$scriptComm.addNotificationListener(variant, filter, onNotification); // TODO here filter is function which changes on each render, should be useCallback()
			function onNotification(args: Partial<NotificationData<SN[V]>>)
			{
				setData(args);
				wasRaised.current = true;
			}
			return () => this.$scriptComm.removeNotificationListener(variant, onNotification);
		}, [variant, filter]);
		
		const notification = { wasRaised: wasRaised.current, ...data };
		if(wasRaised.current === true) wasRaised.current = false;
		return notification;
	}
	
	public async sendMessage<V extends Supported<SM>>(variant: CanOmitArgs<SM, V>) :Promise<ScriptCommReturn<SM[V]>>;
	public async sendMessage<V extends Supported<SM>>(variant: V, args: MessageArgs<SM[V]>) : Promise<ScriptCommReturn<SM[V]>>;
	public async sendMessage<V extends Supported<SM>>(arg0: V, arg1?: MessageArgs<SM[V]>) : Promise<ScriptCommReturn<SM[V]>>
	{
		function resolveArgs(iArgs: IArguments, arg0: unknown, arg1: unknown) : [V, MessageArgs<SM[V]>]
		{
			if(iArgs.length === 1) return [arg0 as V, {} as MessageArgs<SM[V]>];
			if(iArgs.length === 2) return [arg0 as V, arg1 as MessageArgs<SM[V]>];
			throw new ResolveOverloadArgsException("ScriptComm.sendMessage()");
		}
		const [variant, args] = resolveArgs(arguments, arg0, arg1);
		return await this.$scriptComm.sendMessage(variant, args);
	}
}

export function isWaiting(data: BackgroundVar<unknown>) : data is Waiting
{
	if(data instanceof Waiting) return true;
	return false;
}

export function wasRaised<T extends Notification<NotificationBlueprint>>(notification: T) : notification is Required<T>
{
	if(notification.wasRaised === true) return true;
	return false;
}

export class Waiting
{
	private desc = "Waiting on response"
}