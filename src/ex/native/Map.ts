import { MapEx, MapExInterface } from "../MapEx";

declare global
{
	interface Map<K, V> extends MapExInterface<K, V>
	{
		
	}
}
Map.prototype.hasNot= function<K>(key: K) : boolean
{
	return MapEx.prototype.hasNot.call(this, key);
}
Map.prototype.getUniqueId = function() : string
{
	return MapEx.prototype.hasNot.call(this);
}
Map.prototype.castTo = function<K, V, R>(func: (key: K, value: V) => R) : Map<K, R>
{
	return MapEx.prototype.hasNot.call(this, func);
}
Map.prototype.toArray = function<K, V, R>(func: (key: K, value: V) => R) : Array<R>
{
	return MapEx.prototype.hasNot.call(this, func);
}