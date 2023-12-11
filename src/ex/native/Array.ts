import { ArrayEx, ArrayExInterface } from "../ArrayEx";

declare global
{
	interface Array<T> extends ArrayExInterface<T>
	{
		
	}
}
Array.prototype.contains = function<T>(item: T) : boolean
{
	return ArrayEx.prototype.contains.call(this, item);
}
Array.prototype.notContains = function<T>(item: T) : boolean
{
	return ArrayEx.prototype.notContains.call(this, item);
}
Array.prototype.isEmpty = function() : boolean
{
	return ArrayEx.prototype.isEmpty.call(this);
}
Array.prototype.sortAsNumbers = function<T>() : Array<T>
{
	return ArrayEx.prototype.sortAsNumbers.call(this);
}

