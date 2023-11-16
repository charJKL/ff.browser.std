import { ResolveOverloadArgsException } from "../exceptions/ResolveOverloadArgsException";
import "../native/String";
import "../native/Array";

export class Debug 
{
	public static None = Symbol("Debug.Format.None");
	public static ScriptMessage = Symbol("Debug.Format.ScriptMessage");
	public static ScriptNotification = Symbol("Debug.Format.ScriptNotification");
	public static BackgroundMessage = Symbol("Debug.Format.BackgroundNotification");
	public static BackgroundNotification = Symbol("Debug.Format.BackgroundNotification");
	
	private static Formats = 
	{
		[Debug.None]: "",
		[Debug.ScriptMessage]: "background: rgba(125, 206, 160, 1);", // green
		[Debug.ScriptNotification]: "background: rgba(247, 220, 111, 1);", // yellow
		[Debug.BackgroundMessage]: "background: rgba(127, 179, 213, 1);", // blue
		[Debug.BackgroundNotification]: "background: rgba(187, 143, 206, 1);", // purple
	}
	
	public logFunction(message: string, ...args: any[]): void;
	public logFunction(message: string, format: keyof typeof Debug.Formats, ...args: any[]): void;
	public logFunction(arg0: string, ...args: any[]) : void
	{
		// TODO refactor it to use Error.Stack 
		const { message, format, vars, values } = this.differentiateArgs(arg0, args);
		console.group(`%c${message}%c ${vars}`, format, "", ...values);
	}
	
	public log(message: string, ...args: any[]): void;
	public log(message: string, format: keyof typeof Debug.Formats, ...args: any[]): void;
	public log(arg0: string, ...args: any[]) : void
	{
		const { message, format, vars, values } = this.differentiateArgs(arg0, args);
		console.log(`%c${message}%c ${vars}`, format, "", ...values);
	}
	
	public endFunction() : void
	{
		console.groupEnd();
	}
	
	public clear() : void
	{
		console.clear();
	}
	
	public terminate(...data: any[]) : string // TODO does this function is important and needed?
	{
		//PeriodicallyContext.ClearAllActiveContexts(); // 
		console.error(...data);
		debugger;
		return `ApplicationLogicError`;
	}
	
	private differentiateArgs(arg0: string, args: any[]) : {message: string, format: string, vars: string, values: any[]}
	{
		function resolveArgs(iArgs: IArguments, arg0: any, args: any[]) : [string, keyof typeof Debug.Formats, any[]]
		{
			const styles = Object.getOwnPropertySymbols(Debug.Formats);
			if(styles.notContains(args[0])) return [arg0, Debug.None, args];
			if(styles.contains(args[0])) return [arg0, args[0], args.slice(1)];
			throw new ResolveOverloadArgsException("Debug.log()");
		}
		const [rawEntireMessage, rawFormat, values] = resolveArgs(arguments, arg0, args);
		
		const [rawMessage, rawVars] = rawEntireMessage.find("=$").findBefore(" ").cut();
		const format = Debug.Formats[rawFormat];
		const message = rawMessage.trim().trimSuffix(",");
		const vars = rawVars.replaceAll(/\$[0-9]/g, "%o");
		
		return { message, format, vars, values };
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
}