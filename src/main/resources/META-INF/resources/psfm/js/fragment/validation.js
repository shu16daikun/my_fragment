// /psfm/js/fragment/validation.js
import { setIconValid, setIconInvalid } from "/psfm/js/fragment/icons.js";
import { getLoger } from "/psfm/js/common/loger.js";

const LOG = getLoger("psfm.validation");

/* ===== [private] START ===== */

const CLS = Object.freeze({
	ALERT_DANGER: "my-alert-danger",
	CONTAINER: "my-validation-container",
	IS_VALID: "my-is-valid",
	IS_INVALID: "my-is-invalid",
	ICON: "my-validation-icon",
	INVALID_MSG: "my-invalid",
	HAS_GLOBAL_ERROR: "has-global-error"
});
const SEL = Object.freeze({
	FORMS: ".my-validation, .my-validation-input-change",
	INPUTS: "input, select, textarea",
	ALERT_DANGER: "." + CLS.ALERT_DANGER,
	CONTAINER: "." + CLS.CONTAINER,
	ICON: "." + CLS.ICON,
	INVALID_MSG: "." + CLS.INVALID_MSG
});
const ATTR = Object.freeze({
	NAME: "name",
	TYPE: "type",
	DATA_TEXT: "data-text",
	NOVALIDATE: "novalidate"
});
const EVT = Object.freeze({
	INPUT: "input.validation",
	CHANGE: "change.validation"
});
const SVC = Object.freeze({
	INVALID_SET: "_invalidSet"
});

/** サービスエラーの最新スナップショット（name→message） */
let currentErrors = Object.create(null);

/* 小ユーティリティ */
const hasEl = ($el) => $el && $el.length > 0;
const getLen = ($el) => (hasEl($el) ? $el.length : 0);
const isZero = (n) => n === 0;
const trim = (v) => String(v ?? "").trim();
const isBlank = (s) => trim(s).length === 0;
const isNotBlank = (s) => trim(s).length > 0;
const isVisible = ($el) => hasEl($el) && $el.is(":visible");
const isFunction = (fn) => typeof fn === "function";
const isNonEmptyArray = (a) => Array.isArray(a) && a.length > 0;
const isProvided = (v) => v !== null && v !== undefined;
const isNotProvided = (v) => v === null || v === undefined;
const isHiddenField = ($input) => String($input.attr(ATTR.TYPE)) === "hidden";
const getName = ($input) => String($input.attr(ATTR.NAME) ?? "");
const hasServiceError = (name) => isProvided(currentErrors[name]);

/** 見た目をニュートラルにリセット */
const setNeutral = ($parent) => {
	const span = LOG.logStart("setNeutral", { level: "TRACE" });

	$parent.removeClass(`${CLS.IS_VALID} ${CLS.IS_INVALID}`);
	$parent.find(SEL.INVALID_MSG).text("");
	$parent.find(SEL.ICON).remove();

	LOG.logEnd(span);
};

/** valid 表示（緑アイコン＋メッセージ消去） */
const setValid = ($parent, $input) => {
	const span = LOG.logStart("setValid", { level: "TRACE" });

	$parent.removeClass(CLS.IS_INVALID).addClass(CLS.IS_VALID);
	$parent.find(SEL.ICON).remove();
	$input.after(setIconValid());
	$parent.find(SEL.INVALID_MSG).text("");

	LOG.logEnd(span);
};

/** invalid 表示（赤アイコン＋メッセージ反映） */
const setInvalid = ($parent, $input, message) => {
	const span = LOG.logStart("setInvalid", { level: "TRACE" });

	$parent.removeClass(CLS.IS_VALID).addClass(CLS.IS_INVALID);
	$parent.find(SEL.ICON).remove();
	$input.after(setIconInvalid());
	$parent.find(SEL.INVALID_MSG).text(String(message ?? ""));

	LOG.logEnd(span);
};

/** 画面上部の危険アラートが「目に見えて」いるか */
const hasVisibleAlert = ($form) => {
	const span = LOG.logStart("hasVisibleAlert", { level: "TRACE" });

	const $alert = $form.find(SEL.ALERT_DANGER);
	if (isZero(getLen($alert))) {
		LOG.logEnd(span);
		return false;
	}

	const text = trim($alert.text() || $alert.attr(ATTR.DATA_TEXT));
	const out = isNotBlank(text) && isVisible($alert);

	LOG.logEnd(span);
	return out;
};

/** 指定 name の入力を強制 invalid に（メッセージは .my-invalid の既存文字） */
const forceInvalidFor = ($form, names) => {
	const span = LOG.logStart("forceInvalidFor");

	const list = Array.isArray(names) ? names : [];
	LOG.debug("forceInvalidFor: names={0}", list.join(","));

	list.forEach((n) => {
		const $input = $form.find(`[name="${n}"]`);
		if (isZero(getLen($input))) return;

		const $parent = $input.closest(SEL.CONTAINER);
		setInvalid($parent, $input, trim($parent.find(SEL.INVALID_MSG).text()));
	});

	LOG.logEnd(span);
};

/** 単一 input の軽量検証（値が空→ニュートラル、値あり→valid。サービスエラー優先） */
const validateInput = ($input) => {
	const span = LOG.logStart("validateInput", { level: "TRACE" });

	const $parent = $input.closest(SEL.CONTAINER);
	const name = getName($input);

	if (isHiddenField($input) || isBlank(name)) {
		LOG.logEnd(span);
		return;
	}

	$parent.find(SEL.ICON).remove();

	if (hasServiceError(name)) {
		setInvalid($parent, $input, currentErrors[name]);
		LOG.logEnd(span);
		return;
	}

	const value = trim($input.val());
	if (isBlank(value)) {
		setNeutral($parent);
		LOG.logEnd(span);
		return;
	}

	setValid($parent, $input);

	LOG.logEnd(span);
};

/* ===== [private] END ===== */


/* ===== [public/protected] START ===== */

/**
 * setValidation
 * @param {Object<string,string|any>} errors
 * @param {string[]} targets
 * @returns {void}
 */
export const setValidation = function(errors = {}, targets = []) {
	const span = LOG.logStart("setValidation");

	currentErrors = errors;

	const $forms = $(SEL.FORMS);
	LOG.debug("setValidation: forms={0}", $forms.length);

	$forms.each(function() {
		const $form = $(this);
		$form.attr(ATTR.NOVALIDATE, true);

		$form.find(SEL.INPUTS).each(function() {
			validateInput($(this));
		});

		const svcInvalid = errors[SVC.INVALID_SET];

		if (isNonEmptyArray(svcInvalid)) {
			forceInvalidFor($form, svcInvalid);
			$form.addClass(CLS.HAS_GLOBAL_ERROR);
		}

		if (hasVisibleAlert($form)) {
			const names = isNonEmptyArray(svcInvalid) ? svcInvalid : (targets || []);
			forceInvalidFor($form, names);
			$form.addClass(CLS.HAS_GLOBAL_ERROR);
		} else if (isNotProvided(svcInvalid)) {
			$form.removeClass(CLS.HAS_GLOBAL_ERROR);
		}
	});

	LOG.logEnd(span);
};

/**
 * setValidationInputChange
 * @param {(values:Object)=>Object} onChangeValidate
 * @param {{getTargetsForAlert?: ($form:JQuery)=>string[]}} options
 * @returns {void}
 */
export const setValidationInputChange = function(onChangeValidate, options = {}) {
	const span = LOG.logStart("setValidationInputChange");

	// ".my-validation-input-change" のみ
	const $forms = $(SEL.FORMS.replace(".my-validation, ", ""));
	LOG.debug("setValidationInputChange: forms={0}", $forms.length);

	$forms.each(function() {
		const $form = $(this);
		$form.attr(ATTR.NOVALIDATE, true);

		const getTargets = () =>
			(isFunction(options.getTargetsForAlert) ? (options.getTargetsForAlert($form) || []) : []);

		setValidation(currentErrors, getTargets());

		$form.find(SEL.INPUTS)
			.off(`${EVT.INPUT} ${EVT.CHANGE}`)
			.on(`${EVT.INPUT} ${EVT.CHANGE}`, function() {
				const spanEvt = LOG.logStart("validation.onInputOrChange", { level: "TRACE" });

				if (isFunction(onChangeValidate)) {
					const values = {};
					$form.find(SEL.INPUTS).each(function() {
						const $i = $(this);
						const n = getName($i);
						if (isNotBlank(n)) values[n] = $i.val();
					});

					const errors = onChangeValidate(values) || {};
					setValidation(errors, getTargets());

					LOG.logEnd(spanEvt);
					return;
				}

				validateInput($(this));

				if (hasVisibleAlert($form)) {
					forceInvalidFor($form, getTargets());
					$form.addClass(CLS.HAS_GLOBAL_ERROR);
				} else {
					$form.removeClass(CLS.HAS_GLOBAL_ERROR);
				}

				LOG.logEnd(spanEvt);
			});
	});

	LOG.logEnd(span);
};

/* ===== [public/protected] END ===== */
