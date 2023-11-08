import { Debug } from "../../Debug";
import { Message, SupportedMessages, SupportedNotifications, ResolveMessageArgs, ResolveMessageResponse, MessageResponsePacket } from "../Message";

const debug = new Debug();
export class ScriptComm<SM extends SupportedMessages, SN extends SupportedNotifications>
{
	public async sendMessage<V extends keyof SM>(variant: V, ...args: ResolveMessageArgs<SM[V]>) : ResolveMessageResponse<SM[V]>
	{
		debug.beginGroup("ScriptComm:sendMessage()", "variant=", variant, "args=", args);
		const packet = Message.prepare(variant, args);
		const response = await browser.runtime.sendMessage(packet) as MessageResponsePacket; 
		const result = Message.unpack(response);
		debug.info("response=", response, "result=", result);
		debug.endGroup();
		return result;
	}
	
}

