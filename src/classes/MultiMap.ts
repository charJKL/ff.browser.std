export class MultiMap<K, V>
{
	public $map : Map<K, Array<V>>;
	
	public constructor()
	{
		this.$map = new Map();
	}
	
	public has(key: K) : boolean
	{
		return this.$map.has(key);
	}
	
	public delete(key: K, value: V) : this
	{
		const values = this.$map.get(key) ?? [];
		const index = values.indexOf(value);
		if(index >= 0) values.splice(index, 1);
		if(values.length == 0) this.$map.delete(key);
		return this;
	}
	
	public set(key: K, value: V) : this 
	{
		const values = this.$map.get(key) ?? [];
					values.push(value);
		this.$map.set(key, values);
		return this;
	}
	
	public get(key: K) : Array<V>
	{
		return this.$map.get(key) ?? [];
	}
}