
export function isNumber(value: any) : value is number
{
	return typeof value === "number";
}
export function isNotNumber(value: any) : value is unknown
{
	return typeof value !== "number";
}