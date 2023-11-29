interface Array<T>
{
	contains(item: T): boolean;
	notContains(item: T) : boolean;
	isEmpty(): boolean;
	sortAsNumbers() : Array<T>;
	
}
Array.prototype.contains = function<T>(item: T) : boolean
{
	return this.includes(item);
}
Array.prototype.notContains = function<T>(item: T) : boolean
{
	return this.includes(item) == false;
}
Array.prototype.isEmpty = function() : boolean
{
	return this.length === 0;
}
Array.prototype.sortAsNumbers = function<T>() : Array<T>
{
	return this.sort((a, b) => a - b);
}