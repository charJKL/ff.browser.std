import { isString } from "./functions/isString";

export class StringEx 
{
	public static isEqual(first: string, second: string) : boolean
	{
		return first === second;
	}
	
	public static isEmpty(string: string) : boolean
	{
		return string.length === 0;
	}
	
	public static isNotEmpty(string: string) : boolean
	{
		return string.length > 0;
	}
	
	public static findBefore(string: string, before: string, search: string) : number | null
	{
		const mark = string.indexOf(before);
		if(mark === -1) return null;
		const position = string.lastIndexOf(search, mark);
		if(position === -1) return null;
		return position;
	}
	
	public static cut(string: string, place: string | number) : [string, string] | [null, null]
	{
		const mark = isString(place) ? string.indexOf(place) : place;
		if(mark === -1 ) return [null, null];
		const firstPart = string.substring(0, mark);
		const secondPart = string.substring(mark + 1);
		return [firstPart, secondPart];
	}
	
	public static prefix(string: string, prefix: string) : string
	{
		return prefix + string;
	}
	
	public static trimPrefix(string: string, prefix: string) : string
	{
		if(string.startsWith(prefix) === false) return string;
		return string.substring(prefix.length);
	}
	
	public static trimSuffix(string: string, suffix: string) : string
	{
		if(string.endsWith(suffix) === false) return string;
		return string.substring(0, this.length - suffix.length);
	}
	
	public static toUrl(string: string)  : URL
	{
		return new URL(string);
	}
}