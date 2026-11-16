// design_guide の結果を Markdown にする（CLI の --md と、ウェブサイトのデモの元）。
const pct = (x) => (x == null ? '—' : `${Math.round(x * 100)}%`);
const pct1 = (x) => (x == null ? '—' : `${(x * 100).toFixed(1)}%`);
const ratio = (a, b) => (b ? `${(a / b).toFixed(1)} 倍` : '—');

export function guideMarkdown(g, labelInfo) {
  const nj = g.n_papers_with_all_traits; const na = g.n_judged;
  const L = [`# 評価の設計ガイド：${g.traits.map((x) => x.ja).join('・')}`, '',
    `- 特性：${g.traits.map((x) => x.id).join(', ')}`,
    `- 対象：判定済み ${na.toLocaleString()} 本のうち、指定した特性がすべて当てはまる **${nj.toLocaleString()} 本**（CORE A* の採録論文 2024〜2026）`,
    '- 「全体」は判定済みの論文全体での割合。「何倍」は、この特性の論文で全体より何倍よく使われるか。',
    '- ラベルは判定モデル（Jev）の出力で、誤りを含みえます。実例の論文は本文で確かめてください。', ''];
  if (g.small_sample) L.push(`> 当てはまる論文が ${nj} 本と少ないため、割合は不安定です。特性を減らすと母数が増えます。`, '');
  L.push('## 1. どんなデータを使っているか', '', `規則ベースの抽出を済ませた ${g.data.n_extracted.toLocaleString()} 本での上位（辞書にある名前だけ）。`, '',
    '| データセット | 論文数 | 割合 | 全体 |', '|---|---:|---:|---:|',
    ...g.data.datasets.map((d) => `| ${d.name} | ${d.papers} | ${pct(d.share)} | ${pct1(d.share_all)} |`));
  L.push('', '## 2. データの分け方・実験の組み方', '', '★＝勧める手法。', '',
    '| 手法 | 群 | 割合 | 全体 | 何倍 | 落とし穴 |', '|---|---|---:|---:|---:|---|',
    ...g.methods.map((m) => `| ${m.recommended ? '★ ' : ''}${m.ja} | ${m.group_ja || ''} | ${pct(m.share)} | ${pct(m.share_all)} | ${ratio(m.share, m.share_all)} | ${m.pitfalls_ja || ''} |`));
  L.push('', '## 3. 何で測っているか（指標）', '', '| 指標の種類 | 割合 | 全体 | 何倍 |', '|---|---:|---:|---:|',
    ...g.metrics.families.map((m) => `| ${m.ja} | ${pct(m.share)} | ${pct(m.share_all)} | ${ratio(m.share, m.share_all)} |`),
    '', '| 指標名 | 論文数 | 割合 | 全体 |', '|---|---:|---:|---:|',
    ...g.metrics.names.map((d) => `| ${d.name} | ${d.papers} | ${pct(d.share)} | ${pct1(d.share_all)} |`));
  L.push('', '## 4. どう確かめているか（統計的検定・検証手法）', '',
    `本文を走査できた ${g.tests.n_scanned.toLocaleString()} 本での割合。「significantly」などの言い回しは数えない。`, '');
  if (g.tests.hypothesis_test_share != null) L.push(`- 仮説検定を1つでも使っている論文：**${pct(g.tests.hypothesis_test_share)}**（全体 ${pct(g.tests.hypothesis_test_share_all)}）`, `- 検定・検証の手続きが1つも見つからない論文：${pct(g.tests.no_procedure_share)}`, '');
  L.push('| 検定・検証手法 | 群 | 論文数 | 割合 | 全体 |', '|---|---|---:|---:|---:|',
    ...g.tests.items.map((x) => `| ${x.ja} | ${x.group_ja || ''} | ${x.papers} | ${pct(x.share)} | ${pct1(x.share_all)} |`));
  L.push('', '## 5. 注意すること', '');
  for (const p of g.priors) L.push(`- **勧め（${p.id}）**：${p.rationale_ja}${p.caution_ja ? ` 注意：${p.caution_ja}` : ''}`);
  for (const c of g.cautions) L.push(`- **乖離の規則 ${c.id}［${c.basis}］**：${c.ja}。${c.why_ja} → ${c.suggest_ja}（この特性の論文で旗が立ったのは ${c.flagged_papers} 本）  根拠：${c.basis_ja}（${(c.refs || []).join('; ')}）`);
  L.push('', '## 6. 実例の論文（勧める手法ごと）', '');
  for (const [mid, ps] of Object.entries(g.examples)) {
    if (!ps.length) continue;
    L.push(`**${labelInfo(mid).ja}**`, ...ps.map((p) => `- ${p.title}（${p.venue} ${p.year}） ${p.read_url || p.doi || p.url || ''}${p.doi && p.read_url !== p.doi ? `  DOI: ${p.doi}` : ''}`), '');
  }
  return L.join('\n');
}
