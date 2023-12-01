import { BackgroundApiError } from "./BackgroundApiError";
import { Debug } from "../../classes/Debug";
import { isNotUndefined } from "../../functions/isUndefined";
import { isArray } from "../../functions/isArray";
import { isNotNull } from "../../functions/isNull";
import { hasProp } from "../../functions/hasProp";

type StorageArea = browser.storage.StorageArea;
type StorageBlueprint = {[key: string]: any};
type StorageItemNames<B extends StorageBlueprint> = keyof B;

export class BrowserStorage<B extends StorageBlueprint>
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
	
	public get<K extends StorageItemNames<B>>(key: K) : Promise<B[K] | BackgroundApiError<"BrowserStorage">>
	{
		const entry = { [key]: this.$blueprint[key] };
		const unserialize = (obj: StorageBlueprint) => this.decode(obj);
		const flatReturnedObject = (obj: StorageBlueprint) : B[K] => obj[key as keyof StorageBlueprint];
		const returnBackgroundApiError = (reason: any) => new BackgroundApiError("BrowserStorage", BrowserStorage.GetMethodThrowInternalError, {key, reason}, this.$debug);
		return this.$storage.get(entry).then(unserialize).then(flatReturnedObject).catch(returnBackgroundApiError);
	}
	
	public save<I extends StorageItemNames<B>>(key: I, value: B[I]) : Promise<B[I] | BackgroundApiError<"BrowserStorage">>
	{
		const entry = { [key]: value }
		const serialize = (obj: StorageBlueprint) => this.encode(obj);
		const returnSavedObject = () => value;
		const returnBackgroundApiError = (reason: any) => new BackgroundApiError("BrowserStorage", BrowserStorage.SaveMethodThrowInternalError, {key, reason}, this.$debug);
		return this.$storage.set(serialize(entry)).then(returnSavedObject).catch(returnBackgroundApiError);
	}
	
	public remove<I extends StorageItemNames<B>>(key: I): Promise<boolean | BackgroundApiError<"BrowserStorage">>
	{
		const returnTrueOnSuccess = () => true;
		const returnBackgroundApiError = (reason: any) => new BackgroundApiError("BrowserStorage", BrowserStorage.RemoveMethodThrowInternalError, {key, reason}, this.$debug);
		return this.$storage.remove(key as string).then(returnTrueOnSuccess).catch(returnBackgroundApiError);
	}
	
	private encode(value: StorageBlueprint) : StorageBlueprint
	{
		for(const key in value)
		{
			if(BrowserStorageMapEncoder.isMapInstance(value[key])) value[key] = BrowserStorageMapEncoder.encode(value[key]);
		}
		return value;
	}
	
	private decode(result: StorageBlueprint) : StorageBlueprint
	{
		for(const key in result)
		{
			if(BrowserStorageMapEncoder.isMapInstance(result[key])) result[key] = BrowserStorageMapEncoder.decode(result[key]);
		}
		return result;
	}
}

type MapEncoded = { isMapInstance: "true", entries: Array<{key: any, value: any}> };
class BrowserStorageMapEncoder
{
	public static isMapInstance(value: unknown) : value is MapEncoded
	{
		const hasIsMapInstanceProp = hasProp(value, "isMapInstance");
		const hasEntriesProp = hasProp(value, "entries");
		return hasIsMapInstanceProp && hasEntriesProp;
	}
	
	public static encode(value: Map<any, any>) : MapEncoded
	{
		const map : MapEncoded = { isMapInstance: "true", entries: [] };
		for(const [key, entry] of value) map.entries.push({key: key, value: entry});
		return map;
	}
	
	public static decode(value: MapEncoded) : Map<any, any>
	{
		const map = new Map();
		for(const entry of value.entries) map.set(entry.key, entry.value);
		return map;
	}
}