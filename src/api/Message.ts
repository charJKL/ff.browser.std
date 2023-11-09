import { MessageFailure } from "./MessageFailure";

export type MessageSender = browser.runtime.MessageSender;
export type MessageVariant = string;
export type MessageListener = (sender: MessageSender, ...args: any[]) => any;
export type NotificationVariant = string;
export type NotificationData = object;

export type Function = (...args: any) => any;
export type RemoveFirstParameter<T extends []> = T extends [arg0: any, ...args: infer ARGS] ? ARGS : T;
export type ResolveMessageArgs<T extends Function> = RemoveFirstParameter<Parameters<T>>;
export type ResolveMessageResponse<T extends Function> = ReturnType<T>;

export interface SupportedMessages { [variant: MessageVariant]: MessageListener };
export interface SupportedNotifications { [variant: NotificationVariant]: NotificationData };

export type MessagePacket = { variant: MessageVariant, data: any[] };
export type MessageResponsePacket = { status: "Success" | "Failure", data: any };

export class Message
{
	public static prepare(variant: any, args: any[]) : MessagePacket
	{
		return { variant: variant, data: args };
	}
	
	public static pack(result: any) : MessageResponsePacket
	{
		// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Chrome_incompatibilities#data_cloning_algorithm
		const isFailure = (value: any) : value is MessageFailure<any, any> => value instanceof MessageFailure;
		if(isFailure(result))
		{
			return { status: "Failure", data: this.serializeFailure(result) }
		}
		return { status: "Success", data: result };
	}
	
	private static serializeFailure(failure: Object) : {}
	{
		return {error: "fail"}; // TODO serialize error 
	}
	
	public static unpack(response: MessageResponsePacket): any
	{
		const isFailure = (value: MessageResponsePacket) => value.status == "Failure";
		if(isFailure(response))
		{
			return {}; // TODO unserialize error
		}
		return response.data;
	}
}
