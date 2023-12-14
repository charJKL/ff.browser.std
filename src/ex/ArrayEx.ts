import { InvalidOperationException } from "../exceptions/InvalidOperationException";
import { isNotNumber } from "./functions/isNumber";

export class ArrayEx
{
	public static contains<T>(array: Array<T>, item: T): boolean
	{
		return array.includes(item);
	}
	
	public static notContains<T>(array: Array<T>, item: T): boolean
	{
		return array.includes(item) === false;
	}
	
	public static isEmpty<T>(array: Array<T>): boolean
	{
		return array.length === 0;
	}
	
	public static sortAsNumbers<T>(array: Array<T>): Array<T>
	{
		if(ArrayEx.isEmpty(array)) return [];
		if(isNotNumber(array[0])) throw new InvalidOperationException("Array doesn't contains numbers.");
		return array.sort((a, b) => (a as number) - (b as number));
	}
}