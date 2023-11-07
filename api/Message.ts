import { MessageFailure } from "./MessageFailure";
import { isFailure } from "./isFailure";

export type MessageSender = browser.runtime.MessageSender;
export type MessageListener<R> = (sender: MessageSender, ...args: any[]) => R;
export type MessageVariant = string;
export type MessageRequest<V extends MessageVariant> = { variant: V, data: any };
export type MessageResponse<V extends MessageVariant> = { response: "Result" | "Failure", data: any };

export interface MessageList { [key: MessageVariant]: MessageListener<any> };

export class Message
{
	public static pack(result: any) : MessageResponse<any>
	{
		// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Chrome_incompatibilities#data_cloning_algorithm
		const isFailure = (value: any) : value is MessageFailure<any, any> => value instanceof MessageFailure;
		if(isFailure(result))
		{
			const serializedFailure = this.SerializeFailure(result);
			console.log(serializedFailure);
			return { response: "Failure", data: serializedFailure }
		}
		return { response: "Result", data: result };
	}
	
	public static unpack(result: MessageResponse<any>): any
	{
		if(result.response == "Failure")
		{
			return {};
			//return new MessageFailure(result.data.message);
		}
		if(result.response == "Result")
		{
			return result.data;
		}
	}
	
	private static SerializeFailure(failure: Object) : {}
	{
		console.log("SerializeFailure->start");
		return Object.entries(failure).reduce((prev, current) => { console.log(prev, current); return prev; }, {instance: failure.constructor.name});
		console.log("SerializeFailure->end");
		//return Object.entries(failure).reduce((prev, current) => prev[current[0]] = current[1], {instance: failure.constructor.name});
	}
}