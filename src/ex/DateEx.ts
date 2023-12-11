export interface DateExInterface
{
	getTimestamp() : number;
}

export class DateEx extends Date implements DateExInterface
{
	public getTimestamp () : number
	{
		return Math.floor(Date.now() / 1000); 
	}
}