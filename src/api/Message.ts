import { MessageFailure } from "./MessageFailure";

export type ObjectAlike = any; // must be any because https://stackoverflow.com/questions/77460398/why-object-doesnt-conform-type-described-by-index-signatures
export type MessageSender = browser.runtime.MessageSender;
export type MessageVariant = string;
export type MessageListener = (args: ObjectAlike) => any;
export type NotificationVariant = string;
export type NotificationListener = (args: ObjectAlike) => void;
export type MessageListenerArgs<L extends (args: any) => any> = Parameters<L>[0];
export type CanOmitArgs<SM extends SupportedMessages, VM extends keyof SM> = {} extends MessageListenerArgs<SM[VM]> ? VM : never;

export type SupportedMessages = { [variant: MessageVariant]: MessageListener };
export type SupportedNotifications = { [variant: NotificationVariant]: NotificationListener };

export type MessagePacket = { variant: MessageVariant, data: ObjectAlike }
export type MessagePacketResponse = { status: "Success" | "Failure", data: any };

export class Message
{
	public static prepare(variant: any, data: ObjectAlike) : MessagePacket
	{
		return { variant: variant, data: data };
	}
	
	public static pack(result: any) : MessagePacketResponse
	{
		// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Chrome_incompatibilities#data_cloning_algorithm
		const isFailure = (value: any) : value is MessageFailure<any, any> => value instanceof MessageFailure;
		if(isFailure(result))
		{
			return { status: "Failure", data: this.serializeFailure(result) }
		}
		return { status: "Success", data: result };
	}
	
	public static unpack(response: MessagePacketResponse): any
	{
		const isFailure = (value: MessagePacketResponse) => value.status == "Failure";
		if(isFailure(response))
		{
			return {}; // TODO unserialize error
		}
		return response.data;
	}
	
	private static serializeFailure(failure: Object) : {}
	{
		return {error: "fail"}; // TODO serialize error 
	}
}