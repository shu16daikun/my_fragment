// /psfm/js/fragment/pagination.js
// シンプルなクライアントサイド・ページネーション（テーブル tbody > tr を perPage 件ごとに表示）
// 依存: jQuery

import { getLoger } from "/psfm/js/common/loger.js";

const LOG = getLoger("psfm.pagination");

/**
 * attachSimplePagination
 * @param {Object} opts
 * @param {string|HTMLElement|jQuery} opts.table
 * @param {string|HTMLElement|jQuery} opts.container
 * @param {number} [opts.perPage=50]
 * @param {{prev?:string,next?:string}} [opts.labels]
 * @param {string} [opts.eventNS=".pagination"]
 * @returns {{showPage:(p:number)=>void, refresh:()=>void, current:()=>number, total:()=>number}}
 */
export function attachSimplePagination(opts = {}) {
	const span = LOG.logStart("attachSimplePagination");

	const $table = $(opts.table).first();
	const $tbody = $table.find("tbody").first();
	let $rows = $tbody.children("tr");

	const perPage = Number(opts.perPage ?? 50);
	const labels = Object.assign({ prev: "前へ", next: "次へ" }, opts.labels || {});
	const eventNS = String(opts.eventNS ?? ".pagination");
	const $container = $(opts.container).first();

	LOG.debug("init: tableFound={0} tbodyFound={1} rows={2} perPage={3} eventNS={4}",
		!!$table.length, !!$tbody.length, $rows.length, perPage, eventNS);

	// コンテナ内に <ul> を用意（無ければ自動生成）
	function ensureContainer() {
		const s = LOG.logStart("ensureContainer", { level: "TRACE" });

		if (!$container.length) {
			LOG.debug("ensureContainer: container missing");
			LOG.logEnd(s);
			return null;
		}

		let $ul = $container.find("ul").first();
		if (!$ul.length) {
			$ul = $("<ul/>");
			$container.empty().append($ul);
			$container
				.addClass("my-pagination")
				.attr("aria-label", $container.attr("aria-label") || "ページ移動");

			LOG.debug("ensureContainer: created ul");
		}

		LOG.logEnd(s);
		return $ul;
	}

	function countPages() {
		const s = LOG.logStart("countPages", { level: "TRACE" });

		const total = Math.max(1, Math.ceil($rows.length / perPage));

		LOG.logEnd(s);
		return total;
	}

	let _current = 1;
	let _total = countPages();

	function renderNav() {
		const s = LOG.logStart("renderNav");

		const $ul = ensureContainer();
		if (!$ul) {
			LOG.logEnd(s);
			return;
		}

		if (_total <= 1) {
			$container.hide();
			LOG.debug("renderNav: total<=1 -> hide");
			LOG.logEnd(s);
			return;
		}

		$container.show();
		$ul.empty();

		// Prev
		const $prevLi = $("<li/>");
		const $prevA = $('<a href="#" class="my-page-prev"></a>').text(labels.prev);
		if (_current <= 1) $prevA.addClass("disabled");
		$prevLi.append($prevA);
		$ul.append($prevLi);

		// 数字
		for (let i = 1; i <= _total; i++) {
			const $li = $("<li/>");
			const $a = $('<a href="#"></a>').text(String(i)).attr("data-page", String(i));
			if (i === _current) $a.addClass("active").attr("aria-current", "page");
			$li.append($a);
			$ul.append($li);
		}

		// Next
		const $nextLi = $("<li/>");
		const $nextA = $('<a href="#" class="my-page-next"></a>').text(labels.next);
		if (_current >= _total) $nextA.addClass("disabled");
		$nextLi.append($nextA);
		$ul.append($nextLi);

		LOG.debug("renderNav: current={0} total={1}", _current, _total);
		LOG.logEnd(s);
	}

	function applySlice() {
		const s = LOG.logStart("applySlice", { level: "TRACE" });

		const start = (_current - 1) * perPage;
		const end = start + perPage;

		LOG.debug("applySlice: start={0} end={1} rows={2}", start, end, $rows.length);

		$rows.hide().slice(start, end).show();

		LOG.logEnd(s);
	}

	function showPage(p) {
		const s = LOG.logStart("showPage");

		const next = Math.min(Math.max(1, Number(p) || 1), _total);
		_current = next;

		applySlice();
		renderNav();

		LOG.debug("showPage: current={0}", _current);
		LOG.logEnd(s);
	}

	function refresh() {
		const s = LOG.logStart("refresh");

		$rows = $tbody.children("tr");
		_total = countPages();

		if (_current > _total) _current = _total;

		LOG.debug("refresh: rows={0} total={1} current={2}", $rows.length, _total, _current);

		showPage(_current);

		LOG.logEnd(s);
	}

	// イベント（Prev/Next/数字）
	$container
		.off(`click${eventNS}`)
		.on(`click${eventNS}`, "a", function(e) {
			const s = LOG.logStart("pagination.click", { level: "TRACE" });

			e.preventDefault();

			const $a = $(this);
			if ($a.hasClass("disabled") || $a.hasClass("active")) {
				LOG.logEnd(s);
				return;
			}

			if ($a.hasClass("my-page-prev")) {
				showPage(_current - 1);
			} else if ($a.hasClass("my-page-next")) {
				showPage(_current + 1);
			} else {
				const p = parseInt($a.attr("data-page") || "", 10);
				if (!Number.isNaN(p)) showPage(p);
			}

			LOG.logEnd(s);
		});

	// 初期表示
	showPage(1);

	LOG.logEnd(span);

	return {
		showPage,
		refresh,
		current: () => _current,
		total: () => _total
	};
}
