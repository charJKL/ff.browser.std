declare global
{
	interface DateConstructor
	{
		getTimestamp() : number;
	}
	interface Date
	{
		getTimestamp() : number;
	}
}
Date.getTimestamp = function() : number
{
	return Math.floor(Date.now() / 1000); 
}