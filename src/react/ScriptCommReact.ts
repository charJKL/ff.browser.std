import { useState, useEffect } from "react";
import { ScriptComm } from "../api/script/ScriptComm";
import { SupportedMessages, SupportedNotifications, ResolveMessageArgs } from "../api/Message";
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
		console.log("send messadddddddd")
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
	
	public buildMessage<V extends keyof SM>(variant: V, ...args: ResolveMessageArgs<SM[V]>) : MessageRequest<ScriptComm<SM, SN>, V, ResolveMessageArgs<SM[V]>>
	{
		return new MessageRequest(this.$scriptComm, variant, args);
	}
}

class MessageRequest<SC extends ScriptComm<any, any>, V, VR>
{
	private $scriptComm: SC;
	private $variant: V;
	private $vars: VR;
	private $before: Function | undefined;
	private $then : Function | undefined;
	
	public constructor(scriptComm: SC, variant: V, vars: VR)
	{
		this.$scriptComm = scriptComm;
		this.$variant = variant;
		this.$vars = vars;
	}
	
	public before(before: Function) : this 
	{
		this.$before = before;
		return this;
	}
	public then(then: Function) : this // TODO then args should be typed with proper return type.
	{
		this.$then = then;
		return this;
	}
	public async go() : Promise<void>
	{
		if(isNotUndefined(this.$before)) this.$before();
		const result = await this.$scriptComm.sendMessage(this.$variant as unknown as any, ...this.$vars as any[]);
		if(isNotUndefined(this.$then)) this.$then(result); // TODO resolve return type
	}
}