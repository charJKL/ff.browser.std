export function isObject(value: any) : value is object
{
	return typeof value === "object";
}
export function isNotObject(value: any) : value is object
{
	return typeof value !== "object";
}