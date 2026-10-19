const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const APP = 'file://' + path.join(ROOT, 'index.html');
const sample = f => path.join(ROOT, 'samples', f);
const fixture = f => path.join(__dirname, 'fixtures', f);
const lib = f => fs.readFileSync(path.join(ROOT, 'node_modules', f));

// Opens Pacely with fonts stubbed, the PDF libraries served locally, and
// optionally a stand-in for the Claude viewer (downloads + AI) that records calls.
async function openApp(page, { viewer = false, team = false, width, height } = {}) {
  if (width) await page.setViewportSize({ width, height: height || 844 });
  page.errors = [];
  page.on('pageerror', e => page.errors.push(e.message));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ contentType: 'text/css', body: '' }));
  await page.route('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js', r => r.fulfill({ contentType: 'text/javascript', body: lib('html2canvas/dist/html2canvas.min.js') }));
  await page.route('https://cdn.jsdelivr.net/npm/jspdf@4.2.1/dist/jspdf.umd.min.js', r => r.fulfill({ contentType: 'text/javascript', body: lib('jspdf/dist/jspdf.umd.min.js') }));
  if (team) await page.addInitScript(installFakeTeam);
  if (viewer) {
    await page.addInitScript(() => {
      window.__saves = []; window.__asked = [];
      window.claude = {
        use: async name => {
          if (name === 'downloads') return { save: async r => {
            const data = typeof r.data === 'string' ? r.data : await new Response(r.data).text();
            window.__saves.push({ filename: r.filename, data, size: typeof r.data === 'string' ? r.data.length : r.data.size });
            return { status: 'saved' };
          } };
          if (name === 'db' && window.__team) return window.__team.db;
          if (name === 'user' && window.__team) return window.__team.user;
          if (name === 'sample') return async (input, opts) => {
            window.__asked.push(input[0].content);
            const text = 'Test answer ' + window.__asked.length;
            if (opts && opts.onText) opts.onText({ text });
            return { text };
          };
          return null;
        },
      };
    });
  }
  await page.goto(APP);
  return page;
}

// Loads a file through the file picker and waits until its sessions exist.
// Files with many cars open the car picker; every car is loaded.
async function loadFile(page, file) {
  const before = await page.evaluate(() => sessions.length);
  await page.setInputFiles('#file', file);
  await page.waitForFunction(n => sessions.length > n || document.querySelector('#pickGo, #impGo, #out .notice.bad'), before);
  if (await page.$('#pickAll')) { await page.click('#pickAll'); await page.click('#pickGo'); }
  await page.waitForFunction(n => sessions.length > n, before);
}

const openSamples = page => page.evaluate(() => document.getElementById('demo').click());
const pick = (page, nameFragment) => page.evaluate(f => { const i = sessions.findIndex(s => s.name.includes(f)); if (i < 0) throw new Error('no session ' + f); cur = i; render(); }, nameFragment);
const tab = (page, name) => page.click(`[data-tab=${name}]`);

// An in-memory stand-in for the viewer's shared store and user capabilities.
// The store survives reloads within one test through sessionStorage, like a real shared store.
function installFakeTeam() {
  const load = () => { try { return new Map(JSON.parse(sessionStorage.getItem('fakeTeam') || '[]')); } catch (e) { return new Map(); } };
  const store = load(), subs = [], persist = () => sessionStorage.setItem('fakeTeam', JSON.stringify([...store]));
  const notify = () => subs.forEach(f => setTimeout(f, 0));
  const doc = path => ({ id: path.split('/').pop(), path,
    async get() { const d = store.get(path); return { id: path.split('/').pop(), exists: !!d, data: () => d }; },
    async set(d) { if (JSON.stringify(d).length > 262144) throw { code: 'invalid_argument', message: 'too big' }; store.set(path, JSON.parse(JSON.stringify(d))); persist(); notify(); },
    async delete() { store.delete(path); persist(); notify(); },
    collection: c => col(path + '/' + c) });
  const col = (path, ord, lim) => {
    const snap = () => { const n = path.split('/').length; let docs = [...store.keys()].filter(k => k.startsWith(path + '/') && k.split('/').length === n + 1).map(k => ({ id: k.split('/').pop(), exists: true, data: () => store.get(k) }));
      if (ord) docs.sort((a, b) => (a.data()[ord[0]] - b.data()[ord[0]]) * (ord[1] === 'desc' ? -1 : 1)); if (lim) docs = docs.slice(0, lim); return { docs, size: docs.length, empty: !docs.length }; };
    return { path, doc: id => doc(path + '/' + (id || Math.random().toString(36).slice(2))), orderBy: (f, d) => col(path, [f, d || 'asc'], lim), limit: n => col(path, ord, n), where() { return this; },
      async get() { return snap(); }, onSnapshot(next) { const f = () => next(snap()); subs.push(f); setTimeout(f, 0); return () => {}; } };
  };
  window.__team = { store, db: { doc, collection: p => col(p) },
    user: { id: async () => 'u1', can: async () => true, profiles: async ids => Object.fromEntries([].concat(ids).map(i => [i, { id: i, name: 'Alex Driver', isMe: i === 'u1' }])) } };
}

module.exports = { openApp, loadFile, openSamples, pick, tab, sample, fixture };
