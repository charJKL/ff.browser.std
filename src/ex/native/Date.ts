import { DateEx, DateExInterface } from "../DateEx";

declare global
{
	interface DateConstructor extends DateExInterface
	{
		getTimestamp() : number;
	}
	interface Date
	{
		
	}
}
Date.getTimestamp = function() : number
{
	return DateEx.prototype.getTimestamp();
}
