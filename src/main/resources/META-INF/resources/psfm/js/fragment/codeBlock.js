import { setIconInfo, setIconCheck, setIconWarn, setIconError } from "/psfm/js/fragment/icons.js";
/* ↑ 現状このファイル内では未使用。別画面で流用予定がなければ import を削除可。 */

import { getLoger } from "/psfm/js/common/loger.js";

const LOG = getLoger("psfm.code-block");

/* ===== [private] START ===== */

const CLS = Object.freeze({
	CODE_BLOCK: "my-code-block",
	HEADER: "my-code-block-header",
	BUTTON_COPY: "my-btn-secondary",
	BUTTON_COPIED: "my-btn-success"
});
const SEL = Object.freeze({
	ROOT: "." + CLS.CODE_BLOCK,
	HEADER: "." + CLS.HEADER,
	BUTTON: "button",
	CODE: "code"
});
const DATA = Object.freeze({
	COPY: "copy",
	COPIED: "copied"
});
const EVENT = Object.freeze({
	CLICK: "click"
});
const TIME = Object.freeze({
	REVERT_MS: 1500
});
const CMD = Object.freeze({
	COPY: "copy"
});

const isFunction = (fn) => {
	const span = LOG.logStart("isFunction", { level: "TRACE" });
	const out = typeof fn === "function";
	LOG.logEnd(span);
	return out;
};

const isClipboardSupported = () => {
	const span = LOG.logStart("isClipboardSupported", { level: "TRACE" });

	const out =
		typeof navigator !== "undefined" &&
		navigator.clipboard &&
		isFunction(navigator.clipboard.writeText);

	LOG.logEnd(span);
	return out;
};

const setText = ($el, text) => {
	const span = LOG.logStart("setText", { level: "TRACE" });
	$el.text(text);
	LOG.logEnd(span);
};

const switchBtnState = ($btn, text, fromCls, toCls) => {
	const span = LOG.logStart("switchBtnState", { level: "TRACE" });
	setText($btn, text);
	$btn.removeClass(fromCls).addClass(toCls);
	LOG.logEnd(span);
};

const getRootContainer = ($el) => {
	const span = LOG.logStart("getRootContainer", { level: "TRACE" });
	const out = $el.closest(SEL.ROOT);
	LOG.logEnd(span);
	return out;
};

const getCodeText = ($container) => {
	const span = LOG.logStart("getCodeText", { level: "TRACE" });
	const out = $container.find(SEL.CODE).text().trim();
	LOG.logEnd(span);
	return out;
};

const safeExecCommandCopy = () => {
	try { return document.execCommand(CMD.COPY); } catch (_e) { return false; }
};

const fallbackCopy = ($container) => {
	const span = LOG.logStart("fallbackCopy");

	const range = document.createRange();
	const codeEl = $container.find(SEL.CODE).get(0);
	if (!codeEl) {
		LOG.warn("fallbackCopy: code element not found");
		LOG.logEnd(span);
		return;
	}

	range.selectNodeContents(codeEl);
	const sel = window.getSelection();
	if (!sel) {
		LOG.warn("fallbackCopy: selection not available");
		LOG.logEnd(span);
		return;
	}

	sel.removeAllRanges();
	sel.addRange(range);

	const ok = safeExecCommandCopy();
	sel.removeAllRanges();

	LOG.debug("fallbackCopy: execCommand(copy) ok={0}", ok);
	LOG.logEnd(span);
};

/* ===== [private] END ===== */


/* ===== [public/protected] START ===== */

export const setCodeBlock = function() {
	const span = LOG.logStart("setCodeBlock");

	const $roots = $(SEL.ROOT);
	LOG.debug("setCodeBlock: roots={0}", $roots.length);

	$roots.each(function() {
		const $root = $(this);
		const $header = $root.find(SEL.HEADER);
		const $btn = $header.find(SEL.BUTTON);
		const copy = $btn.data(DATA.COPY);
		const copied = $btn.data(DATA.COPIED);

		setText($btn, copy);

		$btn.off(EVENT.CLICK).on(EVENT.CLICK, function() {
			const spanClick = LOG.logStart("codeBlock.click", { level: "TRACE" });

			const $self = $(this);
			const $container = getRootContainer($self);
			const text = getCodeText($container);

			if (isClipboardSupported()) {
				navigator.clipboard.writeText(text)
					.then(() => {
						const spanOk = LOG.logStart("codeBlock.copySuccess", { level: "TRACE" });

						switchBtnState($self, copied, CLS.BUTTON_COPY, CLS.BUTTON_COPIED);
						setTimeout(
							() => switchBtnState($self, copy, CLS.BUTTON_COPIED, CLS.BUTTON_COPY),
							TIME.REVERT_MS
						);

						LOG.logEnd(spanOk);
					})
					.catch((e) => {
						LOG.warn("codeBlock: Clipboard API failed -> {0}", e?.message || String(e));
						fallbackCopy($container);
					})
					.finally(() => {
						LOG.logEnd(spanClick);
					});
				return;
			}

			fallbackCopy($container);
			LOG.logEnd(spanClick);
		});
	});

	LOG.logEnd(span);
};

/* ===== [public/protected] END ===== */
