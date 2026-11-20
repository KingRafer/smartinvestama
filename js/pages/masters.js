/* Admin — Smart Masters (kelola lengkap) */
if (initShell()) {
  var MASTER_STORE = 'smartai_masters_v1';
  var DEFAULT_MASTERS = [
    { id:'SM01', nama:'Andi Rahman', email:'andi@mail.com', hp:'081234567801', bio:'Scalper XAUUSD 5+ tahun.', rank:'Gold', level:3, winRate:72.4, profit30d:18.6, subscribers:128, status:'Active', style:'Scalping', since:'2026-08-01', fee:15 },
    { id:'SM02', nama:'Maya Sari', email:'maya@mail.com', hp:'081234567806', bio:'Swing trader multi-pair.', rank:'Diamond', level:5, winRate:68.1, profit30d:22.3, subscribers:256, status:'Active', style:'Swing', since:'2026-06-12', fee:25 },
    { id:'SM03', nama:'Budi Pratama', email:'budi@mail.com', hp:'081234567803', bio:'Gold specialist.', rank:'Silver', level:2, winRate:65.0, profit30d:12.1, subscribers:64, status:'Active', style:'Intraday', since:'2026-09-20', fee:10 },
    { id:'SM04', nama:'Sari Wulandari', email:'sari@mail.com', hp:'081234567802', bio:'EA + discretionary hybrid.', rank:'Bronze', level:1, winRate:61.5, profit30d:8.4, subscribers:31, status:'Active', style:'Hybrid', since:'2026-10-05', fee:5 },
    { id:'SM05', nama:'Lina Kusuma', email:'lina@mail.com', hp:'081234567808', bio:'Pending review.', rank:'Bronze', level:1, winRate:0, profit30d:0, subscribers:0, status:'Pending', style:'Mean Reversion', since:'2026-11-18', fee:8 }
  ];

  function loadMasters() {
    try {
      var raw = localStorage.getItem(MASTER_STORE);
      if (raw) { var d = JSON.parse(raw); if (Array.isArray(d) && d.length) return d; }
    } catch (e) {}
    localStorage.setItem(MASTER_STORE, JSON.stringify(DEFAULT_MASTERS));
    return JSON.parse(JSON.stringify(DEFAULT_MASTERS));
  }
  function saveMasters(list) {
    try { localStorage.setItem(MASTER_STORE, JSON.stringify(list)); } catch (e) {}
    try {
      var raw = localStorage.getItem('smartai_admin_data');
      var d = raw ? JSON.parse(raw) : getData();
      d.masters = list;
      localStorage.setItem('smartai_admin_data', JSON.stringify(d));
    } catch (e) {}
  }
  function updateMaster(id, mutator) {
    var list = loadMasters();
    list.forEach(function (m) { if (m.id === id) mutator(m); });
    saveMasters(list);
  }
  function pushSignalToMembers(masterName, body) {
    try {
      var key = 'smartai_notifs_v1';
      var list = JSON.parse(localStorage.getItem(key) || '[]');
      list.unshift({ id: 'sig' + Date.now(), title: 'Signal · ' + masterName, body: body, time: 'Baru saja', type: 'signal', read: false });
      if (list.length > 50) list.length = 50;
      localStorage.setItem(key, JSON.stringify(list));
    } catch (e) {}
  }

  function render() {
    var rows = loadMasters();
    setText('st-total', rows.length);
    setText('st-active', rows.filter(function (m) { return m.status === 'Active'; }).length);
    setText('st-pending', rows.filter(function (m) { return m.status === 'Pending'; }).length);
    setText('st-subs', rows.reduce(function (s, m) { return s + (m.subscribers || 0); }, 0));
    var tbody = document.getElementById('tbody');
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state">' + icon('star') + 'Belum ada Smart Master</div></td></tr>';
      return;
    }
    tbody.innerHTML = rows.map(function (m) {
      var acts = '';
      if (m.status === 'Pending') {
        acts += '<button type="button" class="btn btn-success btn-sm" data-act="approve">' + icon('check') + 'Approve</button>';
        acts += '<button type="button" class="btn btn-outline btn-sm" data-act="reject">' + icon('x') + 'Tolak</button>';
      }
      if (m.status === 'Active') {
        acts += '<button type="button" class="btn btn-outline btn-sm" data-act="inactive">' + icon('power') + 'Nonaktif</button>';
        acts += '<button type="button" class="btn btn-primary btn-sm" data-act="signal">' + icon('zap') + 'Signal</button>';
      }
      if (m.status === 'Inactive' || m.status === 'Rejected') {
        acts += '<button type="button" class="btn btn-success btn-sm" data-act="approve">' + icon('check') + 'Aktifkan</button>';
      }
      acts += '<button type="button" class="btn-icon" data-act="edit" title="Edit lengkap">' + icon('sliders') + '</button>';
      acts += '<button type="button" class="btn-icon" data-act="detail" title="Detail">' + icon('eye') + '</button>';
      return '<tr data-id="' + escapeHtml(m.id) + '">' +
        '<td><div class="cell-user">' + avatar(m.nama) + '<div><b>' + escapeHtml(m.nama) + '</b><small>' + escapeHtml(m.email || '') + '</small></div></div></td>' +
        '<td><b>' + escapeHtml(m.rank) + '</b> · Lv' + m.level + '</td>' +
        '<td>' + escapeHtml(m.style || '—') + '</td>' +
        '<td>' + (m.subscribers || 0) + '</td>' +
        '<td>$' + (m.fee || 0) + '</td>' +
        '<td>' + statusBadge(m.status === 'Active' ? 'Active' : m.status === 'Pending' ? 'Pending' : 'Inactive') + '</td>' +
        '<td><div class="row-actions">' + acts + '</div></td></tr>';
    }).join('');
  }

  function openEdit(m) {
    var rank = prompt('Rank (Bronze / Silver / Gold / Diamond):', m.rank);
    if (rank == null) return;
    rank = rank.trim();
    if (['Bronze', 'Silver', 'Gold', 'Diamond'].indexOf(rank) < 0) { toast('Rank tidak valid', 'err'); return; }
    var level = prompt('Level (1–5):', String(m.level));
    if (level == null) return;
    level = Math.max(1, Math.min(5, parseInt(level, 10) || 1));
    var fee = prompt('Fee USD / bulan:', String(m.fee || 0));
    if (fee == null) return;
    fee = Math.max(0, parseFloat(fee) || 0);
    var winRate = prompt('Win rate %:', String(m.winRate || 0));
    if (winRate == null) return;
    winRate = Math.max(0, Math.min(100, parseFloat(winRate) || 0));
    var profit30d = prompt('Profit 30 hari %:', String(m.profit30d || 0));
    if (profit30d == null) return;
    profit30d = parseFloat(profit30d) || 0;
    var style = prompt('Style:', m.style || 'Scalping');
    if (style == null) return;
    var bio = prompt('Bio channel:', m.bio || '');
    if (bio == null) return;
    updateMaster(m.id, function (x) {
      x.rank = rank; x.level = level; x.fee = fee;
      x.winRate = winRate; x.profit30d = profit30d;
      x.style = style.trim(); x.bio = bio.trim();
    });
    logActivity('master', 'Edit master: ' + m.nama, '');
    toast('Data master diperbarui', 'ok');
    render();
  }

  document.getElementById('tbody').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-act]');
    if (!btn) return;
    var id = btn.closest('tr').getAttribute('data-id');
    var act = btn.getAttribute('data-act');
    var m = loadMasters().find(function (x) { return x.id === id; });
    if (!m) return;
    if (act === 'approve') {
      updateMaster(id, function (x) { x.status = 'Active'; if (!x.winRate) x.winRate = 55; });
      logActivity('master', 'Smart Master disetujui: ' + m.nama, '');
      toast('Master diaktifkan', 'ok'); render();
    } else if (act === 'reject') {
      confirmDialog({ title: 'Tolak pengajuan?', message: m.nama + ' akan ditolak.', confirmText: 'Tolak', danger: true }, function () {
        updateMaster(id, function (x) { x.status = 'Rejected'; });
        logActivity('master', 'Smart Master ditolak: ' + m.nama, 'err');
        toast('Ditolak', 'err'); render();
      });
    } else if (act === 'inactive') {
      updateMaster(id, function (x) { x.status = 'Inactive'; });
      logActivity('master', 'Smart Master nonaktif: ' + m.nama, 'warn');
      toast('Dinonaktifkan', 'ok'); render();
    } else if (act === 'signal') {
      var pair = prompt('Pair (contoh XAUUSD):', 'XAUUSD');
      if (!pair) return;
      var side = prompt('Side (Buy/Sell):', 'Buy');
      if (!side) return;
      var note = prompt('Catatan signal:', 'Entry market · risk 1%');
      if (note == null) note = '';
      pushSignalToMembers(m.nama, pair.trim() + ' ' + side.trim() + ' — ' + (note || 'Signal baru') + ' · dari ' + m.nama);
      logActivity('master', 'Signal broadcast: ' + m.nama + ' · ' + pair + ' ' + side, '');
      toast('Signal dikirim ke notifikasi member', 'ok');
    } else if (act === 'detail') {
      alert('Detail Smart Master\n\nNama: ' + m.nama + '\nEmail: ' + (m.email || '—') + '\nHP: ' + (m.hp || '—') +
        '\nRank: ' + m.rank + ' · Level ' + m.level + '\nStyle: ' + (m.style || '—') +
        '\nWin rate: ' + (m.winRate || 0) + '%\nProfit 30d: ' + (m.profit30d || 0) + '%' +
        '\nSubscriber: ' + (m.subscribers || 0) + '\nFee: $' + (m.fee || 0) +
        '\nStatus: ' + m.status + '\nSejak: ' + (m.since || '—') + '\n\nBio:\n' + (m.bio || '—'));
    } else if (act === 'edit') openEdit(m);
  });

  render();
  hydrateIcons();
}
