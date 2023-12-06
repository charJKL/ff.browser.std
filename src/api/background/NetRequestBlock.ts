import { BackgroundApiError } from "./BackgroundApiError";
import { isError } from "../../functions/isError";
import { isUndefined } from "../../functions/isUndefined";
import { Debug } from "../../classes/Debug";


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
	
	public async addRule(rule: NetRequestRulePart) : Promise<NetRequestRule | BackgroundApiError<"NetRequestBlock"> | BackgroundApiError<"RegexpIsNotSupported">>
	{
		const isRegexpValid = await this.isRegexpSupported(rule.regexp);
		if(isError("RegexpIsNotSupported", isRegexpValid)) return isRegexpValid;
		
		const uniqueId = await this.getUniqueId();
		if(isError("NetRequestBlock", uniqueId)) return uniqueId;
		
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
	
	public async updateRule(change: NetRequestRuleChange) : Promise<NetRequestRule | BackgroundApiError<"NetRequestBlock"> | BackgroundApiError<"RuleWasNotFound"> | BackgroundApiError<"RegexpIsNotSupported">>
	{
		const rule = await this.getRule(change.id);
		if(isError("NetRequestBlock", rule)) return rule;
		if(isError("RuleWasNotFound", rule)) return rule;
		
		const isRegexpValid = await this.isRegexpSupported(change.regexp);
		if(isError("RegexpIsNotSupported", isRegexpValid)) return isRegexpValid;
		
		rule.condition.regexFilter = change.regexp;
		const packet : NetRequestUpdatePacket = { removeRuleIds: [rule.id], addRules: [rule] };
		const result = await browser.declarativeNetRequest.updateDynamicRules(packet).catch(this.catchHandler.bind(this, "updateDynamicRules"));
		if(isError("NetRequestBlock", result)) return result;
		return rule;
	}

	public async deleteRule(ruleId: NetRequestRuleId) : Promise<boolean | BackgroundApiError<"NetRequestBlock"> | BackgroundApiError<"RuleWasNotFound">>
	{
		const rule = await this.getRule(ruleId.id);
		if(isError("NetRequestBlock", rule)) return rule;
		if(isError("RuleWasNotFound", rule)) return rule;
		
		const packet = {} as NetRequestUpdatePacket;
					packet.removeRuleIds = [rule.id];
		const result = await browser.declarativeNetRequest.updateDynamicRules(packet).catch(this.catchHandler.bind(this, "updateDynamicRules"));
		if(isError("NetRequestBlock", result)) return result;
		return true;
	}
	
	static RegexpValueForBlockingRuleIsNotSupported = "Provided regexp for blocking rule is not supported, it will not work.";
	public async isRegexpSupported(regexp: string) : Promise<boolean | BackgroundApiError<"RegexpIsNotSupported">>
	{
		const isNotSupported = (value: RegexpSupportedResult) : value is Required<RegexpSupportedResult> => value.isSupported === false;
		const regexpArgs = {} as NetRequestRegexpArgs;
					regexpArgs.regex = regexp;
					regexpArgs.isCaseSensitive = false;
					regexpArgs.requireCapturing = true;

		const isRegexSupportedResult = await browser.declarativeNetRequest.isRegexSupported(regexpArgs);
		if(isNotSupported(isRegexSupportedResult)) return new BackgroundApiError("RegexpIsNotSupported", NetRequestBlock.RegexpValueForBlockingRuleIsNotSupported, {regexp, reason: isRegexSupportedResult.reason}, this.$debug);
		return isRegexSupportedResult.isSupported;
	}
	
	static RuleWithWantedIdDoesntExist = "NetRequestBlockRule with wanted id doesn't exist.";
	private async getRule(id: number) : Promise<NetRequestRule | BackgroundApiError<"NetRequestBlock"> | BackgroundApiError<"RuleWasNotFound">>
	{
		const rules = await this.getRules();
		if(isError("NetRequestBlock", rules)) return rules;
		
		const rule = rules.find((rule) => rule.id === id);
		if(isUndefined(rule)) return new BackgroundApiError("RuleWasNotFound", NetRequestBlock.RuleWithWantedIdDoesntExist, {id, rules}, this.$debug)
		return rule;
	}
	
	private async getUniqueId() : Promise<number | BackgroundApiError<"NetRequestBlock">>
	{
		const rules = await this.getRules();
		if(isError("NetRequestBlock", rules)) return rules;
		
		const rulesIds = rules.map(r => r.id).sortAsNumbers();
		for(let i = 0; i < rulesIds.length; i++)
		{
			if(rulesIds[i] !== i + 1) return i + 1;
		}
		return rulesIds.length + 1;
	}
	
	
	// TODO remove this method, return Error locally.
	static CallToBrowserAPIMethodReturnException = "Call to one of `browser.declarativeNetRequest` methods return browser internal exception.";
	private catchHandler(method: string, reason: unknown) : BackgroundApiError<"NetRequestBlock">
	{
		return new BackgroundApiError("NetRequestBlock", NetRequestBlock.CallToBrowserAPIMethodReturnException, {method, reason}, this.$debug);
	}
}
