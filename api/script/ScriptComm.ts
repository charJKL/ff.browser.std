import { Debug } from "../../Debug";
import { Message, MessageList } from "../Message";

const debug = new Debug();

export type Function = (...args: any) => any;
export type RemoveFirstParameter<T extends []> = T extends [arg0: any, ...args: infer ARGS] ? ARGS : T;
export type ResolveMessageVars<T extends Function> = RemoveFirstParameter<Parameters<T>>;
export type ResolveMessageResponse<T extends Function> = Promise<Awaited<ReturnType<T>>>;

export class ScriptComm<L extends MessageList>
{
	public async sendMessage<V extends keyof L>(variant: V, ...vars: ResolveMessageVars<L[V]>) : ResolveMessageResponse<L[V]>
	{
		debug.beginGroup("./std/api/script/ScriptComm:sendMessage()", "variant=", variant, "vars=", vars);
		const packet = { variant: variant, vars: [] };
		const response = await browser.runtime.sendMessage(packet);
		const result = Message.unpack(response);
		debug.info("response=", response, "result=", result);
		debug.endGroup();
		return result;
	}
}