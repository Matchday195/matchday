/* Matchday — main app. Plain JavaScript, no build step. */
(function () {
  'use strict';
  const D = window.MD_DATA;
  const APP_VERSION = '2.4.0';
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
    dribble: 'M4 18c4 0 4-12 8-12s4 12 8 12', trick: 'M4 17a8 8 0 0116 0M10 19a2 2 0 104 0 2 2 0 00-4 0', pass: 'M5 10a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM19 10a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM8 12h8M13 9l3 3-3 3',
    touch: 'M12 3a4 4 0 100 8 4 4 0 000-8zM5 20c2-4 12-4 14 0M12 11v4', arrow: 'M5 12h14M13 6l6 6-6 6', down: 'M12 4v11M7 10l5 5 5-5M5 20h14',
    wifi: 'M2 9a15 15 0 0120 0M5 12.5a10 10 0 0114 0M8.5 16a5 5 0 017 0M12 19.5h.01'
  };
  const icon = (name, size, sw) => `<svg width="${size || 20}" height="${size || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw || 2}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${IC[name]}"/></svg>`;
  const LOGO = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 112 112" role="img" aria-label="Matchday 195 logo"><rect x="4" y="4" width="104" height="104" rx="30" fill="#B6F23A"/><circle cx="56" cy="56" r="31" fill="none" stroke="#0B1210" stroke-width="7"/><line x1="56" y1="18" x2="56" y2="94" stroke="#0B1210" stroke-width="7" stroke-linecap="round"/><circle cx="56" cy="56" r="8" fill="#0B1210"/><path d="M25 38h10M77 74h10" stroke="#0B1210" stroke-width="7" stroke-linecap="round"/></svg>`;

  /* ---------- user, profile, settings ---------- */
  const DEFAULT_SETTINGS = { mode: 'auto', theme: 'pitch', cbOn: false, cbType: 'rg', size: 1, darkStart: 19, darkEnd: 7, autoRefresh: true };
  const DEFAULT_ALERTS = { kinds: { kick: true, goal: true, ht: true, ft: true }, muted: {}, matches: {} };
  let settings = Object.assign({}, DEFAULT_SETTINGS, store.get('settings', {}));
  const saveSettings = () => { store.set('settings', settings); applyTheme(); };

  function currentUser() { const s = sess.get(); return s ? s.email : null; }
  function profileKey() { return 'profile_' + (currentUser() || 'guest'); }
  function defaultProfile(name, username) { return { name: name || 'Guest', username: username || '', bio: '', avatar: '#5EE0C1', photo: '', pos: '', player: '', teams: [] }; }
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
  const getProg = () => store.get(progKey(), { last: null, steps: {}, done: {} });
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

  /* ---------- teams outside the main list: world clubs (openfootball, CC0) and custom teams ---------- */
  let extraCache = null;
  const extraTeams = () => extraCache || (extraCache = store.get('teamInfo', {}));
  const TEAM_COLORS = ['#C8102E', '#0057B8', '#00843D', '#6B3FC4', '#E8641B', '#0B7A75', '#B8005C', '#1F3C88', '#7A5C00', '#444444'];
  function teamColor(name) { let h = 0; for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return TEAM_COLORS[h % TEAM_COLORS.length]; }
  function teamShort(name) {
    const words = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w && !/^(fc|cf|afc|sc|ac|cd|fk|sk|sv|club|de|the|\d+)$/i.test(w));
    if (!words.length) return name.slice(0, 3).toUpperCase();
    return (words.length === 1 ? words[0].slice(0, 3) : words.slice(0, 3).map((w) => w[0]).join('')).toUpperCase();
  }
  const slug = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  const teamInfoFor = (name, league) => ({ name, color: teamColor(name), short: teamShort(name), league, group: league });
  function rememberTeam(key, name, league) {
    const all = extraTeams();
    all[key] = teamInfoFor(name, league);
    store.set('teamInfo', all); extraCache = all;
  }
  const World = (function () {
    let list = null, loading = null;
    function load() {
      if (list) return Promise.resolve(list);
      if (!loading) loading = fetch('world-clubs.json').then((r) => r.ok ? r.json() : []).then((j) => { list = j; return list; }).catch(() => { loading = null; return []; });
      return loading;
    }
    return { load, list: () => list };
  })();

  const fold = (t) => String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  /* ---------- real match data (football-data.org free plan, fetched by GitHub every ~10 minutes) ---------- */
  // Competition codes from football-data.org -> league names used in the app.
  const COMP_LEAGUE = { PL: 'Premier League', PD: 'La Liga', SA: 'Serie A', BL1: 'Bundesliga', FL1: 'Ligue 1', CL: 'Champions League', DED: 'Eredivisie', PPL: 'Primeira Liga', ELC: 'Championship', BSA: 'Brasileirão', WC: 'FIFA World Cup', EC: 'European Championship', CLI: 'Copa Libertadores' };
  const COMP_GROUP = { PL: 'Premier League', PD: 'La Liga', SA: 'Serie A', BL1: 'Bundesliga', FL1: 'Ligue 1', BSA: 'Brasileirão', WC: 'National teams', EC: 'National teams' };
  const TOUR_CODE = { PL: 'PL', LL: 'PD', SA: 'SA', BL: 'BL1', L1: 'FL1', BR: 'BSA', DED: 'DED', PPL: 'PPL', ELC: 'ELC' };
  const COVERED = new Set(Object.values(COMP_LEAGUE));
  const liveTeams = {};
  const Real = (function () {
    const BASE = 'https://raw.githubusercontent.com/Matchday195/matchday/data/';
    let m = store.get('real_matches', null), s = store.get('real_standings', null);
    let state = m ? 'ok' : 'loading';
    async function getJson(name) {
      const r = await fetch(BASE + name + '?t=' + Math.floor(Date.now() / 60000), { cache: 'no-store' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }
    async function load() {
      try { const j = await getJson('matches.json'); if (j && Array.isArray(j.matches)) { m = j; state = 'ok'; store.set('real_matches', j); cache = null; } }
      catch (e) { if (!m) state = navigator.onLine ? 'none' : 'offline'; }
      try { const j = await getJson('standings.json'); if (j && j.tables) { s = j; store.set('real_standings', j); } } catch (e) { /* tables are optional */ }
      return state === 'ok';
    }
    let cache = null, cacheMin = -1;
    function fixtures() {
      const min = Math.floor(Date.now() / 60000);
      if (!cache || cacheMin !== min) { cache = (m ? m.matches : []).map(convert); cacheMin = min; }
      return cache;
    }
    return { load, fixtures, updated: () => m && m.updated, tables: () => (s && s.tables) || {}, state: () => state };
  })();
  // Find the app's own team for a football-data.org team (by name, short name or 3-letter code).
  const stripName = (t) => fold(t).replace(/\b(fc|cf|afc|sc|ac|cd|ss|ssc|as|sv|vfb|vfl|fk|sk|club|de|calcio|football|futbol)\b/g, ' ').replace(/[^a-z0-9]+/g, '');
  let nameIndex = null;
  function teamIndex() {
    if (nameIndex) return nameIndex;
    nameIndex = {};
    Object.keys(D.TEAM_GROUPS).forEach((g) => D.TEAM_GROUPS[g].forEach((t) => {
      [t[1]].concat(t[3] ? t[3].split('|') : []).forEach((n) => { const k = stripName(n); if (k) (nameIndex[g + ':' + k] = t[0]); });
    }));
    return nameIndex;
  }
  const keyCache = {};
  function keyFor(team, code, league) {
    if (keyCache[team.id]) return keyCache[team.id];
    const idx = teamIndex(); const group = COMP_GROUP[code];
    const groups = group ? [group] : Object.keys(D.TEAM_GROUPS).filter((g) => g !== 'National teams');
    let key = null;
    for (const g of groups) {
      for (const n of [team.short, team.name]) { const k = n && idx[g + ':' + stripName(n)]; if (k) { key = k; break; } }
      if (key) break;
      if (group && team.tla && D.TEAM_GROUPS[g].some((t) => t[0] === team.tla)) { key = team.tla; break; }
    }
    if (!key && group) { // looser match inside the league, e.g. "FC Internazionale Milano" -> Inter
      const full = stripName(team.name);
      const hit = D.TEAM_GROUPS[group].find((t) => [t[1]].concat(t[3] ? t[3].split('|') : []).some((n) => { const k = stripName(n); return k.length >= 4 && full.includes(k); }));
      if (hit) key = hit[0];
    }
    if (!key) { key = 'FD-' + team.id; liveTeams[key] = { name: team.short || team.name, color: teamColor(team.name || String(team.id)), short: (team.tla || teamShort(team.name || '?')).slice(0, 4), league }; }
    keyCache[team.id] = key;
    return key;
  }
  function convert(x) {
    const d = new Date(x.utcDate); const league = COMP_LEAGUE[x.comp] || x.compName || 'Other';
    const f = { id: 'fd' + x.id, real: true, league, comp: x.comp, date: ymd(d), time: pad(d.getHours()) + ':' + pad(d.getMinutes()), kickoff: d,
      home: keyFor(x.home, x.comp, league), away: keyFor(x.away, x.comp, league), matchday: x.matchday, stage: x.stage, hs: x.hs, as: x.as, hht: x.hht, aht: x.aht };
    const st = x.status;
    if (st === 'IN_PLAY' || st === 'PAUSED' || st === 'LIVE') { f.status = 'live'; f.ht = st === 'PAUSED'; f.minute = x.minute || null; if (f.hs == null) { f.hs = 0; f.as = 0; } }
    else if (st === 'FINISHED' || st === 'AWARDED') f.status = 'ft';
    else if (st === 'POSTPONED' || st === 'SUSPENDED' || st === 'CANCELLED') { f.status = 'off'; f.offLabel = { POSTPONED: 'Postponed', SUSPENDED: 'Suspended', CANCELLED: 'Cancelled' }[st]; }
    else f.status = 'upcoming';
    return f;
  }
  const DataSource = {
    fixtures: () => Real.fixtures(),
    team: (c) => D.TEAMS[c] || extraTeams()[c] || liveTeams[c] || { name: c, color: '#777', short: String(c).slice(0, 3), league: '' },
    skills: () => D.SKILLS, leagues: () => D.LEAGUES,
    lastUpdated: () => (Real.updated() ? new Date(Real.updated()) : null),
    refresh: () => Real.load()
  };
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
  const crest = (code, size, info) => { const t = info || T(code); const sh = t.short || code; return `<span class="crest" style="width:${size}px;height:${size}px;background:${t.color};font-size:${Math.round(size / (sh.length > 3 ? 4.2 : 3.3))}px">${esc(sh)}</span>`; };
  const matchTitle = (f) => T(f.home).name + ' vs ' + T(f.away).name;
  function statusText(f) { return f.status === 'live' ? (f.ht ? 'HT' : f.minute ? f.minute + "'" : 'LIVE') : f.status === 'ft' ? 'FT' : f.status === 'off' ? (f.offLabel === 'Postponed' ? 'PPD' : f.offLabel.slice(0, 4) + '.') : fmtTime(f.time); }
  const liveLabel = (f) => f.ht ? 'HALF-TIME' : f.minute ? 'LIVE ' + f.minute + "'" : 'LIVE';
  const resultText = (f) => f.status === 'upcoming' ? fmtTime(f.time) : f.status === 'live' ? liveLabel(f) + ' · ' + f.hs + '–' + f.as : f.status === 'ft' ? 'FT ' + f.hs + '–' + f.as : f.offLabel;
  function noDataCard(msg) {
    const st = Real.state();
    const text = msg || (st === 'loading' ? 'Loading real match data…' : st === 'offline' ? 'You’re offline and no match data is saved yet.' : 'Real match data isn’t connected yet. It appears once the football-data.org key is saved in GitHub.');
    return `<div class="card small muted" style="padding:14px">${text}</div>`;
  }

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
  // Which matches should alert: games of followed teams (unless muted) or games with the bell on.
  function wantsAlerts(f, a, p) {
    if (a.matches[f.id]) return true;
    return [f.home, f.away].some((k) => p.teams.includes(k) && !a.muted[k]);
  }
  function logAlert(title, body, url) {
    const log = store.get('alertLog_' + (currentUser() || 'guest'), []);
    log.unshift({ title, body, url, at: Date.now() });
    store.set('alertLog_' + (currentUser() || 'guest'), log.slice(0, 40));
    sendNotification(title, body, url);
    if (!document.hidden) toast(title + ' · ' + body);
  }
  // Compare the newest real data with what we saw last time and alert on changes.
  function checkAlerts() {
    if (Real.state() !== 'ok' || !sess.get()) return;
    const a = getAlerts(); const p = getProfile(); const now = Date.now();
    const snapKey = 'alertSnap_' + (currentUser() || 'guest');
    const snap = store.get(snapKey, null); const next = {};
    const sent = store.get('sentReminders', {});
    DataSource.fixtures().forEach((f) => {
      next[f.id] = [f.status, f.hs, f.as, f.ht ? 1 : 0];
      if (!wantsAlerts(f, a, p)) return;
      const title = matchTitle(f), url = '#match/' + f.id, score = T(f.home).name + ' ' + f.hs + '–' + f.as + ' ' + T(f.away).name;
      if (f.status === 'upcoming' && a.kinds.kick && !sent[f.id]) {
        const mins = ((f.kickoff ? f.kickoff.getTime() : now) - now) / 60000;
        if (mins > 0 && mins <= 15) { sent[f.id] = 1; logAlert('Kickoff in ' + Math.ceil(mins) + ' min', title + ' · ' + f.league, url); }
      }
      const before = snap && snap[f.id];
      if (!before) return; // first time we see this match: nothing to compare yet
      const [ps, ph, pa, pht] = before;
      if (ps === 'upcoming' && f.status === 'live' && a.kinds.kick) logAlert('Kickoff', title + ' has started · ' + f.league, url);
      if ((f.status === 'live' || f.status === 'ft') && ph != null && (f.hs > ph || f.as > pa) && a.kinds.goal) {
        const scorer = f.hs > ph ? T(f.home).name : T(f.away).name;
        logAlert('GOAL! ' + scorer, score, url);
      }
      if (f.status === 'live' && f.ht && !pht && a.kinds.ht) logAlert('Half-time', score, url);
      if (f.status === 'ft' && ps !== 'ft' && a.kinds.ft) logAlert('Full time', score, url);
    });
    store.set('sentReminders', sent);
    store.set(snapKey, next);
  }
  // Check for new data every minute while the app is open (the data itself updates about every minute).
  async function poll() {
    if (!navigator.onLine || document.hidden || !sess.get()) return;
    const before = Real.updated();
    await Real.load(); await News.load();
    checkAlerts();
    if (Real.updated() !== before && /^#(home|matches|calendar|alerts|match\/.+|team\/.+|league\/.+)?$/.test(location.hash) && !document.activeElement.matches('input,select,textarea')) render();
  }
  setInterval(poll, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) poll(); });

  /* ---------- shared pieces ---------- */
  function nav(active) {
    const items = [['matches', 'Matches', 'ball'], ['home', 'Home', 'home'], ['skills', 'Skills', 'book']];
    return `<nav class="nav" aria-label="Main">${items.map(([r, l, i]) => `<a href="#${r}" ${active === r ? 'aria-current="page"' : ''}>${icon(i, 22)}${l}</a>`).join('')}</nav>`;
  }
  const backBtn = (href, label) => `<a class="iconbtn" href="${href}" aria-label="${label || 'Back'}">${icon('back')}</a>`;
  const offlineBanner = () => navigator.onLine ? '' : `<div class="offline-banner">Offline · showing saved data${DataSource.lastUpdated() ? ' from ' + fmtClock(DataSource.lastUpdated()) : ''}</div>`;
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
    const stepNow = (prog.steps[sk.id] || 0); const started = !!prog.last;
    const tr = News.items();
    const a = getAlerts(); const alertCount = Object.values(a.matches).filter(Boolean).length;
    const lines = (arr) => arr.map((l) => `<div class="ln"><b>${esc(l[0])}</b><span>${esc(l[1])}</span></div>`).join('');
    const cubes = [
      { id: 'live', t: 'Live Matches', s: Real.state() !== 'ok' ? 'No match data yet' : (live.length ? live.length + ' live now' : 'No live games'), c: 'var(--c-live)', href: '#matches', ic: 'ball',
        l: live.slice(0, 2).map((f) => [T(f.home).name + ' ' + f.hs + '–' + f.as + ' ' + T(f.away).name, liveLabel(f) + ' · ' + f.league]) },
      { id: 'cal', t: 'My Calendar', s: nextDay ? 'Next: ' + DOW[nextDay.getDay()] + ', ' + MONTHS[nextDay.getMonth()].slice(0, 3) + ' ' + nextDay.getDate() : 'No games soon', c: 'var(--c-cal)', href: '#calendar', ic: 'cal',
        l: mine.slice(0, 2).map((f) => [matchTitle(f), DOW[parseYmd(f.date).getDay()] + ' · ' + fmtTime(f.time)]) },
      { id: 'tr', t: 'Transfer News', s: tr.length ? 'Latest: ' + timeAgo(tr[0].published) : (News.state() === 'loading' ? 'Loading…' : 'Real headlines'), c: 'var(--c-tr)', href: '#transfers', ic: 'swap',
        l: tr.slice(0, 1).map((x) => [x.title, x.source + ' · ' + timeAgo(x.published)]) },
      { id: 'sk', t: 'Skills', s: started ? sk.name.split(' (')[0] + ' · ' + (stepNow + 1) + '/' + sk.steps.length : DataSource.skills().length + ' tutorials', c: 'var(--c-sk)', href: started ? '#skill/' + sk.id : '#skills', ic: 'book',
        l: [started ? ['Continue: ' + sk.name.split(' (')[0], 'Step ' + (stepNow + 1) + ' of ' + sk.steps.length] : ['Start learning', 'Shooting, dribbling, passing']] },
      { id: 'al', t: 'Alerts', s: alertCount ? alertCount + ' matches on' : 'Set up alerts', c: 'var(--c-al)', href: '#alerts', ic: 'bell',
        l: [['Notifications ' + ({ granted: 'on', denied: 'blocked', default: 'off', unsupported: 'not supported' })[notifyState()], 'Goals, kickoff, full time']] },
      { id: 'pr', t: 'My Profile', s: p.name + (p.teams[0] ? ' · ' + T(p.teams[0]).name + ' fan' : ' · add your teams'), c: 'var(--c-pr)', href: '#profile', ic: 'user',
        l: [[p.teams.length + ' favorite teams', p.teams.map((c) => T(c).name).join(' · ') || 'Add some'], p.pos ? ['Plays ' + ({ GK: 'goalkeeper', DEF: 'defence', MID: 'midfield', FWD: 'forward' })[p.pos], 'Theme: ' + settings.theme] : ['Theme: ' + settings.theme, 'Edit your profile']] }
    ];
    const upd = DataSource.lastUpdated();
    return {
      html: `<div class="screen">
        <header class="topbar"><span class="brand">${LOGO(34)}<span>Match<b>day</b> 195</span></span>
          <button type="button" class="iconbtn" id="refreshBtn" aria-label="Refresh for new updates">${icon('refresh')}</button>
          <a class="iconbtn" href="#settings" aria-label="Settings">${icon('gear')}</a>
          <a href="#profile" aria-label="Your profile">${avatarHtml(p)}</a></header>
        ${offlineBanner()}
        <main class="scroll">
          <div><h1 class="page">Hey, ${esc(p.name)}</h1><span class="muted small">${upd ? 'Scores updated ' + timeAgo(upd.toISOString()) : 'Match data not connected yet'}</span></div>
          <a class="search" href="#search" style="color:var(--muted)" aria-label="Search teams and tournaments">${icon('search', 18)}<span>Search teams and tournaments</span></a>
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
    const p = getProfile();
    const featured = fx.find((f) => f.status === 'live' && (p.teams.includes(f.home) || p.teams.includes(f.away))) || fx.find((f) => f.status === 'live');
    const a = getAlerts();
    const known = D.TOURNAMENTS.map((t) => t.name);
    const groups = D.TOURNAMENTS.map((l) => ({ l, m: fx.filter((f) => f.league === l.name && f !== featured) }))
      .concat([{ l: { name: 'Other', country: '' }, m: fx.filter((f) => !known.includes(f.league) && f !== featured) }]).filter((g) => g.m.length);
    let empty = '';
    if (!groups.length && !featured) {
      if (Real.state() !== 'ok') empty = noDataCard();
      else if (st.league !== 'All' && !COVERED.has(st.league)) empty = noDataCard(esc(st.league) + ' isn\u2019t included in the free data plan, so there are no games to show for it.');
      else empty = noDataCard(q ? 'No matches match your search on this day.' : 'No matches on this day.');
    }
    const row = (f) => `<div class="mrow"><a href="#match/${f.id}" style="display:flex;align-items:center;gap:10px;flex:1;color:var(--text)">
        <span class="st ${f.status === 'live' ? 'status-live' : f.status === 'ft' ? 'muted' : ''}">${statusText(f)}</span>
        <span class="teams"><div><span class="dot" style="background:${T(f.home).color}"></span><span>${esc(T(f.home).name)}</span><b>${f.status !== 'upcoming' && f.hs != null ? f.hs : ''}</b></div>
        <div><span class="dot" style="background:${T(f.away).color}"></span><span>${esc(T(f.away).name)}</span><b>${f.status !== 'upcoming' && f.as != null ? f.as : ''}</b></div></span></a>
        ${f.status === 'upcoming' ? `<button type="button" class="bell" data-bell="${f.id}" aria-pressed="${!!a.matches[f.id]}" aria-label="Alerts for ${esc(matchTitle(f))}">${icon('bell', 18)}</button>` : ''}</div>`;
    return {
      html: `<div class="screen">
        <header class="topbar"><span class="brand">${LOGO(30)}<span>Match<b>day</b> 195</span></span><button type="button" class="iconbtn" id="refreshBtn" aria-label="Refresh scores">${icon('refresh')}</button></header>
        ${offlineBanner()}
        <main class="scroll">
          <label class="search">${icon('search', 18)}<input id="q" type="search" placeholder="Search teams or leagues" aria-label="Search teams or leagues" value="${esc(st.q)}"></label>
          <div class="daystrip">${days.map(({ o, d }) => `<button type="button" data-day="${o}" aria-pressed="${st.day === o}"><span>${o === 0 ? 'Today' : DOW[d.getDay()]}</span><span>${d.getDate()}</span></button>`).join('')}</div>
          <div class="chips">${['All'].concat(DataSource.leagues().map((l) => l.name)).map((l) => `<button type="button" class="chip" data-league="${esc(l)}" aria-pressed="${st.league === l}">${esc(l)}</button>`).join('')}</div>
          ${featured ? `<a class="featured" href="#match/${featured.id}">
            <div class="row between small muted"><span>${esc(featured.league)}</span><span class="live-pill">${liveLabel(featured)}</span></div>
            <div class="scoreline"><div class="side">${crest(featured.home, 48)}${esc(T(featured.home).name)}</div><div class="bigscore">${featured.hs} – ${featured.as}</div><div class="side">${crest(featured.away, 48)}${esc(T(featured.away).name)}</div></div>
            <div class="row between small" style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border);color:var(--accent);font-weight:700"><span>Match details</span>${icon('chev', 18)}</div></a>` : ''}
          ${groups.length ? groups.map((g) => `<section style="display:flex;flex-direction:column;gap:8px"><div class="row between"><b class="small">${esc(g.l.name)}</b><span class="tiny muted">${esc(g.l.country)}</span></div><div class="list">${g.m.map(row).join('')}</div></section>`).join('') : empty}
          ${Real.state() === 'ok' ? `<p class="note">Real data from football-data.org · updated ${timeAgo(Real.updated())} · free plan scores can run a few minutes behind</p>` : ''}
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

  /* ----- Match page (real data only) ----- */
  screens.match = function (id) {
    const f = DataSource.fixtures().find((x) => x.id === id);
    if (!f) return { html: `<div class="screen"><header class="topbar">${backBtn('#matches')}<span class="title">Match</span><span class="spacer44"></span></header><main class="scroll">${noDataCard(Real.state() === 'ok' ? 'This match isn’t in the current data any more.' : null)}</main></div>` };
    const a = getAlerts(); const k = f.kickoff || parseYmd(f.date);
    const when = DOW[k.getDay()] + ', ' + MONTHS[k.getMonth()] + ' ' + k.getDate() + ' · ' + fmtTime(f.time);
    const rows = [['Competition', f.league + (f.matchday ? ' · Matchday ' + f.matchday : '')], ['Kickoff', when + ' (your time)']];
    if (f.hht != null && f.status !== 'upcoming') rows.push(['Half-time', f.hht + ' – ' + f.aht]);
    if (f.status === 'off') rows.push(['Status', f.offLabel]);
    const center = f.status === 'upcoming' || f.status === 'off' ? 'vs' : f.hs + ' – ' + f.as;
    const tag = f.status === 'live' ? `<span class="live-pill">${liveLabel(f)}</span>` : `<span class="small muted">${f.status === 'ft' ? 'Full time' : f.status === 'off' ? esc(f.offLabel) : fmtTime(f.time)}</span>`;
    return {
      html: `<div class="screen">
        <header class="topbar">${backBtn('#matches', 'Back to matches')}<span class="title small muted" style="font-family:Inter;font-weight:500">${esc(f.league)}</span>
          ${f.status === 'upcoming' ? `<button type="button" class="iconbtn bell" data-bell="${f.id}" aria-pressed="${!!a.matches[f.id]}" aria-label="Alerts for this match">${icon('bell')}</button>` : '<span class="spacer44"></span>'}</header>
        <div style="padding:10px 20px" class="scoreline"><a class="side" href="#team/${encodeURIComponent(f.home)}" style="color:var(--text)">${crest(f.home, 52)}${esc(T(f.home).name)}</a>
          <div style="display:flex;flex-direction:column;align-items:center;gap:4px"><div class="bigscore">${center}</div>${tag}</div>
          <a class="side" href="#team/${encodeURIComponent(f.away)}" style="color:var(--text)">${crest(f.away, 52)}${esc(T(f.away).name)}</a></div>
        <main class="scroll">
          <div class="list">${rows.map((r) => `<div class="setrow"><div class="grow"><span>${esc(r[1])}</span><span>${esc(r[0])}</span></div></div>`).join('')}</div>
          <p class="note">Real data from football-data.org${Real.updated() ? ' · updated ' + timeAgo(Real.updated()) : ''}. The free plan doesn’t include goal scorers, lineups, ball tracking or heat maps.</p>
        </main></div>`,
      mount() { on('[data-bell]', 'click', (e, el) => toggleMatchAlert(el.dataset.bell)); }
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
        <main class="scroll">
          <div class="chips">${p.teams.map((c) => `<button type="button" class="teamchip" data-team="${c}" aria-pressed="${!st.hidden[c]}">${crest(c, 28)}${esc(T(c).name)}</button>`).join('')}<a class="chip" href="#profile" style="display:flex;align-items:center;border-style:dashed;color:var(--muted)">+ Add team</a></div>
          <div class="seg"><button type="button" data-cmode="month" aria-pressed="${st.mode === 'month'}">Month</button><button type="button" data-cmode="week" aria-pressed="${st.mode === 'week'}">This matchweek</button></div>
          ${st.mode === 'month' ? `<div class="card cal"><div class="row between" style="padding:0 2px 10px"><button type="button" class="iconbtn" data-mon="-1" aria-label="Previous month">${icon('back', 18)}</button><div style="text-align:center"><b>${MONTHS[st.m]} ${st.y}</b><div class="tiny muted">${monthCount} matches</div></div><button type="button" class="iconbtn" data-mon="1" aria-label="Next month">${icon('chev', 18)}</button></div>
            <div class="calgrid">${'SMTWTFS'.split('').map((x) => `<span class="dow">${x}</span>`).join('')}${cells.join('')}</div></div>` : ''}
          <div class="row between"><b>${title}</b><span class="tiny muted">Your local time</span></div>
          ${list.length ? `<div class="list">${list.map((f) => { const d = parseYmd(f.date); return `<div class="fx"><span class="d"><span class="tiny muted">${DOW[d.getDay()]}</span><b>${d.getDate()}</b></span><a href="#match/${f.id}" style="flex:1;color:var(--text)"><div style="font-weight:600">${esc(matchTitle(f))}</div><div class="small muted">${esc(f.league)} · ${resultText(f)}</div></a>${f.status === 'upcoming' ? `<button type="button" class="iconbtn bell" data-bell="${f.id}" aria-pressed="${!!a.matches[f.id]}" aria-label="Alerts for ${esc(matchTitle(f))}">${icon('bell', 18)}</button>` : ''}</div>`; }).join('')}</div>`
            : (Real.state() !== 'ok' ? noDataCard() : !p.teams.length ? noDataCard('Add favorite teams in your profile to see their games here.') : `<div class="card muted" style="padding:18px;text-align:center">No matches for your teams ${st.mode === 'month' ? 'this day' : 'this week'}.</div>`)}
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
    const kinds = [['kick', 'Kickoff', '15 minutes before and when the game starts'], ['goal', 'Goals', 'Every goal, with the new score'], ['ht', 'Half-time score', 'At the break'], ['ft', 'Full-time result', 'Final score']];
    const log = store.get('alertLog_' + (currentUser() || 'guest'), []);
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
          <span class="label">Notify me about</span>
          <div class="list">${kinds.map((k) => setrow('k_' + k[0], a.kinds[k[0]], k[1], k[2])).join('')}</div>
          <span class="label">For these teams</span>
          <div class="list">${p.teams.length ? p.teams.map((c) => `<div class="setrow">${crest(c, 30)}<div class="grow"><span>${esc(T(c).name)}</span></div>${switchBtn('t_' + c, !a.muted[c], 'Alerts for ' + T(c).name)}</div>`).join('') : '<div class="setrow muted">Add favorite teams in your profile.</div>'}</div>
          <span class="label">Recent alerts</span>
          ${log.length ? `<div class="list">${log.slice(0, 15).map((x) => `<a class="setrow" href="${esc(x.url || '#alerts')}" style="color:var(--text)"><div class="grow"><span>${esc(x.title)}</span><span>${esc(x.body)} · ${esc(timeAgo(new Date(x.at).toISOString()))}</span></div></a>`).join('')}</div>` : `<p class="small muted" style="margin:0">No alerts yet. They’ll appear here when your teams play.</p>`}
          <span class="label">Matches with the bell on (${mine.length})</span>
          ${mine.length ? `<div class="list">${mine.map((f) => `<a class="setrow" href="#match/${f.id}"><div class="grow"><span>${esc(matchTitle(f))}</span><span>${esc(f.league)} · ${f.date} · ${fmtTime(f.time)}</span></div>${icon('chev', 18)}</a>`).join('')}</div>` : '<p class="small muted" style="margin:0">Tap the bell next to any match to get its alerts.</p>'}
          <p class="note">Alerts come from the real match data, which updates about every minute (free-plan scores can run a few minutes behind). They work while Matchday 195 is open or in the background; alerts with the app fully closed would need a push server. Lineups and cards aren’t in the free data plan.</p>
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
          else { const ok = await sendNotification('Test alert', 'This is a test alert from Matchday 195. Real alerts will show your teams\u2019 kickoffs.', '#alerts'); toast(ok ? 'Test alert sent' : 'Couldn’t send — check your notification settings'); }
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

  /* ----- Search: teams and tournaments ----- */
  const groupFor = (name) => D.TEAM_GROUPS[name] ? name : null;
  const tournamentById = (id) => D.TOURNAMENTS.find((t) => t.id === id);
  const tournamentForTeam = (t) => D.TOURNAMENTS.find((x) => x.name === t.league || x.name === t.group);
  const backHere = () => `<button type="button" class="iconbtn" id="goBack" aria-label="Back">${icon('back')}</button>`;
  function bindBack() { on('#goBack', 'click', () => { if (history.length > 1) history.back(); else location.hash = '#home'; }); }
  const tIcon = (t) => `<span class="crest" style="width:36px;height:36px;border-radius:10px;background:var(--surface2);color:var(--accent);text-shadow:none">${icon(t.national ? 'user' : 'cal', 18)}</span>`;

  screens.search = function () {
    const st = screens.search.st || (screens.search.st = { q: '' });
    return {
      html: `<div class="screen">
        <header class="topbar">${backHere()}<label class="search" style="flex:1">${icon('search', 18)}<input id="gq" type="search" placeholder="Search teams and tournaments" aria-label="Search teams and tournaments" value="${esc(st.q)}" autocomplete="off"></label></header>
        <main class="scroll" id="searchResults">${searchResults(st.q)}</main>${nav('')}</div>`,
      mount() {
        bindBack();
        const inp = qs('#gq'); if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
        const bind = () => qsa('#searchResults [data-world]').forEach((el) => el.addEventListener('click', () => rememberTeam(el.dataset.world, el.dataset.n, el.dataset.c)));
        bind();
        on('#gq', 'input', (e) => { st.q = e.target.value; qs('#searchResults').innerHTML = searchResults(st.q); bind(); });
        World.load().then(() => { if (st.q && qs('#searchResults')) { qs('#searchResults').innerHTML = searchResults(st.q); bind(); } });
      }
    };
  };
  function searchResults(raw) {
    const q = fold(raw.trim()); const p = getProfile();
    const teamRow = (key, name, sub, extra, info) => `<a class="setrow" href="#team/${encodeURIComponent(key)}" ${extra || ''} style="color:var(--text)">${crest(key, 36, info)}<div class="grow"><span>${esc(name)}</span><span>${esc(sub)}</span></div>${icon('chev', 18)}</a>`;
    const tRow = (t) => `<a class="setrow" href="#league/${t.id}" style="color:var(--text)">${tIcon(t)}<div class="grow"><span>${esc(t.name)}</span><span>${esc(t.type)} · ${esc(t.country)}</span></div>${icon('chev', 18)}</a>`;
    const section = (title, rows) => rows.length ? `<section style="display:flex;flex-direction:column;gap:8px"><span class="label">${title}</span><div class="list">${rows.join('')}</div></section>` : '';
    if (!q) {
      return section('Your teams', p.teams.map((k) => teamRow(k, T(k).name, T(k).league))) + section('Tournaments', D.TOURNAMENTS.map(tRow));
    }
    const tours = D.TOURNAMENTS.filter((t) => fold(t.name + ' ' + (t.aliases || '') + ' ' + t.country).includes(q)).map(tRow);
    const teams = [];
    Object.keys(D.TEAM_GROUPS).forEach((g) => D.TEAM_GROUPS[g].forEach((t) => { if (fold(t[1] + ' ' + (t[3] || '') + ' ' + t[0].replace(/^N-/, '')).includes(q)) teams.push(teamRow(t[0], t[1], T(t[0]).league)); }));
    const ex = extraTeams(); Object.keys(ex).forEach((k) => { if (k.startsWith('C-') && fold(ex[k].name).includes(q)) teams.push(teamRow(k, ex[k].name, ex[k].league)); });
    Real.fixtures(); Object.keys(liveTeams).forEach((k) => { if (fold(liveTeams[k].name + ' ' + liveTeams[k].league).includes(q)) teams.push(teamRow(k, liveTeams[k].name, liveTeams[k].league)); });
    const world = []; const w = World.list();
    const shown = new Set(); Object.keys(liveTeams).forEach((k) => shown.add(stripName(liveTeams[k].name))); Object.keys(D.TEAMS).forEach((k) => shown.add(stripName(D.TEAMS[k].name)));
    if (w && q.length >= 2) for (let i = 0; i < w.length && world.length < 40; i++) if (fold(w[i][0] + ' ' + w[i][1]).includes(q) && !shown.has(stripName(w[i][0]))) { const key = 'W-' + slug(w[i][0] + '-' + w[i][1]); world.push(teamRow(key, w[i][0], w[i][1], `data-world="${esc(key)}" data-n="${esc(w[i][0])}" data-c="${esc(w[i][1])}"`, teamInfoFor(w[i][0], w[i][1]))); }
    const html = section('Tournaments', tours) + section('Teams', teams.slice(0, 60)) + section('More clubs worldwide', world) + (q.length >= 2 && !w ? '<p class="note">Loading more clubs…</p>' : '');
    return html || `<div class="card muted" style="padding:18px;text-align:center">Nothing found for “${esc(raw.trim())}”. You can add any team as a favorite in your profile.</div>`;
  }

  /* ----- Team page ----- */
  function fixtureRows(list) {
    const a = getAlerts();
    return list.map((f) => { const d = parseYmd(f.date); return `<div class="fx"><span class="d"><span class="tiny muted">${DOW[d.getDay()]}</span><b>${d.getDate()}</b></span><a href="#match/${f.id}" style="flex:1;color:var(--text)"><div style="font-weight:600">${esc(matchTitle(f))}</div><div class="small muted">${esc(f.league)} · ${resultText(f)}</div></a>${f.status === 'upcoming' ? `<button type="button" class="iconbtn bell" data-bell="${f.id}" aria-pressed="${!!a.matches[f.id]}" aria-label="Alerts for ${esc(matchTitle(f))}">${icon('bell', 18)}</button>` : ''}</div>`; }).join('');
  }
  function newsRows(items) {
    return items.map((x) => `<a class="setrow" href="${esc(x.link)}" target="_blank" rel="noopener" style="color:var(--text);align-items:flex-start"><div class="grow"><span style="line-height:1.35">${esc(x.title)}</span><span>${esc(x.source)} · ${esc(timeAgo(x.published))}</span></div><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true" style="flex:none;margin-top:3px;color:var(--accent)"><path d="M7 17L17 7M9 7h8v8"/></svg></a>`).join('');
  }
  screens.team = function (arg) {
    const key = decodeURIComponent(arg || '');
    const t = T(key); const p = getProfile(); const following = p.teams.includes(key);
    const tour = tournamentForTeam(t);
    const fx = DataSource.fixtures().filter((f) => f.home === key || f.away === key).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    const news = News.items().filter((x) => (x.teams || []).includes(key)).slice(0, 8);
    const sub = t.national ? 'National team' : key.startsWith('C-') ? 'My team' : (t.league || '');
    const noGamesMsg = COVERED.has(t.league) || t.national ? 'No games for ' + esc(t.name) + ' in the last two weeks or the next two weeks.' : 'Games for ' + esc(t.name) + ' aren\u2019t included in the free data plan.';
    return {
      html: `<div class="screen">
        <header class="topbar">${backHere()}<span class="title">${esc(t.name)}</span><span class="spacer44"></span></header>
        <main class="scroll" style="gap:18px">
          <div class="card" style="padding:18px;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center">
            ${crest(key, 72)}<h1 class="page" style="font-size:1.5em">${esc(t.name)}</h1>
            ${tour ? `<a href="#league/${tour.id}" class="small" style="font-weight:600">${esc(sub)} ›</a>` : `<span class="small muted">${esc(sub)}</span>`}
            <button type="button" class="btn ${following ? 'ghost' : ''}" id="follow" style="height:46px;max-width:240px">${following ? '★ Following' : '☆ Follow'}</button>
          </div>
          <section style="display:flex;flex-direction:column;gap:8px"><span class="label">Matches</span>
            ${fx.length ? `<div class="list">${fixtureRows(fx)}</div>` : noDataCard(Real.state() === 'ok' ? noGamesMsg : null)}</section>
          <section style="display:flex;flex-direction:column;gap:8px"><span class="label">Transfer headlines</span>
            ${news.length ? `<div class="list">${newsRows(news)}</div>` : `<div class="card small muted" style="padding:14px">No recent transfer headlines about ${esc(t.name)}.</div>`}</section>
        </main>${nav('')}</div>`,
      mount() {
        bindBack();
        on('#follow', 'click', () => { if (key.startsWith('FD-') && !extraTeams()[key]) rememberTeam(key, t.name, t.league); const pr = getProfile(); if (pr.teams.includes(key)) pr.teams = pr.teams.filter((c) => c !== key); else pr.teams.push(key); saveProfile(pr); delete screens.profile.st; toast(pr.teams.includes(key) ? 'Following ' + t.name : 'Unfollowed ' + t.name); render(); });
        on('[data-bell]', 'click', (e, el) => toggleMatchAlert(el.dataset.bell));
      }
    };
  };

  /* ----- Tournament page ----- */
  screens.league = function (id) {
    const t = tournamentById(id);
    if (!t) return { html: `<div class="screen"><header class="topbar">${backHere()}<span class="title">Tournament</span><span class="spacer44"></span></header><main class="scroll"><p class="muted">Tournament not found.</p></main></div>`, mount: bindBack };
    const g = groupFor(t.name); const teams = g ? D.TEAM_GROUPS[g] : (t.national ? D.TEAM_GROUPS['National teams'] : []);
    const fx = DataSource.fixtures().filter((f) => f.league === t.name).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    const noGamesMsg = COVERED.has(t.name) ? 'No ' + esc(t.name) + ' games in the last two weeks or the next two weeks.' : esc(t.name) + ' isn\u2019t included in the free data plan, so there are no games to show.';
    const table = TOUR_CODE[t.id] && Real.tables()[TOUR_CODE[t.id]];
    const tableHtml = table ? `<section style="display:flex;flex-direction:column;gap:8px"><span class="label">Table</span><div class="card" style="overflow-x:auto"><table class="standings"><thead><tr><th>#</th><th style="text-align:left">Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr></thead><tbody>${table.rows.map((r) => { const k = keyFor(r.team, TOUR_CODE[t.id], t.name); return `<tr><td>${r.pos}</td><td style="text-align:left"><a href="#team/${encodeURIComponent(k)}" class="row" style="gap:8px;color:var(--text)">${crest(k, 22)}<span>${esc(T(k).name)}</span></a></td><td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gd > 0 ? '+' + r.gd : r.gd}</td><td><b>${r.pts}</b></td></tr>`; }).join('')}</tbody></table></div></section>` : '';
    return {
      html: `<div class="screen">
        <header class="topbar">${backHere()}<span class="title">${esc(t.name)}</span><span class="spacer44"></span></header>
        <main class="scroll" style="gap:18px">
          <div class="card" style="padding:18px;display:flex;align-items:center;gap:14px">${tIcon(t)}<div><h1 class="page" style="font-size:1.4em">${esc(t.name)}</h1><span class="small muted">${esc(t.type)} · ${esc(t.country)}</span></div></div>
          ${tableHtml}
          <section style="display:flex;flex-direction:column;gap:8px"><span class="label">Matches</span>
            ${fx.length ? `<div class="list">${fixtureRows(fx)}</div>` : noDataCard(Real.state() === 'ok' ? noGamesMsg : null)}</section>
          <section style="display:flex;flex-direction:column;gap:8px"><span class="label">${g ? 'Teams this season (' + teams.length + ')' : t.national ? 'National teams' : 'Teams'}</span>
            ${teams.length ? `<div class="list">${teams.map((x) => `<a class="setrow" href="#team/${encodeURIComponent(x[0])}" style="color:var(--text)">${crest(x[0], 32)}<div class="grow"><span>${esc(x[1])}</span></div>${icon('chev', 18)}</a>`).join('')}</div>` : `<div class="card small muted" style="padding:14px">The team list for this tournament comes with the live data feed.</div>`}</section>
        </main>${nav('')}</div>`,
      mount() { bindBack(); on('[data-bell]', 'click', (e, el) => toggleMatchAlert(el.dataset.bell)); }
    };
  };

  /* ----- Skills list ----- */
  const CAT = { Shooting: ['var(--c-live)', 'shot'], Dribbling: ['var(--c-tr)', 'dribble'], Passing: ['var(--c-cal)', 'pass'], 'First touch': ['var(--c-sk)', 'touch'], Tricks: ['var(--c-al)', 'trick'] };
  const LVL = { Beginner: 'var(--win)', Intermediate: 'var(--c-tr)', Advanced: 'var(--danger)' };
  screens.skills = function () {
    const st = screens.skills.st || (screens.skills.st = { cat: 'All' });
    const prog = getProg(); const all = DataSource.skills();
    const started = !!prog.last; const last = all.find((s) => s.id === prog.last) || all[0]; const ls = prog.steps[last.id] || 0;
    const ORDER = { Beginner: 0, Intermediate: 1, Advanced: 2 };
    const list = all.filter((s) => st.cat === 'All' || s.cat === st.cat).sort((x, y) => ORDER[x.level] - ORDER[y.level]);
    return {
      html: `<div class="screen">
        <header class="topbar"><span class="brand" style="font-size:1.6em">Skills</span><span class="small muted row" style="gap:6px">${icon('down', 14)}Saved offline</span></header>
        <main class="scroll">
          <a class="featured" href="#skill/${last.id}" style="display:flex;flex-direction:column;gap:10px">
            <span class="label" style="color:var(--accent)">${started ? 'Continue learning' : 'Start here'}</span><b class="display" style="font-size:1.3em">${esc(last.name)}</b>
            <span class="small muted">${started ? 'Step ' + (ls + 1) + ' of ' + last.steps.length : last.steps.length + ' steps'} · ${esc(last.steps[ls][0])}</span>
            <div class="progress"><div style="width:${started ? ((ls + 1) / last.steps.length * 100).toFixed(0) : 0}%"></div></div></a>
          <div class="chips">${['All', 'Shooting', 'Dribbling', 'Passing', 'First touch', 'Tricks'].map((c) => `<button type="button" class="chip" data-cat="${c}" aria-pressed="${st.cat === c}">${c}</button>`).join('')}</div>
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
  // Animated demo of the full laces shot: run-up leg swings back, strikes, follows through; ball flies into the net.
  function lacesAnim() {
    return `<svg class="anim" width="100%" height="190" viewBox="0 0 300 190" role="img" aria-label="Animation: the kicking leg swings back, strikes the middle of the ball with the laces, and follows through as the ball flies into the goal">
      <line x1="10" y1="160" x2="290" y2="160" stroke="#E8F5EC" stroke-opacity=".5" stroke-width="2"/>
      <path d="M252 160 V92 H292" fill="none" stroke="#E8F5EC" stroke-width="3"/><path d="M256 96 L288 96 M256 110 L288 110 M256 124 L288 124 M256 138 L288 138 M256 152 L288 152" stroke="#E8F5EC" stroke-opacity=".25"/>
      <g class="k-body"><circle cx="106" cy="46" r="9" fill="#E8F5EC"/><line x1="104" y1="57" x2="100" y2="105" stroke="#E8F5EC" stroke-width="7" stroke-linecap="round"/>
        <line x1="103" y1="68" x2="80" y2="88" stroke="#E8F5EC" stroke-width="5" stroke-linecap="round"/><line x1="103" y1="68" x2="126" y2="80" stroke="#E8F5EC" stroke-width="5" stroke-linecap="round"/>
        <path d="M100 105 L98 132 L96 160 L84 160" fill="none" stroke="#E8F5EC" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g>
      <g class="k-leg"><path d="M100 105 L101 132 L100 158 L113 162" fill="none" stroke="#B6F23A" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g>
      <g class="k-ball"><circle cx="124" cy="152" r="8" fill="#fff"/><path d="M120 149 l4 -2 l4 2 l-1 4 h-6z" fill="#173F26"/></g>
      <text class="k-cap" x="150" y="182" text-anchor="middle" fill="#B6F23A" font-size="11" font-weight="700">Swing back · Strike the middle · Follow through</text>
    </svg>`;
  }
  // Shared stick-figure pieces (side view, facing right). Ground is y=160.
  const G = '#E8F5EC', L = '#B6F23A';
  const ground = `<line x1="10" y1="160" x2="290" y2="160" stroke="${G}" stroke-opacity=".5" stroke-width="2"/>`;
  const ballSvg = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="7" fill="#fff"/><path d="M${cx - 3} ${cy - 3} l3 -2 l3 2 l-1 3 h-4z" fill="#173F26"/>`;
  const caption = (t) => `<text x="150" y="182" text-anchor="middle" fill="${L}" font-size="11" font-weight="700">${t}</text>`;
  // Rainbow flick: ball rolls up the back of the front heel, the heel flicks up, the ball arcs over the head and lands in front.
  function rainbowAnim() {
    return `<svg class="anim" width="100%" height="190" viewBox="0 0 300 190" role="img" aria-label="Animation: the ball is rolled up the back of the front leg, the heel flicks up, and the ball arcs over the player's head to land in front">
      ${ground}
      <g class="r-body"><circle cx="94" cy="46" r="9" fill="${G}"/><line x1="93" y1="57" x2="90" y2="105" stroke="${G}" stroke-width="7" stroke-linecap="round"/>
        <line x1="92" y1="68" x2="72" y2="88" stroke="${G}" stroke-width="5" stroke-linecap="round"/><line x1="92" y1="68" x2="112" y2="86" stroke="${G}" stroke-width="5" stroke-linecap="round"/>
        <path d="M90 105 L80 132 L70 160 L82 160" fill="none" stroke="${G}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="90" y1="105" x2="96" y2="132" stroke="${L}" stroke-width="7" stroke-linecap="round"/>
        <g class="r-shin"><path d="M96 132 L95 158 L107 161" fill="none" stroke="${L}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g></g>
      <g class="r-ball">${ballSvg(87, 153)}</g>
      ${caption('Roll it up the heel · Flick the heel up · Lean forward')}
    </svg>`;
  }
  // Sombrero flick: defender closes in, the ball is scooped over their head, the player runs past and meets the ball.
  function sombreroAnim() {
    return `<svg class="anim" width="100%" height="190" viewBox="0 0 300 190" role="img" aria-label="Animation: a defender runs in, the player scoops the ball over the defender's head, runs past and collects it on the other side">
      ${ground}
      <g class="s-def" opacity=".75"><circle cx="150" cy="46" r="9" fill="#FF8FB1"/><line x1="150" y1="57" x2="152" y2="105" stroke="#FF8FB1" stroke-width="7" stroke-linecap="round"/>
        <line x1="151" y1="68" x2="132" y2="84" stroke="#FF8FB1" stroke-width="5" stroke-linecap="round"/><line x1="151" y1="68" x2="168" y2="86" stroke="#FF8FB1" stroke-width="5" stroke-linecap="round"/>
        <path d="M152 105 L144 160 L134 160 M152 105 L162 160 L152 160" fill="none" stroke="#FF8FB1" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g>
      <g class="s-player"><circle cx="66" cy="46" r="9" fill="${G}"/><line x1="66" y1="57" x2="64" y2="105" stroke="${G}" stroke-width="7" stroke-linecap="round"/>
        <line x1="65" y1="68" x2="46" y2="86" stroke="${G}" stroke-width="5" stroke-linecap="round"/><line x1="65" y1="68" x2="84" y2="84" stroke="${G}" stroke-width="5" stroke-linecap="round"/>
        <path d="M64 105 L60 132 L58 160 L70 160" fill="none" stroke="${G}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
        <g class="s-leg"><path d="M64 105 L70 132 L72 156 L84 158" fill="none" stroke="${L}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g></g>
      <g class="s-ball">${ballSvg(88, 132)}</g>
      ${caption('Wait till they’re close · Scoop it over · Run past and collect')}
    </svg>`;
  }
  const SKILL_ANIM = { laces: lacesAnim, rainbow: rainbowAnim, sombrero: sombreroAnim };
  // Target reps for a drill: "10 reps", "Shoot 20 times", "15 free kicks"… falls back to 10.
  function drillTarget(text) {
    const m = String(text).match(/(\d+)\s+(?:reps?|shots?|times|volleys|free kicks?|run-ups|tosses|touches|passes|kicks|juggles|turns|crosses|headers|attempts)\b/i);
    return m ? Math.min(Number(m[1]), 200) : 10;
  }
  screens.skill = function (id) {
    const all = DataSource.skills(); const sk = all.find((s) => s.id === id);
    if (!sk) return { html: `<div class="screen"><header class="topbar">${backBtn('#skills')}<span class="title">Skill</span><span class="spacer44"></span></header><main class="scroll"><p class="muted">Skill not found.</p></main></div>` };
    const prog = getProg(); let i = Math.min(prog.steps[id] || 0, sk.steps.length - 1);
    if (prog.last !== id) { prog.last = id; saveProg(prog); }
    const step = sk.steps[i]; const last = i === sk.steps.length - 1;
    const skillUi = screens.skill.ui || (screens.skill.ui = {}); if (skillUi.id !== id) { screens.skill.ui = { id }; return screens.skill(id); }
    const anim = !!SKILL_ANIM[id]; const rk = id + '_' + i; const reps = (prog.reps || {})[rk] || 0; const target = drillTarget(step[3]);
    return {
      html: `<div class="screen">
        <header class="topbar">${backBtn('#skills', 'Back to skills')}<div style="flex:1"><div class="tiny muted">${esc(sk.cat)} · ${esc(sk.level)}</div><b class="display" style="font-size:1.15em">${esc(sk.name)}</b></div></header>
        <div style="padding:6px 20px 0"><div class="stepbars" style="grid-template-columns:repeat(${sk.steps.length},1fr)">${sk.steps.map((s, k) => `<button type="button" data-step="${k}" class="${k <= i ? 'done' : ''}" aria-label="Go to step ${k + 1}" ${k === i ? 'aria-current="step"' : ''}><span></span></button>`).join('')}</div></div>
        <main class="scroll">
          <div class="figure"><span class="tag">Step ${i + 1} of ${sk.steps.length}</span>${anim && skillUi.watch ? SKILL_ANIM[id]() : sk.figs ? lacesFig(i) : `<span class="bignum" aria-hidden="true">${i + 1}</span>`}${anim ? `<button type="button" class="watchbtn" id="watch" aria-pressed="${!!skillUi.watch}">${skillUi.watch ? 'Show this step' : '▶ Watch the full move'}</button>` : ''}</div>
          <div class="${skillUi.dir ? 'slide-' + skillUi.dir : ''}"><h2 style="margin:0 0 8px;font-size:1.4em">${esc(step[0])}</h2><p style="margin:0;line-height:1.55">${esc(step[1])}</p></div>
          <div class="card tip"><span class="ic" style="color:var(--accent)">${icon('bulb', 18)}</span><div><b style="color:var(--accent)">COACH TIP</b><p>${esc(step[2])}</p></div></div>
          <div class="card tip"><span class="ic" style="color:var(--c-cal)">${icon('target', 18)}</span><div><b style="color:var(--c-cal)">PRACTICE DRILL</b><p>${esc(step[3])}</p>
            <div class="reps"><button type="button" class="iconbtn" id="repMinus" aria-label="Remove one rep">−</button><div class="grow"><div class="row between small"><b>${reps} / ${target} reps</b>${reps ? '<button type="button" class="linkbtn tiny" id="repReset">Reset</button>' : ''}</div><div class="repbar"><span style="width:${Math.min(100, reps / target * 100)}%"></span></div></div><button type="button" class="btn" id="repPlus" style="height:40px;width:64px" aria-label="Add one rep">+1</button></div></div></div>
          ${last ? `<div class="card" style="padding:14px"><b>Quick recap</b><ol class="recap">${sk.steps.map((s) => `<li>${esc(s[0])}</li>`).join('')}</ol></div>` : ''}
        </main>
        <div class="stepnav"><button type="button" class="btn ghost" id="prev" style="flex:1" ${i === 0 ? 'disabled' : ''}>Back</button><button type="button" class="btn" id="next" style="flex:2">${last ? (prog.done[id] ? 'Start again' : 'Mark as learned') : 'Next step'}</button></div></div>`,
      mount() {
        const go = (k) => { if (k < 0 || k >= sk.steps.length || k === i) return; skillUi.dir = k > i ? 'next' : 'prev'; skillUi.watch = false; const p = getProg(); p.steps[id] = k; saveProg(p); render(); window.scrollTo(0, 0); skillUi.dir = ''; };
        const setReps = (n) => { const p = getProg(); p.reps = p.reps || {}; p.reps[rk] = Math.max(0, n); saveProg(p); render(); if (n === target) toast('Drill done! ' + target + ' reps'); };
        on('#repPlus', 'click', () => setReps(reps + 1));
        on('#repMinus', 'click', () => setReps(reps - 1));
        on('#repReset', 'click', () => setReps(0));
        on('#watch', 'click', () => { skillUi.watch = !skillUi.watch; render(); });
        const sc = qs('main.scroll'); let sx = null, sy = null;
        if (sc) {
          sc.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
          sc.addEventListener('touchend', (e) => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? i + 1 : i - 1); }, { passive: true });
        }
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
    if (!st.p || render.last !== 'profile') st.p = getProfile();
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
              <div class="chips">${['All', 'World clubs'].concat(Object.keys(D.TEAM_GROUPS)).map((g) => `<button type="button" class="chip" data-group="${esc(g)}" aria-pressed="${(st.group || 'All') === g}">${esc(g)}</button>`).join('')}</div>
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
        const saveTeams = () => { const saved = getProfile(); saved.teams = p.teams.slice(); saveProfile(saved); };
        on('[data-rm]', 'click', (e, el) => { grab(); p.teams = p.teams.filter((c) => c !== el.dataset.rm); saveTeams(); toast(T(el.dataset.rm).name + ' removed'); render(); });
        const addKey = (k) => { grab(); if (!p.teams.includes(k)) p.teams.push(k); saveTeams(); toast(T(k).name + ' added'); render(); };
        const bindAdd = () => {
          qsa('#teamResults [data-add]').forEach((el) => el.addEventListener('click', () => addKey(el.dataset.add)));
          qsa('#teamResults [data-addw]').forEach((el) => el.addEventListener('click', () => { rememberTeam(el.dataset.addw, el.dataset.n, el.dataset.c); addKey(el.dataset.addw); }));
          qsa('#teamResults [data-addc]').forEach((el) => el.addEventListener('click', () => { const name = el.dataset.addc.trim(); const key = 'C-' + slug(name); rememberTeam(key, name, 'My team'); addKey(key); }));
        };
        bindAdd();
        World.load().then(() => { const box = qs('#teamResults'); if (box && (st.q || st.group === 'World clubs')) { box.innerHTML = teamResults(p, st); bindAdd(); } });
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
    const fold = (t) => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const raw = (st.q || '').trim(); const q = fold(raw);
    const g = st.group || 'All';
    const row = (key, name, sub, addAttr, info) => { const have = p.teams.includes(key);
      return `<div class="setrow">${crest(key, 30, info)}<div class="grow"><span>${esc(name)}</span><span>${esc(sub)}</span></div>${have ? '<span class="small muted" style="padding:0 6px">Added ✓</span>' : `<button type="button" class="chip" ${addAttr} aria-label="Add ${esc(name)}">+ Add</button>`}</div>`; };
    const out = []; let exact = false;
    if (g !== 'World clubs') {
      const groups = g === 'All' ? Object.keys(D.TEAM_GROUPS) : [g];
      groups.forEach((grp) => D.TEAM_GROUPS[grp].forEach((t) => {
        const hay = fold(t[1] + ' ' + (t[3] || '') + ' ' + t[0].replace(/^N-/, '') + ' ' + grp);
        if (!q || hay.includes(q)) { out.push(row(t[0], t[1], T(t[0]).league, `data-add="${esc(t[0])}"`)); if (fold(t[1]) === q) exact = true; }
      }));
    }
    if (g === 'All' && q) { Real.fixtures(); Object.keys(liveTeams).forEach((k) => { if (fold(liveTeams[k].name + ' ' + liveTeams[k].league).includes(q)) { out.push(row(k, liveTeams[k].name, liveTeams[k].league, `data-addw="${esc(k)}" data-n="${esc(liveTeams[k].name)}" data-c="${esc(liveTeams[k].league)}"`)); if (fold(liveTeams[k].name) === q) exact = true; } }); }
    if (g === 'All' || g === 'World clubs') {
      const w = World.list();
      if (q.length >= 2 && w) {
        let n = 0;
        for (let i = 0; i < w.length && n < 60; i++) {
          if (fold(w[i][0] + ' ' + w[i][1]).includes(q)) { n++; const key = 'W-' + slug(w[i][0] + '-' + w[i][1]); out.push(row(key, w[i][0], w[i][1], `data-addw="${esc(key)}" data-n="${esc(w[i][0])}" data-c="${esc(w[i][1])}"`, teamInfoFor(w[i][0], w[i][1]))); if (fold(w[i][0]) === q) exact = true; }
        }
        if (n === 60) out.push('<div class="setrow small muted">Showing the first 60 — type more to narrow it down.</div>');
      } else if (g === 'World clubs' && !q) out.push(`<div class="setrow small muted">Type a club name to search ${w ? w.length.toLocaleString() : '3,000+'} clubs from 100 countries.</div>`);
      else if (q.length >= 2 && !w) out.push('<div class="setrow small muted">Loading world clubs…</div>');
    }
    if (raw.length >= 2 && !exact) {
      out.push(`<div class="setrow"><div class="grow"><span>Can’t find your team?</span><span>Add any team — local, school or youth</span></div><button type="button" class="chip" data-addc="${esc(raw.slice(0, 40))}" aria-label="Add ${esc(raw)} as my team" style="max-width:150px;overflow:hidden;text-overflow:ellipsis">+ Add “${esc(raw.slice(0, 18))}${raw.length > 18 ? '…' : ''}”</button></div>`);
    }
    return out.length ? out.join('') : '<div class="setrow muted">No teams match that search.</div>';
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
            <div class="row between"><span class="small">Live badge</span><span class="small">Win · Win · Loss · Draw</span></div>
            <div class="row between"><span class="live-pill">LIVE</span><span class="form-dots">${[['W', 'win'], ['W', 'win'], ['L', 'loss'], ['D', 'draw']].map(([l, v]) => `<span style="background:${onWL('--' + v)};color:${v === 'draw' ? 'var(--text)' : 'var(--bg)'}">${l}</span>`).join('')}</span></div>
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
            <div class="list"><div class="setrow"><div class="grow"><span>Refresh now</span><span>${DataSource.lastUpdated() ? 'Scores updated ' + timeAgo(DataSource.lastUpdated().toISOString()) : 'Match data not connected yet'}</span></div><button type="button" class="btn" id="refreshBtn" style="width:auto;height:40px;padding:0 14px;font-size:.9em">${icon('refresh', 16)}Refresh</button></div>
              <div class="setrow"><div class="grow"><span>Automatic updates</span><span>Checks for new scores every minute while the app is open</span></div></div>
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
  Real.load().then(() => { checkAlerts(); if (sess.get() && !document.activeElement.matches('input,select,textarea')) render(); });
  if (sess.get()) { render(); showLoading(() => {}); }
  else render();
})();
