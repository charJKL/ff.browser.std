import * as React from "react";
import { createContext } from "react";
import { Waiting } from "./ScriptCommReact";


export function createWaitingContext<T>(value: T) : React.Context<T | Waiting>
{
	return createContext<T | Waiting>(value);
}