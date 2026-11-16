// 「ウェブで試す」：アイディアか PDF → 研究の特性の候補（選び直せる）→ 評価の設計ガイド。
// PDF はブラウザの中で文字を取り出し、どこにも送らない。計算もすべてブラウザの中。
import { suggest_traits, find_traits, design_guide, labelInfo } from '../lib/core.mjs';
import { guideMarkdown } from '../lib/markdown.mjs';
import { loadData, h, pct, pct1, times, paperItem } from './site.js';

const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
const AXES_SHOWN = ['task', 'data_structure', 'constraint', 'ground_truth', 'domain', 'learning'];

export function mountTry(root) {
  const $ = (s) => root.querySelector(s);
  const idea = $('#idea'); const drop = $('#drop'); const fileIn = $('#pdf'); const fileName = $('#pdf-name');
  const goSuggest = $('#go-suggest'); const traitsBox = $('#traits'); const goGuide = $('#go-guide'); const out = $('#result');
  const addIn = $('#add-trait'); const addList = $('#add-list');
  let pdfText = ''; const picked = new Set();

  async function readPdf(file) {
    fileName.textContent = `${file.name} を読んでいます…`;
    try {
      if (!window.pdfjsLib) {
        await new Promise((ok, ng) => { const s = document.createElement('script'); s.src = PDFJS + 'pdf.min.js'; s.onload = ok; s.onerror = () => ng(new Error('PDF の読み込み部品を取得できませんでした')); document.head.append(s); });
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js';
      }
      const pdf = await window.pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
      const parts = [];
      for (let i = 1; i <= Math.min(pdf.numPages, 12); i++) {
        const tc = await (await pdf.getPage(i)).getTextContent();
        parts.push(tc.items.map((x) => x.str).join(' '));
      }
      pdfText = parts.join('\n');
      fileName.textContent = `${file.name}（${pdf.numPages} ページ。最初の ${Math.min(pdf.numPages, 12)} ページを読みました）`;
    } catch (e) { pdfText = ''; fileName.textContent = `読めませんでした：${e.message}`; }
  }
  fileIn.addEventListener('change', () => fileIn.files[0] && readPdf(fileIn.files[0]));
  drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('over'));
  drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('over'); const f = e.dataTransfer.files[0]; if (f) readPdf(f); });

  function chip(id) {
    const l = labelInfo(id);
    const b = h('button', { type: 'button', class: 'chip', 'aria-pressed': String(picked.has(id)), onclick: () => {
      if (picked.has(id)) picked.delete(id); else picked.add(id);
      b.setAttribute('aria-pressed', String(picked.has(id))); goGuide.disabled = !picked.size;
    } }, l.ja, h('span', { class: 'id' }, id));
    return b;
  }

  goSuggest.addEventListener('click', async () => {
    goSuggest.disabled = true; traitsBox.replaceChildren(h('p', { class: 'loading' }, 'データを読み込んでいます…'));
    try {
      await loadData();
      const text = [idea.value, pdfText].filter(Boolean).join('\n');
      const s = suggest_traits({ text, per_axis: 4 });
      picked.clear(); s.suggested_traits.forEach((x) => picked.add(x));
      const rows = AXES_SHOWN.filter((a) => s.axes[a]).map((a) => h('div', { class: 'axis-row' }, h('div', { class: 'k' }, s.axes[a].ja),
        h('div', { class: 'chips' }, s.axes[a].candidates.map((c) => chip(c.id)))));
      traitsBox.replaceChildren(
        h('p', { class: 'note' }, '語の一致で挙げた候補です。研究に当てはまるものを押して選び直してください（2〜3 個が目安。増やすほど当てはまる論文は減ります）。'),
        ...(rows.length ? rows : [h('p', {}, '手掛かりの語が見つかりませんでした。下の欄から特性を足してください。')]));
      $('#step2').hidden = false; goGuide.disabled = !picked.size;
    } catch (e) { traitsBox.replaceChildren(h('p', { class: 'loading' }, e.message)); }
    goSuggest.disabled = false;
  });

  addIn.addEventListener('input', () => {
    const q = addIn.value.trim();
    if (q.length < 2) { addList.replaceChildren(); return; }
    const hits = find_traits({ text: q, traits_only: true, limit: 8 });
    addList.replaceChildren(...hits.map((x) => h('button', { type: 'button', class: 'chip', onclick: () => {
      picked.add(x.id); addIn.value = ''; addList.replaceChildren();
      let row = traitsBox.querySelector('.added'); if (!row) { row = h('div', { class: 'axis-row' }, h('div', { class: 'k' }, '足した特性'), h('div', { class: 'chips added' })); traitsBox.append(row); row = row.querySelector('.added'); }
      row.append(chip(x.id)); goGuide.disabled = false;
    } }, `＋ ${x.ja}`, h('span', { class: 'id' }, x.axis_ja))));
  });

  goGuide.addEventListener('click', () => {
    try { render(design_guide({ traits: [...picked] })); } catch (e) { out.replaceChildren(h('p', {}, e.message)); }
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  function table(head, rows) {
    return h('div', { class: 'tbl' }, h('table', {}, h('thead', {}, h('tr', {}, head.map(([t, n]) => h('th', { class: n ? 'n' : null }, t)))),
      h('tbody', {}, rows.map((r) => h('tr', {}, r.map((c, i) => h('td', { class: head[i][1] ? 'n' : null }, c)))))));
  }

  function render(g) {
    const recs = g.methods.filter((x) => x.recommended);
    const md = guideMarkdown(g, labelInfo);
    const cmd = `node eval-method-atlas.mjs design-guide --traits ${g.traits.map((x) => x.id).join(',')} --md --out guide.md`;
    out.replaceChildren(
      h('p', { class: 'label' }, '提案'),
      h('h3', { style: 'margin-top:0' }, g.traits.map((x) => x.ja).join(' × ')),
      h('p', { class: 'note' }, `判定済み ${g.n_judged.toLocaleString()} 本のうち、選んだ特性がすべて当てはまる採録論文 ${g.n_papers_with_all_traits.toLocaleString()} 本の実態です。`
        + (g.small_sample ? ' 本数が少ないので、割合は目安です。' : '')),
      h('div', { class: 'cards' },
        h('div', { class: 'card' }, h('p', { class: 'k' }, 'データ'), h('p', {}, g.data.datasets.slice(0, 4).map((d) => `${d.name} ${pct(d.share)}`).join('・') || '辞書にある名前は見つかりませんでした')),
        h('div', { class: 'card key' }, h('p', { class: 'k' }, '勧める評価手法'), h('p', {}, recs.slice(0, 4).map((x) => `${x.ja}（${pct(x.share)}）`).join('・'))),
        h('div', { class: 'card' }, h('p', { class: 'k' }, '指標'), h('p', {}, g.metrics.names.slice(0, 5).map((d) => `${d.name} ${pct(d.share)}`).join('・'))),
        h('div', { class: 'card' }, h('p', { class: 'k' }, '確かめ方'), h('p', {}, `仮説検定を使う論文 ${pct(g.tests.hypothesis_test_share)}（全体 ${pct(g.tests.hypothesis_test_share_all)}）。`
          + (g.tests.items[0] ? `多いのは ${g.tests.items.slice(0, 3).map((x) => x.ja).join('・')}` : '')))),
      g.cautions.length || g.priors.length ? h('div', {}, h('h3', {}, '注意すること'),
        ...g.priors.map((p) => h('p', { class: 'warnbox' }, h('b', {}, '勧め '), p.rationale_ja, p.caution_ja ? ` ${p.caution_ja}` : '')),
        ...g.cautions.map((c) => h('p', { class: 'warnbox' }, h('b', {}, `乖離の規則［${c.basis}］ `), `${c.ja}。${c.why_ja} → ${c.suggest_ja}`, h('br'), h('span', { class: 'note' }, `根拠：${(c.refs || []).join('; ')}・この特性の論文で旗が立ったのは ${c.flagged_papers} 本`)))) : null,
      h('h3', {}, 'データの分け方・実験の組み方'),
      table([['手法'], ['割合', 1], ['全体', 1], ['何倍', 1], ['落とし穴']], g.methods.slice(0, 14).map((x) => [`${x.recommended ? '★ ' : ''}${x.ja}`, pct(x.share), pct(x.share_all), times(x.share, x.share_all), x.pitfalls_ja || ''])),
      h('h3', {}, '検定・検証手法'),
      table([['手法'], ['群'], ['割合', 1], ['全体', 1]], g.tests.items.slice(0, 10).map((x) => [x.ja, x.group_ja || '', pct(x.share), pct1(x.share_all)])),
      h('h3', {}, '参考にできる論文（勧める手法ごと）'),
      ...Object.entries(g.examples).filter(([, ps]) => ps.length).slice(0, 6).map(([mid, ps]) => h('div', {}, h('p', { style: 'margin:12px 0 0;font-weight:700' }, labelInfo(mid).ja), h('ul', { class: 'papers' }, ps.map(paperItem)))),
      h('p', { class: 'note' }, 'ラベルは判定モデル（Jev）の出力で、誤りを含みえます。参考にする前に、評価の節を本文で確かめてください。'),
      h('div', { class: 'actions' },
        h('button', { type: 'button', class: 'btn-ghost', onclick: () => { const a = h('a', { href: URL.createObjectURL(new Blob([md], { type: 'text/markdown' })), download: 'eval-design-guide.md' }); a.click(); } }, 'Markdown で保存'),
        h('code', {}, cmd)),
    );
  }
}
