import { MultiMap, IComparable } from "./MultiMap";

test("Adding multiple values will store it", () =>{
	const map = new MultiMap();
	map.set("colors", "blue");
	map.set("colors", "green");
	
	expect(map.get("colors")).toEqual(["blue", "green"]);
});

test("Removing value from previously multiple value removes correct one", () =>{
	const map = new MultiMap();
	map.set("colors", "blue");
	map.set("colors", "green");
	
	expect(map.get("colors")).toEqual(["blue", "green"]);
	map.delete("colors", "blue");
	expect(map.get("colors")).toEqual(["green"]);
});


test("Remove complex value implementing `IComparable` interface remove correct value", () => {
	const map = new MultiMap();
	const first = {};
	const second = 23;
	
	const firstEntry = new MultiMapRecord(first, second)
	const secondEntry = new MultiMapRecord(first, 34)
	
	map.set("colors", firstEntry);
	map.set("colors", secondEntry);
	
	map.delete("colors", new MultiMapRecord(first, 34));
	
	expect(map.get("colors").length).toBe(1);
	expect(map.get("colors")[0]).toEqual(firstEntry)
});

class MultiMapRecord implements IComparable<MultiMapRecord>
{
	public first: unknown;
	public second: unknown;
	
	public constructor(first: unknown, second: unknown)
	{
		this.first = first;
		this.second = second;
	}
	
	public isEqual(this: MultiMapRecord, obj: MultiMapRecord) : boolean
	{
		return this.first === obj.first && this.second === obj.second;
	}
}