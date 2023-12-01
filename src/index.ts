
export { SetupEvents } from "./api/background/SetupEvents";
export type { InstalledDetails, UpdateAvailableDetails } from "./api/background/SetupEvents";
export { BackgroundApiError } from "./api/background/BackgroundApiError";
export { BackgroundComm, type MessageCommArgs, type MessageCommListener, type MessageCommReturn } from "./api/background/BackgroundComm";
export { BrowserStorage } from "./api/background/BrowserStorage";
export { NetRequestBlock } from "./api/background/NetRequestBlock";


export { ScriptComm } from "./api/script/ScriptComm";

export  { type MessageSender } from "./api/Message";
export { MessageFailure } from "./api/MessageFailure";
export { isFailure } from "./api/isFailure";

export { ScriptCommReact } from "./react/ScriptCommReact";
export { createWaitingContext } from "./react/createWaitingContext";
export { wasRaised, isWaiting } from "./react/ScriptCommReact";

export { Event } from "./classes/Event";
export { Watcher } from "./classes/Watcher";
export { Debug } from "./classes/Debug";
export { TypedError} from "./classes/TypedError";

export { isError } from "./functions/isError";
export { isSuccess } from "./functions/isSuccess";
export { isTrue, isFalse } from "./functions/isBoolean";
export { isUndefined, isNotUndefined } from "./functions/isUndefined";
export { isNull, isNotNull } from "./functions/isNull";
export { isArray, isNotArray } from "./functions/isArray";

export { ResolveOverloadArgsException } from "./exceptions/ResolveOverloadArgsException";