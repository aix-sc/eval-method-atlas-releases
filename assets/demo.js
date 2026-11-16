// 自動で再生するデモ：入力（ファイルとひとこと／コマンド）→ 道具の呼び出し → 出力。
// 出力の数字は、このページが読み込んだ公開データから、その場で計算する（作り話の数字は出さない）。
// mode="mcp" はチャットの画面、mode="cli" はターミナルの画面。画面に入ったら再生し、場面を順に回す。
import { design_guide, review_design, reference_papers, suggest_traits, find_traits } from '../lib/core.mjs';
import { loadData, h, pct } from './site.js';

const CLI = 'node eval-method-atlas.mjs';
const top = (xs, n) => xs.slice(0, n);
const ex = (ps, n = 2) => top(ps || [], n).map((p) => `・${p.title}（${p.venue} ${p.year}）\n  ${p.read_url || p.doi}`).join('\n');

export const SCENARIOS = [
  {
    key: 'idea', label: 'アイディアから設計',
    files: [],
    prompt: '工場のセンサーの時系列から、3 日先の故障を予測したい。季節で傾向が変わる。評価はどう設計すればいい？',
    cli: `${CLI} design-guide --traits t_forecasting,d_time_series,c_nonstationary --md`,
    calls: ['suggest_traits', 'design_guide', 'reference_papers'],
    run() {
      const s = suggest_traits({ text: this.prompt });
      const traits = ['t_forecasting', 'd_time_series', 'c_nonstationary'].filter((x) => s.suggested_traits.includes(x)).length === 3 ? s.suggested_traits : ['t_forecasting', 'd_time_series', 'c_nonstationary'];
      const g = design_guide({ traits });
      const m = (id) => g.methods.find((x) => x.id === id);
      const ts = m('temporal_split'); const mr = m('multiple_runs_variance');
      const mase = g.metrics.names.find((x) => x.name === 'MASE');
      const ds = top(g.data.datasets, 3).map((d) => `${d.name} ${pct(d.share)}`).join('・');
      const mn = top(g.metrics.names.filter((x) => ['MAE', 'MSE', 'RMSE', 'MAPE'].includes(x.name)), 3).map((d) => `${d.name} ${pct(d.share)}`).join('・');
      const rp = reference_papers({ traits, method: 'temporal_split', k: 2 });
      const chat = `「将来予測」「時系列・センサー」「時間とともに変わる」の研究と読みました。同じ特性の採録論文 ${g.n_papers_with_all_traits.toLocaleString()} 本では：\n\n`
        + `データ：${ds}\n`
        + `分け方：時間順の分割・ローリング評価（${pct(ts?.share)}、全体の ${ts ? (ts.share / ts.share_all).toFixed(1) : '—'} 倍）。ランダムに分けると未来の情報が学習に入ります（T1）。\n`
        + `指標：${mn}。尺度に依存しない MASE も併記を（採録論文では ${pct(mase?.share)}）。\n`
        + `確かめ方：複数回の実行のばらつき（${pct(mr?.share)}）。仮説検定を使う論文は ${pct(g.tests.hypothesis_test_share)}。\n\n`
        + `参考になる論文：\n${ex(rp.papers)}`;
      const term = [
        `# 評価の設計ガイド：将来予測・時系列・センサー・時間とともに変わる`,
        `対象：判定済み ${g.n_judged.toLocaleString()} 本のうち ${g.n_papers_with_all_traits.toLocaleString()} 本`, '',
        '## 2. データの分け方・実験の組み方',
        ...top(g.methods.filter((x) => x.recommended), 4).map((x) => `${x.recommended ? '★ ' : ''}${x.ja.padEnd(16, '　')} ${pct(x.share).padStart(4)}（全体 ${pct(x.share_all)}）`),
        '', '## 3. 指標', ...top(g.metrics.names, 4).map((x) => `${x.name.padEnd(10)} ${pct(x.share).padStart(4)}（全体 ${(x.share_all * 100).toFixed(1)}%）`),
        '', '## 5. 注意すること', ...g.cautions.map((c) => `乖離の規則 ${c.id}［${c.basis}］：${c.ja}`),
      ].join('\n');
      return { chat, term };
    },
  },
  {
    key: 'review', label: '原稿の点検',
    files: ['draft_v3.pdf'],
    prompt: 'この原稿の評価の設計を点検して。足りないものと、気をつける点は？',
    cli: `${CLI} review-design --traits t_text_generation,g_subjective --methods-used human_rating,llm_as_judge --tests-used t_test_paired`,
    calls: ['find_traits', 'review_design', 'reference_papers'],
    run() {
      const traits = ['t_text_generation', 'g_subjective'];
      const r = review_design({ traits, methods_used: ['human_rating', 'llm_as_judge'], tests_used: ['t_test_paired'] });
      const miss = top(r.missing_recommended, 3);
      const rp = reference_papers({ traits, method: 'inter_annotator_agreement', k: 2 });
      const chat = `原稿は「テキスト生成」で「許容される答えが複数・主観的」な研究と読みました。人の評定と LLM による評価を使っています。\n\n`
        + `足りないかもしれないもの：\n${miss.map((x) => `・${x.ja}：${x.why}`).join('\n')}\n`
        + (r.mismatch_flags.length ? `\n気をつける点：\n${r.mismatch_flags.map((f) => `・${f.ja}（${f.basis}）→ ${f.suggest_ja}`).join('\n')}\n` : '')
        + `\n評定者間の一致を報告している論文：\n${ex(rp.papers)}`;
      const term = JSON.stringify({ missing_recommended: miss.map((x) => ({ id: x.id, ja: x.ja })), mismatch_flags: r.mismatch_flags.map((f) => ({ id: f.id, basis: f.basis })) }, null, 2);
      return { chat, term };
    },
  },
  {
    key: 'refs', label: '参考にできる論文',
    files: [],
    prompt: 'LLM の生成の質を人が評定する研究で、参考にできる論文を 4 本。原稿が読めるリンクも。',
    cli: `${CLI} reference-papers --traits t_text_generation,g_subjective --method human_rating --k 4`,
    calls: ['find_traits', 'reference_papers'],
    run() {
      find_traits({ text: '人による評定', limit: 3 });
      const rp = reference_papers({ traits: ['t_text_generation', 'g_subjective'], method: 'human_rating', k: 4 });
      const chat = `「テキスト生成」「答えが複数・主観的」で「人による評定」を使った採録論文は ${rp.n_matching.toLocaleString()} 本ありました。学会が偏らないように 4 本選びました：\n\n${ex(rp.papers, 4)}\n\nラベルは判定モデルの出力なので、評価の節を本文で確かめてください。`;
      const term = JSON.stringify({ n_matching: rp.n_matching, papers: rp.papers.map((p) => ({ title: p.title, venue: p.venue, year: p.year, doi: p.doi, read_url: p.read_url })) }, null, 2);
      return { chat, term };
    },
  },
];

const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function mountDemo(root, mode = 'mcp') {
  root.classList.add('demo'); if (mode === 'cli') root.classList.add('term');
  const pick = h('div', { class: 'demo-pick', role: 'group', 'aria-label': 'デモの場面' });
  const stage = h('div', { class: 'demo-stage', 'aria-live': 'polite' });
  const foot = h('div', { class: 'demo-foot' }, h('span', {}, mode === 'cli' ? 'ターミナルでの例' : 'Claude Desktop での例'),
    h('span', {}, '出力の数字は、公開データからその場で計算しています'));
  root.replaceChildren(pick, stage, foot);
  let idx = 0; let runId = 0; let playing = false;
  const btns = SCENARIOS.map((sc, i) => h('button', { type: 'button', 'aria-pressed': 'false', onclick: () => play(i) }, sc.label));
  pick.append(...btns);
  const sleep = (ms, id) => new Promise((r) => setTimeout(() => r(id === runId), reduced ? 0 : ms));

  async function play(i, loop = true) {
    const id = ++runId; idx = i; playing = true;
    btns.forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
    const sc = SCENARIOS[i];
    stage.replaceChildren(h('p', { class: 'loading' }, 'データを読み込んでいます…'));
    try { await loadData(); } catch (e) { stage.replaceChildren(h('p', { class: 'loading' }, e.message)); return; }
    let out;
    try { out = sc.run(); } catch (e) { stage.replaceChildren(h('p', { class: 'loading' }, `計算できませんでした：${e.message}`)); return; }
    stage.replaceChildren();
    if (!(await sleep(300, id))) return;
    // 1 入力
    const input = mode === 'cli' ? sc.cli : sc.prompt;
    let typed;
    if (mode === 'cli') {
      const line = h('div', {}, h('span', { class: 'prompt' }, '$ '), (typed = h('span')), h('span', { class: 'cursor', 'aria-hidden': 'true' }));
      stage.append(line);
    } else {
      for (const f of sc.files) stage.append(h('div', { class: 'file' }, fileIcon(), f));
      if (sc.files.length && !(await sleep(500, id))) return;
      const b = h('div', { class: 'bubble user' }, (typed = h('span')), h('span', { class: 'cursor', 'aria-hidden': 'true' }));
      stage.append(b);
    }
    const speed = mode === 'cli' ? 14 : 28;
    for (let c = 1; c <= input.length; c++) { typed.textContent = input.slice(0, c); if (!reduced && c % 2 === 0 && !(await sleep(speed * 2, id))) return; }
    typed.textContent = input;
    stage.querySelectorAll('.cursor').forEach((x) => x.remove());
    if (!(await sleep(400, id))) return;
    // 2 道具の呼び出し
    const calls = h('div', { class: 'calls' });
    stage.append(calls);
    for (const name of sc.calls) {
      const row = h('div', { class: 'call on' }, h('span', { class: 'dot', 'aria-hidden': 'true' }), mode === 'cli' ? `… ${name.replaceAll('_', '-')}` : `eval-method-atlas ・ ${name}`);
      calls.append(row);
      if (!(await sleep(520, id))) return;
      row.className = 'call done';
    }
    if (!(await sleep(250, id))) return;
    // 3 出力（行ごとに出す）
    const box = mode === 'cli' ? h('div', { class: 'out' }) : h('div', { class: 'bubble bot' });
    stage.append(box);
    const lines = (mode === 'cli' ? out.term : out.chat).split('\n');
    for (const ln of lines) {
      const el = h('div', { class: 'reveal' + (mode === 'cli' && ln.startsWith('#') ? ' h' : '') }, ln || ' ');
      box.append(el);
      requestAnimationFrame(() => el.classList.add('in'));
      if (!(await sleep(mode === 'cli' ? 70 : 110, id))) return;
    }
    if (!(await sleep(6500, id))) return;
    if (loop) play((idx + 1) % SCENARIOS.length, true); else playing = false;
  }
  function fileIcon() {
    const ns = 'http://www.w3.org/2000/svg';
    const s = document.createElementNS(ns, 'svg'); s.setAttribute('width', '16'); s.setAttribute('height', '16'); s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '1.6'); s.setAttribute('aria-hidden', 'true');
    const p = document.createElementNS(ns, 'path'); p.setAttribute('d', 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5'); s.append(p);
    return s;
  }
  const stop = () => { runId++; playing = false; };
  const io = new IntersectionObserver((es) => {
    const vis = es.some((e) => e.isIntersecting);
    if (vis && !playing) play(idx, true); else if (!vis && playing) stop();
  }, { threshold: 0.3 });
  io.observe(root);
  return { play, stop };
}
