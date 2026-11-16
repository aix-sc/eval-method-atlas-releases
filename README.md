# Eval Method Atlas — releases

原稿かアイディアを渡すと、実験と評価の設計が返ってくる道具の配布物と、判定結果の公開データです。
サイト：https://eval.aix.sc/

## 配布物（Releases）

- `eval-method-atlas.mcpb`：Claude Desktop の拡張機能（ローカル版 MCP、データ同梱）
- `eval-method-atlas.mjs`：コマンドライン（単一ファイル、Node.js 20 以上）
- `atlas-data.json.gz`：公開データの束（書誌・DOI・読めるリンク・判定ラベル・規則ベースの抽出・乖離の旗・集計・分類体系）
- `papers.jsonl.gz`：論文ごとのすべてのラベルの確率と判定
- `questions.json`：判定モデルに送った問いと判定の基準

論文の本文・アブストラクト・抽出した文は含みません。原文は各論文のリンク先で読んでください。
判定は TypeSafe Jev による自動の判定で、誤りを含みえます。

## ライセンス

- データ：CC BY 4.0（書誌は DBLP 由来で CC0）
- コード（サイト・MCP・CLI）：MIT

引用：Takahashi, Y. et al. Eval Method Atlas (AIx{ } Project, Musashino University), 2026.
