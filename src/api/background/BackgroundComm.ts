import { Message, SupportedMessages, SupportedNotifications, MessageListener, MessageSender, MessagePacket } from "../Message";
import { MessageFailure } from "../MessageFailure";
import { Debug } from "../../ex/Debug";

type RequestListenerAlternative<Fn extends Function> = Fn extends (...args: infer ARGS) => infer R ? (...args: ARGS) => Promise<R> : never; // wrap function return type in promise.
type SendResponse = (response?: {}) => void;
const debug = new Debug();

export class BackgroundComm<SM extends SupportedMessages, SN extends SupportedNotifications>
{
	private $listeners: Map<keyof SM, MessageListener>;
	
	public constructor()
	{
		browser.runtime.onMessage.addListener(this.dispatchMessage.bind(this));
		this.$listeners = new Map();
	}
	
	public addMessageListener<V extends keyof SM>(variant: V, listener: RequestListenerAlternative<SM[V]>)
	{
		this.$listeners.set(variant, listener);
	}
	
	public sendNotification<V extends keyof SN>(tabId: number, variant: V, data: SN[V])
	{
		// const result = browser.tabs.sendMessage(tabId, data); // TODO implement communication to page script
	}
	
	public async dispatchMessage(packet: MessagePacket, sender: MessageSender, sendResponse: SendResponse)
	{
		debug.info("BackgroundComm:dispatchRequest()", "packet.variant=", packet.variant);
		const listener = this.$listeners.get(packet.variant) ?? this.defaultErrorListener; // TODO what to do when listener for this event is not set?
		const result = await listener(sender, ...packet.data);
		const response = Message.pack(result);
		return Promise.resolve(response);
	}
	
	private async defaultErrorListener() : Promise<MessageFailure<"MissingListener", {}>>
	{
		const ThereIsNoListenerForThisMessage = "There is no listener for this message.";
		return new MessageFailure("MissingListener", ThereIsNoListenerForThisMessage, {});
	}
}