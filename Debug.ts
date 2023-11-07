export class Debug 
{
	public clear() : void
	{
		console.clear();
	}
	
	public log(...data: any[]) : void
	{
		console.log(...data);
	}
	
	public info(...data: any[]) : void
	{
		console.info(...data);
	}
	
	public warn(...data: any[]) : void
	{
		console.warn(...data);
	}
	
	public error(...data: any[]) : void
	{
		console.error(...data);
	}
	
	public beginGroup(...data: any[]) : void
	{
		console.group(...data);
	}
	
	public endGroup() : void
	{
		console.groupEnd();
	}
	
	public terminate(...data: any[]) : string // TODO does this function is important and needed?
	{
		//PeriodicallyContext.ClearAllActiveContexts(); // 
		console.error(...data);
		debugger;
		return `ApplicationLogicError`;
	}
}