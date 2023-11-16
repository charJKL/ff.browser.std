import "../native/String";

export class Debug 
{
	public static Script = Symbol("Debug.Format.Script");
	public static Background = Symbol("Debug.Format.Background");
	
	private static Formats = 
	{
		[Debug.Script]: "background: rgba(247, 220, 111, 1);",
		[Debug.Background]: "background: rgba(247, 220, 111, 1);"
	}
	
	public logFunction(format: keyof typeof Debug.Formats, msg: string, ...args: any[])
	{
		// TODO refactor it to use Error.Stack 
		const styles = Debug.Formats[format];
		const [rawFunctionName, rawVarsList] = msg.find("=$").findBefore(" ").cut();
		const functionName = rawFunctionName.trim().trimSuffix(",");
		const varsList = rawVarsList.replaceAll(/\$[0-9]/g, "%o");
		const vars = this.transformArgs(args);
		console.group(`%c${functionName}%c ${varsList}`, styles, "", ...vars);
	}
	
	public endFunction() : void
	{
		console.groupEnd();
	}
	
	private transformArgs(args: any[]) : any[]
	{
		return args.map(a => this.transformType(a));
	}
	
	private transformType(argument: any) : any
	{
		switch(typeof argument)
		{
			case "undefined": return argument;
			case "object": return argument;
			case "boolean": return new Boolean(argument);
			case "number": return new Number(argument);
			case "bigint": return BigInt(argument);
			case "string": return new String(argument);
			case "symbol": return argument;
			case "function": return argument;
		}
	}
	
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