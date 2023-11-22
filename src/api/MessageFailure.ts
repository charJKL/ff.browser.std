export type MessageFailureVariant = string;
export type MessageFailureInfo = any;

export class MessageFailure<V extends MessageFailureVariant, I extends MessageFailureInfo>
{
	private scope = "MessageFailureScope" as const; // to differentiate from other errors inherited from `TypedError`, important because of duck typing.
	
	public static Any = Symbol("AnyPossibleFailure");
	private $variant: V;
	private $message: string;
	private $info: I;
	
	constructor(variant: V, message: string, info: I)
	{
		this.$variant = variant;
		this.$message = message;
		this.$info = info;
	}
	
	public get variant() : V
	{
		return this.$variant;
	}
	
	public get message(): string
	{
		return this.$message;
	}
	
	public get info(): I
	{
		return this.$info;
	}
}

