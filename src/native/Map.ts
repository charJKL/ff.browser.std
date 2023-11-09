interface Map<K, V>
{
	items(): V[];
	getUniqueId(): string;
}
Map.prototype.items = function<V>() : V[]
{
	const list: V[] = [];
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