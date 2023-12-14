import { StringEx } from "./StringEx";



test("Check if cutting providing text as place to cut work correctly", () =>{
	
	const text = "This is first part of sentence, this is second part.";
	const [first, second] = StringEx.cut(text, ",");
	
	expect(first).toEqual("This is first part of sentence");
	expect(second).toEqual(" this is second part.");
});

test("Check if cutting providing string length return proper values", () =>{
	
	const text = "This is first part of sentence, this is second part.";
	const [first, second] = StringEx.cut(text, text.length);
	
	expect(first).toEqual("This is first part of sentence, this is second part.");
	expect(second).toEqual("");
});