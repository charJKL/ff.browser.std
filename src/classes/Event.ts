export type EventListener<D> = (data: D) => Promise<void> | void; // allow listeners can be `async`

export class Event<D>
{
	private $listeners : Array<EventListener<D>>
	
	public constructor()
	{
		this.$listeners = [];
	}
	
	public add(listener: EventListener<D>) : this
	{
		this.$listeners.push(listener);
		return this;
	}
	
	public remove(listener: EventListener<D>) : this
	{
		const index = this.$listeners.indexOf(listener);
		if(index >= 0) this.$listeners.splice(index, 1);
		return this;
	}
	
	public invoke(args: D) : this
	{
		this.$listeners.forEach(listener => listener(args));
		return this;
	}
}