import { isNotUndefined } from "./functions/isUndefined";

export class MarkedString extends String
{
	private $mark: number | undefined;
	
	public find(search: string) : this
	{
		const index = this.indexOf(search);
		this.$mark = index >= 0 ? index : undefined;
		return this;
	}
	
	public findBefore(search: string) : this
	{
		const index = this.lastIndexOf(search, this.$mark);
		this.$mark = index >= 0 ? index : undefined;
		return this;
	}
	
	public cut() : [string, string]
	{
		const mark = isNotUndefined(this.$mark) ? this.$mark : this.length;
		const firstPart = this.substring(0, mark);
		const secondPart = this.substring(mark + 1);
		return [firstPart, secondPart];
	}
}