import { MultiMap } from "./MultiMap";

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