/* SMARTAI MT5 API — restored loader (pinned good commit + daily clamp) */
(function (w) {
  'use strict';
  var PINNED = 'https://cdn.jsdelivr.net/gh/KingRafer/smartinvestama@c86781b258148474241be15287a400bf7a9ecabb/js/mt5-api.js';
  function clampAccounts(list) {
    return (list || []).map(function (a) {
      var d = Number(a && a.daily_profit);
      if (!Number.isFinite(d) || Math.abs(d) > 500000) {
        a = Object.assign({}, a);
        a.daily_profit = 0;
      }
      return a;
    });
  }
  function wrap() {
    if (!w.SmartAIMT5 || w.SmartAIMT5.__clamped) return;
    var orig = w.SmartAIMT5.getAccounts;
    if (typeof orig === 'function') {
      w.SmartAIMT5.getAccounts = function (force) {
        return Promise.resolve(orig.call(w.SmartAIMT5, force)).then(clampAccounts);
      };
      w.SmartAIMT5.__clamped = true;
    }
  }
  if (w.SmartAIMT5) { wrap(); return; }
  var s = document.createElement('script');
  s.src = PINNED;
  s.async = false;
  s.onload = wrap;
  s.onerror = function () {
    console.error('[SmartAIMT5] failed to load pinned API');
  };
  document.head.appendChild(s);
})(window);
