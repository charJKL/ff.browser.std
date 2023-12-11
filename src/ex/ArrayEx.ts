import { InvalidOperationException } from "../exceptions/InvalidOperationException";
import { isNotNumber } from "./functions/isNumber";

export interface ArrayExInterface<T>
{
	contains(item: T): boolean;
	notContains(item: T) : boolean;
	isEmpty(): boolean;
	sortAsNumbers() : Array<T>;
}

export class ArrayEx<T> extends Array<T> implements ArrayExInterface<T>
{
	public contains(item: T) : boolean
	{
		return this.includes(item);
	}
	
	public notContains(item: T) : boolean
	{
		return this.includes(item) === false;
	}
	
	public isEmpty() : boolean
	{
		return this.length === 0;
	}

	public sortAsNumbers() : Array<T>
	{
		if(this.isEmpty()) return [];
		if(isNotNumber(this[0])) throw new InvalidOperationException("ArrayEx.sortAsNumbers()");
		return this.sort((a, b) => (a as number) - (b as number));
	}
}