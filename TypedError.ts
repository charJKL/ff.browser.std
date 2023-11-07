
export type TypedErrorVariant = string;
export type TypedErrorInfo = any;

export class TypedError<V extends TypedErrorVariant, I extends TypedErrorInfo> extends Error
{
	private $variant : V;
	private $info : I;
	
	constructor(variant: V, message: string, info: I)
	{
		super(message);
		this.$variant = variant;
		this.$info = info;
	}
	
	public get variant() : V
	{
		return this.$variant;
	}
	
	public get info(): I
	{
		return this.$info;
	}
}