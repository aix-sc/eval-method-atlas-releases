// Eval Method Atlas — 公開データ（atlas-data.json.gz）を引く処理。MCP サーバー・CLI・ウェブサイトが共有する。
// 依存なし。Node.js 20 以上とブラウザで動く（読み込みは load.mjs と、サイトでは fetch + DecompressionStream）。
// LLM を呼ばない。原稿は外に送らない。
import { TRAIT_TERMS } from './trait_terms.mjs';

export const VERSION = '0.1.0';
export const DATA_URL = 'https://github.com/aix-sc/eval-method-atlas-releases/releases/latest/download/atlas-data.json.gz';

let DB = null;
export const isLoaded = () => !!DB;

/** データ束（JSON を解いたオブジェクト）を読み込む */
export function loadFromObject(obj) { DB = index(obj); return DB; }

function index(d) {
  const T = d.taxonomy;
  const labels = new Map(T.labels.map((l) => [l.id, l]));
  const ids = d.label_ids;
  const cols = d.paper_cols;
  const ci = Object.fromEntries(cols.map((c, i) => [c, i]));
  const papers = d.papers.map((r) => ({
    id: r[ci.id], title: r[ci.title], venue: r[ci.venue], year: r[ci.year], url: r[ci.url], doi: r[ci.doi],
    read_url: r[ci.read_url], labels: new Set(r[ci.labels].map((i) => ids[i])),
    datasets: r[ci.datasets], metrics: r[ci.metrics], tests: r[ci.tests], flags: r[ci.flags] || [],
  }));
  const byId = new Map(papers.map((p) => [p.id, p]));
  const pc = Object.fromEntries(d.pair_cols.map((c, i) => [c, i]));
  const pairs = d.pairs.map((r) => ({ trait: r[pc.trait], method: r[pc.method], n_trait: r[pc.n_trait], n_both: r[pc.n_both],
    p_method_given_trait: r[pc.p_method_given_trait], p_method: r[pc.p_method], lift: r[pc.lift], q: r[pc.q] }));
  const OUTCOME = new Set(['method', 'metric', 'sense_eval']);
  return { raw: d, T, labels, papers, byId, pairs, OUTCOME, fdr: d.fdr_q ?? 0.05 };
}

const db = () => { if (!DB) throw new Error('データが読み込まれていません'); return DB; };

// ------------------------------------------------------------------ 小道具
export function labelInfo(id) {
  const l = db().labels.get(id);
  if (!l) return { id, error: '不明な ID' };
  const o = { id: l.id, axis: l.axis, ja: l.ja, en: l.en };
  if (l.axis === 'method') {
    o.group = l.group; o.group_ja = db().T.method_groups[l.group]?.ja;
    if (l.desc_ja) o.desc_ja = l.desc_ja;
    if (l.pitfalls_ja) o.pitfalls_ja = l.pitfalls_ja;
  }
  return o;
}

function isTrait(id) { const l = db().labels.get(id); return !!l && !db().OUTCOME.has(l.axis); }

function checkTraits(traits) {
  const bad = (traits || []).filter((x) => !isTrait(x));
  if (!traits?.length) throw new Error('研究の特性 ID を 1 つ以上ください（find_traits で探せます）');
  if (bad.length) throw new Error(`研究の特性 ID ではありません：${bad.join(', ')}（find_traits で探してください）`);
}

const judged = () => db().papers;
const withAll = (ids) => judged().filter((p) => ids.every((x) => p.labels.has(x)));
const round = (x, n = 3) => (x == null ? null : Math.round(x * 10 ** n) / 10 ** n);

function paperOut(p) {
  return { id: p.id, title: p.title, venue: p.venue.toUpperCase(), year: p.year,
    doi: p.doi ? `https://doi.org/${p.doi}` : null, url: p.url, read_url: p.read_url };
}

function examplePapers(traits, method, k = 3, { venue, year } = {}) {
  let ps = withAll([...traits, ...(method ? [method] : [])]);
  if (venue) ps = ps.filter((p) => p.venue === String(venue).toLowerCase());
  if (year) ps = ps.filter((p) => p.year === Number(year));
  ps.sort((a, b) => (b.year - a.year) || ((b.read_url ? 1 : 0) - (a.read_url ? 1 : 0)) || a.id.localeCompare(b.id));
  // 学会が偏らないよう、新しい順のまま学会を順に回して選ぶ
  const byV = new Map();
  for (const p of ps) { if (!byV.has(p.venue)) byV.set(p.venue, []); byV.get(p.venue).push(p); }
  const out = [];
  const lists = [...byV.values()];
  for (let i = 0; out.length < k && lists.some((l) => l.length > i); i++) for (const l of lists) if (l[i] && out.length < k) out.push(l[i]);
  return out.map(paperOut);
}

// ------------------------------------------------------------------ 道具
/** 言葉（日本語・英語・ID）から分類体系の項目を探す。traits_only で研究の特性だけに絞る */
export function find_traits({ text, axes, traits_only = false, limit = 12 } = {}) {
  const q = String(text || '').trim().toLowerCase();
  if (!q) throw new Error('探す言葉をください');
  const words = q.split(/[\s、,・/]+/).filter((w) => w.length >= 2);
  const hits = [];
  for (const l of db().labels.values()) {
    if (axes?.length && !axes.includes(l.axis)) continue;
    if (traits_only && db().OUTCOME.has(l.axis)) continue;
    const hay = [l.id, l.ja, l.en, l.desc_ja || ''].join(' ').toLowerCase();
    let s = 0;
    if ([l.id, l.ja.toLowerCase(), l.en.toLowerCase()].includes(q)) s += 10;
    if (hay.includes(q)) s += 4;
    for (const w of words) if (hay.includes(w)) s += 1;
    for (const part of l.ja.split(/[・、（）()\s]/).filter((x) => x.length >= 2)) if (q.includes(part.toLowerCase())) s += 2;
    if (s > 0) hits.push([s, l.id]);
  }
  hits.sort((a, b) => b[0] - a[0]);
  return hits.slice(0, limit).map(([s, id]) => ({ ...labelInfo(id), axis_ja: db().T.axes[db().labels.get(id).axis]?.ja, score: s,
    is_trait: isTrait(id) }));
}

/** 原稿・アイディアの文から、研究の特性の候補を挙げる（手掛かりの語による規則ベース。判定ではないので、最後は選び直す） */
export function suggest_traits({ text, per_axis = 3, min_score = 1 } = {}) {
  const raw = String(text || '');
  if (!raw.trim()) throw new Error('文をください（アイディアや、原稿の要旨・序論）');
  const low = raw.toLowerCase();
  const out = {};
  for (const [id, terms] of Object.entries(TRAIT_TERMS)) {
    const l = db().labels.get(id);
    if (!l) continue;
    let score = 0; const hit = [];
    for (const term of terms) {
      const t = term.toLowerCase();
      let n = 0;
      if (/^[\x00-\x7f]+$/.test(t)) {
        const re = new RegExp(`(?<![a-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-z0-9])`, 'g');
        n = (low.match(re) || []).length;
      } else {
        n = low.split(t).length - 1;
      }
      if (n) { score += Math.min(n, 3) * (t.length >= 6 ? 1.5 : 1); hit.push(term); }
    }
    if (score >= min_score) (out[l.axis] ||= []).push({ id, ja: l.ja, score: round(score, 1), matched: hit.slice(0, 5) });
  }
  const axes = {};
  for (const [a, xs] of Object.entries(out)) axes[a] = { ja: db().T.axes[a]?.ja || a, candidates: xs.sort((x, y) => y.score - x.score).slice(0, per_axis) };
  const picked = ['task', 'data_structure', 'constraint'].map((a) => axes[a]?.candidates?.[0]?.id).filter(Boolean);
  return { axes, suggested_traits: picked,
    note_ja: '語の一致による候補です。研究に当てはまるものを選び直してから design_guide に渡してください。特性を増やすほど当てはまる論文は減ります（2〜3 個が目安）。' };
}

/** 分類体系の一覧（軸・項目・評価手法の群）。axis を渡すとその軸だけ */
export function list_taxonomy({ axis } = {}) {
  const T = db().T;
  const by = {};
  for (const l of T.labels) {
    if (axis && l.axis !== axis) continue;
    (by[l.axis] ||= []).push({ id: l.id, ja: l.ja, en: l.en, ...(l.group ? { group: l.group } : {}) });
  }
  const out = { axes: Object.fromEntries(Object.entries(by).map(([a, items]) => [a, { ja: T.axes[a]?.ja || a, items }])),
    method_groups: T.method_groups };
  if (!axis || axis === 'stat_tests') out.stat_tests = Object.fromEntries(Object.entries(T.stat_tests).filter(([, v]) => (T.stat_groups[v.group]?.facet || 'procedure') === 'procedure').map(([k, v]) => [k, v.ja]));
  return out;
}

function matchedPriors(traits) {
  const ts = new Set(traits);
  return db().T.priors.filter((r) => {
    const any = r.when?.any || []; const all = r.when?.all || [];
    return (any.length && any.some((x) => ts.has(x))) || (all.length && all.every((x) => ts.has(x)));
  });
}

/** 研究の特性から評価手法を推薦（採録論文の集計＋専門知の規則） */
export function recommend_evaluation({ traits, top_k = 12, examples = 3 } = {}) {
  checkTraits(traits);
  const { pairs, fdr, raw } = db();
  const prior = {};
  for (const r of matchedPriors(traits)) for (const m of r.recommend) (prior[m] ||= []).push({ rule: r.id, rationale_ja: r.rationale_ja, caution_ja: r.caution_ja || '' });
  const ev = {};
  for (const p of pairs) if (traits.includes(p.trait)) (ev[p.method] ||= []).push(p);
  const joint = withAll(traits);
  const nj = joint.length;
  const jc = {};
  for (const p of joint) for (const l of p.labels) jc[l] = (jc[l] || 0) + 1;
  const share = raw.overall_share || {};
  const cands = new Set(Object.keys(prior));
  for (const [m, rows] of Object.entries(ev)) if (rows.some((x) => x.q <= fdr && x.lift > 1)) cands.add(m);
  if (nj >= 20) for (const [m, c] of Object.entries(jc)) if (share[m] && c / nj > 1.3 * share[m]) cands.add(m);
  const items = [];
  for (const m of cands) {
    if (db().labels.get(m)?.axis !== 'method') continue;
    const rows = ev[m] || [];
    const sig = rows.filter((x) => x.q <= fdr && x.lift > 1);
    const mll = rows.length ? rows.reduce((s, x) => s + Math.log(x.lift), 0) / rows.length : 0;
    const score = (prior[m]?.length || 0) + 2 * Math.max(mll, 0) + 0.5 * sig.length;
    items.push({ ...labelInfo(m), score: round(score),
      share_in_these_papers: nj ? round((jc[m] || 0) / nj) : null, share_overall: share[m] ?? null,
      prior: prior[m] || [],
      evidence: rows.map((x) => ({ trait: x.trait, p_method_given_trait: round(x.p_method_given_trait), p_method: round(x.p_method),
        lift: round(x.lift, 2), q: x.q, n_both: x.n_both, n_trait: x.n_trait })) });
  }
  items.sort((a, b) => b.score - a.score);
  const top = items.slice(0, top_k);
  for (const it of top) it.example_papers = examplePapers(traits, it.id, examples);
  return { traits: traits.map(labelInfo), n_papers_with_all_traits: nj, n_judged: judged().length, recommendations: top,
    note_ja: 'share は同じ特性を持つ採録論文（T2）での採用率。prior は評価方法論の勧め（T1・T3）。採用率が高いことは正しさの根拠ではない。' };
}

/** 参考にできる論文（指定の特性と、任意で評価手法をすべて持つ採録論文）。DOI と原稿を読めるリンクつき */
export function reference_papers({ traits, method, k = 10, venue, year } = {}) {
  checkTraits(traits);
  if (method && db().labels.get(method)?.axis !== 'method' && db().labels.get(method)?.axis !== 'metric') throw new Error(`評価手法・指標の ID ではありません：${method}`);
  const all = withAll([...traits, ...(method ? [method] : [])]);
  return { traits: traits.map(labelInfo), method: method ? labelInfo(method) : null, n_matching: all.length,
    papers: examplePapers(traits, method, k, { venue, year }),
    note_ja: 'read_url は公開版の PDF（arXiv・OpenReview・CVF など）か論文ページ。ラベルは Jev の判定で、誤りを含みうるので本文で確かめてください。' };
}

function topCounter(list, k) {
  const c = new Map();
  for (const xs of list) for (const x of new Set(xs)) c.set(x, (c.get(x) || 0) + 1);
  return [...c.entries()].sort((a, b) => b[1] - a[1]).slice(0, k);
}

/** 評価の設計ガイド：データ・分け方・指標・検定・注意・実例 */
export function design_guide({ traits, top = 15, min_share = 0.05 } = {}) {
  checkTraits(traits);
  const D = db();
  const joint = withAll(traits);
  const all = judged();
  const nj = joint.length; const na = all.length;
  const rec = recommend_evaluation({ traits, top_k: 12, examples: 3 });
  const recIds = new Set(rec.recommendations.map((r) => r.id));
  const shareOf = (ps, id) => (ps.length ? ps.filter((p) => p.labels.has(id)).length / ps.length : 0);
  const lexJ = joint.filter((p) => p.datasets); const lexA = all.filter((p) => p.datasets);
  const cntA = (key) => { const m = new Map(); for (const p of lexA) for (const x of new Set(p[key])) m.set(x, (m.get(x) || 0) + 1); return m; };
  const dsA = cntA('datasets'); const mnA = cntA('metrics');
  const datasets = topCounter(lexJ.map((p) => p.datasets), top).map(([name, n]) => ({ name, papers: n, share: round(n / lexJ.length), share_all: round((dsA.get(name) || 0) / lexA.length, 4) }));
  const metric_names = topCounter(lexJ.map((p) => p.metrics), top).map(([name, n]) => ({ name, papers: n, share: round(n / lexJ.length), share_all: round((mnA.get(name) || 0) / lexA.length, 4) }));
  const methods = D.T.labels.filter((l) => l.axis === 'method').map((l) => ({ ...labelInfo(l.id), share: round(shareOf(joint, l.id)), share_all: round(shareOf(all, l.id)), recommended: recIds.has(l.id) }))
    .filter((m) => m.share >= min_share || m.recommended).sort((a, b) => b.share - a.share);
  const metric_families = D.T.labels.filter((l) => l.axis === 'metric').map((l) => ({ id: l.id, ja: l.ja, share: round(shareOf(joint, l.id)), share_all: round(shareOf(all, l.id)) }))
    .filter((m) => m.share >= min_share).sort((a, b) => b.share - a.share);
  const ST = D.T.stat_tests; const SG = D.T.stat_groups;
  const proc = (t) => (SG[ST[t]?.group]?.facet || 'procedure') === 'procedure' && ST[t];
  const scJ = joint.filter((p) => p.tests); const scA = all.filter((p) => p.tests);
  const tA = new Map(); for (const p of scA) for (const t of p.tests) tA.set(t, (tA.get(t) || 0) + 1);
  const tests = topCounter(scJ.map((p) => p.tests.filter(proc)), top).map(([id, n]) => ({ id, ja: ST[id].ja, group_ja: SG[ST[id].group]?.ja, papers: n, share: round(n / scJ.length), share_all: round((tA.get(id) || 0) / scA.length, 4) }));
  const HYP = new Set(['test_param', 'test_nonpar', 'test_cat']);
  const hyp = (ps) => (ps.length ? ps.filter((p) => p.tests.some((t) => proc(t) && HYP.has(ST[t].group))).length / ps.length : null);
  const none = scJ.length ? scJ.filter((p) => !p.tests.some(proc)).length / scJ.length : null;
  const ts = new Set(traits);
  const cautions = D.T.mismatch_rules.filter((r) => (r.label_any || []).some((x) => ts.has(x))).map((r) => ({ id: r.id, ja: r.ja, why_ja: r.why_ja, suggest_ja: r.suggest_ja,
    basis: r.basis, basis_ja: r.basis_ja, refs: r.refs, flagged_papers: joint.filter((p) => p.flags.includes(r.id)).length }));
  const priors = matchedPriors(traits).map((r) => ({ id: r.id, rationale_ja: r.rationale_ja, caution_ja: r.caution_ja || '', recommend: r.recommend.map((m) => labelInfo(m).ja) }));
  return { traits: traits.map(labelInfo), n_papers_with_all_traits: nj, n_judged: na,
    small_sample: nj < 20, data: { n_extracted: lexJ.length, datasets }, methods, metrics: { families: metric_families, names: metric_names },
    tests: { n_scanned: scJ.length, hypothesis_test_share: round(hyp(scJ)), hypothesis_test_share_all: round(hyp(scA)), no_procedure_share: round(none), items: tests },
    cautions, priors, examples: Object.fromEntries(rec.recommendations.map((r) => [r.id, r.example_papers])) };
}

/** 原稿の評価の設計を点検：研究の特性と、原稿で使っている評価手法・検定の ID から、勧めの抜けと乖離の規則の当てはまりを返す */
export function review_design({ traits, methods_used = [], tests_used = [] } = {}) {
  checkTraits(traits);
  const badT = tests_used.filter((x) => !db().T.stat_tests[x]);
  if (badT.length) throw new Error(`検定・検証手法の ID ではありません：${badT.join(', ')}（list_taxonomy の stat_tests を見てください。例 t_test_paired, wilcoxon, kfold_cv, holdout）`);
  const badM = methods_used.filter((x) => db().labels.get(x)?.axis !== 'method');
  if (badM.length) throw new Error(`評価手法の ID ではありません：${badM.join(', ')}`);
  const used = new Set([...methods_used, ...tests_used]);
  const labs = new Set([...traits, ...methods_used]);
  const rec = recommend_evaluation({ traits, top_k: 12, examples: 2 });
  const missing = rec.recommendations.filter((r) => !used.has(r.id) && (r.prior.length || (r.share_in_these_papers ?? 0) >= 0.2))
    .map((r) => ({ id: r.id, ja: r.ja, why: r.prior.map((p) => p.rationale_ja)[0] || `同じ特性の採録論文の ${Math.round((r.share_in_these_papers || 0) * 100)}% が使っている`, example_papers: r.example_papers }));
  const flags = [];
  for (const r of db().T.mismatch_rules) {
    const la = r.label_any || []; const ln = r.label_none || [];
    const any = r.any || []; const allx = r.all || []; const nonex = r.none || [];
    if (!any.length && !allx.length) continue; // 使った手続きで決まる規則だけを当てる
    if (r.cue_any?.length || r.metric_any?.length || r.metric_none?.length) continue; // データの性質の記述・指標名で決まる規則は、原稿の本文が要るので当てない
    if (la.length && !la.some((x) => labs.has(x))) continue;
    if (ln.some((x) => labs.has(x))) continue;
    if (any.length && !any.some((x) => used.has(x))) continue;
    if (allx.length && !allx.every((x) => used.has(x))) continue;
    if (nonex.some((x) => used.has(x))) continue;
    flags.push({ id: r.id, ja: r.ja, why_ja: r.why_ja, suggest_ja: r.suggest_ja, basis: r.basis, basis_ja: r.basis_ja, refs: r.refs });
  }
  return { traits: traits.map(labelInfo), missing_recommended: missing, mismatch_flags: flags,
    note_ja: '旗は「要確認の候補」で、誤りの断定ではない。tests_used は list_taxonomy の stat_tests の ID（例 random_split, paired_t_test）。' };
}

/** 評価手法・指標の定義・注意点と、結びつきの強い研究の特性 */
export function method_profile({ method_id } = {}) {
  const l = db().labels.get(method_id);
  if (!l || !['method', 'metric'].includes(l.axis)) throw new Error(`評価手法・指標の ID ではありません：${method_id}`);
  const assoc = db().pairs.filter((p) => p.method === method_id && p.q <= db().fdr && p.lift > 1).sort((a, b) => b.lift - a.lift).slice(0, 12)
    .map((p) => ({ trait: labelInfo(p.trait), lift: round(p.lift, 2), p_method_given_trait: round(p.p_method_given_trait), n_both: p.n_both }));
  const byYear = {}; const byVenue = {};
  for (const p of judged()) {
    const h = p.labels.has(method_id) ? 1 : 0;
    (byYear[p.year] ||= [0, 0])[0] += h; byYear[p.year][1]++;
    (byVenue[p.venue] ||= [0, 0])[0] += h; byVenue[p.venue][1]++;
  }
  const sh = (o) => Object.entries(o).map(([k, [a, b]]) => ({ key: k, share: round(a / b), n: b }));
  return { ...labelInfo(method_id), share_overall: db().raw.overall_share?.[method_id] ?? null,
    share_by_year: sh(byYear), share_by_venue: sh(byVenue).sort((a, b) => b.share - a.share), associated_traits: assoc,
    prior_rules: db().T.priors.filter((r) => r.recommend.includes(method_id)).map((r) => r.id) };
}

/** 研究の特性の論文数と、その特性に適した評価手法 */
export function trait_profile({ trait_id } = {}) {
  checkTraits([trait_id]);
  const r = recommend_evaluation({ traits: [trait_id], top_k: 15, examples: 2 });
  return { ...labelInfo(trait_id), n_papers: r.n_papers_with_all_traits, recommendations: r.recommendations };
}

/** タイトルの語・学会・年・ラベル（すべてを満たす）で採録論文を探す */
export function search_papers({ query = '', venue, year, labels = [], limit = 20 } = {}) {
  const q = query.toLowerCase();
  let ps = judged();
  if (q) ps = ps.filter((p) => (p.title || '').toLowerCase().includes(q));
  if (venue) ps = ps.filter((p) => p.venue === String(venue).toLowerCase());
  if (year) ps = ps.filter((p) => p.year === Number(year));
  if (labels.length) ps = ps.filter((p) => labels.every((x) => p.labels.has(x)));
  return { n_matching: ps.length, papers: ps.slice(0, limit).map((p) => ({ ...paperOut(p), labels: [...p.labels] })) };
}

/** 論文 1 本の書誌・リンク・判定ラベル（軸ごと）・抽出した名前・検定・乖離の旗 */
export function get_paper({ paper_id } = {}) {
  const p = db().byId.get(paper_id);
  if (!p) throw new Error(`見つかりません：${paper_id}`);
  const by = {};
  for (const id of p.labels) { const l = db().labels.get(id); if (l) (by[l.axis] ||= []).push({ id, ja: l.ja }); }
  return { ...paperOut(p), labels_by_axis: by, datasets: p.datasets, metric_names: p.metrics,
    tests: (p.tests || []).map((t) => ({ id: t, ja: db().T.stat_tests[t]?.ja || t })), mismatch_flags: p.flags };
}

/** Jev に送っている判定の問いと基準（判定の透明性のため）。questions.json があれば使う */
export function judge_questions({ axis } = {}) {
  const T = db().T;
  const labs = T.labels.filter((l) => !axis || l.axis === axis).map((l) => ({ id: l.id, axis: l.axis, ja: l.ja, en: l.en }));
  return { model: db().raw.judge?.model, thresholds: db().raw.judge?.thresholds, n: labs.length, labels: labs,
    note_ja: '問いの原文と判定の基準（当てはまる・当てはまらない）の全文は、ウェブサイトの「判定の問い」と公開データの questions.json にあります。' };
}

/** データの版・件数・学会 × 年の判定件数 */
export function corpus_status() {
  const d = db().raw;
  return { generated: d.generated, license: d.license, cite: d.cite, judge: d.judge, n_judged: judged().length, coverage: d.coverage };
}

// ------------------------------------------------------------------ 道具の定義（MCP と CLI の共通）
const S = (props, required = []) => ({ type: 'object', properties: props, required, additionalProperties: false });
const strArr = { type: 'array', items: { type: 'string' } };
export const TOOLS = [
  { name: 'find_traits', fn: find_traits, desc: '言葉（日本語・英語）から研究の特性・評価手法の ID を探す。原稿やアイディアを読んで、当てはまる特性を選ぶ前に使う。',
    schema: S({ text: { type: 'string', description: '例「時系列の将来予測」「user study」' }, traits_only: { type: 'boolean' }, axes: strArr, limit: { type: 'integer' } }, ['text']) },
  { name: 'suggest_traits', fn: suggest_traits, desc: '原稿・アイディアの文から研究の特性の候補を挙げる（語の一致による候補。Claude は自分で読んで選んでもよい）。',
    schema: S({ text: { type: 'string', description: 'アイディア、または原稿の要旨・序論の文' }, per_axis: { type: 'integer' } }, ['text']) },
  { name: 'design_guide', fn: design_guide, desc: '研究の特性 ID から、同じ特性の採録論文が使うデータ・分け方・指標・検定と、注意（乖離の規則と根拠の文献）、実例の論文をまとめて返す。',
    schema: S({ traits: { ...strArr, description: '例 ["t_forecasting","d_time_series","c_nonstationary"]' } }, ['traits']) },
  { name: 'recommend_evaluation', fn: recommend_evaluation, desc: '研究の特性 ID から評価手法を推薦する（採録論文での採用率と専門知の規則）。',
    schema: S({ traits: strArr, top_k: { type: 'integer' } }, ['traits']) },
  { name: 'reference_papers', fn: reference_papers, desc: '指定の特性（と任意の評価手法）を持つ採録論文を、DOI と原稿を読めるリンクつきで返す。ケーススタディの参考に使う。',
    schema: S({ traits: strArr, method: { type: 'string', description: '評価手法・指標の ID（任意）' }, k: { type: 'integer' }, venue: { type: 'string' }, year: { type: 'integer' } }, ['traits']) },
  { name: 'review_design', fn: review_design, desc: '原稿の評価の設計を点検する。研究の特性と、原稿で使っている評価手法・検定の ID から、勧めの抜けと乖離の規則の当てはまりを返す。',
    schema: S({ traits: strArr, methods_used: strArr, tests_used: strArr }, ['traits']) },
  { name: 'method_profile', fn: method_profile, desc: '評価手法・指標の定義・落とし穴・年ごと学会ごとの採用率・結びつきの強い特性。',
    schema: S({ method_id: { type: 'string' } }, ['method_id']) },
  { name: 'trait_profile', fn: trait_profile, desc: '研究の特性の論文数と、その特性に適した評価手法。', schema: S({ trait_id: { type: 'string' } }, ['trait_id']) },
  { name: 'search_papers', fn: search_papers, desc: 'タイトルの語・学会・年・ラベル（すべてを満たす）で採録論文を探す。',
    schema: S({ query: { type: 'string' }, venue: { type: 'string' }, year: { type: 'integer' }, labels: strArr, limit: { type: 'integer' } }) },
  { name: 'get_paper', fn: get_paper, desc: '論文 1 本の書誌・リンク・判定ラベル・データセット名・指標名・検定・乖離の旗。', schema: S({ paper_id: { type: 'string' } }, ['paper_id']) },
  { name: 'list_taxonomy', fn: list_taxonomy, desc: '分類体系の一覧（研究の特性の軸と項目、評価手法 46、指標の族 26、10SM）。', schema: S({ axis: { type: 'string' } }) },
  { name: 'judge_questions', fn: judge_questions, desc: '判定に使った問いの一覧と閾値（判定の透明性のため）。', schema: S({ axis: { type: 'string' } }) },
  { name: 'corpus_status', fn: corpus_status, desc: 'データの版・ライセンス・学会 × 年の判定件数。', schema: S({}) },
];
