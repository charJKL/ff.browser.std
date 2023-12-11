import { StringExMark } from "./StringExMark";

export interface StringExInterface
{
	isEqual(string: string): boolean;
	isEmpty(): boolean;
	isNotEmpty(): boolean;
	prefix(prefix: string): string;
	unprefix(prefix: string): string;
	trimPrefix(prefix: string): string;
	trimSuffix(suffix: string): string;
	find(search: string): StringExMark;
	toUrl(): URL;
}

export class StringEx extends String implements StringExInterface
{
	public isEqual(this: string, string : string) : boolean
	{
		return this === string;
	}
	
	public isEmpty() : boolean
	{
		return this.length === 0;
	}
	
	public isNotEmpty() : boolean
	{
		return this.length > 0;
	}
	
	public prefix(prefix: string) : string 
	{
		return prefix + this;
	}
	
	public unprefix(prefix: string) : string
	{
		if(this.startsWith(prefix) === false) return this.toString();
		return this.substring(prefix.length);
	}
	
	public trimPrefix(prefix: string) : string
	{
		if(this.startsWith(prefix) === false) return this.toString();
		return this.substring(prefix.length);
	}
	
	public trimSuffix (suffix: string) : string
	{
		if(this.endsWith(suffix) === false) return this.toString();
		return this.substring(0, this.length - suffix.length);
	}
	
	public find(search: string) : StringExMark
	{
		return (new StringExMark(this)).find(search);
	}
	
	public toUrl() : URL
	{
		return new URL(this.toString());
	}
}