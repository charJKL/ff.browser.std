import * as React from "react";
import { createContext } from "react";
import { Waiting } from "./FrontendCommReact";


export function createWaitingContext<T>(value: T) : React.Context<T | Waiting>
{
	return createContext<T | Waiting>(value);
}