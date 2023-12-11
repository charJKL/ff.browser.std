import { Waiting, BackgroundVar } from "./FrontendCommReact";

export function isWaiting(data: BackgroundVar<unknown>) : data is Waiting
{
	if(data instanceof Waiting) return true;
	return false;
}


