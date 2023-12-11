import { useState, useEffect, useRef } from "react";
import { FrontendComm, FrontendCommReturn } from "../FrontendComm";
import { SupportedMessages, CanOmitArgs, MessageArgs } from "../../Message";
import { Supported } from "../../Message";
import { SupportedNotifications, NotificationData, NotificationFilter} from "../../Message";
import { ResolveOverloadArgsException } from "../../../exceptions/ResolveOverloadArgsException";

export type BackgroundVar<T> = Waiting | T;
export type BackgroundState<T> = [BackgroundVar<T>, (state: T) => void];
export type Notification<T> = { wasRaised: boolean } & Partial<T>;

/* eslint-disable react-hooks/rules-of-hooks -- it's special class which is some kind of gate between react and browser.std */
export class FrontendCommReact<SM extends SupportedMessages, SN extends SupportedNotifications>
{
	private $frontendComm: FrontendComm<SM, SN>;
	
	constructor(frontendComm: FrontendComm<SM, SN>)
	{
		this.$frontendComm = frontendComm;
	}
	
	public useBackgroundState<V extends Supported<SM>>(variant: CanOmitArgs<SM, V>) : BackgroundState<FrontendCommReturn<SM[V]>>;
	public useBackgroundState<V extends Supported<SM>>(variant: V, args: MessageArgs<SM[V]>) : BackgroundState<FrontendCommReturn<SM[V]>>;
	public useBackgroundState<V extends Supported<SM>>(arg0: V, arg1?: MessageArgs<SM[V]>) : BackgroundState<FrontendCommReturn<SM[V]>>
	{
		function resolveArgs(iArgs: IArguments, arg0: unknown, arg1: unknown) : [V, MessageArgs<SM[V]>]
		{
			if(iArgs.length === 1) return [arg0 as V, {} as MessageArgs<SM[V]>];
			if(iArgs.length === 2) return [arg0 as V, arg1 as MessageArgs<SM[V]>];
			throw new ResolveOverloadArgsException("FrontendCommReact.sendMessage()");
		}
		const [variant, args] = resolveArgs(arguments, arg0, arg1);
		const [data, setData] = useState<FrontendCommReturn<SM[V]> | Waiting>(new Waiting());
		
		// we doom here, because we need somehow change `args` to primitive type to be easy passable to `useEffect` deps.
		// only way todoing so is `JSON.stringify` object.
		const simplyfiedArgs = JSON.stringify(args);
		useEffect(() => {
			let ignore = false;
			const args = JSON.parse(simplyfiedArgs);
			this.$frontendComm.sendMessage(variant, args).then(thenHandler).catch(catchHandler)
			function thenHandler(data: FrontendCommReturn<SM[V]>)
			{
				if(ignore === true) return;
				setData(data)
			}
			function catchHandler()
			{
				// const messageError = new MessageError("FatalResponse", "", {}, this.$debug) // TODO can't return `MessageError` because it's not background error, it's frontend. Also for the same reason I don't have access to this.$debug.
			}
			return () => { ignore = true; }
		}, [variant, simplyfiedArgs]);
		
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
			throw new ResolveOverloadArgsException("FrontendCommReact.useNotification()");
		}
		const [variant, filter] = resolveArgs(arguments, arg0, arg1);
		const [data, setData] = useState<Partial<NotificationData<SN[V]>>>({});
		const wasRaised = useRef(false);

		useEffect(() => {
			this.$frontendComm.addNotificationListener(variant, filter, onNotification); 
			function onNotification(args: Partial<NotificationData<SN[V]>>)
			{
				setData(args);
				wasRaised.current = true;
			}
			return () => this.$frontendComm.removeNotificationListener(variant, onNotification);
		}, [variant, filter]); // TODO here filter is function which changes on each render, should be useCallback()
		
		const notification = { wasRaised: wasRaised.current, ...data };
		if(wasRaised.current === true) wasRaised.current = false;
		return notification;
	}
	
	public async sendMessage<V extends Supported<SM>>(variant: CanOmitArgs<SM, V>) :Promise<FrontendCommReturn<SM[V]>>;
	public async sendMessage<V extends Supported<SM>>(variant: V, args: MessageArgs<SM[V]>) : Promise<FrontendCommReturn<SM[V]>>;
	public async sendMessage<V extends Supported<SM>>(arg0: V, arg1?: MessageArgs<SM[V]>) : Promise<FrontendCommReturn<SM[V]>>
	{
		function resolveArgs(iArgs: IArguments, arg0: unknown, arg1: unknown) : [V, MessageArgs<SM[V]>]
		{
			if(iArgs.length === 1) return [arg0 as V, {} as MessageArgs<SM[V]>];
			if(iArgs.length === 2) return [arg0 as V, arg1 as MessageArgs<SM[V]>];
			throw new ResolveOverloadArgsException("FrontendCommReact.sendMessage()");
		}
		const [variant, args] = resolveArgs(arguments, arg0, arg1);
		return await this.$frontendComm.sendMessage(variant, args);
	}
}

export class Waiting
{
	private desc = "Waiting on response"
}