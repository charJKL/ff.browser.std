import { Message, SupportedMessages, SupportedNotifications, MessageListener, MessageSender, MessagePacket } from "../Message";
import { MessageFailure } from "../MessageFailure";
import { Debug } from "../../ex/Debug";

type SendResponse = (response?: {}) => void;
type ExtendedMessageListener<L extends MessageListener> = (sender: MessageSender, ...args: Parameters<L>) => ReturnType<L>;

export class BackgroundComm<SM extends SupportedMessages, SN extends SupportedNotifications>
{
	private $debug: undefined | Debug ;
	private $listeners: Map<keyof SM, ExtendedMessageListener<any>>;
	
	public constructor(debug?: Debug)
	{
		browser.runtime.onMessage.addListener(this.dispatchMessage.bind(this));
		this.$debug = debug;
		this.$listeners = new Map();
	}
	
	public addMessageListener<V extends keyof SM>(variant: V, listener: ExtendedMessageListener<SM[V]>)
	{
		this.$listeners.set(variant, listener);
	}
	
	public sendNotification<V extends keyof SN>(tabId: number, variant: V, data: SN[V])
	{
		// const result = browser.tabs.sendMessage(tabId, data); // TODO implement communication to page script
	}
	
	public async dispatchMessage(packet: MessagePacket, sender: MessageSender, sendResponse: SendResponse)
	{
		this.$debug?.info("BackgroundComm:dispatchRequest()", "packet=", packet, "packet.variant=", packet.variant, "packet.data=", packet.data);
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