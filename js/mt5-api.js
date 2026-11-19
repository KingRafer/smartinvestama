/* SMARTAI MT5 API — emergency loader: pull last good version then apply clamp at runtime */
(function(w){
  'use strict';
  var src = 'https://cdn.jsdelivr.net/gh/KingRafer/smartinvestama@c86781b258148474241be15287a400bf7a9ecabb/js/mt5-api.js';
  var s = document.createElement('script');
  s.src = src;
  s.onload = function(){
    try {
      if (w.SmartAIMT5 && w.SmartAIMT5.getAccounts) {
        var orig = w.SmartAIMT5.getAccounts;
        w.SmartAIMT5.getAccounts = async function(force){
          var list = await orig(force);
          return (list||[]).map(function(a){
            var d = Number(a.daily_profit);
            if (!Number.isFinite(d) || Math.abs(d) > 500000) a.daily_profit = 0;
            return a;
          });
        };
      }
    } catch(e){}
  };
  s.onerror = function(){ console.error('Failed to load SmartAIMT5'); };
  document.head.appendChild(s);
})(window);
