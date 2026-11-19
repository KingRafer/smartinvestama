/* SMARTAI MT5 API — live + demo fallback (fast cache) */
(function (w) {
  'use strict';

  var LIVE_BASE = 'https://script.google.com/macros/s/AKfycbw8AEMeie38BBxW3S-22bf0WrI_7vGHPkpANGEsoQiTv7Jg86X8rrTEQ3AtDyzQol5D_Q/exec';

  var ACCOUNT_META = {
    ACC01: { package: 'Smart Basic', login: '100000052', owner: 'willy', server: 'TrijayaPratamaFutures-Live', broker_label: 'PT. Trijaya Pratama Futures', mode: 'Hedge · Access Server' },
    ACC02: { package: 'Smart Gold', login: null, owner: null, server: null, broker_label: 'PT. Trijaya Pratama Futures', mode: null },
    ACC03: { package: 'Smart Pro', login: null, owner: null, server: null, broker_label: 'Exness Technologies Ltd', mode: null }
  };

  var demoAccounts = [
    { account_id:'ACC01', status:'DEMO', balance:89795.21, equity:90786.35, deposit_awal:10000.00, daily_profit:991.14, total_profit:80795.21, daily_dd:1.2, total_penarikan:73862.00, updated_at:'DEMO DATA', name:'Smart Basic', broker:'Trijaya pratama futures' },
    { account_id:'ACC02', status:'DEMO', balance:106455.80, equity:106793.83, deposit_awal:10000.00, daily_profit:338.03, total_profit:96455.80, daily_dd:0.8, total_penarikan:28000.00, updated_at:'DEMO DATA', name:'Smart Gold' },
    { account_id:'ACC03', status:'DEMO', balance:645950.70, equity:656274.00, deposit_awal:60000.00, daily_profit:10323.30, total_profit:585950.70, daily_dd:2.1, total_penarikan:5540000.00, updated_at:'DEMO DATA', name:'Smart Pro' }
  ];

  var cache = { accounts: null, history: null, isLive: false, fetchedAt: null, historyFetchedAt: null, error: null, inflightAccounts: null, inflightHistory: null };
  var FRESH_MS = 25000;
  var HISTORY_FRESH_MS = 90000;

  function formatUSD(value) {
    if (value === null || value === undefined || value === '' || !Number.isFinite(Number(value))) return '\u2014';
    return new Intl.NumberFormat('en-US', { style:'currency', currency:'USD', maximumFractionDigits:2 }).format(Number(value));
  }
  function formatNumber(value, digits) {
    if (value === null || value === undefined || value === '' || !Number.isFinite(Number(value))) return '\u2014';
    return Number(value).toLocaleString('en-US', { minimumFractionDigits:digits || 2, maximumFractionDigits:digits || 2 });
  }
  function escape(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function num(v) {
    var n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  function normalizeAccount(a) {
    if (!a) return null;
    var id = a.account_id || a.id || a.login || '';
    var meta = ACCOUNT_META[id] || {};
    return {
      account_id: id,
      status: a.status || 'DEMO',
      balance: num(a.balance),
      equity: num(a.equity),
      deposit_awal: num(a.deposit_awal),
      daily_profit: (function(v){ v = num(v); if (!Number.isFinite(v) || Math.abs(v) > 500000) return 0; return v; })(a.daily_profit),
      total_profit: num(a.total_profit),
      daily_dd: num(a.daily_dd),
      total_penarikan: num(a.total_penarikan),
      updated_at: a.updated_at || '',
      name: a.name || meta.package || id,
      broker: a.broker || meta.broker_label || '',
      broker_label: meta.broker_label || a.broker || '',
      package: meta.package || a.name || '',
      login: meta.login || a.login || null,
      owner: meta.owner || a.owner || null,
      server: meta.server || a.server || null,
      mode: meta.mode || null
    };
  }

  function cloneAccounts(list) {
    return (list || []).map(function (a) { return Object.assign({}, a); });
  }

  function apiUrl(action, extra) {
    var params = new URLSearchParams();
    params.set('action', action || 'accounts');
    if (extra) Object.keys(extra).forEach(function (k) { if (extra[k] != null) params.set(k, extra[k]); });
    return LIVE_BASE + '?' + params.toString();
  }

  function fetchLiveAccounts() {
    return fetch(apiUrl('accounts'), { method: 'GET', mode: 'cors', cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        if (!data || !data.ok || !Array.isArray(data.accounts)) throw new Error('Invalid live response');
        var list = data.accounts.map(normalizeAccount).filter(Boolean);
        if (!list.length) throw new Error('No accounts');
        cache.accounts = list; cache.isLive = true; cache.fetchedAt = Date.now(); cache.error = null;
        return cloneAccounts(list);
      });
  }

  function getAccounts(force) {
    var age = cache.fetchedAt ? (Date.now() - cache.fetchedAt) : Infinity;
    if (!force && cache.accounts && age < FRESH_MS) return Promise.resolve(cloneAccounts(cache.accounts));
    if (!force && cache.accounts && age < FRESH_MS * 4) {
      fetchLiveAccounts().catch(function () {});
      return Promise.resolve(cloneAccounts(cache.accounts));
    }
    if (cache.inflightAccounts) return cache.inflightAccounts;
    cache.inflightAccounts = fetchLiveAccounts()
      .catch(function (err) {
        cache.error = String(err && err.message || err);
        if (cache.accounts) return cloneAccounts(cache.accounts);
        return demoAccounts.map(function(a){ return normalizeAccount(a); });
      })
      .finally(function () { cache.inflightAccounts = null; });
    return cache.inflightAccounts;
  }

  function getDemoAccounts() {
    return demoAccounts.map(function (a) { return normalizeAccount(a); });
  }

  w.SmartAIMt5 = {
    formatUSD: formatUSD,
    formatNumber: formatNumber,
    escape: escape,
    getAccounts: getAccounts,
    getDemoAccounts: getDemoAccounts,
    ACCOUNT_META: ACCOUNT_META
  };
})(window);
