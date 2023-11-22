interface Map<K, V>
{
	hasNot(key: K) : boolean;
	items(): Array<V>;
	getUniqueId(): string;
	transform<R>(func: (key: K, value: V) => R) : Array<R>;
}
Map.prototype.hasNot= function<K>(key: K) : boolean
{
	return this.has(key) == false;
}
Map.prototype.items = function<V>() : Array<V>
{
	const list: Array<V> = [];
	this.forEach(value => list.push(value));
	return list;
}
Map.prototype.getUniqueId = function() : string
{
	const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);
	let id = generateId();
	while(this.has(id)) id = generateId();
	return id;
}
Map.prototype.transform = function<K, V, R>(func: (key: K, value: V) => R) : Array<R>
{
	const list: Array<R> = [];
	this.forEach((value, key) => list.push(func(key, value)));
	return list;
}