export function isArray<T>(value: any) : value is T[]
{
	return Array.isArray(value);
}
export function isNotArray<T>(value: T) : value is Exclude<T, any[]>
{
	return Array.isArray(value) === false;
}