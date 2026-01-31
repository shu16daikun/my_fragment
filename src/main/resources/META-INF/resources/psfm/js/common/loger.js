// /psfm/js/common/loger.js
// ES Module: import { getLoger, endAndReturn } from "/psfm/js/common/loger.js";

/**
 * @typedef {"TRACE"|"DEBUG"|"INFO"|"WARN"|"ERROR"|"OFF"} LogLevel
 */

const LEVEL_VALUE = /** @type {const} */ ({
	TRACE: 10,
	DEBUG: 20,
	INFO: 30,
	WARN: 40,
	ERROR: 50,
	OFF: 99
});

/** @type {{ enabled: boolean, level: LogLevel, duration: boolean }} */
let CONFIG = {
	enabled: true,
	level: "DEBUG",
	duration: false
};

const LOGGERS = new Map();

/** 設定変更（全ロガー共通） */
export function setLogerConfig(partial) {
	if (!partial || typeof partial !== "object") return;

	if (typeof partial.enabled === "boolean") CONFIG.enabled = partial.enabled;

	if (typeof partial.level === "string") {
		const lv = partial.level.toUpperCase();
		if (Object.prototype.hasOwnProperty.call(LEVEL_VALUE, lv)) {
			/** @type {LogLevel} */ (CONFIG.level = /** @type {any} */ (lv));
		}
	}

	if (typeof partial.duration === "boolean") CONFIG.duration = partial.duration;
}

export function getLogerConfig() {
	return { ...CONFIG };
}

/** ロガー取得（同名は使い回し） */
export function getLoger(name) {
	const key = String(name || "APP");
	let logger = LOGGERS.get(key);
	if (!logger) {
		logger = new Loger(key);
		LOGGERS.set(key, logger);
	}
	return logger;
}

/**
 * return直前を1行にする用：span.endして値を返す
 * @template T
 * @param {SpanToken|null|undefined} span
 * @param {T} value
 * @returns {T}
 */
export function endAndReturn(span, value) {
	if (span && typeof span.end === "function") span.end();
	return value;
}

/**
 * throw直前を1行にする用：span.endしてから投げる
 * @param {SpanToken|null|undefined} span
 * @param {any} err
 */
export function endAndThrow(span, err) {
	if (span && typeof span.end === "function") span.end();
	throw err;
}

/**
 * 互換用：旧startSpan API
 * - これ自体は try を要求しない（戻り値の span を好きなタイミングで end すればOK）
 * @param {Loger} logger
 * @param {string} label
 * @param {{ level?: LogLevel, duration?: boolean }} [opt]
 * @returns {SpanToken}
 */
export function startSpan(logger, label, opt) {
	return (logger || getLoger("APP")).logStart(label, opt);
}

/**
 * 互換用：旧withSpan API（あなたのコードはフラットのまま）
 * @template T
 * @param {Loger} logger
 * @param {string} label
 * @param {() => T | Promise<T>} fn
 * @param {{ level?: LogLevel, duration?: boolean }} [opt]
 * @returns {Promise<T>}
 */
export function withSpan(logger, label, fn, opt) {
	const lg = logger || getLoger("APP");
	const span = lg.logStart(label, opt);

	return Promise.resolve()
		.then(fn)
		.finally(() => span.end());
}

/**
 * 任意：全メソッド自動（Proxy）
 * - 注意：同期例外（throw）時は end が出ない（try を避けるためのトレードオフ）
 * @template T
 * @param {T} obj
 * @param {{ logger?: Loger, name?: string, level?: LogLevel, duration?: boolean, include?: (key: string) => boolean }} [opt]
 * @returns {T}
 */
export function wrapAllMethods(obj, opt) {
	const logger = opt?.logger ?? getLoger(opt?.name ?? "APP");
	const level = opt?.level;
	const duration = opt?.duration;
	const include = opt?.include ?? (() => true);

	return new Proxy(obj, {
		get(target, prop, receiver) {
			const v = Reflect.get(target, prop, receiver);
			if (typeof prop !== "string") return v;
			if (typeof v !== "function") return v;
			if (!include(prop)) return v;

			return function wrappedMethod(...args) {
				const label = `${target?.constructor?.name ?? "Object"}#${prop}`;
				const span = logger.logStart(label, { level, duration });

				const ret = v.apply(this, args);
				if (ret && typeof ret.then === "function") {
					return ret.finally(() => span.end());
				}
				span.end();
				return ret;
			};
		}
	});
}

export class Loger {
	constructor(name) {
		this.name = name;
		/** @type {Map<string, Array<{start:number, level:LogLevel, duration:boolean}>>} */
		this._spanStacks = new Map();
	}

	trace(msg, ...args) {
		this._log("TRACE", msg, null, args);
	}
	debug(msg, ...args) {
		this._log("DEBUG", msg, null, args);
	}
	info(msg, ...args) {
		this._log("INFO", msg, null, args);
	}
	warn(msg, ...args) {
		this._log("WARN", msg, null, args);
	}
	error(msg, err, ...args) {
		if (err instanceof Error) {
			this._log("ERROR", msg, err, args);
		} else {
			this._log("ERROR", msg, null, [err, ...args]);
		}
	}

	/**
	 * startログ（label だけでOK）
	 * @param {string} label
	 * @param {{ level?: LogLevel, duration?: boolean }} [opt]
	 * @returns {SpanToken}
	 */
	logStart(label, opt) {
		const name = String(label || "method");
		const level = opt?.level ?? "DEBUG";
		const duration = opt?.duration ?? CONFIG.duration;

		if (!this.isEnabled(level)) {
			return SpanToken.noop(name);
		}

		const start = nowMs();
		const stack = this._spanStacks.get(name) || [];
		stack.push({ start, level, duration });
		this._spanStacks.set(name, stack);

		this._log(level, `${name}[start]`, null, []);
		return new SpanToken(this, name, start, level, duration);
	}

	/**
	 * endログ（label or token どっちでもOK）
	 * @param {string|SpanToken} labelOrToken
	 */
	logEnd(labelOrToken) {
		if (labelOrToken instanceof SpanToken) {
			labelOrToken.end();
			return;
		}

		const name = String(labelOrToken || "method");
		const stack = this._spanStacks.get(name);

		if (!stack || stack.length === 0) {
			// startがない end はWARNで通知（不要ならTRACEに落としてもOK）
			this._log("WARN", `${name}[end] (no start)`, null, []);
			return;
		}

		const last = stack.pop();
		if (stack.length === 0) this._spanStacks.delete(name);

		if (!last) return;

		if (!last.duration) {
			this._log(last.level, `${name}[end]`, null, []);
			return;
		}

		const elapsed = Math.max(0, nowMs() - last.start);
		this._log(last.level, `${name}[end] ${elapsed.toFixed(1)}ms`, null, []);
	}

	isEnabled(level) {
		if (!CONFIG.enabled) return false;
		return LEVEL_VALUE[level] >= LEVEL_VALUE[CONFIG.level] && CONFIG.level !== "OFF";
	}

	_log(level, msg, err, args) {
		if (!this.isEnabled(level)) return;

		const text = format(msg, args);
		const line = `${nowIsoOffset()} ${level} ${this.name} - ${text}`;

		switch (level) {
		case "ERROR":
			err ? console.error(line, err) : console.error(line);
			break;
		case "WARN":
			console.warn(line);
			break;
		case "INFO":
			console.info(line);
			break;
		default:
			console.log(line);
			break;
		}
	}
}

/**
 * start/end の“持ち回り”用トークン（try不要）
 */
export class SpanToken {
	constructor(logger, label, start, level, duration) {
		this._logger = logger;
		this._label = label;
		this._start = start;
		this._level = level;
		this._duration = duration;
		this._ended = false;
	}

	static noop(label) {
		const t = new SpanToken(null, label, 0, "DEBUG", false);
		t._ended = true;
		return t;
	}

	end() {
		if (this._ended) return;
		this._ended = true;

		const logger = this._logger;
		if (!logger) return;

		if (!logger.isEnabled(this._level)) return;

		if (!this._duration) {
			logger._log(this._level, `${this._label}[end]`, null, []);
			return;
		}

		const elapsed = Math.max(0, nowMs() - this._start);
		logger._log(this._level, `${this._label}[end] ${elapsed.toFixed(1)}ms`, null, []);
	}
}

/** "{0}" 形式の簡易プレースホルダ置換 */
function format(pattern, args) {
	if (pattern == null) return "null";
	const s = String(pattern);
	if (!args || args.length === 0) return s;

	let out = s;
	for (let i = 0; i < args.length; i++) {
		out = out.split("{" + i + "}").join(String(args[i]));
	}
	return out;
}

function nowMs() {
	if (typeof performance !== "undefined" && typeof performance.now === "function") {
		return performance.now();
	}
	return Date.now();
}

function nowIsoOffset() {
	const d = new Date();
	const pad = (n) => String(Math.floor(Math.abs(n))).padStart(2, "0");

	const y = d.getFullYear();
	const m = pad(d.getMonth() + 1);
	const day = pad(d.getDate());
	const hh = pad(d.getHours());
	const mm = pad(d.getMinutes());
	const ss = pad(d.getSeconds());

	const offMin = -d.getTimezoneOffset();
	const sign = offMin >= 0 ? "+" : "-";
	const oh = pad(offMin / 60);
	const om = pad(offMin % 60);

	return `${y}-${m}-${day}T${hh}:${mm}:${ss}${sign}${oh}:${om}`;
}
