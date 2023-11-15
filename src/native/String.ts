interface String
{
	isEqual(string: string) : boolean;
	isEmpty() : boolean;
	isNotEmpty(): boolean;
	prefix(prefix: string) : string;
	unprefix(prefix: string) : string;
	trimPrefix(prefix: string) : string;
	trimSuffix(suffix: string) : string;
	toUrl() : URL;
}
String.prototype.isEqual = function(string : string) : boolean
{
	return this == string;
}
String.prototype.isEmpty = function() : boolean
{
	return this.length == 0;
}
String.prototype.isNotEmpty = function() : boolean
{
	return this.length > 0;
}
String.prototype.prefix = function(prefix: string) : string 
{
	return prefix + this;
}
String.prototype.unprefix = function(prefix: string) : string
{
	if(this.startsWith(prefix) == false) return this.toString();
	return this.substring(prefix.length);
}
String.prototype.trimPrefix = function(prefix: string) : string
{
	if(this.startsWith(prefix) == false) return this.toString();
	return this.substring(prefix.length);
}
String.prototype.trimSuffix = function(suffix: string) : string
{
	if(this.endsWith(suffix) == false) return this.toString();
  return this.substring(0, this.length - suffix.length);
}
String.prototype.toUrl = function() : URL
{
	return new URL(this.toString());
}