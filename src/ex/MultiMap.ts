export class MultiMap<K, V>
{
	public $map : Map<K, V[]>;
	
	public constructor()
	{
		this.$map = new Map();
	}
	
	public has(key: K) : boolean
	{
		return this.$map.has(key);
	}
	
	public delete(key: K) : this
	{
		this.$map.delete(key);
		return this;
	}
	
	public set(key: K, value: V) : this 
	{
		const values = this.$map.get(key) ?? [];
					values.push(value);
		this.$map.set(key, values);
		return this;
	}
	
	public get(key: K) : V[] | undefined
	{
		return this.$map.get(key);
	}
}