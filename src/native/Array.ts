interface Array<T>
{
	contains(item: T): boolean;
	notContains(item: T) : boolean;
}
Array.prototype.contains = function<T>(item: T) : boolean
{
	return this.includes(item);
}
Array.prototype.notContains = function<T>(item: T) : boolean
{
	return this.includes(item) == false;
}