import { Debug, isUndefined } from "../..";
import { Message, MessagePacket, MessagePacketResponse, MessageSender, NotificationListener, SupportedMessages, SupportedNotifications} from "../Message";

type SendResponse = (response?: {}) => void;

export class ScriptComm<SM extends SupportedMessages, SN extends SupportedNotifications>
{
	private $debug: undefined | Debug;
	private $listeners: Map<keyof SN, NotificationListener>;
	
	public constructor(debug?: Debug)
	{
		browser.runtime.onMessage.addListener(this.dispatchNotification.bind(this));
		this.$debug = debug;
		this.$listeners = new Map();
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

	public addNotificationListener<V extends keyof SN>(variant: V, listener: SN[V])
	{
		this.$listeners.set(variant, listener);
	}
	
	public removeNotificationListener<V extends keyof SN>(variant: V, listener: SN[V])
	{
		this.$listeners.delete(variant); // TODO map is not enought here, beouse there may be multiple listners for notifications.
	}

	private async dispatchNotification(packet: MessagePacket, sender: MessageSender, sendResponse: SendResponse) 
	{
		this.$debug?.info("ScriptComm::dispatchNotification()", "packer=", packet, "packet.variant=", packet.variant, "packet.data=", packet.data);
		const listener = this.$listeners.get(packet.variant);
		if(isUndefined(listener)) return;
		await listener(...packet.data);
	}
}

