import { Debug } from "../..";
import { Message, MessagePacketResponse, SupportedMessages, SupportedNotifications} from "../Message";

export class ScriptComm<SM extends SupportedMessages, SN extends SupportedNotifications>
{
	private $debug: undefined | Debug;
	
	public constructor(debug?: Debug)
	{
		this.$debug = debug;
	}
	
	public async sendMessage<V extends keyof SM>(variant: V, ...args: Parameters<SM[V]>) : Promise<ReturnType<SM[V]>>
	{
		this.$debug?.beginGroup("ScriptComm:sendMessage()", "variant=", variant, "args=", args);
		const packet = Message.prepare(variant, args);
		const response = await browser.runtime.sendMessage(packet) as MessagePacketResponse; 
		const result = Message.unpack(response);
		this.$debug?.info("ScriptComm:sendMessage()", "response=", response, "result=", result);
		this.$debug?.endGroup();
		return result;
	}
}

