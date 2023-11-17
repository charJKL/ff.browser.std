interface Array<T>
{
	contains(item: T): boolean;
	notContains(item: T) : boolean;
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
Array.prototype.sortAsNumbers = function<T>() : Array<T>
{
	return this.sort((a, b) => a - b);
}