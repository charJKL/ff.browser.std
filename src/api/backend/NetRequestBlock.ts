import { BackendApiError } from "./BackendApiError";
import { isError } from "../../ex/isError";
import { isUndefined } from "../../ex/functions/isUndefined";
import { Debug } from "../../ex/Debug";
import { ArrayEx } from "../../ex";

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/declarativeNetRequest
type NetRequestRuleCondition = browser.declarativeNetRequest._RuleCondition;
type NetRequestRuleAction = browser.declarativeNetRequest._RuleAction;
type NetRequestRuleActionRedirect = browser.declarativeNetRequest._RuleActionRedirect;
type NetRequestUpdatePacket = browser.declarativeNetRequest._UpdateDynamicRulesOptions;
type IsRegexSupportedRegexOptions = browser.declarativeNetRequest._IsRegexSupportedRegexOptions;
type IsRegexSupportedReturnResult = browser.declarativeNetRequest._IsRegexSupportedReturnResult;


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
	
	static GetDynamicRulesMethodThrowInternalError = "`browser.declarativeNetRequest.getDynamicRules` method throw internal error.";
	static UpdateDynamicRulesMethodThrowInternalError = "`browser.declarativeNetRequest.updateDynamicRules` method throw internal error.";
	
	public async getRules() : Promise<NetRequestRule[] | BackendApiError<"NetRequestBlock">>
	{
		const returnBackendApiError = (reason: unknown) => new BackendApiError("NetRequestBlock", NetRequestBlock.GetDynamicRulesMethodThrowInternalError, {reason}, this.$debug);
		return browser.declarativeNetRequest.getDynamicRules().catch(returnBackendApiError);
	}
	
	public async addRule(rule: NetRequestRulePart) : Promise<NetRequestRule | BackendApiError<"NetRequestBlock"> | BackendApiError<"RegexpIsNotSupported">>
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
		const returnBackendApiError = (reason: unknown) => new BackendApiError("NetRequestBlock", NetRequestBlock.UpdateDynamicRulesMethodThrowInternalError, {reason}, this.$debug);
		const result = await browser.declarativeNetRequest.updateDynamicRules(packet).catch(returnBackendApiError);
		if(isError("NetRequestBlock",result)) return result;
		return netRequestRule;
	}
	
	public async updateRule(change: NetRequestRuleChange) : Promise<NetRequestRule | BackendApiError<"NetRequestBlock"> | BackendApiError<"RuleWasNotFound"> | BackendApiError<"RegexpIsNotSupported">>
	{
		const rule = await this.getRule(change.id);
		if(isError("NetRequestBlock", rule)) return rule;
		if(isError("RuleWasNotFound", rule)) return rule;
		
		const isRegexpValid = await this.isRegexpSupported(change.regexp);
		if(isError("RegexpIsNotSupported", isRegexpValid)) return isRegexpValid;
		
		rule.condition.regexFilter = change.regexp;
		const packet : NetRequestUpdatePacket = { removeRuleIds: [rule.id], addRules: [rule] };
		const returnBackendApiError = (reason: unknown) => new BackendApiError("NetRequestBlock", NetRequestBlock.UpdateDynamicRulesMethodThrowInternalError, {reason}, this.$debug);
		const result = await browser.declarativeNetRequest.updateDynamicRules(packet).catch(returnBackendApiError);
		if(isError("NetRequestBlock", result)) return result;
		return rule;
	}

	public async deleteRule(ruleId: NetRequestRuleId) : Promise<boolean | BackendApiError<"NetRequestBlock"> | BackendApiError<"RuleWasNotFound">>
	{
		const rule = await this.getRule(ruleId.id);
		if(isError("NetRequestBlock", rule)) return rule;
		if(isError("RuleWasNotFound", rule)) return rule;
		
		const packet = {} as NetRequestUpdatePacket;
					packet.removeRuleIds = [rule.id];
		const returnBackendApiError = (reason: unknown) => new BackendApiError("NetRequestBlock", NetRequestBlock.UpdateDynamicRulesMethodThrowInternalError, {reason}, this.$debug);
		const result = await browser.declarativeNetRequest.updateDynamicRules(packet).catch(returnBackendApiError);
		if(isError("NetRequestBlock", result)) return result;
		return true;
	}
	
	static RegexpValueForBlockingRuleIsNotSupported = "Provided regexp for blocking rule is not supported, it will not work.";
	public async isRegexpSupported(regexp: string) : Promise<boolean | BackendApiError<"RegexpIsNotSupported">>
	{
		const isNotSupported = (value: IsRegexSupportedReturnResult) : value is Required<IsRegexSupportedReturnResult> => value.isSupported === false;
		const regexpArgs = {} as IsRegexSupportedRegexOptions;
					regexpArgs.regex = regexp;
					regexpArgs.isCaseSensitive = false;
					regexpArgs.requireCapturing = true;

		const isRegexSupportedResult = await browser.declarativeNetRequest.isRegexSupported(regexpArgs);
		if(isNotSupported(isRegexSupportedResult)) return new BackendApiError("RegexpIsNotSupported", NetRequestBlock.RegexpValueForBlockingRuleIsNotSupported, {regexp, reason: isRegexSupportedResult.reason}, this.$debug);
		return isRegexSupportedResult.isSupported;
	}
	
	static RuleWithWantedIdDoesntExist = "NetRequestBlockRule with wanted id doesn't exist.";
	private async getRule(id: number) : Promise<NetRequestRule | BackendApiError<"NetRequestBlock"> | BackendApiError<"RuleWasNotFound">>
	{
		const rules = await this.getRules();
		if(isError("NetRequestBlock", rules)) return rules;
		
		const rule = rules.find((rule) => rule.id === id);
		if(isUndefined(rule)) return new BackendApiError("RuleWasNotFound", NetRequestBlock.RuleWithWantedIdDoesntExist, {id, rules}, this.$debug)
		return rule;
	}
	
	private async getUniqueId() : Promise<number | BackendApiError<"NetRequestBlock">>
	{
		const rules = await this.getRules();
		if(isError("NetRequestBlock", rules)) return rules;
		
		const rulesIds = new ArrayEx(...rules.map(r => r.id)).sortAsNumbers();
		for(let i = 0; i < rulesIds.length; i++)
		{
			if(rulesIds[i] !== i + 1) return i + 1;
		}
		return rulesIds.length + 1;
	}
}
