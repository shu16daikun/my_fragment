/**
 * ----------------------------------------------------------------
 * accordion.js（my-accordion の動的処理）
 * ----------------------------------------------------------------
 */

import { getLoger } from "/psfm/js/common/loger.js";

const LOG = getLoger("psfm.accordion");

/* ===== [private] START ===== */

const CLS = Object.freeze({
	ACCORDION: "my-accordion",
	ITEM: "my-accordion-item",
	TOGGLE: "my-accordion-toggle",
	COLLAPSE: "my-accordion-collapse",
	SHOW: "show"
});
const SEL = Object.freeze({
	ACCORDION: "." + CLS.ACCORDION,
	ITEM: "." + CLS.ITEM,
	TOGGLE: "." + CLS.TOGGLE,
	COLLAPSE: "." + CLS.COLLAPSE
});
const ATTR = Object.freeze({
	ID: "id",
	ARIA_EXPANDED: "aria-expanded",
	ARIA_CONTROLS: "aria-controls",
	STYLE_MAX_HEIGHT: "max-height"
});
const STR = Object.freeze({
	TRUE: "true",
	FALSE: "false",
	ID_PREFIX_ACCORDION: "myAccordion_",
	ID_SUFFIX_COLLAPSE: "_collapse_",
	ID_SUFFIX_BTN: "_btn_",
	PX: "px"
});

const isTrue = (v) => {
	const span = LOG.logStart("isTrue", { level: "TRACE" });
	const out = v === true;
	LOG.logEnd(span);
	return out;
}; // ※現状未使用（必要なければ削除可）

const isFalse = (v) => {
	const span = LOG.logStart("isFalse", { level: "TRACE" });
	const out = v === false;
	LOG.logEnd(span);
	return out;
};

const isExpanded = ($btn) => {
	const span = LOG.logStart("isExpanded", { level: "TRACE" });
	const out = $btn.attr(ATTR.ARIA_EXPANDED) === STR.TRUE;
	LOG.logEnd(span);
	return out;
};

const setExpanded = ($btn) => {
	const span = LOG.logStart("setExpanded", { level: "TRACE" });
	$btn.attr(ATTR.ARIA_EXPANDED, STR.TRUE);
	LOG.logEnd(span);
};

const setCollapsedAttr = ($btn) => {
	const span = LOG.logStart("setCollapsedAttr", { level: "TRACE" });
	$btn.attr(ATTR.ARIA_EXPANDED, STR.FALSE);
	LOG.logEnd(span);
};

const toPx = (n) => {
	const span = LOG.logStart("toPx", { level: "TRACE" });
	const out = `${n}${STR.PX}`;
	LOG.logEnd(span);
	return out;
};

const buildAccordionId = (i) => {
	const span = LOG.logStart("buildAccordionId", { level: "TRACE" });
	const out = STR.ID_PREFIX_ACCORDION + i;
	LOG.logEnd(span);
	return out;
};

const buildCollapseId = (accId, i) => {
	const span = LOG.logStart("buildCollapseId", { level: "TRACE" });
	const out = accId + STR.ID_SUFFIX_COLLAPSE + i;
	LOG.logEnd(span);
	return out;
};

const buildBtnId = (accId, i) => {
	const span = LOG.logStart("buildBtnId", { level: "TRACE" });
	const out = accId + STR.ID_SUFFIX_BTN + i;
	LOG.logEnd(span);
	return out;
};

const closeItem = ($item) => {
	const span = LOG.logStart("closeItem");
	const $collapses = $item.find(SEL.COLLAPSE);
	LOG.debug("closeItem: collapseCount={0}", $collapses.length);

	$collapses.each(function() {
		$(this).removeClass(CLS.SHOW).css(ATTR.STYLE_MAX_HEIGHT, 0);
	});

	LOG.logEnd(span);
};

const openCollapse = ($collapse) => {
	const span = LOG.logStart("openCollapse");
	const h = $collapse.prop("scrollHeight");
	LOG.debug("openCollapse: scrollHeight={0}", h);

	$collapse.addClass(CLS.SHOW).css(ATTR.STYLE_MAX_HEIGHT, toPx(h));

	LOG.logEnd(span);
};

/* ===== [private] END ===== */


/* ===== [public/protected] START ===== */

export const setAccordion = function() {
	const span = LOG.logStart("setAccordion");

	const $accordions = $(SEL.ACCORDION);
	LOG.debug("setAccordion: accordions={0}", $accordions.length);

	$accordions.each(function(aIndex) {
		const $accordion = $(this);
		const accordionId = buildAccordionId(aIndex);
		$accordion.attr(ATTR.ID, accordionId);

		const $items = $accordion.find(SEL.ITEM);
		LOG.debug("setAccordion: accordionId={0} items={1}", accordionId, $items.length);

		$items.each(function(bIndex) {
			const $item = $(this);
			const collapseId = buildCollapseId(accordionId, bIndex);
			const btnId = buildBtnId(accordionId, bIndex);
			const $btn = $item.find(SEL.TOGGLE);
			const $collapse = $item.find(SEL.COLLAPSE);

			LOG.debug(
				"setAccordion: itemIndex={0} btnCount={1} collapseCount={2}",
				bIndex,
				$btn.length,
				$collapse.length
			);

			$btn.attr(ATTR.ID, btnId)
				.attr(ATTR.ARIA_EXPANDED, STR.FALSE)
				.attr(ATTR.ARIA_CONTROLS, collapseId);

			$collapse.attr(ATTR.ID, collapseId);

			$btn.off("click.psfmAccordion").on("click.psfmAccordion", function() {
				const spanClick = LOG.logStart("accordion.click", { level: "TRACE" });

				const wasExpanded = isExpanded($btn);
				closeItem($item);
				setCollapsedAttr($btn);

				if (isFalse(wasExpanded)) {
					openCollapse($collapse);
					setExpanded($btn);
				}

				LOG.logEnd(spanClick);
			});
		});
	});

	LOG.logEnd(span);
};

/* ===== [public/protected] END ===== */
