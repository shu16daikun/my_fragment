/**
 * ----------------------------------------------------------------
 * icons.js（SVG <use> を使った軽量アイコン生成）
 * ----------------------------------------------------------------
 */

import { getLoger } from "/psfm/js/common/loger.js";

const LOG = getLoger("psfm.icons");

/* ===== [private] START ===== */

const IDS = Object.freeze({
	INFO: "info-circle",
	CHECK: "check-circle",
	WARN: "exclamation-triangle",
	ERROR: "exclamation-triangle", // ※ WARNと同一グリフ利用
	LIST: "list"
});
const CLS = Object.freeze({
	ALERT_ICON: "my-alert-icon",
	NAVBAR_TOGGLER: "my-navbar-toggler-icon",
	VALIDATION_ICON: "my-validation-icon",
	VALID: "valid",
	INVALID: "invalid"
});
const DEF = Object.freeze({
	SIZE: 20,
	NAV_SIZE: 24,
	VALID_SIZE: 16,
	FILL: "currentColor"
});

/* 小ユーティリティ */
const isProvided = (v) => {
	const span = LOG.logStart("isProvided", { level: "TRACE" });
	const out = v !== undefined && v !== null;
	LOG.logEnd(span);
	return out;
};

const isPositive = (n) => {
	const span = LOG.logStart("isPositive", { level: "TRACE" });
	const out = Number.isFinite(n) && n > 0;
	LOG.logEnd(span);
	return out;
};

const normalizeSize = (n, fallback) => {
	const span = LOG.logStart("normalizeSize", { level: "TRACE" });
	const out = isPositive(n) ? n : fallback;
	LOG.logEnd(span);
	return out;
};

const joinClass = (a, b) => {
	const span = LOG.logStart("joinClass", { level: "TRACE" });
	const out = String([a, b].filter(isProvided).join(" ")).trim();
	LOG.logEnd(span);
	return out;
};

/**
 * createIcon
 * @returns {jQuery}
 */
function createIcon(id, className, size, fill) {
	const span = LOG.logStart("createIcon", { level: "TRACE" });

	const w = normalizeSize(size, DEF.SIZE);
	const f = isProvided(fill) ? fill : DEF.FILL;
	const cls = joinClass(className, null);

	const $out = $(
		`<svg class="${cls}" width="${w}" height="${w}" aria-hidden="true" fill="${f}">
			<use href="#${id}"></use>
		</svg>`
	);

	LOG.logEnd(span);
	return $out;
}

/** アイコンマップ（カテゴリ別） */
const ICON = Object.freeze({
	alert: Object.freeze({
		info: () => createIcon(IDS.INFO, CLS.ALERT_ICON, DEF.SIZE, DEF.FILL),
		check: () => createIcon(IDS.CHECK, CLS.ALERT_ICON, DEF.SIZE, DEF.FILL),
		warn: () => createIcon(IDS.WARN, CLS.ALERT_ICON, DEF.SIZE, DEF.FILL),
		error: () => createIcon(IDS.ERROR, CLS.ALERT_ICON, DEF.SIZE, DEF.FILL)
	}),
	navbar: Object.freeze({
		list: () => createIcon(IDS.LIST, CLS.NAVBAR_TOGGLER, DEF.NAV_SIZE, DEF.FILL)
	}),
	validation: Object.freeze({
		valid: () => createIcon(
			IDS.CHECK,
			joinClass(CLS.VALIDATION_ICON, CLS.VALID),
			DEF.VALID_SIZE,
			DEF.FILL
		),
		invalid: () => createIcon(
			IDS.WARN,
			joinClass(CLS.VALIDATION_ICON, CLS.INVALID),
			DEF.VALID_SIZE,
			DEF.FILL
		)
	})
});

/* ===== [private] END ===== */


/* ===== [public/protected] START ===== */

export const setIconInfo = () => {
	const span = LOG.logStart("setIconInfo", { level: "TRACE" });
	const out = ICON.alert.info();
	LOG.logEnd(span);
	return out;
};

export const setIconCheck = () => {
	const span = LOG.logStart("setIconCheck", { level: "TRACE" });
	const out = ICON.alert.check();
	LOG.logEnd(span);
	return out;
};

export const setIconWarn = () => {
	const span = LOG.logStart("setIconWarn", { level: "TRACE" });
	const out = ICON.alert.warn();
	LOG.logEnd(span);
	return out;
};

export const setIconError = () => {
	const span = LOG.logStart("setIconError", { level: "TRACE" });
	const out = ICON.alert.error();
	LOG.logEnd(span);
	return out;
};

export const setIconList = () => {
	const span = LOG.logStart("setIconList", { level: "TRACE" });
	const out = ICON.navbar.list();
	LOG.logEnd(span);
	return out;
};

export const setIconValid = () => {
	const span = LOG.logStart("setIconValid", { level: "TRACE" });
	const out = ICON.validation.valid();
	LOG.logEnd(span);
	return out;
};

export const setIconInvalid = () => {
	const span = LOG.logStart("setIconInvalid", { level: "TRACE" });
	const out = ICON.validation.invalid();
	LOG.logEnd(span);
	return out;
};

/* ===== [public/protected] END ===== */
