/**
 * ----------------------------------------------------------------
 * form.js（フロートラベル制御）
 * ----------------------------------------------------------------
 */

import { getLoger } from "/psfm/js/common/loger.js";

const LOG = getLoger("psfm.form-float-label");

/* ===== [private] START ===== */

const CLS = Object.freeze({
	WRAPPER: "my-form-input",
	FILLED: "filled",
	FOCUSED: "focused"
});

const SEL = Object.freeze({
	WRAPPER: "." + CLS.WRAPPER,
	INPUT: "input, select, textarea"
});

const EVENT = Object.freeze({
	FOCUS: "focus.floatlabel",
	BLUR: "blur.floatlabel",
	INPUT: "input.floatlabel",
	CHANGE: "change.floatlabel"
});

const NUM = Object.freeze({
	ZERO: 0
});

/** ラッパー取得 */
const getWrapper = ($input) => {
	const span = LOG.logStart("getWrapper", { level: "TRACE" });
	const out = $input.closest(SEL.WRAPPER);
	LOG.logEnd(span);
	return out;
};

/** 値の正規化 */
const getNormalizedValue = ($input) => {
	const span = LOG.logStart("getNormalizedValue", { level: "TRACE" });

	const tag = String($input.prop("tagName") || "").toLowerCase();
	if (tag === "select") {
		const out = String($input.val() ?? "");
		LOG.logEnd(span);
		return out;
	}

	const out = String($input.val() ?? "").trim();
	LOG.logEnd(span);
	return out;
};

/** 文字列長 */
const getLength = (s) => {
	const span = LOG.logStart("getLength", { level: "TRACE" });
	const out = s.length;
	LOG.logEnd(span);
	return out;
};
/** 空白判定 */
const isBlank = (s) => {
	const span = LOG.logStart("isBlank", { level: "TRACE" });
	const out = getLength(s) === NUM.ZERO;
	LOG.logEnd(span);
	return out;
};
/** 非空白判定 */
const isNotBlank = (s) => {
	const span = LOG.logStart("isNotBlank", { level: "TRACE" });
	const out = getLength(s) > NUM.ZERO;
	LOG.logEnd(span);
	return out;
};

/** .focused 付与/除去 */
const setFocused = ($w) => {
	const span = LOG.logStart("setFocused", { level: "TRACE" });
	$w.addClass(CLS.FOCUSED);
	LOG.logEnd(span);
};
const unsetFocused = ($w) => {
	const span = LOG.logStart("unsetFocused", { level: "TRACE" });
	$w.removeClass(CLS.FOCUSED);
	LOG.logEnd(span);
};

/** .filled 付与/除去 */
const setFilled = ($w) => {
	const span = LOG.logStart("setFilled", { level: "TRACE" });
	$w.addClass(CLS.FILLED);
	LOG.logEnd(span);
};
const unsetFilled = ($w) => {
	const span = LOG.logStart("unsetFilled", { level: "TRACE" });
	$w.removeClass(CLS.FILLED);
	LOG.logEnd(span);
};

/**
 * updateFilledState
 * @param {jQuery} $input
 * @returns {void}
 */
const updateFilledState = ($input) => {
	const span = LOG.logStart("updateFilledState", { level: "TRACE" });

	const $w = getWrapper($input);
	const tag = String($input.prop("tagName") || "").toLowerCase();

	// select は常に“浮かす”
	if (tag === "select" || $w.hasClass("is-select")) {
		setFilled($w);
		LOG.logEnd(span);
		return;
	}

	// textarea を wrapper に .is-textarea 付けた場合は常に浮かす（任意）
	if (tag === "textarea" && $w.hasClass("is-textarea")) {
		setFilled($w);
		LOG.logEnd(span);
		return;
	}

	const val = getNormalizedValue($input);
	isNotBlank(val) ? setFilled($w) : unsetFilled($w);

	LOG.logEnd(span);
};

/* ===== [private] END ===== */


/* ===== [public/protected] START ===== */

export const setFormFloatLabel = function() {
	const span = LOG.logStart("setFormFloatLabel");

	const $inputs = $(SEL.WRAPPER).find(SEL.INPUT);
	LOG.debug("setFormFloatLabel: inputs={0}", $inputs.length);

	$inputs.each(function() {
		const $input = $(this);
		const $wrapper = getWrapper($input);

		// 初期状態を反映
		updateFilledState($input);

		// フォーカス時
		$input.off(EVENT.FOCUS).on(EVENT.FOCUS, function() {
			const spanEvt = LOG.logStart("floatlabel.focus", { level: "TRACE" });
			setFocused($wrapper);
			LOG.logEnd(spanEvt);
		});

		// ブラー時
		$input.off(EVENT.BLUR).on(EVENT.BLUR, function() {
			const spanEvt = LOG.logStart("floatlabel.blur", { level: "TRACE" });
			unsetFocused($wrapper);
			updateFilledState($input);
			LOG.logEnd(spanEvt);
		});

		// 入力中
		$input.off(EVENT.INPUT).on(EVENT.INPUT, function() {
			const spanEvt = LOG.logStart("floatlabel.input", { level: "TRACE" });
			updateFilledState($input);
			LOG.logEnd(spanEvt);
		});

		// 選択変更
		$input.off(EVENT.CHANGE).on(EVENT.CHANGE, function() {
			const spanEvt = LOG.logStart("floatlabel.change", { level: "TRACE" });
			updateFilledState($input);
			LOG.logEnd(spanEvt);
		});
	});

	LOG.logEnd(span);
};

/* ===== [public/protected] END ===== */
