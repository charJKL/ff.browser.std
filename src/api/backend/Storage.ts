import { BackendApiError } from "./BackendApiError";
import { Debug } from "../../ex/Debug";
import { hasProp } from "../../ex/functions/hasProp";

type StorageArea = browser.storage.StorageArea;
type StorageBlueprint = {[key: string]: unknown};
type StorageItemNames<B extends StorageBlueprint> = keyof B;

export class Storage<B extends StorageBlueprint>
{
	private $storage: StorageArea;
	private $blueprint: B;
	private $debug : Debug;
	
	public constructor(storage: StorageArea, blueprint: B, debug: Debug)
	{
		this.$storage = storage;
		this.$blueprint = blueprint;
		this.$debug = debug;
	}
	
	static GetMethodThrowInternalError = "`browser.storage.get()` method throw internal error.";
	static SaveMethodThrowInternalError = "`browser.storage.set()` method throw internal error.";
	static RemoveMethodThrowInternalError = "`browser.storage.remove()` method throw internal error.";
	
	public get<K extends StorageItemNames<B>>(key: K) : Promise<B[K] | BackendApiError<"BrowserStorage">>
	{
		const entry = { [key]: this.$blueprint[key] };
		const unserialize = (obj: StorageBlueprint) => this.decode(obj);
		const flatReturnedObject = (obj: StorageBlueprint) : B[K] => obj[key as keyof StorageBlueprint] as B[K];
		const returnBackendApiError = (reason: unknown) => new BackendApiError("BrowserStorage", Storage.GetMethodThrowInternalError, {key, reason}, this.$debug);
		return this.$storage.get(entry).then(unserialize).then(flatReturnedObject).catch(returnBackendApiError);
	}
	
	public save<I extends StorageItemNames<B>>(key: I, value: B[I]) : Promise<B[I] | BackendApiError<"BrowserStorage">>
	{
		const entry = { [key]: value }
		const serialize = (obj: StorageBlueprint) => this.encode(obj);
		const returnSavedObject = () => value;
		const returnBackendApiError = (reason: unknown) => new BackendApiError("BrowserStorage", Storage.SaveMethodThrowInternalError, {key, reason}, this.$debug);
		return this.$storage.set(serialize(entry)).then(returnSavedObject).catch(returnBackendApiError);
	}
	
	public remove<I extends StorageItemNames<B>>(key: I): Promise<boolean | BackendApiError<"BrowserStorage">>
	{
		const returnTrueOnSuccess = () => true;
		const returnBackendApiError = (reason: unknown) => new BackendApiError("BrowserStorage", Storage.RemoveMethodThrowInternalError, {key, reason}, this.$debug);
		return this.$storage.remove(key as string).then(returnTrueOnSuccess).catch(returnBackendApiError);
	}
	
	private encode(blueprint: StorageBlueprint) : StorageBlueprint
	{
		for(const key in blueprint)
		{
			const value = blueprint[key];
			if(BrowserStorageMapEncoder.isMapInstance(value)) blueprint[key] = BrowserStorageMapEncoder.encode(value);
		}
		return blueprint;
	}
	
	private decode(blueprint: StorageBlueprint) : StorageBlueprint
	{
		for(const key in blueprint)
		{
			const value = blueprint[key];
			if(BrowserStorageMapEncoder.isMapEncodedInstane(value)) blueprint[key] = BrowserStorageMapEncoder.decode(value);
		}
		return blueprint;
	}
}

// TODO move this class to diffrent file.
type MapEncoded = { isMapInstance: "true", entries: Array<{key: unknown, value: unknown}> };
class BrowserStorageMapEncoder
{
	public static isMapInstance(value: unknown) : value is Map<unknown, unknown>
	{
		return value instanceof Map;
	}
	
	public static isMapEncodedInstane(value: unknown) : value is MapEncoded
	{
		const hasIsMapInstanceProp = hasProp(value, "isMapInstance");
		const hasEntriesProp = hasProp(value, "entries");
		return hasIsMapInstanceProp && hasEntriesProp;
	}
	
	public static encode(value: Map<unknown, unknown>) : MapEncoded
	{
		const map : MapEncoded = { isMapInstance: "true", entries: [] };
		for(const [key, entry] of value) map.entries.push({key: key, value: entry});
		return map;
	}
	
	public static decode(value: MapEncoded) : Map<unknown, unknown>
	{
		const map = new Map();
		for(const entry of value.entries) map.set(entry.key, entry.value);
		return map;
	}
}