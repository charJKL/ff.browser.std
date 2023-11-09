import { BackgroundApiError } from "./BackgroundApiError";
import { isNotUndefined } from "../../ex/isUndefined";

type StorageArea = browser.storage.StorageArea;
type StorageBlueprint = {[key: string]: any};
type StorageItemNames<B extends StorageBlueprint> = keyof B;

export class BrowserStorage<B extends StorageBlueprint>
{
	private $storage: StorageArea;
	private $blueprint: B;
	
	public constructor(storage: StorageArea, blueprint: B)
	{
		this.$storage = storage;
		this.$blueprint = blueprint;
	}
	
	public get<I extends StorageItemNames<B>>(item: I) : Promise<B[I] | BackgroundApiError<"BrowserStorage">>
	{
		const entry = { [item]: this.$blueprint[item] };
		const flatReturnedObject = (obj: StorageBlueprint) : B[I] => obj[item as keyof StorageBlueprint];
		return this.$storage.get(entry).then(this.decode).then(flatReturnedObject).catch(this.catchHandler);
	}
	
	public save<I extends StorageItemNames<B>>(item: I, value: B[I]) : Promise<B[I] | BackgroundApiError<"BrowserStorage">>
	{
		const entry = { [item]: value }
		const returnSavedObject = () => value;
		return this.$storage.set(this.encode(entry)).then(returnSavedObject).catch(this.catchHandler);
	}
	
	public remove<I extends StorageItemNames<B>>(item: I): Promise<boolean | BackgroundApiError<"BrowserStorage">>
	{
		const returnTrueOnSuccess = () => true;
		return this.$storage.remove(item as string).then(returnTrueOnSuccess).catch(this.catchHandler);
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
	
	private catchHandler(reason: any) : BackgroundApiError<"BrowserStorage">
	{
		return new BackgroundApiError("BrowserStorage", "During api call browser throw internal error.", {reason: reason as string});
	}
}

type MapEncoded = { isMapInstance: "true", entries: Array<{key: any, value: any}> };
class BrowserStorageMapEncoder
{
	public static isMapInstance(value: any) : value is MapEncoded
	{
		return isNotUndefined(value.isMapInstance) && value.isMapInstance === "true";
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