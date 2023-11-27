import { createContext } from "react";
import { Waiting } from "./ScriptCommReact";
import * as React from "react";

export function createWaitingContext<T>(value: T) : React.Context<T | Waiting>
{
	return createContext<T | Waiting>(value);
}