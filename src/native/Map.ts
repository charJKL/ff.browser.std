interface Map<K, V>
{
	hasNot(key: K) : boolean;
	getUniqueId(): string;
	castTo<R>(func: (key: K, value: V) => R) : Map<K, R>;
	toArray<R>(func: (key: K, value: V) => R) : Array<R>;
}
Map.prototype.hasNot= function<K>(key: K) : boolean
{
	return this.has(key) === false;
}
Map.prototype.getUniqueId = function() : string
{
	const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);
	let id = generateId();
	while(this.has(id)) id = generateId();
	return id;
}
Map.prototype.castTo = function<K, V, R>(func: (key: K, value: V) => R) : Map<K, R>
{
	this.forEach((value, key) => this.set(key, func(key, value)));
	return this;
}
Map.prototype.toArray = function<K, V, R>(func: (key: K, value: V) => R) : Array<R>
{
	const list: Array<R> = [];
	this.forEach((value, key) => list.push(func(key, value)));
	return list;
}