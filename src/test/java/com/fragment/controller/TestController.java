package com.fragment.controller;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * デモ用フラグメント（共通UI部品）の表示確認コントローラ。 前提条件： - プロパティ psfm.demo.enabled が "true"
 * のときのみ有効。 目的： - buttons /
 * navbar / offcanvas / form / alert / modal / pagination ... 等の
 * フラグメント表示を個別URLで動作確認する。
 *
 * <p>
 * 注意： - "breadcrump" はテンプレ名に合わせて敢えて綴りを変更していない（テンプレ側がその名前の場合）。
 */
@Controller
@ConditionalOnProperty(name = TestController.PROP_DEMO_ENABLED, havingValue = TestController.PROP_TRUE)
final class TestController {

	/* ===== [private] START ===== */

	/** 有効化プロパティ名 */
	public static final String PROP_DEMO_ENABLED = "psfm.demo.enabled";

	/** 文字列 "true"（ConditionalOnProperty の havingValue に使用） */
	public static final String PROP_TRUE = "true";

	/** View の共通接頭辞（フラグメント用） */
	private static final String VIEW_PREFIX = "psfm/fragment/main-contents/";

	/* ビュー名（Thymeleaf 論理名） */
	private static final String VIEW_BUTTONS = VIEW_PREFIX + "buttons";
	private static final String VIEW_BREADCRUMP = VIEW_PREFIX + "breadcrump"; // テンプレ名と一致前提
	private static final String VIEW_BTN_GROUP_VERTICAL = VIEW_PREFIX + "btnGroupVertical";
	private static final String VIEW_ACCORDION = VIEW_PREFIX + "accordion";
	private static final String VIEW_NAVBAR_USER = VIEW_PREFIX + "navbar-user";
	private static final String VIEW_NAVBAR_ADMIN = VIEW_PREFIX + "navbar-admin";
	private static final String VIEW_OFFCANVAS = VIEW_PREFIX + "offcanvas";
	private static final String VIEW_TABLE = VIEW_PREFIX + "table";
	private static final String VIEW_LIST_GROUP = VIEW_PREFIX + "listGroup";
	private static final String VIEW_ROW_COLS = VIEW_PREFIX + "rowCols";
	private static final String VIEW_ERROR_MESSAGE = VIEW_PREFIX + "errorMessage";
	private static final String VIEW_FORM = VIEW_PREFIX + "form";
	private static final String VIEW_CODE_BLOCK = VIEW_PREFIX + "codeBlock";
	private static final String VIEW_VALIDATION = VIEW_PREFIX + "validation";
	private static final String VIEW_ALERT = VIEW_PREFIX + "alert";
	private static final String VIEW_DROPDOWN = VIEW_PREFIX + "dropdown";
	private static final String VIEW_MODAL = VIEW_PREFIX + "modal";
	private static final String VIEW_PAGINATION = VIEW_PREFIX + "pagination";
	private static final String VIEW_TOOLTIPS = VIEW_PREFIX + "tooltips";
	private static final String VIEW_SELECT = VIEW_PREFIX + "select";
	private static final String VIEW_CARD = VIEW_PREFIX + "card";
	private static final String VIEW_CHECK_BOX = VIEW_PREFIX + "checkBox";
	private static final String VIEW_FOOTER = VIEW_PREFIX + "footer";

	/* パス（先頭スラッシュで統一。ルートのみ "/"） */
	private static final String PATH_ROOT = "/";
	private static final String PATH_BREADCRUMP = "/test/breadcrump";
	private static final String PATH_BUTTONS = "/test/buttons";
	private static final String PATH_BTN_GROUP_VERTICAL = "/test/btnGroupVertical";
	private static final String PATH_ACCORDION = "/test/accordion";
	private static final String PATH_NAVBAR_USER = "/test/navbarUser";
	private static final String PATH_NAVBAR_ADMIN = "/test/navbarAdmin";
	private static final String PATH_OFFCANVAS = "/test/offcanvas";
	private static final String PATH_TABLE = "/test/table";
	private static final String PATH_LIST_GROUP = "/test/listGroup";
	private static final String PATH_ROW_COLS = "/test/rowCols";
	private static final String PATH_ERROR_MESSAGE = "/test/errorMessage";
	private static final String PATH_FORM = "/test/form";
	private static final String PATH_CODE_BLOCK = "/test/codeBlock";
	private static final String PATH_VALIDATION = "/test/validation";
	private static final String PATH_ALERT = "/test/alert";
	private static final String PATH_DROPDOWN = "/test/dropdown";
	private static final String PATH_MODAL = "/test/modal";
	private static final String PATH_PAGINATION = "/test/pagination";
	private static final String PATH_TOOLTIPS = "/test/tooltips";
	private static final String PATH_SELECT = "/test/select";
	private static final String PATH_CARD = "/test/card";
	private static final String PATH_CHECK_BOX = "/test/checkBox";
	private static final String PATH_FOOTER = "/test/footer";

	/* ===== [private] END ===== */

	/* ===== [public/protected] START ===== */

	/** ホーム（デフォルトは buttons のデモ） */
	@GetMapping(PATH_ROOT)
	final String getHome() {
		return VIEW_BUTTONS;
	}

	/** パンくず */
	@GetMapping(PATH_BREADCRUMP)
	final String getBreadcrump() {
		return VIEW_BREADCRUMP;
	}

	/** ボタン */
	@GetMapping(PATH_BUTTONS)
	final String getButtons() {
		return VIEW_BUTTONS;
	}

	/** 縦ボタングループ */
	@GetMapping(PATH_BTN_GROUP_VERTICAL)
	final String getBtnGroupVertical() {
		return VIEW_BTN_GROUP_VERTICAL;
	}

	/** アコーディオン */
	@GetMapping(PATH_ACCORDION)
	final String getAccordion() {
		return VIEW_ACCORDION;
	}

	/** ユーザー用ナビバー */
	@GetMapping(PATH_NAVBAR_USER)
	final String getNavbarUser() {
		return VIEW_NAVBAR_USER;
	}

	/** 管理者用ナビバー */
	@GetMapping(PATH_NAVBAR_ADMIN)
	final String getNavbarAdmin() {
		return VIEW_NAVBAR_ADMIN;
	}

	/** オフキャンバス */
	@GetMapping(PATH_OFFCANVAS)
	final String getOffcanvas() {
		return VIEW_OFFCANVAS;
	}

	/** テーブル */
	@GetMapping(PATH_TABLE)
	final String getTable() {
		return VIEW_TABLE;
	}

	/** リストグループ */
	@GetMapping(PATH_LIST_GROUP)
	final String getListGroup() {
		return VIEW_LIST_GROUP;
	}

	/** レスポンシブ行列 */
	@GetMapping(PATH_ROW_COLS)
	final String getRowCols() {
		return VIEW_ROW_COLS;
	}

	/** エラーメッセージ */
	@GetMapping(PATH_ERROR_MESSAGE)
	final String getErrorMessage() {
		return VIEW_ERROR_MESSAGE;
	}

	/** フォーム */
	@GetMapping(PATH_FORM)
	final String getForm() {
		return VIEW_FORM;
	}

	/** コードブロック */
	@GetMapping(PATH_CODE_BLOCK)
	final String getCodeBlock() {
		return VIEW_CODE_BLOCK;
	}

	/** バリデーション */
	@GetMapping(PATH_VALIDATION)
	final String getValidation() {
		return VIEW_VALIDATION;
	}

	/** アラート */
	@GetMapping(PATH_ALERT)
	final String getAlert() {
		return VIEW_ALERT;
	}

	/** ドロップダウン */
	@GetMapping(PATH_DROPDOWN)
	final String getDropdown() {
		return VIEW_DROPDOWN;
	}

	/** モーダル */
	@GetMapping(PATH_MODAL)
	final String getModal() {
		return VIEW_MODAL;
	}

	/** ページネーション */
	@GetMapping(PATH_PAGINATION)
	final String getPagination() {
		return VIEW_PAGINATION;
	}

	/** ツールチップ */
	@GetMapping(PATH_TOOLTIPS)
	final String getTooltips() {
		return VIEW_TOOLTIPS;
	}

	/** セレクト */
	@GetMapping(PATH_SELECT)
	final String getSelect() {
		return VIEW_SELECT;
	}

	/** カード */
	@GetMapping(PATH_CARD)
	final String getCard() {
		return VIEW_CARD;
	}

	/** チェックボックス */
	@GetMapping(PATH_CHECK_BOX)
	final String getCheckBox() {
		return VIEW_CHECK_BOX;
	}

	/** フッター */
	@GetMapping(PATH_FOOTER)
	final String getFooter() {
		return VIEW_FOOTER;
	}

	/* ===== [public/protected] END ===== */
}
