import { Debug } from "./Debug";

export type TypedErrorVariant = string;
export type TypedErrorInfo = unknown;

export class TypedError<V extends TypedErrorVariant, I extends TypedErrorInfo> extends Error
{
	public static Any = Symbol("AnyPossibleError");
	private $variant : V;
	private $info : I;
	private $parent: TypedError<string, unknown> | null
	private $debug?: Debug;
	
	constructor(variant: V, message: string, info: I, parent: TypedError<string, unknown> | null, debug?: Debug)
	{
		super(message);
		this.$debug = debug;
		this.$variant = variant;
		this.$info = info;
		this.$parent = parent;
		this.$debug?.log(`${this.constructor.name}, variant=$0, message=$1, info=$2, parent=$3`, Debug.Error, this.variant, this.message, this.info, this.$parent);
	}
	
	public get variant() : V
	{
		return this.$variant;
	}
	
	public get info(): I
	{
		return this.$info;
	}
	
	public get debug(): Debug | undefined
	{
		return this.$debug
	}
}