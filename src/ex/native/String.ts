import { StringExMark } from "../StringExMark";
import { StringEx, StringExInterface } from "../StringEx";

declare global
{
	interface String extends StringExInterface
	{
		
	}
}

String.prototype.isEqual = function(string : string) : boolean
{
	return StringEx.prototype.isEqual.call(this, string);
}
String.prototype.isEmpty = function() : boolean
{
	return StringEx.prototype.isEmpty.call(this);
}
String.prototype.isNotEmpty = function() : boolean
{
	return StringEx.prototype.isNotEmpty.call(this);
}
String.prototype.prefix = function(prefix: string) : string 
{
	return StringEx.prototype.prefix.call(this, prefix);
}
String.prototype.unprefix = function(prefix: string) : string
{
	return StringEx.prototype.unprefix.call(this, prefix);
}
String.prototype.trimPrefix = function(prefix: string) : string
{
	return StringEx.prototype.trimPrefix.call(this, prefix);
}
String.prototype.trimSuffix = function(suffix: string) : string
{
	return StringEx.prototype.trimSuffix.call(this, suffix);
}
String.prototype.find = function(search: string) : StringExMark
{
	return StringEx.prototype.find.call(this, search);
}
String.prototype.toUrl = function() : URL
{
	return StringEx.prototype.toUrl.call(this);
}