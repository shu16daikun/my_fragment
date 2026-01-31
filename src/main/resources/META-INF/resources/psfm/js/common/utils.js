// /psfm/js/common/utils.js

import { getLoger } from "/psfm/js/common/loger.js";

const LOG = getLoger("psfm.utils");

/* ===== [private] START ===== */

const _trim = (v) => {
	const span = LOG.logStart("_trim", { level: "TRACE" });

	const s = v == null ? "" : String(v);
	/* eslint-disable no-undef */
	const out = (typeof $ !== "undefined" && $.trim) ? $.trim(s) : s.trim();

	LOG.logEnd(span);
	return out;
};

/* ===== [private] END ===== */


/* ===== [exported] START ===== */

export const toStr = function(v) {
	const span = LOG.logStart("toStr", { level: "TRACE" });

	const out = v == null ? "" : String(v);

	LOG.logEnd(span);
	return out;
};

export const isBlank = function(str) {
	const span = LOG.logStart("isBlank", { level: "TRACE" });

	const out = _trim(str) === "";

	LOG.logEnd(span);
	return out;
};

export const isNotBlank = function(str) {
	const span = LOG.logStart("isNotBlank", { level: "TRACE" });

	const out = _trim(str) !== "";

	LOG.logEnd(span);
	return out;
};

export const isNull = function(v) {
	const span = LOG.logStart("isNull", { level: "TRACE" });

	const out = v === null || v === undefined;

	LOG.logEnd(span);
	return out;
};

export const isNotNull = function(v) {
	const span = LOG.logStart("isNotNull", { level: "TRACE" });

	const out = v !== null && v !== undefined;

	LOG.logEnd(span);
	return out;
};

export const isEquals = function(a, b) {
	const span = LOG.logStart("isEquals", { level: "TRACE" });

	const out = a === b;

	LOG.logEnd(span);
	return out;
};

export const isNotEquals = function(a, b) {
	const span = LOG.logStart("isNotEquals", { level: "TRACE" });

	const out = a !== b;

	LOG.logEnd(span);
	return out;
};

export const isEmptyArray = function(arr) {
	const span = LOG.logStart("isEmptyArray", { level: "TRACE" });

	const out = !Array.isArray(arr) || arr.length === 0;

	LOG.logEnd(span);
	return out;
};

export const isNotEmptyArray = function(arr) {
	const span = LOG.logStart("isNotEmptyArray", { level: "TRACE" });

	const out = Array.isArray(arr) && arr.length > 0;

	LOG.logEnd(span);
	return out;
};

export const isEmptyObject = function(obj) {
	const span = LOG.logStart("isEmptyObject", { level: "TRACE" });

	const out = obj != null && typeof obj === "object" && !Array.isArray(obj) && Object.keys(obj).length === 0;

	LOG.logEnd(span);
	return out;
};

export const isNotEmptyObject = function(obj) {
	const span = LOG.logStart("isNotEmptyObject", { level: "TRACE" });

	const out = obj != null && typeof obj === "object" && !Array.isArray(obj) && Object.keys(obj).length > 0;

	LOG.logEnd(span);
	return out;
};

export const toNumber = function(v) {
	const span = LOG.logStart("toNumber", { level: "TRACE" });

	if (typeof v === "number") {
		LOG.logEnd(span);
		return v;
	}
	if (typeof v === "string" && v.trim() === "") {
		LOG.logEnd(span);
		return NaN;
	}

	const out = Number(v);

	LOG.logEnd(span);
	return out;
};

/* ===== [exported] END ===== */
