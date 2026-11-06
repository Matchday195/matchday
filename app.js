/* Matchday — main app. Plain JavaScript, no build step. */
(function () {
  'use strict';
  const D = window.MD_DATA;
  const APP_VERSION = '1.2.0';
  const app = document.getElementById('app');

  /* ---------- helpers ---------- */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const qs = (s, el) => (el || app).querySelector(s);
  const qsa = (s, el) => Array.from((el || app).querySelectorAll(s));
  const on = (sel, ev, fn) => qsa(sel).forEach((el) => el.addEventListener(ev, (e) => fn(e, el)));
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const parseYmd = (s) => { const p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const fmtTime = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return (h % 12 || 12) + ':' + pad(m) + ' ' + (h >= 12 ? 'PM' : 'AM'); };
  const fmtClock = (d) => (d.getHours() % 12 || 12) + ':' + pad(d.getMinutes()) + ' ' + (d.getHours() >= 12 ? 'PM' : 'AM');
  const fmtHour = (h) => (h % 12 || 12) + ':00 ' + (h >= 12 ? 'PM' : 'AM');

  const store = {
    get(k, d) { try { const v = localStorage.getItem('md_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('md_' + k, JSON.stringify(v)); } catch (e) { /* storage full or blocked */ } },
    del(k) { try { localStorage.removeItem('md_' + k); } catch (e) { } }
  };
  const sess = {
    get() { try { return JSON.parse(sessionStorage.getItem('md_session') || 'null') || store.get('session', null); } catch (e) { return store.get('session', null); } },
    set(v, remember) { if (remember) store.set('session', v); else { store.del('session'); try { sessionStorage.setItem('md_session', JSON.stringify(v)); } catch (e) { } } },
    clear() { store.del('session'); try { sessionStorage.removeItem('md_session'); } catch (e) { } }
  };

  let toastTimer;
  function toast(msg) {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
  }

  async function hash(text) {
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('matchday:' + text));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch (e) { let h = 0; for (const c of 'matchday:' + text) h = (h * 31 + c.charCodeAt(0)) | 0; return 'x' + h; }
  }

  /* ---------- icons ---------- */
  const IC = {
    back: 'M15 6l-6 6 6 6', chev: 'M9 6l6 6-6 6', search: 'M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-3.5-3.5',
    refresh: 'M20 11a8 8 0 10-2.3 5.7M20 4v7h-7', gear: 'M12 9a3 3 0 100 6 3 3 0 000-6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z',
    ball: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 7l4 3-1.5 4.5h-5L8 10z', home: 'M4 11l8-7 8 7v9h-5v-6H9v6H4z',
    book: 'M4 5h6a2 2 0 012 2v13a2 2 0 00-2-2H4zM20 5h-6a2 2 0 00-2 2v13a2 2 0 012-2h6z', cal: 'M3 5h18v16H3zM3 10h18M8 3v4M16 3v4',
    swap: 'M4 8h14l-3-3M20 16H6l3 3', bell: 'M6 16V11a6 6 0 0112 0v5l2 2H4zM10 21h4', user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c1.5-4 14.5-4 16 0',
    x: 'M6 6l12 12M18 6L6 18', clock: 'M12 5a8 8 0 100 16 8 8 0 000-16zM12 9v4l2.5 2M9 2h6', bulb: 'M9 18h6M10 21h4M12 3a6 6 0 00-4 10.5c.6.6 1 1.5 1 2.5h6c0-1 .4-1.9 1-2.5A6 6 0 0012 3z',
    target: 'M12 4a8 8 0 100 16 8 8 0 000-16zM12 9a3 3 0 100 6 3 3 0 000-6z', shot: 'M7 12a4 4 0 100 8 4 4 0 000-8zM11 12l9-7M15 5h5v5',
    dribble: 'M4 18c4 0 4-12 8-12s4 12 8 12', pass: 'M5 10a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM19 10a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM8 12h8M13 9l3 3-3 3',
    touch: 'M12 3a4 4 0 100 8 4 4 0 000-8zM5 20c2-4 12-4 14 0M12 11v4', arrow: 'M5 12h14M13 6l6 6-6 6', down: 'M12 4v11M7 10l5 5 5-5M5 20h14',
    wifi: 'M2 9a15 15 0 0120 0M5 12.5a10 10 0 0114 0M8.5 16a5 5 0 017 0M12 19.5h.01'
  };
  const icon = (name, size, sw) => `<svg width="${size || 20}" height="${size || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw || 2}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${IC[name]}"/></svg>`;
  const LOGO = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 112 112" role="img" aria-label="Matchday 195 logo"><rect x="4" y="4" width="104" height="104" rx="30" fill="#B6F23A"/><circle cx="56" cy="56" r="31" fill="none" stroke="#0B1210" stroke-width="7"/><line x1="56" y1="18" x2="56" y2="94" stroke="#0B1210" stroke-width="7" stroke-linecap="round"/><circle cx="56" cy="56" r="8" fill="#0B1210"/><path d="M25 38h10M77 74h10" stroke="#0B1210" stroke-width="7" stroke-linecap="round"/></svg>`;

  /* ---------- user, profile, settings ---------- */
  const DEFAULT_SETTINGS = { mode: 'auto', theme: 'pitch', cbOn: false, cbType: 'rg', size: 1, darkStart: 19, darkEnd: 7, autoRefresh: true };
  const DEFAULT_ALERTS = { kinds: { kick: true, line: true, goal: true, red: true, ht: false, ft: true }, muted: {}, matches: {} };
  let settings = Object.assign({}, DEFAULT_SETTINGS, store.get('settings', {}));
  const saveSettings = () => { store.set('settings', settings); applyTheme(); };

  function currentUser() { const s = sess.get(); return s ? s.email : null; }
  function profileKey() { return 'profile_' + (currentUser() || 'guest'); }
  function defaultProfile(name, username) { return { name: name || 'Guest', username: username || '', bio: '', avatar: '#5EE0C1', photo: '', pos: 'MID', player: '', teams: ['ARS', 'BAR', 'MIA'] }; }
  function getProfile() { return Object.assign(defaultProfile(), store.get(profileKey(), {})); }
  function saveProfile(p) { store.set(profileKey(), p); }
  function initials(name) { const p = String(name || '?').trim().split(/\s+/); return ((p[0] || '?')[0] + (p[1] ? p[1][0] : (p[0][1] || ''))).toUpperCase(); }
  function avatarHtml(p, cls) {
    const style = p.photo ? `background-image:url('${p.photo}');background-color:${p.avatar}` : `background:${p.avatar}`;
    return `<span class="avatar ${cls || ''}" style="${style};--av:${p.avatar}">${p.photo ? '' : esc(initials(p.name))}</span>`;
  }
  const alertsKey = () => 'alerts_' + (currentUser() || 'guest');
  function getAlerts() { const a = store.get(alertsKey(), {}); return { kinds: Object.assign({}, DEFAULT_ALERTS.kinds, a.kinds), muted: a.muted || {}, matches: a.matches || {} }; }
  const saveAlerts = (a) => store.set(alertsKey(), a);
  const progKey = () => 'skills_' + (currentUser() || 'guest');
  const getProg = () => store.get(progKey(), { last: 'laces', steps: { laces: 2 }, done: {} });
  const saveProg = (p) => store.set(progKey(), p);

  /* ---------- theme ---------- */
  function isDarkNow() {
    if (settings.mode === 'dark') return true;
    if (settings.mode === 'light') return false;
    const h = new Date().getHours();
    return settings.darkStart > settings.darkEnd ? (h >= settings.darkStart || h < settings.darkEnd) : (h >= settings.darkStart && h < settings.darkEnd);
  }
  function applyTheme() {
    const r = document.documentElement;
    r.dataset.mode = isDarkNow() ? 'dark' : 'light';
    r.dataset.theme = settings.theme;
    r.dataset.cb = settings.cbOn ? settings.cbType : 'off';
    r.dataset.size = String(settings.size);
    const m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', isDarkNow() ? '#0B1210' : '#F4F7F5');
  }
  applyTheme();
  setInterval(() => { if (settings.mode === 'auto') applyTheme(); }, 60000);

  /* ---------- data source (sample data now; swap for a live feed later) ---------- */
  const DataSource = (function () {
    const BASE = parseYmd('2026-11-05');
    let lastUpdated = new Date();
    function dayShift() { const t = new Date(); t.setHours(0, 0, 0, 0); return Math.round((t - BASE) / 86400000); }
    // Goals for a fixture: [minute, 'H' or 'A']. Sample goals come from data.js; others are made up from the match id.
    function goalsFor(f) {
      if (D.GOALS && D.GOALS[f.id]) return D.GOALS[f.id];
      let h = 0; for (const c of f.id + f.home + f.away) h = (h * 31 + c.charCodeAt(0)) >>> 0;
      const out = []; const n = h % 5;
      for (let i = 0; i < n; i++) { h = (h * 1103515245 + 12345) >>> 0; out.push([5 + (h % 85), (h >> 8) % 2 ? 'H' : 'A']); }
      return out.sort((a, b) => a[0] - b[0]);
    }
    // Status comes from the real clock: before kickoff = upcoming, then 1st half,
    // half-time (15 min), 2nd half, full time about 110 minutes after kickoff.
    function fixtures() {
      const shift = dayShift(); const now = Date.now();
      return D.FIXTURES.map((f) => {
        const d = parseYmd(f.date); d.setDate(d.getDate() + shift);
        const g = Object.assign({}, f, { date: ymd(d) });
        delete g.minute; delete g.hs; delete g.as; delete g.ht;
        const [hh, mm] = f.time.split(':').map(Number); const ko = new Date(d); ko.setHours(hh, mm, 0, 0);
        const el = Math.floor((now - ko) / 60000);
        let minute;
        if (el < 0) { g.status = 'upcoming'; return g; }
        if (el < 45) minute = el + 1;
        else if (el < 60) { minute = 45; g.ht = true; }
        else if (el < 110) minute = Math.min(90, el - 14);
        else minute = 90;
        g.status = el < 110 ? 'live' : 'ft';
        if (g.status === 'live') g.minute = minute;
        const goals = goalsFor(f).filter((x) => x[0] <= minute);
        g.hs = goals.filter((x) => x[1] === 'H').length; g.as = goals.filter((x) => x[1] === 'A').length;
        return g;
      });
    }
    return {
      fixtures, team: (c) => D.TEAMS[c] || { name: c, color: '#777', short: c, league: '' },
      detail: (id) => D.MATCH_DETAIL[id] || null, skills: () => D.SKILLS, leagues: () => D.LEAGUES,
      lastUpdated: () => lastUpdated,
      refresh() { return new Promise((res) => setTimeout(() => { lastUpdated = new Date(); store.set('lastUpdated', lastUpdated.getTime()); res(); }, 700)); }
    };
  })();
  const T = DataSource.team;

  /* ---------- real transfer headlines (news.json is updated by GitHub every 30 minutes) ---------- */
  const News = (function () {
    const URLS = ['https://raw.githubusercontent.com/Matchday195/matchday/main/news.json', 'news.json'];
    let data = store.get('news', null); let state = data ? 'ok' : 'loading';
    async function load() {
      for (const u of URLS) {
        try {
          const r = await fetch(u + '?t=' + Math.floor(Date.now() / 60000), { cache: 'no-store' });
          if (!r.ok) continue;
          const j = await r.json();
          if (j && Array.isArray(j.items)) { data = j; state = 'ok'; store.set('news', j); return true; }
        } catch (e) { /* try the next address */ }
      }
      state = data ? 'ok' : (navigator.onLine ? 'empty' : 'offline');
      return false;
    }
    return { load, items: () => (data && data.items) || [], updated: () => data && data.updated, sources: () => (data && data.sources) || [], state: () => state };
  })();
  function timeAgo(iso) {
    const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (m < 1) return 'just now'; if (m < 60) return m + ' min ago';
    const h = Math.round(m / 60); if (h < 24) return h + 'h ago';
    const d = Math.round(h / 24); return d + (d === 1 ? ' day ago' : ' days ago');
  }
  const crest = (code, size) => { const t = T(code); const sh = t.short || code; return `<span class="crest" style="width:${size}px;height:${size}px;background:${t.color};font-size:${Math.round(size / (sh.length > 3 ? 4.2 : 3.3))}px">${esc(sh)}</span>`; };
  const matchTitle = (f) => T(f.home).name + ' vs ' + T(f.away).name;
  function statusText(f) { return f.status === 'live' ? (f.ht ? 'HT' : f.minute + "'") : f.status === 'ft' ? 'FT' : fmtTime(f.time); }
  const liveLabel = (f) => f.ht ? 'HALF-TIME' : 'LIVE ' + f.minute + "'";

  /* ---------- app update + refresh ---------- */
  let swReg = null;
  async function refreshAll(btn) {
    if (btn) { const s = btn.querySelector('svg'); s.classList.remove('spin'); void s.offsetWidth; s.classList.add('spin'); }
    if (!navigator.onLine) { toast('You’re offline — showing saved data'); return false; }
    await Promise.all([DataSource.refresh(), News.load()]);
    let updating = false;
    if (swReg) {
      try { await swReg.update(); if (swReg.waiting) { updating = true; swReg.waiting.postMessage('skipWaiting'); } } catch (e) { }
    }
    toast(updating ? 'New version found — updating…' : 'Up to date');
    return true;
  }

  /* ---------- notifications ---------- */
  function notifyState() { return 'Notification' in window ? Notification.permission : 'unsupported'; }
  async function sendNotification(title, body, url) {
    if (notifyState() !== 'granted') return false;
    const opts = { body, icon: 'icon-192.png', badge: 'icon-192.png', data: { url: url || './' } };
    try { const r = swReg || (navigator.serviceWorker && await navigator.serviceWorker.ready); if (r) { await r.showNotification(title, opts); return true; } } catch (e) { }
    try { new Notification(title, opts); return true; } catch (e) { return false; }
  }
  // While the app is open: kickoff reminders for matches you turned the bell on for.
  function checkReminders() {
    const a = getAlerts(); if (!a.kinds.kick) return;
    const sent = store.get('sentReminders', {});
    const now = Date.now();
    DataSource.fixtures().forEach((f) => {
      if (!a.matches[f.id] || f.status !== 'upcoming' || sent[f.id + f.date]) return;
      const [h, m] = f.time.split(':').map(Number); const k = parseYmd(f.date); k.setHours(h, m, 0, 0);
      const mins = (k - now) / 60000;
      if (mins > 0 && mins <= 15) { sendNotification('Kickoff in ' + Math.ceil(mins) + ' min', matchTitle(f) + ' · ' + f.league, '#match/' + f.id); sent[f.id + f.date] = 1; store.set('sentReminders', sent); }
    });
  }
  setInterval(checkReminders, 60000);

  /* ---------- shared pieces ---------- */
  function nav(active) {
    const items = [['matches', 'Matches', 'ball'], ['home', 'Home', 'home'], ['skills', 'Skills', 'book']];
    return `<nav class="nav" aria-label="Main">${items.map(([r, l, i]) => `<a href="#${r}" ${active === r ? 'aria-current="page"' : ''}>${icon(i, 22)}${l}</a>`).join('')}</nav>`;
  }
  const demoBanner = () => `<div class="demo" role="note"><b>DEMO DATA</b><span>These games and scores are made up for testing. They are not real yet.</span></div>`;
  const backBtn = (href, label) => `<a class="iconbtn" href="${href}" aria-label="${label || 'Back'}">${icon('back')}</a>`;
  const offlineBanner = () => navigator.onLine ? '' : `<div class="offline-banner">Offline · showing saved data from ${fmtClock(DataSource.lastUpdated())}</div>`;
  function switchBtn(id, onState, label) { return `<button type="button" class="switch" data-sw="${id}" aria-pressed="${!!onState}" aria-label="${esc(label)}"></button>`; }
  function setrow(id, onState, title, sub) { return `<div class="setrow"><div class="grow"><span>${esc(title)}</span>${sub ? `<span>${esc(sub)}</span>` : ''}</div>${switchBtn(id, onState, title)}</div>`; }

  /* ================= SCREENS ================= */
  const screens = {};

  /* ----- Login ----- */
  screens.login = function () {
    const st = screens.login.st || (screens.login.st = { mode: 'login', remember: true });
    const s = st.mode === 'signup';
    return {
      html: `<div class="screen"><div class="scroll" style="padding:48px 28px 32px;gap:22px">
        <div style="display:flex;flex-direction:column;align-items:center;gap:14px">${LOGO(64)}
          <h1 class="page">${s ? 'Join Matchday 195' : 'Welcome back'}</h1>
          <p class="muted" style="margin:0;text-align:center">${s ? 'Make a profile, pick your teams, get alerts.' : 'Log in to see your teams and alerts.'}</p></div>
        <div class="seg"><button type="button" data-mode="login" aria-pressed="${!s}">Log in</button><button type="button" data-mode="signup" aria-pressed="${s}">Create account</button></div>
        <form id="authForm" novalidate style="display:flex;flex-direction:column;gap:14px">
          ${s ? `<label class="field">Username<input name="username" autocomplete="username" placeholder="e.g. abhi_10" required></label>` : ''}
          <label class="field">Email<input name="email" type="email" autocomplete="email" placeholder="you@example.com" required></label>
          <label class="field">Password<input name="password" type="password" autocomplete="${s ? 'new-password' : 'current-password'}" placeholder="At least 8 characters" required></label>
          <div class="card setrow" style="border-radius:12px"><div class="grow"><span>Save my login</span><span>${st.remember ? 'Next time you go straight to loading' : 'You’ll log in each time'}</span></div>${switchBtn('remember', st.remember, 'Save my login on this device')}</div>
          <div class="error" id="authErr" role="alert"></div>
          <button class="btn" type="submit">${s ? 'Create account' : 'Log in'}</button>
        </form>
        <button type="button" class="btn ghost" id="guestBtn">Skip for now — browse as guest</button>
        <p class="note">Accounts are saved on this device for now.</p>
      </div></div>`,
      mount() {
        on('[data-mode]', 'click', (e, el) => { st.mode = el.dataset.mode; render(); });
        on('[data-sw="remember"]', 'click', () => { st.remember = !st.remember; render(); });
        on('#guestBtn', 'click', () => { sess.set({ email: null, guest: true }, st.remember); startApp('#home'); });
        on('#authForm', 'submit', async (e) => {
          e.preventDefault();
          const f = new FormData(e.target); const err = qs('#authErr');
          const email = String(f.get('email') || '').trim().toLowerCase(); const pw = String(f.get('password') || '');
          if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { err.textContent = 'Enter a valid email.'; return; }
          if (pw.length < 8) { err.textContent = 'Password needs at least 8 characters.'; return; }
          const users = store.get('users', {}); const h = await hash(pw);
          if (s) {
            const username = String(f.get('username') || '').trim();
            if (!username) { err.textContent = 'Pick a username.'; return; }
            if (users[email]) { err.textContent = 'That email already has an account — log in instead.'; return; }
            users[email] = { email, username, hash: h, created: Date.now() }; store.set('users', users);
            sess.set({ email }, st.remember);
            saveProfile(Object.assign(defaultProfile(username, '@' + username.replace(/^@/, ''))));
          } else {
            if (!users[email] || users[email].hash !== h) { err.textContent = 'Email or password is wrong.'; return; }
            sess.set({ email }, st.remember);
          }
          startApp('#home');
        });
      }
    };
  };

  /* ----- Home (cubes) ----- */
  screens.home = function () {
    const st = screens.home.st || (screens.home.st = { open: {} });
    const p = getProfile(); const fx = DataSource.fixtures(); const today = ymd(new Date());
    const live = fx.filter((f) => f.status === 'live');
    const mine = fx.filter((f) => f.status === 'upcoming' && f.date >= today && (p.teams.includes(f.home) || p.teams.includes(f.away))).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    const nextDay = mine[0] ? parseYmd(mine[0].date) : null;
    const prog = getProg(); const sk = DataSource.skills().find((x) => x.id === prog.last) || DataSource.skills()[0];
    const stepNow = (prog.steps[sk.id] || 0);
    const tr = News.items();
    const a = getAlerts(); const alertCount = Object.values(a.matches).filter(Boolean).length;
    const lines = (arr) => arr.map((l) => `<div class="ln"><b>${esc(l[0])}</b><span>${esc(l[1])}</span></div>`).join('');
    const cubes = [
      { id: 'live', t: 'Live Matches', s: 'DEMO · ' + (live.length ? live.length + ' live now' : 'no live games'), c: 'var(--c-live)', href: '#matches', ic: 'ball',
        l: live.slice(0, 2).map((f) => [T(f.home).name + ' ' + f.hs + '–' + f.as + ' ' + T(f.away).name, liveLabel(f) + ' · ' + f.league]) },
      { id: 'cal', t: 'My Calendar', s: nextDay ? 'Next: ' + DOW[nextDay.getDay()] + ', ' + MONTHS[nextDay.getMonth()].slice(0, 3) + ' ' + nextDay.getDate() : 'No games soon', c: 'var(--c-cal)', href: '#calendar', ic: 'cal',
        l: mine.slice(0, 2).map((f) => [matchTitle(f), DOW[parseYmd(f.date).getDay()] + ' · ' + fmtTime(f.time)]) },
      { id: 'tr', t: 'Transfer News', s: tr.length ? 'Latest: ' + timeAgo(tr[0].published) : (News.state() === 'loading' ? 'Loading…' : 'Real headlines'), c: 'var(--c-tr)', href: '#transfers', ic: 'swap',
        l: tr.slice(0, 1).map((x) => [x.title, x.source + ' · ' + timeAgo(x.published)]) },
      { id: 'sk', t: 'Skills', s: sk.name.split(' (')[0] + ' · ' + (stepNow + 1) + '/' + sk.steps.length, c: 'var(--c-sk)', href: '#skill/' + sk.id, ic: 'book',
        l: [['Continue: ' + sk.name.split(' (')[0], 'Step ' + (stepNow + 1) + ' of ' + sk.steps.length]] },
      { id: 'al', t: 'Alerts', s: alertCount ? alertCount + ' matches on' : 'Set up alerts', c: 'var(--c-al)', href: '#alerts', ic: 'bell',
        l: [['Notifications ' + ({ granted: 'on', denied: 'blocked', default: 'off', unsupported: 'not supported' })[notifyState()], 'Goals, kickoff, full time']] },
      { id: 'pr', t: 'My Profile', s: p.name + (p.teams[0] ? ' · ' + T(p.teams[0]).name + ' fan' : ''), c: 'var(--c-pr)', href: '#profile', ic: 'user',
        l: [[p.teams.length + ' favorite teams', p.teams.map((c) => T(c).name).join(' · ') || 'Add some'], ['Plays ' + ({ GK: 'goalkeeper', DEF: 'defence', MID: 'midfield', FWD: 'forward' })[p.pos], 'Theme: ' + settings.theme]] }
    ];
    const upd = DataSource.lastUpdated();
    return {
      html: `<div class="screen">
        <header class="topbar"><span class="brand">${LOGO(34)}<span>Match<b>day</b> 195</span></span>
          <button type="button" class="iconbtn" id="refreshBtn" aria-label="Refresh for new updates">${icon('refresh')}</button>
          <a class="iconbtn" href="#settings" aria-label="Settings">${icon('gear')}</a>
          <a href="#profile" aria-label="Your profile">${avatarHtml(p)}</a></header>
        ${offlineBanner()}
        <main class="scroll">${demoBanner()}
          <div><h1 class="page">Hey, ${esc(p.name)}</h1><span class="muted small">Updated ${fmtClock(upd)}</span></div>
          <div class="cubes">${cubes.map((c) => `<div class="cube ${st.open[c.id] ? 'open' : ''}" style="--c:${c.c}">
            <div class="cube-inner">
              <button type="button" class="face front" data-flip="${c.id}" aria-label="Peek at ${esc(c.t)}" ${st.open[c.id] ? 'tabindex="-1"' : ''}>
                <span class="ic">${icon(c.ic, 24, 2.2)}</span><span><span class="t">${esc(c.t)}</span><span class="s">${esc(c.s)}</span></span></button>
              <div class="face back" ${st.open[c.id] ? '' : 'aria-hidden="true"'}>
                <div class="hd"><span>${esc(c.t)}</span><button type="button" class="x" data-flip="${c.id}" aria-label="Flip back" ${st.open[c.id] ? '' : 'tabindex="-1"'}>${icon('x', 14, 2.5)}</button></div>
                ${lines(c.l.length ? c.l : [[c.id === 'live' ? 'No live games right now' : 'Nothing yet', '']])}
                <a class="open" href="${c.href}" ${st.open[c.id] ? '' : 'tabindex="-1"'}>Open</a></div>
            </div></div>`).join('')}</div>
          <p class="note">Tap a cube to peek · tap Open to go in</p>
        </main>${nav('home')}</div>`,
      mount() {
        on('[data-flip]', 'click', (e, el) => { st.open[el.dataset.flip] = !st.open[el.dataset.flip]; render(); });
        on('#refreshBtn', 'click', async (e, el) => { if (await refreshAll(el)) setTimeout(render, 900); });
      }
    };
  };

  /* ----- Matches ----- */
  screens.matches = function () {
    const st = screens.matches.st || (screens.matches.st = { league: 'All', day: 0, q: '' });
    const base = new Date(); base.setHours(0, 0, 0, 0);
    const days = [-2, -1, 0, 1, 2].map((o) => { const d = new Date(base); d.setDate(d.getDate() + o); return { o, d }; });
    const sel = new Date(base); sel.setDate(sel.getDate() + st.day);
    const q = st.q.trim().toLowerCase();
    let fx = DataSource.fixtures().filter((f) => f.date === ymd(sel));
    if (st.league !== 'All') fx = fx.filter((f) => f.league === st.league);
    if (q) fx = fx.filter((f) => (T(f.home).name + ' ' + T(f.away).name + ' ' + f.league).toLowerCase().includes(q));
    const featured = fx.find((f) => f.status === 'live' && f.featured) || fx.find((f) => f.status === 'live');
    const a = getAlerts();
    const groups = DataSource.leagues().map((l) => ({ l, m: fx.filter((f) => f.league === l.name && f !== featured) })).filter((g) => g.m.length);
    const row = (f) => `<div class="mrow"><a href="#match/${f.id}" style="display:flex;align-items:center;gap:10px;flex:1;color:var(--text)">
        <span class="st ${f.status === 'live' ? 'status-live' : f.status === 'ft' ? 'muted' : ''}">${statusText(f)}</span>
        <span class="teams"><div><span class="dot" style="background:${T(f.home).color}"></span><span>${esc(T(f.home).name)}</span><b>${f.hs != null ? f.hs : ''}</b></div>
        <div><span class="dot" style="background:${T(f.away).color}"></span><span>${esc(T(f.away).name)}</span><b>${f.as != null ? f.as : ''}</b></div></span></a>
        ${f.status === 'upcoming' ? `<button type="button" class="bell" data-bell="${f.id}" aria-pressed="${!!a.matches[f.id]}" aria-label="Alerts for ${esc(matchTitle(f))}">${icon('bell', 18)}</button>` : ''}</div>`;
    return {
      html: `<div class="screen">
        <header class="topbar"><span class="brand">${LOGO(30)}<span>Match<b>day</b> 195</span></span><button type="button" class="iconbtn" id="refreshBtn" aria-label="Refresh scores">${icon('refresh')}</button></header>
        ${offlineBanner()}
        <main class="scroll">${demoBanner()}
          <label class="search">${icon('search', 18)}<input id="q" type="search" placeholder="Search teams or leagues" aria-label="Search teams or leagues" value="${esc(st.q)}"></label>
          <div class="daystrip">${days.map(({ o, d }) => `<button type="button" data-day="${o}" aria-pressed="${st.day === o}"><span>${o === 0 ? 'Today' : DOW[d.getDay()]}</span><span>${d.getDate()}</span></button>`).join('')}</div>
          <div class="chips">${['All'].concat(DataSource.leagues().map((l) => l.name)).map((l) => `<button type="button" class="chip" data-league="${esc(l)}" aria-pressed="${st.league === l}">${esc(l)}</button>`).join('')}</div>
          ${featured ? `<a class="featured" href="#match/${featured.id}">
            <div class="row between small muted"><span>${esc(featured.league)}</span><span class="live-pill">${liveLabel(featured)}</span></div>
            <div class="scoreline"><div class="side">${crest(featured.home, 48)}${esc(T(featured.home).name)}</div><div class="bigscore">${featured.hs} – ${featured.as}</div><div class="side">${crest(featured.away, 48)}${esc(T(featured.away).name)}</div></div>
            <div class="row between small" style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border);color:var(--accent);font-weight:700"><span>${DataSource.detail(featured.id) ? 'Ball tracker · Heat maps · Events' : 'Match details'}</span>${icon('chev', 18)}</div></a>` : ''}
          ${groups.length ? groups.map((g) => `<section style="display:flex;flex-direction:column;gap:8px"><div class="row between"><b class="small">${esc(g.l.name)}</b><span class="tiny muted">${esc(g.l.country)}</span></div><div class="list">${g.m.map(row).join('')}</div></section>`).join('') : (featured ? '' : `<div class="card muted" style="padding:20px;text-align:center">No matches${q ? ' match your search' : ' on this day'}.</div>`)}
          <p class="note">Sample data · live feed coming next</p>
        </main>${nav('matches')}</div>`,
      mount() {
        on('[data-day]', 'click', (e, el) => { st.day = Number(el.dataset.day); render(); });
        on('[data-league]', 'click', (e, el) => { st.league = el.dataset.league; render(); });
        on('#q', 'input', (e) => { st.q = e.target.value; clearTimeout(st.t); st.t = setTimeout(() => { render(); const i = qs('#q'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 250); });
        on('[data-bell]', 'click', (e, el) => toggleMatchAlert(el.dataset.bell));
        on('#refreshBtn', 'click', async (e, el) => { if (await refreshAll(el)) setTimeout(render, 900); });
      }
    };
  };

  async function toggleMatchAlert(id) {
    const a = getAlerts(); a.matches[id] = !a.matches[id]; saveAlerts(a);
    if (a.matches[id] && notifyState() === 'default') { try { await Notification.requestPermission(); } catch (e) { } }
    toast(a.matches[id] ? 'Alerts on for this match' : 'Alerts off for this match');
    render();
  }

  /* ----- Match detail ----- */
  function ballPos(m) {
    const x = 50 + 34 * Math.sin(m * 0.23) + 8 * Math.sin(m * 0.91);
    const y = 50 + 30 * Math.sin(m * 0.37 + 1.2) + 6 * Math.cos(m * 1.3);
    return { x: Math.max(4, Math.min(96, x)), y: Math.max(6, Math.min(94, y)) };
  }
  const PITCH = (stripes) => `<svg class="pitch" viewBox="0 0 105 68" preserveAspectRatio="none" aria-hidden="true"><rect width="105" height="68" fill="${stripes ? '#1F6B3A' : '#173F26'}"/>${stripes ? [0, 21, 42, 63, 84].map((x) => `<rect x="${x}" width="10.5" height="68" fill="#237541"/>`).join('') : ''}<g fill="none" stroke="#E8F5EC" stroke-opacity=".6" stroke-width=".4"><rect x="1" y="1" width="103" height="66"/><line x1="52.5" y1="1" x2="52.5" y2="67"/><circle cx="52.5" cy="34" r="9.15"/><rect x="1" y="13.85" width="16.5" height="40.3"/><rect x="87.5" y="13.85" width="16.5" height="40.3"/><rect x="1" y="24.85" width="5.5" height="18.3"/><rect x="98.5" y="24.85" width="5.5" height="18.3"/></g></svg>`;
  screens.match = function (id) {
    const f = DataSource.fixtures().find((x) => x.id === id);
    if (!f) return { html: `<div class="screen"><header class="topbar">${backBtn('#matches')}<span class="title">Match</span><span class="spacer44"></span></header><main class="scroll"><p class="muted">Match not found.</p></main></div>` };
    const det = f.status === 'upcoming' ? null : DataSource.detail(id);
    const key = 'match_' + id;
    const st = screens.match[key] || (screens.match[key] = { tab: det ? 'ball' : 'events', minute: f.minute || 90, player: 0 });
    const maxMin = f.status === 'live' ? f.minute : 90;
    if (!det) st.tab = 'events';
    if (st.minute > maxMin) st.minute = maxMin;
    const a = getAlerts();
    const tabs = det ? [['ball', 'Ball tracker'], ['heat', 'Heat maps'], ['events', 'Events']] : [['events', 'Info']];
    let body = '';
    if (st.tab === 'ball' && det) {
      const b = ballPos(st.minute); const trail = [];
      for (let i = 6; i >= 1; i--) if (st.minute - i * 0.5 > 0) { const q = ballPos(st.minute - i * 0.5); trail.push(`<span class="trail" style="left:${q.x}%;top:${q.y}%;opacity:${(0.12 * (7 - i)).toFixed(2)}"></span>`); }
      const zone = b.x < 33 ? T(f.home).name + ' attacking third' : b.x > 67 ? T(f.away).name + ' attacking third' : 'Midfield';
      const goals = det.events.filter((e) => e.type === 'goal' && e.min <= maxMin);
      body = `<div class="row between tiny muted"><span>← ${esc(T(f.home).name)} attack</span><span>${esc(T(f.away).name)} attack →</span></div>
        <div class="pitch-wrap" id="pitch">${PITCH(true)}${trail.join('')}<span class="ball" style="left:${b.x}%;top:${b.y}%"></span></div>
        <div class="row between"><b class="display" style="font-size:1.4em">${st.minute}'</b><span class="small muted">${esc(zone)}</span></div>
        <input type="range" id="minute" min="1" max="${maxMin}" value="${st.minute}" aria-label="Match minute">
        <div class="marks">${goals.map((g) => `<span style="left:${((g.min - 1) / Math.max(1, maxMin - 1) * 100).toFixed(1)}%">⚽ ${g.min}</span>`).join('')}</div>
        <div class="row"><button type="button" class="btn" id="goLive" style="height:46px">${f.status === 'live' ? 'Jump to live' : 'Jump to end'}</button><button type="button" class="btn ghost" id="replay" style="height:46px">${st.playing ? 'Stop replay' : 'Replay from 1\''}</button></div>`;
    } else if (st.tab === 'heat' && det) {
      const pl = det.players[st.player];
      body = `<div class="row">${det.players.map((x, i) => `<button type="button" class="chip" data-player="${i}" aria-pressed="${st.player === i}" style="flex:1;height:56px;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px"><span>${esc(x.name)}</span><span class="tiny" style="opacity:.75">${esc(x.role)}</span></button>`).join('')}</div>
        <div class="pitch-wrap">${PITCH(false)}${pl.spots.map((s) => `<span class="blob" style="left:${s[0]}%;top:${s[1]}%;width:${s[2] / 3.5}%;aspect-ratio:1;background:radial-gradient(circle, rgba(255,70,40,${s[3]}) 0%, rgba(255,190,40,${(s[3] * .6).toFixed(2)}) 40%, rgba(255,230,80,0) 70%)"></span>`).join('')}</div>
        <div class="stat3">${pl.stats.map((s) => `<div class="card"><span class="tiny muted">${esc(s[0])}</span><b>${esc(s[1])}</b></div>`).join('')}</div>`;
    } else {
      const evs = det ? det.events.filter((e) => e.min <= maxMin).slice().reverse() : [];
      const col = { goal: 'var(--accent)', yellow: '#FFD23F', red: 'var(--loss)', sub: 'var(--c-cal)' };
      body = evs.length ? `<div class="list">${evs.map((e) => `<div class="ev"><b class="small muted" style="width:34px">${e.min}'</b><span class="mk" style="background:${col[e.type]}"></span><div style="flex:1"><div style="font-weight:600">${esc(e.title)}</div><div class="small muted">${esc(e.sub)}</div></div><b class="tiny muted">${esc(e.team)}</b></div>`).join('')}</div>`
        : `<div class="card" style="padding:16px"><b>${esc(f.league)}</b><p class="muted small" style="margin:6px 0 0">${f.status === 'upcoming' ? 'Kickoff ' + fmtTime(f.time) + '. Turn on the bell to get a reminder.' : 'Detailed tracking for this match will appear when the live data feed is connected.'}</p></div>`;
    }
    return {
      html: `<div class="screen">
        <header class="topbar">${backBtn('#matches', 'Back to matches')}<span class="title small muted" style="font-family:Inter;font-weight:500">${esc(f.league)}${det ? ' · ' + esc(det.venue) : ''}</span>
          ${f.status === 'upcoming' ? `<button type="button" class="iconbtn bell" data-bell="${f.id}" aria-pressed="${!!a.matches[f.id]}" aria-label="Alerts for this match">${icon('bell')}</button>` : '<span class="spacer44"></span>'}</header>
        <div style="padding:10px 20px" class="scoreline"><div class="side">${crest(f.home, 52)}${esc(T(f.home).name)}</div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:4px"><div class="bigscore">${f.hs != null ? f.hs + ' – ' + f.as : 'vs'}</div>${f.status === 'live' ? `<span class="live-pill">${liveLabel(f)}</span>` : `<span class="small muted">${f.status === 'ft' ? 'Full time' : fmtTime(f.time)}</span>`}</div>
          <div class="side">${crest(f.away, 52)}${esc(T(f.away).name)}</div></div>
        <div style="padding:0 20px"><div class="seg">${tabs.map(([k, l]) => `<button type="button" data-tab="${k}" aria-pressed="${st.tab === k}">${l}</button>`).join('')}</div></div>
        <main class="scroll">${demoBanner()}${body}</main></div>`,
      mount() {
        on('[data-tab]', 'click', (e, el) => { st.tab = el.dataset.tab; stopReplay(); render(); });
        on('[data-player]', 'click', (e, el) => { st.player = Number(el.dataset.player); render(); });
        on('[data-bell]', 'click', (e, el) => toggleMatchAlert(el.dataset.bell));
        on('#minute', 'input', (e) => { st.minute = Number(e.target.value); stopReplay(); render(); const r = qs('#minute'); if (r) r.focus(); });
        on('#goLive', 'click', () => { stopReplay(); st.minute = maxMin; render(); });
        on('#replay', 'click', () => {
          if (st.playing) { stopReplay(); render(); return; }
          st.minute = 1; st.playing = true;
          st.timer = setInterval(() => { if (location.hash !== '#match/' + id || st.minute >= maxMin) { stopReplay(); if (location.hash === '#match/' + id) render(); return; } st.minute += 1; render(); }, 180);
          render();
        });
        function stopReplay() { clearInterval(st.timer); st.playing = false; }
      }
    };
  };

  /* ----- Calendar ----- */
  screens.calendar = function () {
    const p = getProfile(); const now = new Date();
    const st = screens.calendar.st || (screens.calendar.st = { mode: 'month', y: now.getFullYear(), m: now.getMonth(), sel: ymd(now), hidden: {} });
    const a = getAlerts();
    const teamFx = DataSource.fixtures().filter((f) => p.teams.some((c) => (f.home === c || f.away === c) && !st.hidden[c]));
    const colorFor = (f) => T(p.teams.find((c) => (f.home === c || f.away === c) && !st.hidden[c])).color;
    const first = new Date(st.y, st.m, 1); const daysIn = new Date(st.y, st.m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < first.getDay(); i++) cells.push('<button type="button" disabled></button>');
    for (let d = 1; d <= daysIn; d++) {
      const key = st.y + '-' + pad(st.m + 1) + '-' + pad(d); const dayFx = teamFx.filter((f) => f.date === key);
      cells.push(`<button type="button" data-sel="${key}" class="${key === ymd(now) ? 'today' : ''}" aria-pressed="${st.sel === key}" aria-label="${MONTHS[st.m]} ${d}, ${dayFx.length} matches"><span>${d}</span><span class="dots">${dayFx.slice(0, 3).map((f) => `<i style="background:${colorFor(f)}"></i>`).join('')}</span></button>`);
    }
    const monthCount = teamFx.filter((f) => f.date.startsWith(st.y + '-' + pad(st.m + 1))).length;
    let list, title;
    if (st.mode === 'month') { list = teamFx.filter((f) => f.date === st.sel); const d = parseYmd(st.sel); title = DOW[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate(); }
    else { const s = new Date(now); s.setHours(0, 0, 0, 0); const e = new Date(s); e.setDate(e.getDate() + 7); list = teamFx.filter((f) => { const d = parseYmd(f.date); return d >= s && d < e; }); title = 'Matchweek · next 7 days'; }
    list.sort((x, y) => (x.date + x.time).localeCompare(y.date + y.time));
    return {
      html: `<div class="screen">
        <header class="topbar">${backBtn('#home', 'Back to home')}<span class="title">My calendar</span><span class="spacer44"></span></header>
        <main class="scroll">${demoBanner()}
          <div class="chips">${p.teams.map((c) => `<button type="button" class="teamchip" data-team="${c}" aria-pressed="${!st.hidden[c]}">${crest(c, 28)}${esc(T(c).name)}</button>`).join('')}<a class="chip" href="#profile" style="display:flex;align-items:center;border-style:dashed;color:var(--muted)">+ Add team</a></div>
          <div class="seg"><button type="button" data-cmode="month" aria-pressed="${st.mode === 'month'}">Month</button><button type="button" data-cmode="week" aria-pressed="${st.mode === 'week'}">This matchweek</button></div>
          ${st.mode === 'month' ? `<div class="card cal"><div class="row between" style="padding:0 2px 10px"><button type="button" class="iconbtn" data-mon="-1" aria-label="Previous month">${icon('back', 18)}</button><div style="text-align:center"><b>${MONTHS[st.m]} ${st.y}</b><div class="tiny muted">${monthCount} matches</div></div><button type="button" class="iconbtn" data-mon="1" aria-label="Next month">${icon('chev', 18)}</button></div>
            <div class="calgrid">${'SMTWTFS'.split('').map((x) => `<span class="dow">${x}</span>`).join('')}${cells.join('')}</div></div>` : ''}
          <div class="row between"><b>${title}</b><span class="tiny muted">Your local time</span></div>
          ${list.length ? `<div class="list">${list.map((f) => { const d = parseYmd(f.date); return `<div class="fx"><span class="d"><span class="tiny muted">${DOW[d.getDay()]}</span><b>${d.getDate()}</b></span><a href="#match/${f.id}" style="flex:1;color:var(--text)"><div style="font-weight:600">${esc(matchTitle(f))}</div><div class="small muted">${esc(f.league)} · ${f.status === 'upcoming' ? fmtTime(f.time) : f.status === 'live' ? 'LIVE' : 'FT ' + f.hs + '–' + f.as}</div></a>${f.status === 'upcoming' ? `<button type="button" class="iconbtn bell" data-bell="${f.id}" aria-pressed="${!!a.matches[f.id]}" aria-label="Alerts for ${esc(matchTitle(f))}">${icon('bell', 18)}</button>` : ''}</div>`; }).join('')}</div>`
            : `<div class="card muted" style="padding:18px;text-align:center">No matches for your teams ${st.mode === 'month' ? 'this day' : 'this week'}.</div>`}
          <p class="note">Saved on your device · works offline</p>
        </main>${nav('')}</div>`,
      mount() {
        on('[data-team]', 'click', (e, el) => { st.hidden[el.dataset.team] = !st.hidden[el.dataset.team]; render(); });
        on('[data-cmode]', 'click', (e, el) => { st.mode = el.dataset.cmode; render(); });
        on('[data-sel]', 'click', (e, el) => { st.sel = el.dataset.sel; render(); });
        on('[data-mon]', 'click', (e, el) => { const d = new Date(st.y, st.m + Number(el.dataset.mon), 1); st.y = d.getFullYear(); st.m = d.getMonth(); render(); });
        on('[data-bell]', 'click', (e, el) => toggleMatchAlert(el.dataset.bell));
      }
    };
  };

  /* ----- Alerts ----- */
  screens.alerts = function () {
    const a = getAlerts(); const p = getProfile(); const ns = notifyState();
    const kinds = [['kick', 'Kickoff reminder', '15 minutes before the match'], ['line', 'Lineups announced', 'About an hour before kickoff'], ['goal', 'Goals', 'With scorer and live score'], ['red', 'Red cards & penalties', 'Big moments only'], ['ht', 'Half-time score', 'At the break'], ['ft', 'Full-time result', 'Final score']];
    const statusCard = {
      granted: ['Notifications are on', 'You’ll get alerts on this device.', 'Send a test alert', 'test'],
      default: ['Turn on notifications', 'Your phone will ask for permission.', 'Turn on', 'ask'],
      denied: ['Notifications are blocked', 'Allow them for this site in your browser or phone settings, then come back.', '', ''],
      unsupported: ['Not supported here', 'On iPhone, add Matchday 195 to your Home Screen first (Share → Add to Home Screen), then open it from there.', '', '']
    }[ns];
    const mine = DataSource.fixtures().filter((f) => a.matches[f.id] && f.status === 'upcoming');
    return {
      html: `<div class="screen">
        <header class="topbar">${backBtn('#home', 'Back to home')}<span class="title">Alerts</span><span class="spacer44"></span></header>
        <main class="scroll">
          <div class="card" style="padding:14px;display:flex;flex-direction:column;gap:10px"><b>${statusCard[0]}</b><span class="small muted">${statusCard[1]}</span>${statusCard[2] ? `<button type="button" class="btn" id="notifBtn" data-act="${statusCard[3]}" style="height:44px">${statusCard[2]}</button>` : ''}</div>
          <span class="label">How alerts look</span>
          <div class="notif"><span class="ic" style="background:var(--accent)">${icon('ball', 20, 2.2)}</span><div style="flex:1"><div class="row between tiny muted"><span>Matchday 195</span><span>now</span></div><b class="small">GOAL! Arsenal 2 – 1 Chelsea (58')</b><div class="small muted">Ødegaard scores. Tap for the ball tracker.</div></div></div>
          <span class="label">Notify me about</span>
          <div class="list">${kinds.map((k) => setrow('k_' + k[0], a.kinds[k[0]], k[1], k[2])).join('')}</div>
          <span class="label">For these teams</span>
          <div class="list">${p.teams.length ? p.teams.map((c) => `<div class="setrow">${crest(c, 30)}<div class="grow"><span>${esc(T(c).name)}</span></div>${switchBtn('t_' + c, !a.muted[c], 'Alerts for ' + T(c).name)}</div>`).join('') : '<div class="setrow muted">Add favorite teams in your profile.</div>'}</div>
          <span class="label">Matches with the bell on (${mine.length})</span>
          ${mine.length ? `<div class="list">${mine.map((f) => `<a class="setrow" href="#match/${f.id}"><div class="grow"><span>${esc(matchTitle(f))}</span><span>${esc(f.league)} · ${f.date} · ${fmtTime(f.time)}</span></div>${icon('chev', 18)}</a>`).join('')}</div>` : '<p class="small muted" style="margin:0">Tap the bell next to any match to get its alerts.</p>'}
          <p class="note">Right now alerts come while Matchday 195 is open or running in the background. Alerts when the app is fully closed need the live server, which comes with the live data feed.</p>
        </main>${nav('')}</div>`,
      mount() {
        on('[data-sw]', 'click', (e, el) => {
          const id = el.dataset.sw; const al = getAlerts();
          if (id.startsWith('k_')) al.kinds[id.slice(2)] = !al.kinds[id.slice(2)];
          if (id.startsWith('t_')) al.muted[id.slice(2)] = !al.muted[id.slice(2)];
          saveAlerts(al); render();
        });
        on('#notifBtn', 'click', async (e, el) => {
          if (el.dataset.act === 'ask') { try { await Notification.requestPermission(); } catch (er) { } render(); }
          else { const ok = await sendNotification('GOAL! Arsenal 2 – 1 Chelsea (58\')', 'This is a test alert from Matchday 195.', '#alerts'); toast(ok ? 'Test alert sent' : 'Couldn’t send — check your notification settings'); }
        });
      }
    };
  };

  /* ----- Transfers ----- */
  screens.transfers = function () {
    const st = screens.transfers.st || (screens.transfers.st = { scope: 'all' });
    const p = getProfile();
    const now = new Date(); let banner = '';
    const jan = new Date(now.getFullYear() + (now.getMonth() >= 1 ? 1 : 0), 0, 1);
    const inJan = (now.getMonth() === 0) || (now.getMonth() === 1 && now.getDate() <= 2);
    if (inJan) banner = 'The January window is <b>open</b>';
    else if (now.getMonth() >= 8) banner = `January window opens in <b>${Math.ceil((jan - now) / 86400000)} days</b>`;
    const all = News.items();
    const items = st.scope === 'all' ? all : all.filter((x) => (x.teams || []).some((c) => p.teams.includes(c)));
    const state = News.state();
    let empty = '';
    if (!items.length) {
      if (state === 'loading') empty = 'Loading the latest headlines…';
      else if (state === 'offline') empty = 'You’re offline. Headlines will load when you’re back online.';
      else if (st.scope === 'mine') empty = 'No headlines about your favorite teams right now.';
      else empty = 'No headlines yet. They update every 30 minutes.';
    }
    const srcs = News.sources();
    return {
      html: `<div class="screen">
        <header class="topbar">${backBtn('#home', 'Back to home')}<span class="title">Transfer news</span><button type="button" class="iconbtn" id="newsRefresh" aria-label="Refresh headlines">${icon('refresh')}</button></header>
        <main class="scroll">
          ${banner ? `<div class="window">${icon('clock', 20)}<span>${banner}</span></div>` : ''}
          <div class="seg"><button type="button" data-scope="all" aria-pressed="${st.scope === 'all'}">All teams</button><button type="button" data-scope="mine" aria-pressed="${st.scope === 'mine'}">My teams</button></div>
          ${items.length ? items.map((x) => `<article class="card tcard">
            <div class="row between tiny muted"><b style="color:var(--text)">${esc(x.source)}</b><span>${esc(timeAgo(x.published))}</span></div>
            <b style="font-size:1.02em;line-height:1.35">${esc(x.title)}</b>
            ${(x.teams || []).length ? `<div class="row" style="gap:6px;flex-wrap:wrap">${x.teams.map((c) => `<span class="row tiny" style="gap:6px;padding:3px 10px 3px 3px;border-radius:999px;background:var(--surface2);font-weight:600">${crest(c, 20)}${esc(T(c).name)}</span>`).join('')}</div>` : ''}
            <a href="${esc(x.link)}" target="_blank" rel="noopener" class="row small" style="gap:6px;font-weight:700;padding-top:10px;border-top:1px solid var(--line)">Read on ${esc(x.source)}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg></a>
          </article>`).join('') : `<div class="card muted" style="padding:18px;text-align:center">${empty}</div>`}
          <p class="note">Real headlines${srcs.length ? ' from ' + srcs.map(esc).join(' and ') : ''}${News.updated() ? ' · updated ' + timeAgo(News.updated()) : ''}. Tap a story to read it on their site.</p>
        </main>${nav('')}</div>`,
      mount() {
        on('[data-scope]', 'click', (e, el) => { st.scope = el.dataset.scope; render(); });
        on('#newsRefresh', 'click', async (e, el) => { const sv = el.querySelector('svg'); sv.classList.remove('spin'); void sv.offsetWidth; sv.classList.add('spin'); const ok = await News.load(); toast(ok ? 'Headlines up to date' : 'Couldn’t reach the news — showing saved headlines'); render(); });
      }
    };
  };

  /* ----- Skills list ----- */
  const CAT = { Shooting: ['var(--c-live)', 'shot'], Dribbling: ['var(--c-tr)', 'dribble'], Passing: ['var(--c-cal)', 'pass'], 'First touch': ['var(--c-sk)', 'touch'] };
  const LVL = { Beginner: 'var(--win)', Intermediate: 'var(--c-tr)', Advanced: 'var(--danger)' };
  screens.skills = function () {
    const st = screens.skills.st || (screens.skills.st = { cat: 'All' });
    const prog = getProg(); const all = DataSource.skills();
    const last = all.find((s) => s.id === prog.last) || all[0]; const ls = prog.steps[last.id] || 0;
    const list = all.filter((s) => st.cat === 'All' || s.cat === st.cat);
    return {
      html: `<div class="screen">
        <header class="topbar"><span class="brand" style="font-size:1.6em">Skills</span><span class="small muted row" style="gap:6px">${icon('down', 14)}Saved offline</span></header>
        <main class="scroll">
          <a class="featured" href="#skill/${last.id}" style="display:flex;flex-direction:column;gap:10px">
            <span class="label" style="color:var(--accent)">Continue learning</span><b class="display" style="font-size:1.3em">${esc(last.name)}</b>
            <span class="small muted">Step ${ls + 1} of ${last.steps.length} · ${esc(last.steps[ls][0])}</span>
            <div class="progress"><div style="width:${((ls + 1) / last.steps.length * 100).toFixed(0)}%"></div></div></a>
          <div class="chips">${['All', 'Shooting', 'Dribbling', 'Passing', 'First touch'].map((c) => `<button type="button" class="chip" data-cat="${c}" aria-pressed="${st.cat === c}">${c}</button>`).join('')}</div>
          <div class="skgrid">${list.map((s) => { const done = prog.done[s.id]; return `<a class="card skcard" href="#skill/${s.id}"><span class="ic" style="background:${CAT[s.cat][0]}">${icon(CAT[s.cat][1], 22, 2.2)}</span><b>${esc(s.name)}</b>
            <span class="row between tiny muted" style="margin-top:auto"><span class="lvl" style="color:${LVL[s.level]}">${s.level}</span><span>${done ? '✓ Done' : s.steps.length + ' steps'}</span></span></a>`; }).join('')}</div>
        </main>${nav('skills')}</div>`,
      mount() { on('[data-cat]', 'click', (e, el) => { st.cat = el.dataset.cat; render(); }); }
    };
  };

  /* ----- Skill tutorial ----- */
  function lacesFig(i) {
    const lime = '#B6F23A', dim = '#E8F5EC';
    if (i <= 1) { const ap = i === 0 ? lime : dim, pl = i === 1 ? lime : dim;
      return `<svg width="100%" height="190" viewBox="0 0 300 190" role="img" aria-label="Top view: angled run-up and standing foot beside the ball"><rect x="230" y="20" width="60" height="150" fill="none" stroke="#E8F5EC" stroke-opacity=".5" stroke-width="2"/><text x="260" y="98" fill="#E8F5EC" fill-opacity=".7" font-size="12" text-anchor="middle" font-family="Inter">GOAL</text><path d="M30 160 L120 108" stroke="${ap}" stroke-width="4" stroke-dasharray="8 7" stroke-linecap="round"/><path d="M112 103 l12 4 -6 10" fill="none" stroke="${ap}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><text x="40" y="130" fill="${ap}" font-size="12" font-weight="700" font-family="Inter">~30° run-up</text><ellipse cx="146" cy="78" rx="9" ry="20" fill="${pl}" transform="rotate(90 146 78)"/><text x="128" y="58" fill="${pl}" font-size="12" font-weight="700" font-family="Inter">standing foot</text><circle cx="146" cy="100" r="11" fill="#fff" stroke="#0B1210" stroke-width="2"/><path d="M162 100 L224 100" stroke="#E8F5EC" stroke-opacity=".6" stroke-width="2" stroke-dasharray="4 5"/></svg>`; }
    if (i === 2) return `<svg width="100%" height="190" viewBox="0 0 300 190" role="img" aria-label="Side view: kicking foot with toes pointed down and ankle locked"><path d="M110 20 L120 110 Q122 128 140 134 L210 150 Q226 154 222 140 L216 128 Q150 112 146 96 L140 20 Z" fill="${lime}"/><path d="M150 112 Q180 122 212 132" stroke="#0B1210" stroke-width="3" stroke-dasharray="5 5" fill="none"/><text x="160" y="104" fill="#0B1210" font-size="11" font-weight="700" font-family="Inter" transform="rotate(14 160 104)">laces</text><path d="M232 120 q16 18 4 38" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M230 152 l6 8 8 -6" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><text x="20" y="60" fill="#EEF3EF" font-size="13" font-weight="700" font-family="Inter">Toes down</text><text x="20" y="80" fill="#EEF3EF" font-size="13" font-weight="700" font-family="Inter">Ankle firm</text></svg>`;
    if (i <= 4) { const fc = i === 4 ? lime : '#5C7A68';
      return `<svg width="100%" height="190" viewBox="0 0 300 190" role="img" aria-label="Side view: laces strike the middle of the ball, then follow through toward the target"><line x1="10" y1="160" x2="290" y2="160" stroke="#E8F5EC" stroke-opacity=".5" stroke-width="2"/><circle cx="130" cy="130" r="30" fill="#fff"/><circle cx="102" cy="130" r="7" fill="#FF7A4D"/><text x="40" y="100" fill="#FF7A4D" font-size="12" font-weight="700" font-family="Inter">hit here</text><path d="M165 128 Q220 112 285 96" stroke="#E8F5EC" stroke-width="3" stroke-dasharray="6 6" fill="none"/><path d="M60 150 Q120 170 170 120 Q200 86 220 60" stroke="${fc}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M210 58 l11 1 -3 11" stroke="${fc}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><text x="196" y="44" fill="${fc}" font-size="12" font-weight="700" font-family="Inter">follow through</text></svg>`; }
    return `<div style="display:flex;flex-direction:column;gap:8px;width:88%"><div style="padding:10px 12px;border-radius:10px;background:rgba(11,18,16,.6)"><b>Ball flies over?</b> Lean forward, knee over the ball.</div><div style="padding:10px 12px;border-radius:10px;background:rgba(11,18,16,.6)"><b>Shot is weak?</b> Lock your ankle, hit through.</div><div style="padding:10px 12px;border-radius:10px;background:rgba(11,18,16,.6)"><b>Goes wide?</b> Point your standing foot at the target.</div></div>`;
  }
  screens.skill = function (id) {
    const all = DataSource.skills(); const sk = all.find((s) => s.id === id);
    if (!sk) return { html: `<div class="screen"><header class="topbar">${backBtn('#skills')}<span class="title">Skill</span><span class="spacer44"></span></header><main class="scroll"><p class="muted">Skill not found.</p></main></div>` };
    const prog = getProg(); let i = Math.min(prog.steps[id] || 0, sk.steps.length - 1);
    if (prog.last !== id) { prog.last = id; saveProg(prog); }
    const step = sk.steps[i]; const last = i === sk.steps.length - 1;
    return {
      html: `<div class="screen">
        <header class="topbar">${backBtn('#skills', 'Back to skills')}<div style="flex:1"><div class="tiny muted">${esc(sk.cat)} · ${esc(sk.level)}</div><b class="display" style="font-size:1.15em">${esc(sk.name)}</b></div></header>
        <div style="padding:6px 20px 0"><div class="stepbars" style="grid-template-columns:repeat(${sk.steps.length},1fr)">${sk.steps.map((s, k) => `<button type="button" data-step="${k}" class="${k <= i ? 'done' : ''}" aria-label="Go to step ${k + 1}" ${k === i ? 'aria-current="step"' : ''}><span></span></button>`).join('')}</div></div>
        <main class="scroll">
          <div class="figure"><span class="tag">Step ${i + 1} of ${sk.steps.length}</span>${sk.figs ? lacesFig(i) : `<span class="bignum" aria-hidden="true">${i + 1}</span>`}</div>
          <div><h2 style="margin:0 0 8px;font-size:1.4em">${esc(step[0])}</h2><p style="margin:0;line-height:1.55">${esc(step[1])}</p></div>
          <div class="card tip"><span class="ic" style="color:var(--accent)">${icon('bulb', 18)}</span><div><b style="color:var(--accent)">COACH TIP</b><p>${esc(step[2])}</p></div></div>
          <div class="card tip"><span class="ic" style="color:var(--c-cal)">${icon('target', 18)}</span><div><b style="color:var(--c-cal)">PRACTICE DRILL</b><p>${esc(step[3])}</p></div></div>
        </main>
        <div class="stepnav"><button type="button" class="btn ghost" id="prev" style="flex:1" ${i === 0 ? 'disabled' : ''}>Back</button><button type="button" class="btn" id="next" style="flex:2">${last ? (prog.done[id] ? 'Start again' : 'Mark as learned') : 'Next step'}</button></div></div>`,
      mount() {
        const go = (k) => { const p = getProg(); p.steps[id] = k; saveProg(p); render(); window.scrollTo(0, 0); };
        on('[data-step]', 'click', (e, el) => go(Number(el.dataset.step)));
        on('#prev', 'click', () => { if (i > 0) go(i - 1); });
        on('#next', 'click', () => {
          if (!last) return go(i + 1);
          const p = getProg();
          if (p.done[id]) { p.steps[id] = 0; saveProg(p); render(); window.scrollTo(0, 0); return; }
          p.done[id] = true; saveProg(p); toast('Nice! ' + sk.name + ' learned'); render();
        });
      }
    };
  };

  /* ----- Profile ----- */
  screens.profile = function () {
    const st = screens.profile.st || (screens.profile.st = { p: null });
    if (!st.p) st.p = getProfile();
    const p = st.p; const s = sess.get() || {};
    const colors = ['#B6F23A', '#5AA9FF', '#FFB547', '#C9A7FF', '#FF8FB1', '#5EE0C1'];
    return {
      html: `<div class="screen">
        <header class="topbar">${backBtn('#home', 'Back to home')}<span class="title">Edit profile</span><a class="iconbtn" href="#settings" aria-label="Settings">${icon('gear')}</a></header>
        <main class="scroll" style="gap:18px">
          ${s.guest ? `<div class="card small" style="padding:12px 14px"><b>You’re browsing as a guest.</b> <span class="small muted">Your profile is saved on this device. <a href="#" id="toLogin">Create an account</a> to keep it with a login.</span></div>` : ''}
          <div style="display:flex;flex-direction:column;align-items:center;gap:12px">${avatarHtml(p, 'bigavatar')}
            <div class="row" style="gap:10px">${colors.map((c) => `<button type="button" class="swatch" data-color="${c}" aria-pressed="${p.avatar === c}" style="background:${c}" aria-label="Avatar color"></button>`).join('')}</div>
            <div class="row"><label style="font-weight:600;color:var(--accent);cursor:pointer" class="small">Upload a photo<input type="file" id="photo" accept="image/*" class="sr"></label>${p.photo ? `<button type="button" id="rmPhoto" class="small" style="border:0;background:none;color:var(--muted)">Remove photo</button>` : ''}</div></div>
          <label class="field">Display name<input id="f_name" value="${esc(p.name)}" maxlength="30"></label>
          <label class="field">Username<input id="f_username" value="${esc(p.username)}" maxlength="30" placeholder="@yourname"></label>
          <label class="field">Bio<textarea id="f_bio" rows="2" maxlength="140" placeholder="Say something about your game">${esc(p.bio)}</textarea></label>
          <div style="display:flex;flex-direction:column;gap:8px"><span class="small muted" style="font-weight:600">Position I play</span><div class="seg">${['GK', 'DEF', 'MID', 'FWD'].map((x) => `<button type="button" data-pos="${x}" aria-pressed="${p.pos === x}">${x}</button>`).join('')}</div></div>
          <div style="display:flex;flex-direction:column;gap:8px"><span class="small muted" style="font-weight:600">Favorite teams</span>
            <div class="list">${p.teams.map((c) => `<div class="setrow">${crest(c, 30)}<div class="grow"><span>${esc(T(c).name)}</span><span>${esc(T(c).league)}</span></div><button type="button" class="iconbtn" data-rm="${c}" aria-label="Remove ${esc(T(c).name)}" style="background:transparent;border:0">${icon('x', 16, 2.5)}</button></div>`).join('') || '<div class="setrow muted">No teams yet.</div>'}</div>
            <div class="card" style="padding:12px;display:flex;flex-direction:column;gap:10px">
              <b class="small">Add teams</b>
              <label class="search">${icon('search', 18)}<input id="teamQ" type="search" placeholder="Search clubs or countries" aria-label="Search clubs or countries" value="${esc(st.q || '')}"></label>
              <div class="chips">${['All'].concat(Object.keys(D.TEAM_GROUPS)).map((g) => `<button type="button" class="chip" data-group="${esc(g)}" aria-pressed="${(st.group || 'All') === g}">${esc(g)}</button>`).join('')}</div>
              <div class="list" id="teamResults" style="max-height:340px;overflow-y:auto">${teamResults(p, st)}</div>
            </div></div>
          <label class="field">Favorite player<input id="f_player" value="${esc(p.player)}" maxlength="40" placeholder="Who do you play like?"></label>
          <button type="button" class="btn" id="saveP">Save profile</button>
          <button type="button" class="btn ghost" id="logout" style="color:var(--danger)">Log out</button>
        </main></div>`,
      mount() {
        const grab = () => { ['name', 'username', 'bio', 'player'].forEach((k) => { const el = qs('#f_' + k); if (el) p[k] = el.value; }); };
        on('[data-color]', 'click', (e, el) => { grab(); p.avatar = el.dataset.color; render(); });
        on('[data-pos]', 'click', (e, el) => { grab(); p.pos = el.dataset.pos; render(); });
        on('[data-rm]', 'click', (e, el) => { grab(); p.teams = p.teams.filter((c) => c !== el.dataset.rm); render(); });
        const bindAdd = () => qsa('#teamResults [data-add]').forEach((el) => el.addEventListener('click', () => { grab(); const k = el.dataset.add; if (!p.teams.includes(k)) p.teams.push(k); toast(T(k).name + ' added'); render(); }));
        bindAdd();
        on('[data-group]', 'click', (e, el) => { grab(); st.group = el.dataset.group; render(); });
        on('#teamQ', 'input', (e) => { st.q = e.target.value; qs('#teamResults').innerHTML = teamResults(p, st); bindAdd(); });
        on('#rmPhoto', 'click', () => { grab(); p.photo = ''; render(); });
        on('#photo', 'change', (e) => {
          const file = e.target.files && e.target.files[0]; if (!file) return; grab();
          const img = new Image(); const url = URL.createObjectURL(file);
          img.onload = () => { const c = document.createElement('canvas'); const S = 256; c.width = c.height = S; const k = Math.max(S / img.width, S / img.height); const w = img.width * k, h = img.height * k;
            c.getContext('2d').drawImage(img, (S - w) / 2, (S - h) / 2, w, h); p.photo = c.toDataURL('image/jpeg', 0.82); URL.revokeObjectURL(url); render(); };
          img.onerror = () => toast('Couldn’t read that image'); img.src = url;
        });
        on('#saveP', 'click', () => { grab(); p.name = p.name.trim() || 'Player'; saveProfile(p); st.p = null; toast('Profile saved'); render(); });
        on('#logout', 'click', logout);
        on('#toLogin', 'click', (e) => { e.preventDefault(); logout(); });
      }
    };
  };
  function teamResults(p, st) {
    const q = (st.q || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const g = st.group || 'All';
    const groups = g === 'All' ? Object.keys(D.TEAM_GROUPS) : [g];
    const keys = [];
    groups.forEach((grp) => D.TEAM_GROUPS[grp].forEach((t) => {
      const hay = (t[1] + ' ' + (t[3] || '') + ' ' + t[0].replace(/^N-/, '') + ' ' + grp).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (!q || hay.includes(q)) keys.push(t[0]);
    }));
    if (!keys.length) return '<div class="setrow muted">No teams match that search.</div>';
    return keys.map((k) => { const t = T(k); const have = p.teams.includes(k);
      return `<div class="setrow">${crest(k, 30)}<div class="grow"><span>${esc(t.name)}</span><span>${esc(t.league)}</span></div>${have ? '<span class="small muted" style="padding:0 6px">Added ✓</span>' : `<button type="button" class="chip" data-add="${esc(k)}" aria-label="Add ${esc(t.name)}">+ Add</button>`}</div>`; }).join('');
  }
  function logout() { sess.clear(); Object.keys(screens).forEach((k) => { delete screens[k].st; }); location.hash = '#login'; render(); }

  /* ----- Settings ----- */
  screens.settings = function () {
    const dark = isDarkNow();
    const themes = [['pitch', 'Pitch', '#B6F23A', '#3B7A0A'], ['blue', 'Blue', '#5AA9FF', '#1F5FBF'], ['sunset', 'Sunset', '#FFB547', '#A85400'], ['royal', 'Royal', '#C9A7FF', '#6B3FC4'], ['red', 'Red', '#FF7B7B', '#C62828']];
    const hours = (from, to) => { const o = []; for (let h = from; h <= to; h++) o.push(h % 24); return o; };
    const sel = (id, val, list) => `<select id="${id}" style="height:40px;padding:0 8px;border-radius:10px;background:var(--bg);color:var(--text);border:1px solid var(--border)">${list.map((h) => `<option value="${h}" ${h === val ? 'selected' : ''}>${fmtHour(h)}</option>`).join('')}</select>`;
    const onWL = (v) => ['--win', '--loss', '--draw'].includes(v) ? `var(${v})` : v;
    return {
      html: `<div class="screen">
        <header class="topbar">${backBtn('#home', 'Back to home')}<span class="title">Settings</span><span class="spacer44"></span></header>
        <main class="scroll" style="gap:18px">
          <div class="card" style="padding:14px;display:flex;flex-direction:column;gap:10px">
            <div class="row between tiny muted"><span>PREVIEW</span><span>${dark ? 'Dark' : 'Light'}${settings.mode === 'auto' ? ' · auto' : ''}</span></div>
            <div class="row between"><b>Arsenal</b><b class="display" style="font-size:1.6em">2 – 1</b><b>Chelsea</b></div>
            <div class="row between"><span class="live-pill">LIVE 67'</span><span class="form-dots">${[['W', 'win'], ['W', 'win'], ['L', 'loss'], ['D', 'draw']].map(([l, v]) => `<span style="background:${onWL('--' + v)};color:${v === 'draw' ? 'var(--text)' : 'var(--bg)'}">${l}</span>`).join('')}</span></div>
          </div>
          <section style="display:flex;flex-direction:column;gap:8px"><span class="label">Appearance</span>
            <div class="seg">${[['light', 'Light'], ['dark', 'Dark'], ['auto', 'Auto']].map(([k, l]) => `<button type="button" data-smode="${k}" aria-pressed="${settings.mode === k}">${l}</button>`).join('')}</div>
            ${settings.mode === 'auto' ? `<div class="list"><div class="setrow"><span style="flex:1">Dark mode starts</span>${sel('darkStart', settings.darkStart, hours(16, 23))}</div><div class="setrow"><span style="flex:1">Light mode starts</span>${sel('darkEnd', settings.darkEnd, hours(4, 10))}</div><div class="setrow small muted">Right now it’s ${dark ? 'dark' : 'light'} mode. Switches by itself at those times.</div></div>` : ''}</section>
          <section style="display:flex;flex-direction:column;gap:8px"><span class="label">Theme</span>
            <div class="themegrid">${themes.map(([k, l, d, li]) => `<button type="button" data-theme="${k}" aria-pressed="${settings.theme === k}" aria-label="${l} theme"><i style="background:${dark ? d : li}"></i>${l}</button>`).join('')}</div></section>
          <section style="display:flex;flex-direction:column;gap:8px"><span class="label">Accessibility</span>
            <div class="list">${setrow('cbOn', settings.cbOn, 'Colorblind mode', 'Swaps hard-to-tell colors and adds labels')}
              ${settings.cbOn ? `<div class="setrow"><div class="seg" style="flex:1">${[['rg', 'Red-green'], ['by', 'Blue-yellow'], ['mono', 'No color']].map(([k, l]) => `<button type="button" data-cb="${k}" aria-pressed="${settings.cbType === k}">${l}</button>`).join('')}</div></div>` : ''}
              <div class="setrow"><span style="flex:1;font-weight:600">Text size</span>${[0, 1, 2].map((z) => `<button type="button" class="chip" data-size="${z}" aria-pressed="${settings.size === z}" style="width:46px;padding:0;font-size:${[13, 16, 20][z]}px" aria-label="${['Small', 'Medium', 'Large'][z]} text">A</button>`).join('')}</div></div></section>
          <section style="display:flex;flex-direction:column;gap:8px"><span class="label">Updates & offline</span>
            <div class="list"><div class="setrow"><div class="grow"><span>Refresh now</span><span>Last updated ${fmtClock(DataSource.lastUpdated())}</span></div><button type="button" class="btn" id="refreshBtn" style="width:auto;height:40px;padding:0 14px;font-size:.9em">${icon('refresh', 16)}Refresh</button></div>
              ${setrow('autoRefresh', settings.autoRefresh, 'Auto-refresh live scores', 'Every 30 seconds while the app is open')}
              <div class="setrow"><div class="grow"><span>Works offline</span><span>Skills, calendar and last scores are saved on this device</span></div><span style="color:var(--accent)">${icon('down', 20)}</span></div></div></section>
          <section style="display:flex;flex-direction:column;gap:8px"><span class="label">Account</span>
            <div class="list"><a class="setrow" href="#profile"><span style="flex:1;font-weight:600">Edit profile</span>${icon('chev', 18)}</a><a class="setrow" href="#alerts"><span style="flex:1;font-weight:600">Notifications</span>${icon('chev', 18)}</a>
              <button type="button" class="setrow" id="logout" style="width:100%;border:0;background:none;color:var(--danger);font-weight:600;text-align:left">Log out</button></div></section>
          <p class="note">Matchday 195 v${APP_VERSION}</p>
        </main></div>`,
      mount() {
        on('[data-smode]', 'click', (e, el) => { settings.mode = el.dataset.smode; saveSettings(); render(); });
        on('[data-theme]', 'click', (e, el) => { settings.theme = el.dataset.theme; saveSettings(); render(); });
        on('[data-cb]', 'click', (e, el) => { settings.cbType = el.dataset.cb; saveSettings(); render(); });
        on('[data-size]', 'click', (e, el) => { settings.size = Number(el.dataset.size); saveSettings(); render(); });
        on('[data-sw]', 'click', (e, el) => { settings[el.dataset.sw] = !settings[el.dataset.sw]; saveSettings(); render(); });
        on('#darkStart', 'change', (e) => { settings.darkStart = Number(e.target.value); saveSettings(); render(); });
        on('#darkEnd', 'change', (e) => { settings.darkEnd = Number(e.target.value); saveSettings(); render(); });
        on('#refreshBtn', 'click', async (e, el) => { if (await refreshAll(el)) setTimeout(render, 900); });
        on('#logout', 'click', logout);
      }
    };
  };

  /* ================= ROUTER ================= */
  function render() {
    const s = sess.get();
    let h = location.hash.replace(/^#/, '') || 'home';
    if (!s && h !== 'login') { h = 'login'; history.replaceState(null, '', '#login'); }
    if (s && h === 'login') { h = 'home'; history.replaceState(null, '', '#home'); }
    const [name, arg] = h.split('/');
    const fn = screens[name] || screens.home;
    const prevScroll = render.last === h ? window.scrollY : 0;
    const view = fn(arg);
    app.innerHTML = view.html;
    if (view.mount) view.mount();
    window.scrollTo(0, prevScroll);
    if (render.last !== h) { const t = app.querySelector('h1, .title'); document.title = 'Matchday 195' + (t ? ' – ' + t.textContent.trim() : ''); }
    render.last = h;
  }
  window.addEventListener('hashchange', render);
  window.addEventListener('online', render);
  window.addEventListener('offline', render);

  // Auto-refresh while open (only re-render screens that show scores).
  setInterval(async () => {
    if (!settings.autoRefresh || !navigator.onLine || document.hidden || !sess.get()) return;
    const h = location.hash;
    if (/^#(home|matches|match\/m1)?$/.test(h) || h === '') { await DataSource.refresh(); const sc = screens.match['match_m1']; if (!(sc && sc.playing) && !document.activeElement.matches('input,select,textarea')) render(); }
  }, 30000);

  /* ---------- loading screen ---------- */
  function showLoading(done) {
    const el = document.createElement('div');
    el.className = 'loading'; el.setAttribute('role', 'progressbar'); el.setAttribute('aria-label', 'Loading Matchday 195');
    el.innerHTML = `${LOGO(112)}<div class="word">Match<b>day</b> 195</div><div class="bar"><div></div></div>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.querySelector('.bar').classList.add('run'));
    setTimeout(() => { done(); el.classList.add('hide'); setTimeout(() => el.remove(), 450); }, 3500);
  }
  function startApp(target) { showLoading(() => { if (location.hash !== target) location.hash = target; else render(); }); }

  /* ---------- boot ---------- */
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').then((r) => { swReg = r; }).catch(() => { });
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (!reloaded) { reloaded = true; location.reload(); } });
  }
  News.load().then(() => { if (/^#(home|transfers)?$/.test(location.hash)) render(); });
  if (sess.get()) { render(); showLoading(() => {}); }
  else render();
  checkReminders();
})();
