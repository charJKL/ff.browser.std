declare namespace browser.declarativeNetRequest
{
	// @types/firefox-webext-browser is missing this function:
	export type RegexOptions = {regex: string, isCaseSensitive?: boolean, requireCapturing?: boolean };
	type RegexpSupportedResult = {isSupported: boolean, reason?: string};
	function isRegexSupported(arg: RegexOptions) : Promise<RegexpSupportedResult>;
}
