export function isSymbol(value: any) : value is symbol
{
	return typeof value === "symbol";
}
export function isNotSymbol(value: any) : value is unknown
{
	return typeof value !== "symbol";
}