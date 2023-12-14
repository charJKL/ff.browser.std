
export class MapEx
{
	public static hasNot<K, V>(map: Map<K, V>, key: K) : boolean
	{
		return map.has(key) === false;
	}
	
	public static getUniqueKey<V>(map: Map<string, V>): string
	{
		const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);
		let id = generateId();
		while(map.has(id)) id = generateId();
		return id;
	}
	
	public static castTo<K, V, R>(map: Map<K, V>, func: (key: K, value: V) => R) : Map<K, R>
	{
		map.forEach((value, key) => map.set(key, func(key, value) as unknown as V)); // casting to V is necessary
		return this as unknown as Map<K, R>; // casting to Map<K, R> is necessary
	}
	
	public static toArray<K, V, R>(map: Map<K, V>, func: (key: K, value: V) => R) : Array<R>
	{
		const list: Array<R> = [];
		map.forEach((value, key) => list.push(func(key, value)));
		return list;
	}
}