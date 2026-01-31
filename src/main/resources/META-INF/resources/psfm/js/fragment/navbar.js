// /psfm/js/fragment/navbar.js
import { setIconList } from "/psfm/js/fragment/icons.js";
import { initOffcanvas } from "/psfm/js/fragment/offcanvas.js";
import { getLoger } from "/psfm/js/common/loger.js";

const LOG = getLoger("psfm.navbar");

/* ===== [private] START ===== */

const CLS = Object.freeze({
	NAVBAR_TOGGLER: "my-navbar-toggler",
	NAVBAR_TOGGLER_ICON: "my-navbar-toggler-icon",
	OFFCANVAS_OPEN: "open"
});
const SEL = Object.freeze({
	NAV: "nav",
	TOGGLER: "." + CLS.NAVBAR_TOGGLER
});
const ATTR = Object.freeze({
	DATA_THEME: "data-theme"
});
const DATA = Object.freeze({
	OC_INITED: "ocInited"
});
const EVT = Object.freeze({
	CLICK_TOGGLE: "click.navbar.toggle"
});

const toClassSelector = (name) => {
	const span = LOG.logStart("toClassSelector", { level: "TRACE" });
	const out = "." + String(name);
	LOG.logEnd(span);
	return out;
};

const getLength = ($el) => {
	const span = LOG.logStart("getLength", { level: "TRACE" });
	const out = ($el ? $el.length : 0);
	LOG.logEnd(span);
	return out;
};

const isZero = (n) => {
	const span = LOG.logStart("isZero", { level: "TRACE" });
	const out = n === 0;
	LOG.logEnd(span);
	return out;
};

/** トグルボタンにアイコン(svg)を1回だけ追加 */
const ensureTogglerIcon = ($toggle) => {
	const span = LOG.logStart("ensureTogglerIcon", { level: "TRACE" });

	const hasIcon = getLength($toggle.find("." + CLS.NAVBAR_TOGGLER_ICON)) > 0;
	if (!hasIcon) {
		LOG.debug("ensureTogglerIcon: append icon");
		$toggle.append(setIconList());
	}

	LOG.logEnd(span);
};

/** offcanvas 初期化を一度だけ実施 */
const initOffcanvasOnce = ($container) => {
	const span = LOG.logStart("initOffcanvasOnce");

	if (!$container || isZero(getLength($container))) {
		LOG.debug("initOffcanvasOnce: container missing -> skip");
		LOG.logEnd(span);
		return;
	}

	if ($container.data(DATA.OC_INITED) === true) {
		LOG.debug("initOffcanvasOnce: already inited -> skip");
		LOG.logEnd(span);
		return;
	}

	initOffcanvas($container);
	$container.data(DATA.OC_INITED, true);

	LOG.debug("initOffcanvasOnce: inited");
	LOG.logEnd(span);
};

/**
 * setNavbar（内部）
 * @param {JQuery} $root
 * @param {"dark"|"success"|string} theme
 * @param {string} offcanvasClass
 */
const setNavbar = function($root, theme, offcanvasClass) {
	const span = LOG.logStart("setNavbar");

	const rootLen = getLength($root);
	LOG.debug("setNavbar: rootLen={0} theme={1} offcanvasClass={2}", rootLen, theme, offcanvasClass);

	if (isZero(rootLen)) {
		LOG.debug("setNavbar: root not found -> skip");
		LOG.logEnd(span);
		return;
	}

	const $nav = $root.find(SEL.NAV);
	$nav.attr(ATTR.DATA_THEME, theme);

	const $toggle = $root.find(SEL.TOGGLER);
	ensureTogglerIcon($toggle);

	const $offcanvasContainer = $root.find(toClassSelector(offcanvasClass));
	initOffcanvasOnce($offcanvasContainer);

	$toggle.off(EVT.CLICK_TOGGLE).on(EVT.CLICK_TOGGLE, (e) => {
		const spanEvt = LOG.logStart("navbar.toggle.click", { level: "TRACE" });

		e.stopPropagation();
		$offcanvasContainer.addClass(CLS.OFFCANVAS_OPEN);

		LOG.logEnd(spanEvt);
	});

	LOG.logEnd(span);
};

/* ===== [private] END ===== */


/* ===== [public/protected] START ===== */

/** ユーザー用ナビバー初期化（テーマ：dark / offcanvas：.my-offcanvas-user） */
export const setNavbarUser = () => {
	const span = LOG.logStart("setNavbarUser");
	setNavbar($(".my-navbar-user"), "dark", "my-offcanvas-user");
	LOG.logEnd(span);
};

/** 管理者用ナビバー初期化（テーマ：success / offcanvas：.my-offcanvas-admin） */
export const setNavbarAdmin = () => {
	const span = LOG.logStart("setNavbarAdmin");
	setNavbar($(".my-navbar-admin"), "success", "my-offcanvas-admin");
	LOG.logEnd(span);
};

/* ===== [public/protected] END ===== */
