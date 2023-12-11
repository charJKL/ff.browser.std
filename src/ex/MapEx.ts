
export interface MapExInterface<K, V>
{
	hasNot(key: K) : boolean;
	getUniqueId(): string;
	castTo<R>(func: (key: K, value: V) => R) : Map<K, R>;
	toArray<R>(func: (key: K, value: V) => R) : Array<R>;
}

export class MapEx<K, V> extends Map<K, V> implements MapExInterface<K, V>
{
	public hasNot(key: K) : boolean
	{
		return this.has(key) === false;
	}
	
	public getUniqueId() : string
	{
		const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);
		let id = generateId() as any; // eslint-disable-line -- TODO what to do now?
		while(this.has(id)) id = generateId();
		return id;
	}
	
	public castTo<K, R>(func: (key: K, value: V) => R) : Map<K, R>
	{
		this.forEach((value, key) => this.set(key, func(key as unknown as K, value) as unknown as V)); // TODO how to fix it?
		return this as unknown as Map<K, R>; // TODO fix it.
	}
	
	public toArray<R>(func: (key: K, value: V) => R) : Array<R>
	{
		const list: Array<R> = [];
		this.forEach((value, key) => list.push(func(key, value)));
		return list;
	}
}