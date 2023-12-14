export function isTrue(value: any) : value is boolean
{
	return typeof value === "boolean" && value === true;
}
export function isFalse(value: any): value is boolean
{
	return typeof value === "boolean" && value === false;
}