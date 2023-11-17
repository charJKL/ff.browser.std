import { BackgroundApiError } from "./BackgroundApiError";
import { isError } from "../../ex/isError";
import { isUndefined } from "../../ex/isUndefined";
import { Debug } from "../../ex/Debug";


// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/declarativeNetRequest
type NetRequestRuleCondition = browser.declarativeNetRequest._RuleCondition;
type NetRequestRuleAction = browser.declarativeNetRequest._RuleAction;
type NetRequestRuleActionRedirect = browser.declarativeNetRequest._RuleActionRedirect;
type NetRequestUpdatePacket = browser.declarativeNetRequest._UpdateDynamicRulesOptions;
type NetRequestRegexpArgs = browser.declarativeNetRequest.RegexOptions;
type RegexpSupportedResult = browser.declarativeNetRequest.RegexpSupportedResult;

export type NetRequestRule = browser.declarativeNetRequest.Rule;
export type NetRequestRulePart = { regexp: string };
export type NetRequestRuleChange = { id: number, regexp: string };
export type NetRequestRuleId = { id: number };
export class NetRequestBlock
{
	private $redirect: string;
	private $debug: Debug;
	
	public constructor(redirect: string, debug: Debug)
	{
		this.$redirect = redirect;
		this.$debug = debug;
	}
	
	public async getRules() : Promise<NetRequestRule[] | BackgroundApiError<"NetRequestBlock">>
	{
		return browser.declarativeNetRequest.getDynamicRules().catch(this.catchHandler.bind(this, "getDynamicRules"));
	}
	
	public async addRule(rule: NetRequestRulePart) : Promise<NetRequestRule | BackgroundApiError<"NetRequestBlock"> | BackgroundApiError<"RegexpNotSupported">>
	{
		const uniqueId = await this.getUniqueId();
		if(isError("NetRequestBlock", uniqueId)) return uniqueId;
		
		const isRegexpValid = await this.isRegexpSupported(rule.regexp);
		if(isError("RegexpNotSupported", isRegexpValid)) return isRegexpValid;
		
		// TODO read and check if limits are not reached.
		
		const netRequestRule = {} as NetRequestRule;
					netRequestRule.priority = 1;
					netRequestRule.id = uniqueId;
					netRequestRule.condition = {} as NetRequestRuleCondition;
					netRequestRule.condition.regexFilter = rule.regexp;
					netRequestRule.condition.isUrlFilterCaseSensitive = false;
					netRequestRule.condition.resourceTypes = ["main_frame", "sub_frame"];
					netRequestRule.action = {} as NetRequestRuleAction;
					netRequestRule.action.type = "redirect";
					netRequestRule.action.redirect = {} as NetRequestRuleActionRedirect;
					netRequestRule.action.redirect.regexSubstitution = this.$redirect + "#\\0"; // suffix url with orginal target url
		
		const packet : NetRequestUpdatePacket = { addRules: [netRequestRule] };
		const result = await browser.declarativeNetRequest.updateDynamicRules(packet).catch(this.catchHandler.bind(this, "updateDynamicRules"));
		if(isError("NetRequestBlock",result)) return result;
		return netRequestRule;
	}
	
	public async updateRule(change: NetRequestRuleChange) : Promise<NetRequestRule | BackgroundApiError<"NetRequestBlock"> | BackgroundApiError<"RuleDoesntExist"> | BackgroundApiError<"RegexpNotSupported">>
	{
		const rule = await this.getRule(change.id);
		if(isError("NetRequestBlock", rule)) return rule;
		if(isError("RuleDoesntExist", rule)) return rule;
		
		const isRegexpValid = await this.isRegexpSupported(change.regexp);
		if(isError("RegexpNotSupported", isRegexpValid)) return isRegexpValid;
		
		rule.condition.regexFilter = change.regexp;
		const packet : NetRequestUpdatePacket = { addRules: [rule] };
		const result = await browser.declarativeNetRequest.updateDynamicRules(packet).catch(this.catchHandler.bind(this, "updateDynamicRules"));
		if(isError("NetRequestBlock", result)) return result;
		return rule;
	}

	public async deleteRule(ruleId: NetRequestRuleId) : Promise<boolean | BackgroundApiError<"NetRequestBlock"> | BackgroundApiError<"RuleDoesntExist">>
	{
		const rule = await this.getRule(ruleId.id);
		if(isError("NetRequestBlock", rule)) return rule;
		if(isError("RuleDoesntExist", rule)) return rule;
		
		const packet = {} as NetRequestUpdatePacket;
					packet.removeRuleIds = [rule.id];
		const result = await browser.declarativeNetRequest.updateDynamicRules(packet).catch(this.catchHandler.bind(this, "updateDynamicRules"));
		if(isError("NetRequestBlock", result)) return result;
		return true;
	}
	
	static RegexpValueForBlockingRuleIsNotSupported = "Provided regexp for blocking rule is not supported, it will not work.";
	public async isRegexpSupported(regexp: string) : Promise<boolean | BackgroundApiError<"RegexpNotSupported">>
	{
		const isNotSupported = (value: RegexpSupportedResult) : value is Required<RegexpSupportedResult> => value.isSupported === false;
		const regexpArgs = {} as NetRequestRegexpArgs;
					regexpArgs.regex = regexp;
					regexpArgs.isCaseSensitive = false;
					regexpArgs.requireCapturing = true;

		const isRegexSupportedResult = await browser.declarativeNetRequest.isRegexSupported(regexpArgs);
		if(isNotSupported(isRegexSupportedResult)) return new BackgroundApiError("RegexpNotSupported", NetRequestBlock.RegexpValueForBlockingRuleIsNotSupported, {regexp, reason: isRegexSupportedResult.reason}, this.$debug);
		return isRegexSupportedResult.isSupported;
	}
	
	static RuleWithWantedIdDoesntExist = "NetRequestBlockRule with wanted id doesn't exist.";
	private async getRule(ruleId: number) : Promise<NetRequestRule | BackgroundApiError<"NetRequestBlock"> | BackgroundApiError<"RuleDoesntExist">>
	{
		const rules = await this.getRules();
		if(isError("NetRequestBlock", rules)) return rules;
		
		const rule = rules.find((rule) => rule.id == ruleId);
		if(isUndefined(rule)) return new BackgroundApiError("RuleDoesntExist", NetRequestBlock.RuleWithWantedIdDoesntExist, {rules, ruleId}, this.$debug)
		return rule;
	}
	
	private async getUniqueId() : Promise<number | BackgroundApiError<"NetRequestBlock">>
	{
		const rules = await this.getRules();
		if(isError("NetRequestBlock", rules)) return rules;
		
		for(let i = 1; ; i++) // TODO here should be some limit, because it may happen that there will be no free id.
		{
			const rule = rules.at(i);
			if(isUndefined(rule)) return i;
		}
	}
	
	static CallToBrowserAPIMethodReturnException = "Call to one of `browser.declarativeNetRequest` methods return browser internal exception.";
	private catchHandler(method: string, reason: any) : BackgroundApiError<"NetRequestBlock">
	{
		return new BackgroundApiError("NetRequestBlock", NetRequestBlock.CallToBrowserAPIMethodReturnException, {method, reason}, this.$debug);
	}
}
