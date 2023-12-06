import { MultiMap } from "./MultiMap";

type Func<R = unknown> = (...args: unknown[]) => R;
type AssureParameters<T> = T extends Func ? Parameters<T> : never;
type AssureReturn<T> = T extends Func ? ReturnType<T> : never;
type OnlyFunctions<T> = keyof { [Key in keyof T as T[Key] extends Func ? Key : never]: T[Key] }
type Watched<T> = WatcherInterface<T> & T;

interface WatcherInterface<T>
{
	new <T>(obj: T) : Watched<T>;
	addBeforeCallWatcher<K extends OnlyFunctions<T>>(name: K, watcher: (...args: AssureParameters<T[K]>) => AssureParameters<T[K]>) : void;
	addAfterCallWatcher<K extends OnlyFunctions<T>>(name: K, watcher: (result: AssureReturn<T[K]>) => AssureReturn<T[K]>) : void;
}

function WatcherImplementation<T extends object>(obj: T) : Watched<T>
{
	const beforeWatchers = new MultiMap<keyof T, Func<unknown[]>>();
	const afterWatchers = new MultiMap<keyof T, Func>();
	const addBeforeCallWatcher = (name: OnlyFunctions<T>, watcher: Func<unknown[]>) => beforeWatchers.set(name, watcher);
	const addAfterCallWatcher = (name: OnlyFunctions<T>, watcher: Func) => afterWatchers.set(name, watcher);
	function wrapFunction(name: keyof T)
	{
		return function(...args: unknown[])
		{
			let vars = args;
			if(beforeWatchers.has(name)) vars = beforeWatchers.get(name)!.reduce((accumulator, watcher) => watcher(...accumulator), vars);
			const result = (obj[name] as Func).call(obj, ...vars);
			
			let final = result;
			if(afterWatchers.has(name)) final = afterWatchers.get(name)!.reduce((accumulator, watcher) => watcher(accumulator), final);
			return final;
		}
	}
	const handler = 
	{
		get(target: T, prop: string | symbol, receiver: unknown) : unknown
		{
			if(prop === "addBeforeCallWatcher") return addBeforeCallWatcher;
			if(prop === "addAfterCallWatcher") return addAfterCallWatcher;
			if(typeof target[prop as keyof T] === "function")
			{
				return wrapFunction(prop as keyof T);
			}
			return Reflect.get(target, prop, receiver);
		},
	}
	return new Proxy(obj, handler) as Watched<T>
}

export const Watcher = WatcherImplementation as unknown as WatcherInterface<unknown>;