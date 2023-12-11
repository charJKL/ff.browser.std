import { NotificationBlueprint } from "../../Message";
import { Notification } from "./FrontendCommReact";

export function wasRaised<T extends Notification<NotificationBlueprint>>(notification: T) : notification is Required<T>
{
	if(notification.wasRaised === true) return true;
	return false;
}
