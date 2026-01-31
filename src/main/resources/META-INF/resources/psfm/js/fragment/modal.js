/**
 * ----------------------------------------------------------------
 * modal.js（シンプルなモーダル制御）
 * ----------------------------------------------------------------
 */

import { getLoger } from "/psfm/js/common/loger.js";

const LOG = getLoger("psfm.modal");

/* ===== [private] START ===== */

const CLS = Object.freeze({
	MODAL: "my-modal",
	OPEN: "open"
});
const SEL = Object.freeze({
	OPEN_TRIGGER: ".my-modal-open",
	MODAL: "." + CLS.MODAL,
	CONTENT: ".my-modal-content",
	DISMISS: "[data-dismiss]",
	SUBMIT_BTN: "[data-submit-form]"
});
const EVT = Object.freeze({
	OPEN_CLICK: "click.myModal.open",
	DISMISS_CLICK: "click.myModal.dismiss",
	BACKDROP_CLICK: "click.myModal.backdrop",
	SUBMIT_CLICK: "click.myModal.submit"
});
const DATA = Object.freeze({
	BIND_FROM: "bindFrom",
	BIND_TO: "bindTo",
	BIND_TPL: "bindTemplate",
	OWNER_FORM: "ownerForm"
});

/* === ページロック関連（モーダル表示中は他操作を制限） === */

const LOCK = Object.freeze({
	BODY_LOCK_CLASS: "my-modal-lock",
	NS: ".myModal.lock"
});

/** 現在「開いている」モーダル数（0 になったらロック解除） */
let openModalCount = 0;

/** ページ離脱（戻る／リロード等）前の確認ダイアログ */
const handleBeforeUnload = (event) => {
	const span = LOG.logStart("handleBeforeUnload", { level: "TRACE" });

	if (openModalCount > 0) {
		event.preventDefault();
		event.returnValue = "";
		LOG.logEnd(span);
		return "";
	}

	LOG.logEnd(span);
};

const lockPage = () => {
	const span = LOG.logStart("lockPage");

	if (openModalCount === 0) {
		LOG.debug("lockPage: enable lock");

		$("body").addClass(LOCK.BODY_LOCK_CLASS);

		$(document).on("click" + LOCK.NS, function(e) {
			const spanEvt = LOG.logStart("lockPage.document.click", { level: "TRACE" });

			const $t = $(e.target);
			if ($t.closest(SEL.MODAL).length || $t.closest(SEL.OPEN_TRIGGER).length) {
				LOG.logEnd(spanEvt);
				return;
			}
			e.preventDefault();
			e.stopImmediatePropagation();

			LOG.logEnd(spanEvt);
		});

		$(document).on("keydown" + LOCK.NS, function(e) {
			const spanEvt = LOG.logStart("lockPage.document.keydown", { level: "TRACE" });

			const key = e.key || e.keyCode;

			if (key === "F5" || key === 116) {
				e.preventDefault();
				LOG.logEnd(spanEvt);
				return;
			}
			if ((e.ctrlKey || e.metaKey) && (key === "r" || key === "R" || key === 82)) {
				e.preventDefault();
			}

			LOG.logEnd(spanEvt);
		});

		window.addEventListener("beforeunload", handleBeforeUnload);
	}

	openModalCount++;
	LOG.debug("lockPage: openModalCount={0}", openModalCount);

	LOG.logEnd(span);
};

const unlockPage = () => {
	const span = LOG.logStart("unlockPage");

	if (openModalCount <= 0) {
		openModalCount = 0;
		LOG.debug("unlockPage: already unlocked");
		LOG.logEnd(span);
		return;
	}

	openModalCount--;
	LOG.debug("unlockPage: openModalCount={0}", openModalCount);

	if (openModalCount === 0) {
		LOG.debug("unlockPage: disable lock");

		$("body").removeClass(LOCK.BODY_LOCK_CLASS);
		$(document).off(LOCK.NS);
		window.removeEventListener("beforeunload", handleBeforeUnload);
	}

	LOG.logEnd(span);
};

const getOwnerForm = (el) => {
	const span = LOG.logStart("getOwnerForm", { level: "TRACE" });

	const $form = $(el).closest("form");
	const out = $form.length ? $form : $();

	LOG.logEnd(span);
	return out;
};

const fillTemplate = (tpl, value) => {
	const span = LOG.logStart("fillTemplate", { level: "TRACE" });

	const out = String(tpl || "").split("{value}").join(String(value || ""));

	LOG.logEnd(span);
	return out;
};

const applyBinding = ($modal, $ownerForm) => {
	const span = LOG.logStart("applyBinding", { level: "TRACE" });

	const fromSel = $modal.data(DATA.BIND_FROM) || $modal.attr("data-bind-from");
	const toSel = $modal.data(DATA.BIND_TO) || $modal.attr("data-bind-to");
	const tpl = $modal.data(DATA.BIND_TPL) || $modal.attr("data-bind-template");

	if (!fromSel || !toSel) {
		LOG.logEnd(span);
		return;
	}

	let $src = ($ownerForm && $ownerForm.length) ? $ownerForm.find(fromSel) : $();
	if (!$src.length) $src = $(fromSel);

	let value = "";
	if ($src.length) {
		const el = $src[0];
		if (el.tagName && /^(INPUT|TEXTAREA|SELECT)$/i.test(el.tagName)) {
			value = String($src.val() || "");
		} else {
			value = String($src.text() || $src.attr("data-text") || "");
		}
	}

	const text = tpl ? fillTemplate(tpl, value) : value;
	$modal.find(toSel).text(text);

	LOG.logEnd(span);
};

const openModal = ($modal, ctx) => {
	const span = LOG.logStart("openModal");

	if (!$modal || !$modal.length) {
		LOG.debug("openModal: modal not found");
		LOG.logEnd(span);
		return;
	}

	const e = $.Event("before:open.myModal");
	$modal.trigger(e, ctx);

	if (e.isDefaultPrevented()) {
		LOG.debug("openModal: canceled by before:open.myModal");
		LOG.logEnd(span);
		return;
	}

	const $ownerForm = getOwnerForm(ctx && ctx.trigger);
	$modal.data(DATA.OWNER_FORM, $ownerForm);

	// ここは“開く処理を止めない”ための保険（元コード踏襲）
	try { applyBinding($modal, $ownerForm); } catch (_ignored) { /* no-op */ }

	if (!$modal.hasClass(CLS.OPEN)) {
		$modal.addClass(CLS.OPEN);
		lockPage();
		LOG.debug("openModal: opened");
	} else {
		LOG.debug("openModal: already open");
	}

	LOG.logEnd(span);
};

const closeModal = ($modal) => {
	const span = LOG.logStart("closeModal");

	if ($modal && $modal.length && $modal.hasClass(CLS.OPEN)) {
		$modal.removeClass(CLS.OPEN);
		unlockPage();
		LOG.debug("closeModal: closed");
	} else {
		LOG.debug("closeModal: skip (not open / not found)");
	}

	LOG.logEnd(span);
};

const closeNearestModal = (el) => {
	const span = LOG.logStart("closeNearestModal", { level: "TRACE" });
	closeModal($(el).closest(SEL.MODAL));
	LOG.logEnd(span);
};

/* ===== [private] END ===== */


/* ===== [public/protected] START ===== */

export const setModal = function() {
	const span = LOG.logStart("setModal");

	$(document)
		.off(EVT.OPEN_CLICK)
		.off(EVT.DISMISS_CLICK)
		.off(EVT.BACKDROP_CLICK)
		.off(EVT.SUBMIT_CLICK);

	LOG.debug("setModal: bind handlers");

	/* 開く */
	$(document).on(EVT.OPEN_CLICK, SEL.OPEN_TRIGGER, function(e) {
		const spanEvt = LOG.logStart("modal.open.click", { level: "TRACE" });

		e.preventDefault();

		const modalSel = $(this).data("modal");
		const $modal = $(modalSel);

		const $ownerForm = getOwnerForm(this);
		const ctx = { trigger: this, ownerForm: $ownerForm[0] || null };

		LOG.debug("modal.open: modalSel={0} ownerForm={1}", modalSel, !!ctx.ownerForm);

		openModal($modal, ctx);

		LOG.logEnd(spanEvt);
	});

	/* 閉じる（ボタン） */
	$(document).on(EVT.DISMISS_CLICK, SEL.DISMISS, function(e) {
		const spanEvt = LOG.logStart("modal.dismiss.click", { level: "TRACE" });

		e.preventDefault();
		closeNearestModal(this);

		LOG.logEnd(spanEvt);
	});

	/* 閉じる（backdrop） */
	$(document).on(EVT.BACKDROP_CLICK, SEL.MODAL, function(e) {
		const spanEvt = LOG.logStart("modal.backdrop.click", { level: "TRACE" });

		const $content = $(this).find(SEL.CONTENT);
		if (!$content.length || !$content[0].contains(e.target)) {
			closeModal($(this));
		}

		LOG.logEnd(spanEvt);
	});

	/* 確認→フォーム送信 */
	$(document).on(EVT.SUBMIT_CLICK, SEL.SUBMIT_BTN, function(e) {
		const spanEvt = LOG.logStart("modal.submit.click", { level: "TRACE" });

		e.preventDefault();

		const $btn = $(this);
		const sel = $btn.attr("data-submit-form"); // "#id" | "owner" | 未指定
		const $modal = $btn.closest(SEL.MODAL);

		let $form = $();

		if (sel && sel !== "owner") {
			$form = $(sel);
		} else {
			$form = $modal.data(DATA.OWNER_FORM);
		}

		LOG.debug("modal.submit: sel={0} formFound={1}", sel, !!($form && $form.length));

		if (!$form || !$form.length) {
			closeNearestModal(this);
			LOG.logEnd(spanEvt);
			return;
		}

		closeNearestModal(this);

		const ev = $.Event("submit");
		$form.trigger(ev);

		if (!ev.isDefaultPrevented() && $form[0] && typeof $form[0].submit === "function") {
			$form[0].submit();
		}

		LOG.logEnd(spanEvt);
	});

	LOG.logEnd(span);
};

/* ===== [public/protected] END ===== */
