// サイト共通：公開データの読み込み（ブラウザの中で解凍し、外には何も送らない）
import { loadFromObject, isLoaded } from '../lib/core.mjs';

export const RELEASE = 'https://github.com/aix-sc/eval-method-atlas-releases/releases/latest/download/';
let pending = null;

export function loadData() {
  if (isLoaded()) return Promise.resolve();
  if (pending) return pending;
  pending = (async () => {
    const res = await fetch('data/atlas-data.json.gz');
    if (!res.ok) throw new Error(`データを読み込めませんでした（${res.status}）`);
    let text;
    const enc = res.headers.get('content-encoding');
    const buf = await res.arrayBuffer();
    const u8 = new Uint8Array(buf);
    if (enc === 'gzip' || !(u8[0] === 0x1f && u8[1] === 0x8b)) {
      text = new TextDecoder().decode(u8); // サーバーがすでに解凍して渡した場合
    } else {
      const ds = new Blob([u8]).stream().pipeThrough(new DecompressionStream('gzip'));
      text = await new Response(ds).text();
    }
    loadFromObject(JSON.parse(text));
  })();
  return pending;
}

/** 要素を作る小道具：h('p', {class:'x'}, '文', child, …)。文字は textContent で入れる */
export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return el;
}

export const pct = (x) => (x == null ? '—' : `${Math.round(x * 100)}%`);
export const pct1 = (x) => (x == null ? '—' : `${(x * 100).toFixed(1)}%`);
export const times = (a, b) => (b ? `${(a / b).toFixed(1)} 倍` : '—');

/** 論文のリンク（読める版 → DOI） */
export function paperItem(p) {
  const link = p.read_url || p.doi || p.url;
  return h('li', {}, link ? h('a', { href: link, target: '_blank', rel: 'noopener' }, p.title) : p.title,
    `（${p.venue} ${p.year}）`, p.doi && p.doi !== link ? [' ', h('a', { href: p.doi, target: '_blank', rel: 'noopener', class: 'note' }, 'DOI')] : null);
}

