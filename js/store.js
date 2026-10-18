// Хранилище посланий: localStorage браузера на этом компьютере
const Store = (() => {
  const KEY = 'vertor-burn:messages';

  function all() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }

  function add(text) {
    const list = all();
    list.push({ n: list.length + 1, text, at: new Date().toISOString() });
    try { localStorage.setItem(KEY, JSON.stringify(list)); }
    catch (e) { console.warn('Не удалось сохранить послание', e); }
  }

  function clear() {
    try { localStorage.removeItem(KEY); } catch (e) {}
  }

  function stamp() {
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}`;
  }

  // в веб-версии (claude.ai) файл предлагается через downloads, локально — обычной ссылкой
  async function download(name, content, type) {
    const downloads = window.claude && window.claude.use ? await window.claude.use('downloads').catch(() => null) : null;
    if (downloads) {
      try { await downloads.save({ filename: name, data: content }); } catch (e) { console.warn('Файл не сохранён', e); }
      return;
    }
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function exportTxt() {
    const list = all();
    const body = list
      .map(m => `#${m.n} — ${new Date(m.at).toLocaleString('ru-RU')}\n\n${m.text}\n`)
      .join('\n————————————\n\n');
    download(`verter-poslaniya-${stamp()}.txt`, '﻿' + body, 'text/plain;charset=utf-8');
  }

  function exportJson() {
    download(`verter-poslaniya-${stamp()}.json`, JSON.stringify(all(), null, 2), 'application/json');
  }

  return { all, add, clear, exportTxt, exportJson };
})();
