interface Map<K, V>
{
	items(): V[];
}
Map.prototype.items = function<V>() : V[]
{
	const list: V[] = [];
	this.forEach(value => list.push(value));
	return list;
}
