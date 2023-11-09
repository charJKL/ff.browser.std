import { useState, useEffect } from "react";
import { ScriptComm } from "../api/script/ScriptComm";
import { SupportedMessages, SupportedNotifications, ResolveMessageArgs, ResolveMessageResponse } from "../api/Message";
import { isNotUndefined } from "../ex/isUndefined";

export class ScriptCommReact<SM extends SupportedMessages, SN extends SupportedNotifications>
{
	private $scriptComm: ScriptComm<SM, SM>;
	
	constructor(scriptComm: ScriptComm<SM, SN>)
	{
		this.$scriptComm = scriptComm;
	}
	
	public useMessage<V extends keyof SM>(variant: V, ...args: ResolveMessageArgs<SM[V]>) : [boolean, null | ReturnType<SM[V]>]
	{
		// TODO here should be some cache, for not request twice the same.
		const [isComplete, setIsComplete] = useState(false);
		const [data, setData] = useState<ReturnType<SM[V]> | null>(null);
		useEffect(() => {
			let ignore = false;
			this.$scriptComm.sendMessage(variant, ...args).then(thenHandler).catch(catchHandler);
			function thenHandler(data: ReturnType<SM[V]>)
			{
				if(ignore == true) return;
				setIsComplete(true);
				setData(data);
			}
			function catchHandler()
			{
				setIsComplete(false);
			}
			return () => { ignore = true; }
		}, [variant, ...args]);
		return [isComplete, data];
	}
	
	public buildMessage<V extends keyof SM>(variant: V, ...args: ResolveMessageArgs<SM[V]>) : MessageRequest<SM, ScriptComm<SM, SN>, V, ResolveMessageArgs<SM[V]>>
	{
		return new MessageRequest(this.$scriptComm, variant, args);
	}
}

class MessageRequest<SM extends SupportedMessages, SC extends ScriptComm<SM, undefined>, V extends keyof SM, VR>
{
	private $scriptComm: SC;
	private $variant: V;
	private $args: VR;
	private $before: Function | undefined;
	private $then : Function | undefined;
	
	public constructor(scriptComm: SC, variant: V, args: VR)
	{
		this.$scriptComm = scriptComm;
		this.$variant = variant;
		this.$args = args;
	}
	
	public before(before: Function) : this 
	{
		this.$before = before;
		return this;
	}
	public then(then: (args: ResolveMessageResponse<SM[V]>) => void) : this
	{
		this.$then = then;
		return this;
	}
	public async send() : Promise<void>
	{
		if(isNotUndefined(this.$before)) this.$before();
		const result = await this.$scriptComm.sendMessage(this.$variant, ...this.$args as ResolveMessageArgs<SM[V]>);
		if(isNotUndefined(this.$then)) this.$then(result);
	}
}