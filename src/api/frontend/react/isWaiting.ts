import { Waiting, BackgroundVar } from "./ScriptCommReact";

export function isWaiting(data: BackgroundVar<unknown>) : data is Waiting
{
	if(data instanceof Waiting) return true;
	return false;
}


