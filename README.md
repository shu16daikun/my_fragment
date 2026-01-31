# my_fragment — module map（JAR / UI Fragments / JPMS 無効）

> 目的：**共通フロント資産**（Thymeleaf フラグメント＋静的ファイル）をモジュール化し、各画面で再利用。
> 位置づけ：Boot化しない **JAR ライブラリ**。`META-INF/resources/psfm/**` は `/psfm/**` で静的配信、`templates/psfm/**` はフラグメントとして参照。
> ルートpkg想定：`com.fragment`（Java クラスが無い場合も可）

---

## 1. モジュール直下（ベースファイル）

* `pom.xml` … 依存とパッケージング（jar）。
* `.editorconfig` … **全言語タブ（幅4）**/LF/末尾改行/行末空白削除を固定。
* `.eclipse/formatter/eclipse-java-formatter.xml` … 将来 Spotless から参照。
* `src/main/resources/application.properties` … 原則空（Boot起動はしない）。
* `docs/` / `HELP.md` … 簡易導入・変更履歴。

> メモ：**JPMS 無効**（`module-info.java` は置かない）。

---

## 2. ディレクトリ構成（主）

```
my_fragment/
├─ src/main/
│  ├─ resources/
│  │  ├─ META-INF/resources/psfm/
│  │  │  ├─ css/
│  │  │  │  ├─ common/         # 共通: var.css, common.css, layout 等
│  │  │  │  └─ fragment/       # 断片別: alert.css, form.css, navbar.css...
│  │  │  ├─ js/
│  │  │  │  ├─ common/         # 共通便益: utils.js ほか
│  │  │  │  └─ fragment/       # 断片別: alert.js, form.js, validation.js...
│  │  │  └─ img/               # 画像類（png/svg等）
│  │  └─ templates/psfm/
│  │     ├─ fragment/          # Thymeleaf フラグメント群
│  │     └─ test/              # 表示確認用の簡易テンプレ（運用非必須）
└─ ...
```

---

## 3. コンポ「内」種別（再利用 UI 部品）

### 3.1 HTML（Thymeleaf フラグメント）

* 例：`templates/psfm/fragment/navbar-user.html`

  * `th:fragment="navbar"` で公開。
* 例：`templates/psfm/fragment/validation.html`

  * グローバルアラート/行内エラーの表示断片。

### 3.2 CSS

* `psfm/css/common/**` … 色・余白・共通レイアウト基盤。
* `psfm/css/fragment/**` … 部品別スタイル（alert/form/navbar/table/modal…）。

### 3.3 JS

* `psfm/js/common/utils.js` … **共通便益**（`isBlank/between/matches` など）。
* `psfm/js/fragment/**` … フラグメント単位の振る舞い（`validation.js` など）。

> 規約メモ：**HTML/CSS/JS すべてタブインデント**。DOM 契約はコメントで明記（`.my-validation-container` / `.my-invalid` / `.my-alert-danger` など）。

---

## 4. コンポ「外」種別（補助・整備用）

* `templates/psfm/test/**` … フラグメントの表示確認用テンプレ。
* テスト用軽量コントローラ（必要時 `src/test/java/com/fragment/**`）… 実運用コードには含めない。
* 整形・設定系（`.editorconfig` 等）… **全言語タブ**の担保。

---

## 5. 本体（main_app）からの利用

### 5.1 静的資産の読み込み

```html
<!-- CSS -->
<link rel="stylesheet" th:href="@{/psfm/css/common/common.css}">
<link rel="stylesheet" th:href="@{/psfm/css/fragment/validation.css}">

<!-- JS（順序：共通 → 断片） -->
<script th:src="@{/psfm/js/common/utils.js}"></script>
<script th:src="@{/psfm/js/fragment/validation.js}"></script>

<!-- 画像 -->
<img th:src="@{/psfm/img/png/logo.png}" alt="logo">
```

### 5.2 フラグメントの挿入

```html
<!-- ユーザーナビバー -->
<div th:replace="~{/psfm/fragment/navbar-user :: navbar}"></div>

<!-- 入力フォーム断片 -->
<div th:replace="~{/psfm/fragment/form :: formSection}"></div>

<!-- バリデーション表示（上部アラート等） -->
<div th:replace="~{/psfm/fragment/validation :: messages(area='page-top')}"></div>
```

> 覚え方：**静的**は `/psfm/**`、**フラグメント**は `/psfm/fragment/**`。

---

## 6. 規約と接続（抜粋リマインド）

* **全言語タブインデント（幅4）**厳守。
* 画面メッセージは **`ValidationMessageUtil` → `window.VALIDATION_MESSAGES`** へ一括投入（JS 側で **再宣言しない**）。
* フロント検証：

  * フィールドローカル（必須/長さ）＝**行内 `.my-invalid`**、
  * 正規表現（パスワード等）＝**上部アラート `.my-alert-danger`** に集約（`validation.js` に準拠）。
* セキュリティ：JS へ渡すのは **ID/定数**のみに限定（PIIや自由入力値は不可）。

---

## 7. よくあるハマり & チェック

* `th:replace` のフラグメント名不一致 → HTML 側 `th:fragment` 名称を確認。
* 静的とテンプレのパス混同 → `/psfm/**` vs `/psfm/fragment/**` を使い分け。
* 整形崩れ → `.editorconfig` 有効化、**保存時フォーマット**ON、（導入後は）Spotless/Prettier を CI で検査。
* JS 読み込み順 → **`utils.js` → 断片 JS** の順に。

---

## 8. 導入フロー（最短）

1. `main_app` の `pom.xml` に `my_fragment` を依存追加。
2. 画面テンプレで 5.1/5.2 の要領で参照。
3. 画面メッセージは `GlobalValidationMessagesAdvice`（or 規約の仕組み）で `validationMessages` を投入。
4. 動作確認：フラグメントの表示／バリデーションの見た目／JS の初期化ログ。

---

## 9. バージョニング方針（SemVer）

* 追加（互換）＝ **MINOR**、修正＝ **PATCH**、破壊的変更（クラス名・フラグメント名・パス変更）＝ **MAJOR**。
* 本体は明示バージョン固定。更新時は差分一覧（CSS/JS/fragment 変更点）をリリースノートに記す。

---

必要に応じて、この内容を `my_fragment/README.md` と **基本規則.md（要点リンク）**に転記できます。
