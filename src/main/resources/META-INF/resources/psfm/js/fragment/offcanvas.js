// /psfm/js/fragment/offcanvas.js

import { getLoger } from "/psfm/js/common/loger.js";

const LOG = getLoger("psfm.offcanvas");

/* ===== [private] START ===== */

const CLS = Object.freeze({
	OFFCANVAS: "my-offcanvas",
	BACKDROP: "my-offcanvas-backdrop",
	CLOSE: "my-offcanvas-close",
	OPEN: "open"
});
const SEL = Object.freeze({
	OFFCANVAS: "." + CLS.OFFCANVAS,
	BACKDROP: "." + CLS.BACKDROP,
	CLOSE: "." + CLS.CLOSE,
	LIST_ITEMS: "ul li"
});
const DATA = Object.freeze({
	INITED: "inited",
	TEXT: "text",
	HREF: "href",
	MODAL: "modal",
	FORM_SUBMIT: "formSubmit"
});
const STR = Object.freeze({
	HASH: "#"
});
const EVT = Object.freeze({
	CLICK_CLOSE: "click.offcanvas.close",
	CLICK_BACKDROP: "click.offcanvas.backdrop",
	CLICK_FORM: "click.offcanvas.form"
});

const hasJQ = ($el) => {
	const span = LOG.logStart("hasJQ", { level: "TRACE" });
	const out = !!($el && $el.length > 0);
	LOG.logEnd(span);
	return out;
};

const isEmptyJQ = ($el) => {
	const span = LOG.logStart("isEmptyJQ", { level: "TRACE" });
	const out = !hasJQ($el);
	LOG.logEnd(span);
	return out;
};

/** backdrop が無ければ補完して返す */
const ensureBackdrop = ($container) => {
	const span = LOG.logStart("ensureBackdrop");

	const $exists = $container.find(SEL.BACKDROP);
	if (isEmptyJQ($exists)) {
		LOG.debug("ensureBackdrop: create backdrop");
		$container.append(`<div class="${CLS.BACKDROP}"></div>`);
		const $created = $container.find(SEL.BACKDROP);
		LOG.logEnd(span);
		return $created;
	}

	LOG.debug("ensureBackdrop: already exists");
	LOG.logEnd(span);
	return $exists;
};

/** .open 除去でクローズ */
const closeContainer = ($container) => {
	const span = LOG.logStart("closeContainer", { level: "TRACE" });

	$container.removeClass(CLS.OPEN);

	LOG.logEnd(span);
};

/* ===== [private] END ===== */


/* ===== [public/protected] START ===== */

/**
 * initOffcanvas
 * @param {JQuery} $container
 * @returns {void}
 */
export const initOffcanvas = function($container) {
	const span = LOG.logStart("initOffcanvas");

	if (!$container || !$container.length) {
		LOG.debug("initOffcanvas: container missing -> skip");
		LOG.logEnd(span);
		return;
	}

	if ($container.data(DATA.INITED) === true) {
		LOG.debug("initOffcanvas: already inited -> skip");
		LOG.logEnd(span);
		return;
	}
	$container.data(DATA.INITED, true);

	const $offcanvas = $container.find(SEL.OFFCANVAS);
	const $backdrop = ensureBackdrop($container);

	LOG.debug("initOffcanvas: listItems={0}", $offcanvas.find(SEL.LIST_ITEMS).length);

	$offcanvas.find(SEL.LIST_ITEMS).each(function() {
		const spanItem = LOG.logStart("initOffcanvas.eachItem", { level: "TRACE" });

		const $li = $(this);
		const text = $li.data(DATA.TEXT);
		const href = $li.data(DATA.HREF) || STR.HASH;
		const modalSel = $li.data(DATA.MODAL);
		const formSubmitSelector = $li.data(DATA.FORM_SUBMIT);

		const $a = $("<a>").text(text);

		if (modalSel) {
			LOG.debug("initOffcanvas.item: modal={0}", modalSel);

			$a.attr("href", STR.HASH)
				.addClass("my-modal-open")
				.attr("data-modal", modalSel);
		} else if (formSubmitSelector) {
			LOG.debug("initOffcanvas.item: formSubmit={0}", formSubmitSelector);

			$a.attr("href", STR.HASH)
				.addClass("my-offcanvas-form")
				.attr("data-form-submit", formSubmitSelector);
		} else {
			LOG.debug("initOffcanvas.item: href={0}", href);

			$a.attr("href", href);
		}

		$li.empty().append($a);

		LOG.logEnd(spanItem);
	});

	$offcanvas.find(SEL.CLOSE)
		.off(EVT.CLICK_CLOSE)
		.on(EVT.CLICK_CLOSE, () => {
			const spanEvt = LOG.logStart("offcanvas.close.click", { level: "TRACE" });
			closeContainer($container);
			LOG.logEnd(spanEvt);
		});

	$backdrop
		.off(EVT.CLICK_BACKDROP)
		.on(EVT.CLICK_BACKDROP, () => {
			const spanEvt = LOG.logStart("offcanvas.backdrop.click", { level: "TRACE" });
			closeContainer($container);
			LOG.logEnd(spanEvt);
		});

	// 「フォームsubmit」リンクのクリックで対象フォームをsubmit
	$offcanvas
		.off(EVT.CLICK_FORM, "a.my-offcanvas-form")
		.on(EVT.CLICK_FORM, "a.my-offcanvas-form", function(e) {
			const spanEvt = LOG.logStart("offcanvas.form.click", { level: "TRACE" });

			e.preventDefault();

			const $link = $(this);
			const selector = $link.data("formSubmit"); // "#user-account-form" など

			if (!selector) {
				LOG.debug("offcanvas.form.click: selector missing");
				LOG.logEnd(spanEvt);
				return;
			}

			const $form = $(selector);
			if (!$form.length) {
				LOG.debug("offcanvas.form.click: form not found selector={0}", selector);
				LOG.logEnd(spanEvt);
				return;
			}

			LOG.debug("offcanvas.form.click: submit selector={0}", selector);

			// offcanvas を閉じてから submit
			closeContainer($container);
			$form.trigger("submit");

			LOG.logEnd(spanEvt);
		});

	LOG.logEnd(span);
};

/* ===== [public/protected] END ===== */
