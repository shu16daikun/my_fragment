// /psfm/js/fragment/browser-guard.js
// 依存：jQuery（$）

import { getLoger } from "/psfm/js/common/loger.js";

const LOG = getLoger("psfm.browser-guard");

const NAV_TYPE = Object.freeze({
	NAVIGATE: "navigate",
	RELOAD: "reload",
	BACK_FORWARD: "back_forward",
	UNKNOWN: "unknown"
});

const STORAGE_LATEST_TOKEN = "psfm.latestPageToken";
const STORAGE_VISITED_TOKENS = "psfm.visitedPageTokens";

/* try を表に出さないための安全ラッパ（ログ用じゃなく、環境差で落ちるのを防ぐ用） */
const safeSessionGet = (key) => {
	try { return window.sessionStorage.getItem(key); } catch (_e) { return null; }
};
const safeSessionSet = (key, val) => {
	try { window.sessionStorage.setItem(key, val); return true; } catch (_e) { return false; }
};
const safeJsonParseArray = (raw) => {
	try {
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch (_e) {
		return [];
	}
};

const detectPerfType = () => {
	const span = LOG.logStart("detectPerfType", { level: "TRACE" });

	if (window.performance && performance.getEntriesByType) {
		const entries = performance.getEntriesByType("navigation");
		if (entries && entries.length > 0) {
			const type = entries[0].type || NAV_TYPE.UNKNOWN;
			LOG.debug("detectPerfType: navEntry.type={0}", type);
			LOG.logEnd(span);
			return type;
		}
	}

	if (window.performance && performance.navigation) {
		let type = NAV_TYPE.UNKNOWN;
		switch (performance.navigation.type) {
			case performance.navigation.TYPE_RELOAD:
				type = NAV_TYPE.RELOAD;
				break;
			case performance.navigation.TYPE_BACK_FORWARD:
				type = NAV_TYPE.BACK_FORWARD;
				break;
			case performance.navigation.TYPE_NAVIGATE:
				type = NAV_TYPE.NAVIGATE;
				break;
			default:
				type = NAV_TYPE.UNKNOWN;
		}
		LOG.debug("detectPerfType: legacy.type={0}", type);
		LOG.logEnd(span);
		return type;
	}

	LOG.debug("detectPerfType: no performance api -> UNKNOWN");
	LOG.logEnd(span);
	return NAV_TYPE.UNKNOWN;
};

const getPageTokenFromMeta = () => {
	const span = LOG.logStart("getPageTokenFromMeta", { level: "TRACE" });
	const token = $("meta[name='page-token']").attr("content") || "";
	LOG.debug("getPageTokenFromMeta: tokenLen={0}", token.length);
	LOG.logEnd(span);
	return token;
};

const loadVisitedTokens = () => {
	const span = LOG.logStart("loadVisitedTokens", { level: "TRACE" });

	const raw = safeSessionGet(STORAGE_VISITED_TOKENS);
	if (!raw) {
		LOG.debug("loadVisitedTokens: empty");
		LOG.logEnd(span);
		return [];
	}

	const tokens = safeJsonParseArray(raw);
	LOG.debug("loadVisitedTokens: count={0}", tokens.length);

	LOG.logEnd(span);
	return tokens;
};

const saveVisitedTokens = (tokens) => {
	const span = LOG.logStart("saveVisitedTokens", { level: "TRACE" });

	const ok = safeSessionSet(STORAGE_VISITED_TOKENS, JSON.stringify(tokens));
	if (!ok) {
		LOG.warn("saveVisitedTokens: sessionStorage set failed");
	}

	LOG.debug("saveVisitedTokens: saved count={0}", Array.isArray(tokens) ? tokens.length : 0);
	LOG.logEnd(span);
};

const dispatchNavigationEvents = (type, originalEvent) => {
	const span = LOG.logStart("dispatchNavigationEvents", { level: "TRACE" });

	const detail = { type, originalEvent };
	LOG.debug("dispatchNavigationEvents: type={0}", type);

	$(window).trigger("psfm:browserNavigation", detail);

	if (type === NAV_TYPE.BACK_FORWARD) {
		$(window).trigger("psfm:browserBackOrForward", detail);
	}
	if (type === NAV_TYPE.RELOAD) {
		$(window).trigger("psfm:browserReload", detail);
	}

	LOG.logEnd(span);
};

export const setBrowserNavigationGuard = function() {
	const span = LOG.logStart("setBrowserNavigationGuard");

	LOG.debug("setBrowserNavigationGuard: bind pageshow handler");
	$(window).off("pageshow.psfmBrowserGuard");

	$(window).on("pageshow.psfmBrowserGuard", (event) => {
		const spanEvt = LOG.logStart("pageshowHandler", { level: "TRACE" });

		const originalEvent = event.originalEvent || event;
		const isBFCache = !!(originalEvent && originalEvent.persisted);

		const currentToken = getPageTokenFromMeta();
		const latestToken = safeSessionGet(STORAGE_LATEST_TOKEN);

		const visitedTokens = loadVisitedTokens();
		const hasSeenCurrent = !!currentToken && visitedTokens.indexOf(currentToken) !== -1;

		let navType = NAV_TYPE.NAVIGATE;

		const perfType = detectPerfType();
		if (perfType === NAV_TYPE.RELOAD || perfType === "reload") {
			navType = NAV_TYPE.RELOAD;
		} else if (perfType === NAV_TYPE.BACK_FORWARD || perfType === "back_forward") {
			navType = NAV_TYPE.BACK_FORWARD;
		}

		if (isBFCache && navType === NAV_TYPE.NAVIGATE) {
			navType = NAV_TYPE.BACK_FORWARD;
		}

		if (!isBFCache && navType === NAV_TYPE.NAVIGATE) {
			if (currentToken && latestToken && currentToken !== latestToken && hasSeenCurrent) {
				navType = NAV_TYPE.BACK_FORWARD;
			}
		}

		LOG.debug(
			"pageshow: persisted={0} perfType={1} navType={2} curLen={3} latestLen={4} seen={5} visitedCount={6}",
			isBFCache,
			perfType,
			navType,
			currentToken ? currentToken.length : 0,
			latestToken ? latestToken.length : 0,
			hasSeenCurrent,
			visitedTokens.length
		);

		dispatchNavigationEvents(navType, originalEvent);

		if (currentToken) {
			if (!hasSeenCurrent) {
				visitedTokens.push(currentToken);
				saveVisitedTokens(visitedTokens);
			}
			safeSessionSet(STORAGE_LATEST_TOKEN, currentToken);
			LOG.debug("pageshow: latestToken updated");
		}

		LOG.logEnd(spanEvt);
	});

	LOG.logEnd(span);
};

export const setDoubleSubmitGuard = function() {
	const span = LOG.logStart("setDoubleSubmitGuard");

	LOG.debug("setDoubleSubmitGuard: bind submit handler");
	$(document).off("submit.psfmBrowserGuard", "form[data-psfm-prevent-double-submit]");

	$(document).on(
		"submit.psfmBrowserGuard",
		"form[data-psfm-prevent-double-submit]",
		(event) => {
			const spanEvt = LOG.logStart("doubleSubmitHandler", { level: "TRACE" });

			const $form = $(event.currentTarget);

			if ($form.data("psfmSubmitted") === true) {
				LOG.debug("doubleSubmit: prevented (already submitted)");
				event.preventDefault();
				LOG.logEnd(spanEvt);
				return;
			}

			$form.data("psfmSubmitted", true);

			$form
				.find("button[type='submit'], input[type='submit']")
				.prop("disabled", true)
				.addClass("psfm-double-submit-disabled");

			LOG.debug("doubleSubmit: marked submitted + disabled buttons");
			LOG.logEnd(spanEvt);
		}
	);

	LOG.logEnd(span);
};

export const setBrowserGuard = function() {
	const span = LOG.logStart("setBrowserGuard");
	LOG.debug("setBrowserGuard: start");

	setBrowserNavigationGuard();
	setDoubleSubmitGuard();

	LOG.logEnd(span);
};

export const BROWSER_NAV_TYPE = NAV_TYPE;
window.psfmBrowserGuard = { NAV_TYPE };
