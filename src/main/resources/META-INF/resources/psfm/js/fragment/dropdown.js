/**
 * dropdown.js（my-dropdown / my-dropdown-dark / inputトリガ対応版）
 */

import { getLoger } from "/psfm/js/common/loger.js";

const LOG = getLoger("psfm.dropdown");

const CLS = Object.freeze({
	ROOT_LIGHT: "my-dropdown",
	ROOT_DARK: "my-dropdown-dark",
	OPEN: "is-open"
});
const SEL = Object.freeze({
	ROOTS: `.${CLS.ROOT_LIGHT}, .${CLS.ROOT_DARK}`,
	MENU: "ul",
	TRIGGER_CANDIDATES: "button, input.js-dropdown-input, input[role='combobox']"
});
const ATTR = Object.freeze({
	ID: "id",
	ARIA_EXPANDED: "aria-expanded",
	ARIA_CONTROLS: "aria-controls",
	ROLE: "role",
	ARIA_HASPOPUP: "aria-haspopup",
	ARIA_AUTOCOMPLETE: "aria-autocomplete"
});
const STR = Object.freeze({
	ID_PREFIX: "myDropdown_",
	ID_MENU_SUFFIX: "_menu",
	EVENT_NS_CLICK: "click.dropdown",
	EVENT_NS_KEYDOWN: "keydown.dropdown"
});

/* ===== [private] START ===== */

const isVisible = ($el) => {
	const span = LOG.logStart("isVisible", { level: "TRACE" });
	const out = $el.is(":visible");
	LOG.logEnd(span);
	return out;
};

const showMenu = ($menu, $trigger) => {
	const span = LOG.logStart("showMenu", { level: "TRACE" });
	$menu.show();
	$trigger.attr(ATTR.ARIA_EXPANDED, "true");
	LOG.logEnd(span);
};

const hideMenu = ($menu, $trigger) => {
	const span = LOG.logStart("hideMenu", { level: "TRACE" });
	$menu.hide();
	$trigger.attr(ATTR.ARIA_EXPANDED, "false");
	LOG.logEnd(span);
};

const uid = (i) => {
	const span = LOG.logStart("uid", { level: "TRACE" });
	const out = {
		rootId: `${STR.ID_PREFIX}${i}`,
		menuId: `${STR.ID_PREFIX}${i}${STR.ID_MENU_SUFFIX}`
	};
	LOG.logEnd(span);
	return out;
};

const findTrigger = ($root) => {
	const span = LOG.logStart("findTrigger", { level: "TRACE" });

	// button 優先。無ければ input（.js-dropdown-input or role="combobox"）
	let $t = $root.find("button").first();
	if ($t.length) {
		LOG.logEnd(span);
		return $t;
	}
	$t = $root.find("input.js-dropdown-input, input[role='combobox']").first();

	LOG.logEnd(span);
	return $t;
};

const isButtonTrigger = ($t) => {
	const span = LOG.logStart("isButtonTrigger", { level: "TRACE" });
	const out = $t.is("button");
	LOG.logEnd(span);
	return out;
};

const isInputTrigger = ($t) => {
	const span = LOG.logStart("isInputTrigger", { level: "TRACE" });
	const out = $t.is("input");
	LOG.logEnd(span);
	return out;
};

const $rootize = ($root, ids) => {
	const span = LOG.logStart("$rootize", { level: "TRACE" });
	if (!$root.attr(ATTR.ID)) $root.attr(ATTR.ID, ids.rootId);
	LOG.logEnd(span);
};

const initAria = ($trigger, $menu, ids) => {
	const span = LOG.logStart("initAria");

	$rootize($trigger.closest(SEL.ROOTS), ids); // id 付与（保険）
	$menu.attr(ATTR.ID, ids.menuId);

	if (isButtonTrigger($trigger)) {
		LOG.debug("initAria: trigger=button menuRole=menu");

		$trigger
			.attr(ATTR.ARIA_CONTROLS, ids.menuId)
			.attr(ATTR.ARIA_EXPANDED, "false")
			.attr(ATTR.ARIA_HASPOPUP, "true");
		$menu.attr(ATTR.ROLE, "menu");
		$menu.find("li > *, li").attr(ATTR.ROLE, "menuitem");
	} else {
		LOG.debug("initAria: trigger=input menuRole=listbox");

		$trigger
			.attr(ATTR.ROLE, "combobox")
			.attr(ATTR.ARIA_CONTROLS, ids.menuId)
			.attr(ATTR.ARIA_EXPANDED, "false")
			.attr(ATTR.ARIA_HASPOPUP, "listbox")
			.attr(ATTR.ARIA_AUTOCOMPLETE, "none")
			.prop("readOnly", true);
		$menu.attr(ATTR.ROLE, "listbox");
		$menu.find("li > *, li").attr(ATTR.ROLE, "option");
	}

	LOG.logEnd(span);
};

const closeAllExcept = ($targetMenu) => {
	const span = LOG.logStart("closeAllExcept", { level: "TRACE" });

	$(SEL.ROOTS).each(function() {
		const $root = $(this);
		const $trigger = findTrigger($root);
		const $menu = $root.find(SEL.MENU).first();
		if ($menu.get(0) !== $targetMenu.get(0)) {
			hideMenu($menu, $trigger);
		}
	});

	LOG.logEnd(span);
};

const focusFirstItem = ($menu) => {
	const span = LOG.logStart("focusFirstItem", { level: "TRACE" });

	const $first = $menu.find("li > *:visible, li:visible").first();
	if ($first.length) $first.trigger("focus");

	LOG.logEnd(span);
};

const bindMouse = ($root, $trigger, $menu) => {
	const span = LOG.logStart("bindMouse");

	$trigger.off(STR.EVENT_NS_CLICK).on(STR.EVENT_NS_CLICK, function(e) {
		const spanEvt = LOG.logStart("dropdown.trigger.click", { level: "TRACE" });

		e.stopPropagation();

		if (isVisible($menu)) {
			hideMenu($menu, $trigger);
		} else {
			closeAllExcept($menu);
			showMenu($menu, $trigger);
		}

		LOG.logEnd(spanEvt);
	});

	$menu.off(STR.EVENT_NS_CLICK).on(STR.EVENT_NS_CLICK, function(e) {
		const spanEvt = LOG.logStart("dropdown.menu.click", { level: "TRACE" });
		e.stopPropagation(); // メニュー内クリックは閉じない
		LOG.logEnd(spanEvt);
	});

	// 外側クリックで全閉（この実装は「最後にbindしたものが上書き」になる）
	$(document).off(STR.EVENT_NS_CLICK).on(STR.EVENT_NS_CLICK, function() {
		const spanEvt = LOG.logStart("dropdown.document.click", { level: "TRACE" });

		$(SEL.ROOTS).each(function() {
			const $r = $(this);
			const $t = findTrigger($r);
			const $m = $r.find(SEL.MENU).first();
			if (isVisible($m)) hideMenu($m, $t);
		});

		LOG.logEnd(spanEvt);
	});

	LOG.logEnd(span);
};

const bindKeyboard = ($root, $trigger, $menu) => {
	const span = LOG.logStart("bindKeyboard");

	$trigger.off(STR.EVENT_NS_KEYDOWN).on(STR.EVENT_NS_KEYDOWN, function(e) {
		const spanEvt = LOG.logStart("dropdown.trigger.keydown", { level: "TRACE" });

		const key = e.key;

		if (key === "Enter" || key === " " || key === "Spacebar") {
			e.preventDefault();
			if (isVisible($menu)) {
				hideMenu($menu, $trigger);
			} else {
				closeAllExcept($menu);
				showMenu($menu, $trigger);
				focusFirstItem($menu);
			}
		} else if (key === "ArrowDown") {
			e.preventDefault();
			if (!isVisible($menu)) {
				closeAllExcept($menu);
				showMenu($menu, $trigger);
			}
			focusFirstItem($menu);
		} else if (key === "Escape" || key === "Esc") {
			if (isVisible($menu)) {
				e.preventDefault();
				hideMenu($menu, $trigger);
				$trigger.trigger("focus");
			}
		}

		LOG.logEnd(spanEvt);
	});

	LOG.logEnd(span);
};

/* ===== [private] END ===== */


/* ===== [public/protected] START ===== */

export const setDropdown = function() {
	const span = LOG.logStart("setDropdown");

	const $roots = $(SEL.ROOTS);
	LOG.debug("setDropdown: roots={0}", $roots.length);

	$roots.each(function(index) {
		const spanRoot = LOG.logStart("setDropdown.eachRoot", { level: "TRACE" });

		const $root = $(this);
		const $menu = $root.find(SEL.MENU).first();

		let $trigger = $root.find(SEL.TRIGGER_CANDIDATES).first();
		if (!$trigger.length) {
			LOG.debug("setDropdown: no trigger -> skip index={0}", index);
			LOG.logEnd(spanRoot);
			return;
		}

		const ids = uid(index);
		$rootize($root, ids);
		initAria($trigger, $menu, ids);

		// 初期は閉じておく
		if (isVisible($menu)) {
			LOG.debug("setDropdown: menu visible -> hide (index={0})", index);
			hideMenu($menu, $trigger);
		}

		// 入れ替えの可能性に備え、都度取り直すための再バインド関数
		const rebind = () => {
			const spanRe = LOG.logStart("rebind");

			$trigger = findTrigger($root);
			if (!$trigger.length) {
				LOG.debug("rebind: trigger missing -> skip");
				LOG.logEnd(spanRe);
				return;
			}

			initAria($trigger, $menu, ids);
			bindMouse($root, $trigger, $menu);
			bindKeyboard($root, $trigger, $menu);

			LOG.logEnd(spanRe);
		};

		rebind(); // 初回

		LOG.logEnd(spanRoot);
	});

	LOG.logEnd(span);
};

/* ===== [public/protected] END ===== */
