import { AssertNotReachableDueToExhaustiveLogic } from "../exceptions/AssertNotReachableDueToExhaustiveLogic";
import { MessageFailure } from "./MessageFailure";
import { MessageFailureVariant, MessageFailureInfo } from "./MessageFailure";

export type MessageVariant = string;
export type MessageSender = browser.runtime.MessageSender;
export type MessageBlueprintParametless = () => unknown;
export type MessageBlueprintParametered = (args: any) => unknown; // eslint-disable-line -- `any` is sole abstract type which conform any argument, indirectly because https://stackoverflow.com/questions/37006008/typescript-index-signature-is-missing-in-type#comment96038128_37006179
export type MessageBlueprint = MessageBlueprintParametless | MessageBlueprintParametered;
export type MessageArgs<B extends MessageBlueprint> = B extends MessageBlueprintParametered ? Parameters<B>[0] : undefined;
export type CanOmitArgs<SM extends SupportedMessages, VM extends Supported<SM>> = SM[VM] extends MessageBlueprintParametless ? VM : never;

export type NotificationVariant = string;
export type NotificationBlueprint = () => unknown;
export type NotificationFilter<B extends NotificationBlueprint> = (value: ReturnType<B>) => boolean;
export type NotificationData<B extends NotificationBlueprint> = ReturnType<B>;
export type NotificationListener<B extends NotificationBlueprint> = (data: NotificationData<B>) => void;

export type SupportedMessages = { [variant: MessageVariant]: MessageBlueprint };
export type SupportedNotifications = { [variant: NotificationVariant]: NotificationBlueprint };
export type Supported<S> = keyof S & string;

export type MessagePacket = { variant: Supported<SupportedMessages>, data: unknown }
export type MessagePacketSuccess = { status: "Success", data: unknown };
export type MessagePacketFailure = { status: "Failure", data: SerializedMessageFailure };
export type MessagePacketResponse = MessagePacketSuccess | MessagePacketFailure;
type SerializedMessageFailure = { variant: MessageFailureVariant, message: string, info: MessageFailureInfo };


export class Message
{
	public static prepare(variant: Supported<SupportedMessages>, data: unknown) : MessagePacket
	{
		return { variant: variant, data: data };
	}
	
	public static pack(result: unknown | MessageFailure<string, unknown>) : MessagePacketResponse
	{
		// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Chrome_incompatibilities#data_cloning_algorithm
		// TODO do not rely on native serialization, in firefox works in chrome doesn't.
		// TODO this logic have no sense, `Data` and `MessageFailure` have the same sense, just latter need serialization.
		const isSuccess = (value: unknown | MessageFailure<string, unknown>) : value is unknown => value instanceof MessageFailure === false;
		const isFailure = (value: unknown | MessageFailure<string, unknown>) : value is MessageFailure<string, unknown> => value instanceof MessageFailure === true;
		if(isSuccess(result)) return { status: "Success", data: result };
		if(isFailure(result)) return { status: "Failure", data: this.serializeFailure(result) }
		throw new AssertNotReachableDueToExhaustiveLogic("Message.pack()");
	}
	
	public static unpack(response: MessagePacketResponse): unknown | MessageFailure<string, unknown>
	{
		const isSuccess = (value: MessagePacketResponse) : value is MessagePacketSuccess => value.status === "Success";
		const isFailure = (value: MessagePacketResponse) : value is MessagePacketFailure => value.status === "Failure";
		if(isSuccess(response)) return response.data;
		if(isFailure(response)) return new MessageFailure(response.data.variant, response.data.message, response.data.info);
		throw new AssertNotReachableDueToExhaustiveLogic("Message.unpack()");
	}
	
	private static serializeFailure(failure: MessageFailure<string, unknown>) : SerializedMessageFailure
	{
		return { variant: failure.variant, message: failure.message, info: failure.info } // thats all data we need in frontend
	}
}