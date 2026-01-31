import { setIconInfo, setIconCheck, setIconWarn, setIconError } from "/psfm/js/fragment/icons.js";
import { getLoger } from "/psfm/js/common/loger.js";

const LOG = getLoger("psfm.alert");

/* ===== [private] START ===== */

const CLS = Object.freeze({
	ALERT: "my-alert",
	PRIMARY: "my-alert-primary",
	SUCCESS: "my-alert-success",
	WARNING: "my-alert-warning",
	DANGER: "my-alert-danger",
	TEXT: "my-alert-text",
	CLOSE: "my-alert-close",
	HIDING: "is-hiding"
});
const ATTR = Object.freeze({
	ROLE: "role",
	ARIA_LIVE: "aria-live",
	ARIA_LABEL: "aria-label",
	DATA_TEXT: "text",
	DATA_DISMISS: "dismiss",
	DATA_TIMEOUT: "timeout",
	STYLE_MAX_HEIGHT: "max-height"
});
const STR = Object.freeze({
	ALERT: "alert",
	POLITE: "polite",
	CLOSE_LABEL: "閉じる",
	CLOSE_MARK: "×",
	EMPTY: "",
	DOT: ".",
	PX: "px"
});
const TIME = Object.freeze({
	ANIM_REMOVE_MS: 250
});

const toClassSelector = (name) => {
	const span = LOG.logStart("toClassSelector", { level: "TRACE" });
	const out = STR.DOT + name;
	LOG.logEnd(span);
	return out;
};
const isProvided = (v) => {
	const span = LOG.logStart("isProvided", { level: "TRACE" });
	const out = v !== undefined && v !== null;
	LOG.logEnd(span);
	return out;
};
const isZero = (n) => {
	const span = LOG.logStart("isZero", { level: "TRACE" });
	const out = n === 0;
	LOG.logEnd(span);
	return out;
};
const isPositive = (n) => {
	const span = LOG.logStart("isPositive", { level: "TRACE" });
	const out = Number.isFinite(n) && n > 0;
	LOG.logEnd(span);
	return out;
};
const toInt10 = (v) => {
	const span = LOG.logStart("toInt10", { level: "TRACE" });
	const out = Number.parseInt(v, 10);
	LOG.logEnd(span);
	return out;
};
const toPx = (n) => {
	const span = LOG.logStart("toPx", { level: "TRACE" });
	const out = `${n}${STR.PX}`;
	LOG.logEnd(span);
	return out;
}; // 予備（現状未使用）

const removeWithAnime = ($el, delay) => {
	const span = LOG.logStart("removeWithAnime", { level: "TRACE" });

	$el.addClass(CLS.HIDING);
	setTimeout(() => {
		const span2 = LOG.logStart("removeWithAnime.timeout", { level: "TRACE" });
		$el.remove();
		LOG.logEnd(span2);
	}, delay);

	LOG.logEnd(span);
};

const scheduleAutoDismiss = ($el, timeoutMs) => {
	const span = LOG.logStart("scheduleAutoDismiss");

	if (isPositive(timeoutMs)) {
		LOG.debug("scheduleAutoDismiss: timeoutMs={0}", timeoutMs);
		setTimeout(() => {
			const span2 = LOG.logStart("scheduleAutoDismiss.timeout", { level: "TRACE" });
			removeWithAnime($el, TIME.ANIM_REMOVE_MS);
			LOG.logEnd(span2);
		}, timeoutMs);
	}

	LOG.logEnd(span);
};

const materializeIcon = (iconOrFactory) => {
	const span = LOG.logStart("materializeIcon");

	if (!isProvided(iconOrFactory)) {
		LOG.debug("materializeIcon: iconOrFactory not provided");
		LOG.logEnd(span);
		return null;
	}

	const produced = (typeof iconOrFactory === "function") ? iconOrFactory() : iconOrFactory;

	if (typeof produced === "string") {
		LOG.debug("materializeIcon: produced is string(html)");
		LOG.logEnd(span);
		return $(produced);
	}

	const $el = $(produced);
	const out = ($el.clone ? $el.clone(true) : $el);

	LOG.logEnd(span);
	return out;
};

const setAlert = function(className, iconOrFactory) {
	const span = LOG.logStart("setAlert");

	const $targets = $(toClassSelector(className));
	$targets.addClass(CLS.ALERT);

	LOG.debug("setAlert: className={0} targets={1}", className, $targets.length);

	$targets.each(function() {
		const $host = $(this);
		const text = $host.data(ATTR.DATA_TEXT);
		const canClose = $host.data(ATTR.DATA_DISMISS);
		const timeout = toInt10($host.data(ATTR.DATA_TIMEOUT));

		if (isZero($host.children().length)) {
			const $frag = $(document.createDocumentFragment());

			const $icon = materializeIcon(iconOrFactory);
			if ($icon) $frag.append($icon);

			$frag.append($(`<span class="${CLS.TEXT}"></span>`).text(text ?? STR.EMPTY));

			if (canClose === true) {
				const $close = $(
					`<button class="${CLS.CLOSE}" type="button" ${ATTR.ARIA_LABEL}="${STR.CLOSE_LABEL}">${STR.CLOSE_MARK}</button>`
				);

				$close.off("click.psfmAlert").on("click.psfmAlert", () => {
					const spanClick = LOG.logStart("alert.closeClick", { level: "TRACE" });
					removeWithAnime($host, TIME.ANIM_REMOVE_MS);
					LOG.logEnd(spanClick);
				});

				$frag.append($close);
			}

			$host.attr(ATTR.ROLE, STR.ALERT)
				.attr(ATTR.ARIA_LIVE, STR.POLITE)
				.append($frag);

			LOG.debug("setAlert: materialized");
		} else {
			LOG.debug("setAlert: already materialized -> skipped");
		}

		scheduleAutoDismiss($host, timeout);
	});

	LOG.logEnd(span);
};

/* ===== [private] END ===== */


/* ===== [public/protected] START ===== */

export const setAlertPrimary = function() {
	const span = LOG.logStart("setAlertPrimary");
	setAlert(CLS.PRIMARY, () => setIconInfo());
	LOG.logEnd(span);
};

export const setAlertSuccess = function() {
	const span = LOG.logStart("setAlertSuccess");
	setAlert(CLS.SUCCESS, () => setIconCheck());
	LOG.logEnd(span);
};

export const setAlertWarning = function() {
	const span = LOG.logStart("setAlertWarning");
	setAlert(CLS.WARNING, () => setIconWarn());
	LOG.logEnd(span);
};

export const setAlertDanger = function() {
	const span = LOG.logStart("setAlertDanger");
	setAlert(CLS.DANGER, () => setIconError());
	LOG.logEnd(span);
};

/* ===== [public/protected] END ===== */
