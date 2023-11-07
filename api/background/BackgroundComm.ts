import { Debug } from "../../Debug";
import { MessageFailure } from "../MessageFailure";
import { Message } from "../Message";

type SendResponse = (response?: {}) => void;

// TODO move this to CommSpecs.ts file
type RequestVariant = string;
type RequestSender = browser.runtime.MessageSender;
type RequestListener = (sender: RequestSender, ...args: any[]) => any;
type RequestListenerAlternative<Fn extends Function> = Fn extends (...args: infer ARGS) => infer R ? (...args: ARGS) => Promise<R> : never; // wrap function return type in promise.
type NotificationVariant = string;
type NotificationData = object;

type RequestPacket<V extends RequestVariant> = { variant: V, data: any};

interface SupportedRequests { [type: RequestVariant]: RequestListener };
interface SupportedNotifications { [type: NotificationVariant]: NotificationData };
const debug = new Debug();


export class BackgroundComm<SR extends SupportedRequests, SN extends SupportedNotifications>
{
	private $listeners: Map<keyof SR, RequestListener>
	
	public constructor()
	{
		browser.runtime.onMessage.addListener(this.dispatchRequest.bind(this));
		this.$listeners = new Map();
	}
	
	public addMessageListener<V extends keyof SR>(variant: V, listener: RequestListenerAlternative<SR[V]>)
	{
		this.$listeners.set(variant, listener);
	}
	
	public sendNotification<V extends keyof SN>(tabId: number, variant: V, data: SN[V])
	{
		// const result = browser.tabs.sendMessage(tabId, data); // TODO implement communication to page script
	}
	
	private async dispatchRequest(request: RequestPacket<any>, sender: RequestSender, sendResponse: SendResponse)
	{
		debug.info("BackgroundComm:dispatchRequest()", "requestVariant=", request.variant); // TODO normalize this
		const listener = this.$listeners.get(request.variant) ?? this.defaultErrorListener;
		const result = await listener(request.data, sender);
		const response = Message.pack(result);
		debug.info("Return");
		return Promise.resolve(response);
	}
	
	private async defaultErrorListener() : Promise<MessageFailure<"MissingListener", {}>>
	{
		const ThereIsNoListenerForThisMessage = "There is no listener for this message.";
		return new MessageFailure("MissingListener", ThereIsNoListenerForThisMessage, {});
	}
}