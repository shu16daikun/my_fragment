// /psfm/js/fragment/tooltip.js

import { getLoger } from "/psfm/js/common/loger.js";

const LOG = getLoger("psfm.tooltip");

/* ===== [private] START ===== */

const CLS = Object.freeze({
	HOST: "my-tooltips",
	TOOLTIP: "my-tooltip",
	SHOW: "show"
});
const SEL = Object.freeze({
	HOST: "." + CLS.HOST
});
const EVT = Object.freeze({
	ENTER: "mouseenter",
	FOCUS: "focus",
	LEAVE: "mouseleave",
	BLUR: "blur",
	SCROLL: "scroll",
	RESIZE: "resize"
});
const DATA = Object.freeze({
	TITLE: "title"
});
const NUM = Object.freeze({
	PADDING: 6
});

/* ユーティリティ */
const ns = (base, id) => {
	const span = LOG.logStart("ns", { level: "TRACE" });
	const out = `${base}.tooltips.${id}`;
	LOG.logEnd(span);
	return out;
};

const hasJQ = ($el) => {
	const span = LOG.logStart("hasJQ", { level: "TRACE" });
	const out = !!($el && $el.length > 0);
	LOG.logEnd(span);
	return out;
};

const getTitle = ($el) => {
	const span = LOG.logStart("getTitle", { level: "TRACE" });
	const out = String($el.data(DATA.TITLE) ?? "").trim();
	LOG.logEnd(span);
	return out;
};

const isBlank = (s) => {
	const span = LOG.logStart("isBlank", { level: "TRACE" });
	const out = s.length === 0;
	LOG.logEnd(span);
	return out;
};

const removeAllTooltips = () => {
	const span = LOG.logStart("removeAllTooltips", { level: "TRACE" });
	$(`.${CLS.TOOLTIP}`).remove();
	LOG.logEnd(span);
};

const px = (n) => {
	const span = LOG.logStart("px", { level: "TRACE" });
	const out = `${n}px`;
	LOG.logEnd(span);
	return out;
};

const isOverflowTop = (top) => top < 0;
const isOverflowLeft = (left) => left < 0;
const isOverflowRight = (left, width, viewW, pad) => (left + width) > (viewW - pad);

const createTooltip = (text) => {
	const span = LOG.logStart("createTooltip", { level: "TRACE" });
	const $out = $(`<div class="${CLS.TOOLTIP}" role="tooltip" aria-hidden="true"></div>`).text(text);
	LOG.logEnd(span);
	return $out;
};

const bindWindowHandlers = (nsId, $el, $tooltip) => {
	const span = LOG.logStart("bindWindowHandlers", { level: "TRACE" });

	$(window)
		.off(ns(EVT.SCROLL, nsId))
		.on(ns(EVT.SCROLL, nsId), () => {
			const s2 = LOG.logStart("window.scroll", { level: "TRACE" });
			if (hasJQ($tooltip)) positionTooltip($el, $tooltip);
			LOG.logEnd(s2);
		})
		.off(ns(EVT.RESIZE, nsId))
		.on(ns(EVT.RESIZE, nsId), () => {
			const s2 = LOG.logStart("window.resize", { level: "TRACE" });
			if (hasJQ($tooltip)) positionTooltip($el, $tooltip);
			LOG.logEnd(s2);
		});

	LOG.logEnd(span);
};

const unbindWindowHandlers = (nsId) => {
	const span = LOG.logStart("unbindWindowHandlers", { level: "TRACE" });
	$(window).off(ns(EVT.SCROLL, nsId)).off(ns(EVT.RESIZE, nsId));
	LOG.logEnd(span);
};

/** 位置計算（中央上／溢れ補正） */
const positionTooltip = ($el, $tooltip) => {
	const span = LOG.logStart("positionTooltip", { level: "TRACE" });

	const rect = $el[0].getBoundingClientRect();
	const tRect = $tooltip[0].getBoundingClientRect();
	const padding = NUM.PADDING;

	let top = rect.top - tRect.height - padding;
	let left = rect.left + (rect.width / 2) - (tRect.width / 2);

	if (isOverflowTop(top)) {
		top = rect.bottom + padding;
	}
	if (isOverflowLeft(left)) {
		left = padding;
	}
	if (isOverflowRight(left, tRect.width, window.innerWidth, padding)) {
		left = window.innerWidth - tRect.width - padding;
	}

	$tooltip.css({
		top: px(top + window.scrollY),
		left: px(left + window.scrollX)
	});

	LOG.logEnd(span);
};

/* ===== [private] END ===== */


/* ===== [public/protected] START ===== */

/**
 * setTooltips
 * @returns {void}
 */
export const setTooltips = function() {
	const span = LOG.logStart("setTooltips");

	const $hosts = $(SEL.HOST);
	LOG.debug("setTooltips: hosts={0}", $hosts.length);

	$hosts.each(function(i) {
		const spanHost = LOG.logStart("setTooltips.eachHost", { level: "TRACE" });

		const $el = $(this);
		let $tooltip = $();
		const nsId = `host-${i}`;

		const open = () => {
			const s = LOG.logStart("tooltip.open", { level: "TRACE" });

			const text = getTitle($el);
			if (isBlank(text)) {
				LOG.debug("tooltip.open: blank title -> skip");
				LOG.logEnd(s);
				return;
			}

			removeAllTooltips();
			$tooltip = createTooltip(text);
			$("body").append($tooltip);

			positionTooltip($el, $tooltip);
			$tooltip.addClass(CLS.SHOW).attr("aria-hidden", "false");

			bindWindowHandlers(nsId, $el, $tooltip);

			LOG.logEnd(s);
		};

		const close = () => {
			const s = LOG.logStart("tooltip.close", { level: "TRACE" });

			if (hasJQ($tooltip)) {
				$tooltip.remove();
				$tooltip = $();
			}
			unbindWindowHandlers(nsId);

			LOG.logEnd(s);
		};

		$el.off(ns(EVT.ENTER, nsId)).on(ns(EVT.ENTER, nsId), open);
		$el.off(ns(EVT.FOCUS, nsId)).on(ns(EVT.FOCUS, nsId), open);
		$el.off(ns(EVT.LEAVE, nsId)).on(ns(EVT.LEAVE, nsId), close);
		$el.off(ns(EVT.BLUR, nsId)).on(ns(EVT.BLUR, nsId), close);

		LOG.logEnd(spanHost);
	});

	LOG.logEnd(span);
};

/* ===== [public/protected] END ===== */
