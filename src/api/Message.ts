import { MessageFailure } from "./MessageFailure";
import { MessageFailureVariant, MessageFailureInfo } from "./MessageFailure";

export type ObjectAlike = any; // must be any because https://stackoverflow.com/questions/77460398/why-object-doesnt-conform-type-described-by-index-signatures

export type MessageVariant = string;
export type MessageSender = browser.runtime.MessageSender;
export type MessageBlueprint = (args: ObjectAlike) => any;
export type MessageArgs<L extends MessageBlueprint> = Parameters<L>[0];
export type CanOmitArgs<SM extends SupportedMessages, VM extends keyof SM> = {} extends MessageArgs<SM[VM]> ? VM : never;

export type NotificationVariant = string;
export type NotificationBlueprint = () => ObjectAlike;
export type NotificationFilter<B extends NotificationBlueprint> = (value: ReturnType<B>) => boolean;
export type NotificationData<B extends NotificationBlueprint> = ReturnType<B>;
export type NotificationListener<B extends NotificationBlueprint> = (data: NotificationData<B>) => void;

export type SupportedMessages = { [variant: MessageVariant]: MessageBlueprint };
export type SupportedNotifications = { [variant: NotificationVariant]: NotificationBlueprint };

export type MessagePacket = { variant: MessageVariant, data: ObjectAlike }
export type MessagePacketResponse = { status: "Success" | "Failure", data: any };
export type MessagePacketFailure = { status: "Failure", data: SerializedMessageFailure };
type SerializedMessageFailure = { variant: MessageFailureVariant, message: string, info: MessageFailureInfo };


export class Message
{
	public static prepare(variant: any, data: ObjectAlike) : MessagePacket
	{
		return { variant: variant, data: data };
	}
	
	public static pack(result: any | MessageFailure<any, any>) : MessagePacketResponse
	{
		// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Chrome_incompatibilities#data_cloning_algorithm
		const isSuccess = (value: any | MessageFailure<any, any>) : value is any => value instanceof MessageFailure === false;
		switch(isSuccess(result))
		{
			case true:
				return { status: "Success", data: result };
				
			case false:
				return { status: "Failure", data: this.serializeFailure(result) }
		}
	}
	
	public static unpack(response: MessagePacketResponse): any
	{
		switch(response.status)
		{
			case "Success":
				return response.data;
				
			case "Failure":
				return new MessageFailure(response.data.variant, response.data.message, response.data.info);
		}
	}
	
	private static serializeFailure(failure: MessageFailure<any, any>) : SerializedMessageFailure
	{
		return { variant: failure.variant, message: failure.message, info: failure.info } // thats all data we need in frontend
	}
}