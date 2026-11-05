/* செட்டிங்ஸ் → Articles: அட்மின் ஒப்புதல் பலகை.
   காத்திருப்பு (pending) கட்டுரைகளை ஏற்கலாம் / நிராகரிக்கலாம் / நீக்கலாம். ஏற்றவை மட்டுமே முதன்மைப் பக்கத்தில் தெரியும். */
(function () {
  'use strict';
  var KIND = { article: ['📝', 'Articles', 'கட்டுரை'], shopping: ['🛒', 'Shopping', 'பொருள்'], events: ['🎪', 'Events', 'நிகழ்வு'] };
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }
  function create(box0, kind) {
  var S = window.ArticleStore.forKind(kind);
  var box = box0, filter = 'pending', all = [], K = KIND[kind] || KIND.article;
  var STAT = { pending: 'காத்திருப்பு', approved: 'ஏற்றவை', rejected: 'நிராகரித்தவை' };
  function h(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function toast(m) { var t = document.getElementById('toast'); if (!t) return; t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove('on'); }, 2400); }
  var date = function (ms) { try { return new Date(ms).toLocaleString('ta-IN', { dateStyle: 'medium', timeStyle: 'short' }); } catch (e) { return ''; } };

  function render() {
    box.innerHTML = '';
    var names = {}; try { names = JSON.parse(ls('np_tabs') || '{}') || {}; } catch (e) {}
    var c = h('div', 'sc'); var hd = h('h2', '', K[0] + ' ' + (names[kind] || K[1]) + ' — அட்மின் ஒப்புதல்'); c.appendChild(hd);
    var l1 = h('label', '', 'பகுதியின் பெயர் (முதல் பக்கத்தில் தெரியும்)'), nm = h('input'); nm.type = 'text'; nm.value = names[kind] || ''; nm.placeholder = K[1]; l1.appendChild(nm); c.appendChild(l1);
    nm.oninput = function () { var v = nm.value.trim(); if (v) names[kind] = v; else delete names[kind]; ls('np_tabs', JSON.stringify(names)); hd.textContent = K[0] + ' ' + (names[kind] || K[1]) + ' — அட்மின் ஒப்புதல்'; };
    var mode = h('p', 'note', S.mode === 'cloud'
      ? 'பகிரப்பட்ட முறை (Firebase): யாரும் எழுதிய கட்டுரைகள் இங்கே காத்திருப்பில் வரும்.'
      : '⚠ சோதனை முறை: தரவு இந்தச் சாதனத்தில் மட்டும் (localStorage). பகிரப்பட்ட முறைக்கு articles-config.js நிரப்பவும் (README → Articles அமைப்பு).');
    c.appendChild(mode); box.appendChild(c);
    if (!S.isAdmin()) return login();
    panel();
  }

  function login() {
    var c = h('div', 'sc'); c.appendChild(h('h2', '', '🔐 அட்மின் உள்நுழைவு'));
    var l1 = h('label', '', 'மின்னஞ்சல்'), em = h('input'); em.type = 'email'; em.autocomplete = 'username'; em.value = S.adminEmail || ''; l1.appendChild(em);
    var l2 = h('label', '', 'கடவுச்சொல்'), pw = h('input'); pw.type = 'password'; pw.autocomplete = 'current-password'; l2.appendChild(pw);
    var row = h('div', 'st-row'), go = h('button', '', 'உள்நுழை'); go.type = 'button'; row.appendChild(go);
    var msg = h('p', 'note', 'இது Firebase Authentication-ல் நீங்கள் உருவாக்கிய அட்மின் கணக்கு (README பார்க்கவும்).');
    function doLogin() {
      go.disabled = true; msg.textContent = 'சரிபார்க்கிறது…';
      S.login(em.value.trim(), pw.value).then(render).catch(function (e) { msg.textContent = '⚠ ' + e.message; go.disabled = false; });
    }
    go.onclick = doLogin; pw.onkeydown = function (e) { if (e.key === 'Enter') doLogin(); };
    c.append(l1, l2, row, msg); box.appendChild(c);
  }

  function panel() {
    var head = h('div', 'sc'), tabs = h('div', 'st-row');
    Object.keys(STAT).forEach(function (k) {
      var n = all.filter(function (a) { return a.status === k; }).length;
      var b = h('button', k === filter ? '' : 'alt', STAT[k] + ' (' + n + ')'); b.type = 'button';
      b.onclick = function () { filter = k; render(); draw(); }; tabs.appendChild(b);
    });
    var rf = h('button', 'alt', '↻ புதுப்பி'); rf.type = 'button'; rf.onclick = load; tabs.appendChild(rf);
    if (S.mode === 'cloud') { var lo = h('button', 'warn', 'வெளியேறு'); lo.type = 'button'; lo.onclick = function () { S.logout(); render(); }; tabs.appendChild(lo); }
    head.appendChild(tabs); box.appendChild(head);
    var out = h('div', '', ''); out.id = 'artList'; out.style.cssText = 'display:grid;gap:12px'; box.appendChild(out); draw();
  }

  function draw() {
    var out = document.getElementById('artList'); if (!out) return; out.innerHTML = '';
    var rows = all.filter(function (a) { return a.status === filter; });
    if (!rows.length) { out.appendChild(h('div', 'st-empty', 'இந்தப் பிரிவில் கட்டுரைகள் இல்லை.')); return; }
    rows.forEach(function (a) {
      var c = h('div', 'sc'), top = h('div'); top.style.cssText = 'display:flex;gap:12px;align-items:flex-start';
      var im = h('div'); im.style.cssText = 'width:64px;height:80px;flex:none;border-radius:10px;overflow:hidden;display:grid;place-items:center;font-weight:800;font-size:26px;background:repeating-conic-gradient(rgba(128,128,128,.18) 0 25%,transparent 0 50%) 0 0/12px 12px';
      if (a.photo) { var p = h('img'); p.src = a.photo; p.alt = ''; p.style.cssText = 'width:100%;height:100%;object-fit:contain;object-position:bottom'; im.appendChild(p); } else im.textContent = (a.name || '✍').charAt(0);
      var tx = h('div'); tx.style.cssText = 'min-width:0;display:grid;gap:2px';
      var t = h('strong', '', a.title); t.style.overflowWrap = 'anywhere';
      var by = h('span', 'note', a.name + (a.role && a.role !== '-' ? ' · ' + a.role : '') + (a.extra ? ' · ' + a.extra : '') + (a.photo && kind === 'article' ? (a.cutout ? ' · ✂ cut-out' : ' · (அசல் படம்)') : ''));
      var dt = h('span', 'note', date(a.createdAt)); tx.append(t, by, dt); top.append(im, tx); c.appendChild(top);
      c.appendChild(h('p', 'note', a.summary));
      var det = document.createElement('details'), sm = h('summary', '', 'முழு விவரத்தைப் படி'), bd = h('div', 'body'); bd.style.cssText = 'white-space:pre-wrap;line-height:1.8;overflow-wrap:anywhere';
      bd.textContent = a.body; det.append(sm, bd); c.appendChild(det);
      var row = h('div', 'st-row');
      function btn(txt, cls, fn) { var b = h('button', cls, txt); b.type = 'button'; b.onclick = function () { b.disabled = true; fn().then(load).catch(function (e) { toast('⚠ ' + e.message); b.disabled = false; if (/உள்நுழை|அமர்வு/.test(e.message)) render(); }); }; row.appendChild(b); }
      if (a.status !== 'approved') btn('✔ ஏற்று (முகப்பில் காட்டு)', '', function () { return S.setStatus(a.id, 'approved').then(function () { toast('✔ ஏற்கப்பட்டது'); }); });
      if (a.status === 'approved') btn('⏸ முகப்பிலிருந்து எடு', 'alt', function () { return S.setStatus(a.id, 'pending').then(function () { toast('காத்திருப்புக்கு மாற்றப்பட்டது'); }); });
      if (a.status === 'pending') btn('✖ நிராகரி', 'alt', function () { return S.setStatus(a.id, 'rejected').then(function () { toast('நிராகரிக்கப்பட்டது'); }); });
      btn('🗑 நீக்கு', 'warn', function () { if (!confirm('இந்தக் கட்டுரையை நிரந்தரமாக நீக்கவா?')) return Promise.reject(new Error('ரத்து செய்யப்பட்டது')); return S.remove(a.id).then(function () { toast('நீக்கப்பட்டது'); }); });
      c.appendChild(row); out.appendChild(c);
    });
  }

  function load() {
    if (!S.isAdmin()) return render();
    return S.listAll(kind).then(function (l) { all = l; render(); }).catch(function (e) {
      if (/உள்நுழை|அமர்வு|401|403|PERMISSION/i.test(e.message)) { S.logout(); } else toast('⚠ ' + e.message);
      render();
    });
  }
  return { mount: function (el) { box = el; if (S.isAdmin()) load(); else render(); } };
  }
  var inst = {};
  window.ArticleAdmin = { mount: function (el, kind) { kind = kind || 'article'; (inst[kind] = inst[kind] || create(el, kind)).mount(el); } };
})();

/* ===== ஒருங்கிணைந்த "பதிவுகள்" பெட்டி: Articles + Shopping (விளம்பரம்) + Events — ஒரே ஒப்புதல் பலகை =====
   வகை சிப் (எல்லாம் / கட்டுரை / விளம்பரம் / நிகழ்வு) + நிலைத் தாவல் (காத்திருப்பு / ஏற்றவை / நிராகரித்தவை).
   ஒவ்வொரு பதிவும் அதன் சொந்த store மூலமே ஏற்கப்படும் / நிராகரிக்கப்படும் / நீக்கப்படும் (தரவு அமைப்பு மாறவில்லை). */
(function () {
  'use strict';
  var KINDS = ['article', 'shopping', 'events'];
  var KIND = { article: ['📝', 'Articles', 'கட்டுரை'], shopping: ['🛒', 'Shopping', 'விளம்பரம்'], events: ['🎪', 'Events', 'நிகழ்வு'] };
  var STAT = { pending: 'காத்திருப்பு', approved: 'ஏற்றவை', rejected: 'நிராகரித்தவை' };
  var st = { box: null, typ: 'all', stat: 'pending', all: [], listed: false, onCount: null };
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function h(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function toast(m) { var t = document.getElementById('toast'); if (!t) return; t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove('on'); }, 2400); }
  var date = function (ms) { try { return new Date(ms).toLocaleString('ta-IN', { dateStyle: 'medium', timeStyle: 'short' }); } catch (e) { return ''; } };
  function S(k) { return window.ArticleStore.forKind(k); }
  function names() { try { return JSON.parse(lsGet('np_tabs') || '{}') || {}; } catch (e) { return {}; } }
  function label(k) { return names()[k] || KIND[k][1]; }
  function isAdmin() { return S('article').isAdmin(); }
  function pendingN(k) { return st.all.filter(function (a) { return a._k === k && a.status === 'pending'; }).length; }
  function totalPending() { return st.all.filter(function (a) { return a.status === 'pending'; }).length; }
  function notify() { if (st.onCount) try { st.onCount(totalPending()); } catch (e) {} }

  function load() {
    if (!isAdmin()) { st.all = []; st.listed = false; return render(); }
    var firstErr = null;
    return Promise.all(KINDS.map(function (k) {
      return S(k).listAll().then(function (l) { return l.map(function (a) { a._k = k; return a; }); }).catch(function (e) { firstErr = firstErr || e; return []; });
    })).then(function (lists) {
      st.all = [].concat.apply([], lists).sort(function (a, b) { return b.createdAt - a.createdAt; });
      st.listed = true; notify();
      if (firstErr) {
        if (/உள்நுழை|அமர்வு|401|403|PERMISSION/i.test(firstErr.message)) S('article').logout(); else toast('⚠ ' + firstErr.message);
      }
      render();
    });
  }

  function render() {
    var box = st.box; if (!box) return; box.innerHTML = '';
    var c = h('div', 'sc'); c.appendChild(h('h2', '', '📥 பதிவுகள் — அட்மின் ஒப்புதல்'));
    c.appendChild(h('p', 'note', S('article').mode === 'cloud'
      ? 'கட்டுரை, விளம்பரம் (Shopping), நிகழ்வு (Events) மூன்றும் ஒரே இடத்தில். காத்திருப்பவை இங்கே வரும்; ஏற்றவை மட்டுமே முதல் பக்கத்தில் தெரியும்.'
      : '⚠ சோதனை முறை: தரவு இந்தச் சாதனத்தில் மட்டும் (localStorage). பகிரப்பட்ட முறைக்கு articles-config.js நிரப்பவும் (README → Articles அமைப்பு).'));
    var det = document.createElement('details'); det.className = 'in';
    var sm = h('summary', '', '✏ பகுதிகளின் பெயர் (முதல் பக்கத்தில் தெரியும்; ஒருமுறை மட்டும்)'); det.appendChild(sm);
    var nm = names(), bd = h('div', 'subb'); bd.style.cssText = 'display:grid;gap:10px;padding:10px 0 0';
    KINDS.forEach(function (k) {
      var l = h('label', '', KIND[k][0] + ' ' + KIND[k][1]), i = h('input'); i.type = 'text'; i.value = nm[k] || ''; i.placeholder = KIND[k][1];
      i.oninput = function () { var n = names(), v = i.value.trim(); if (v) n[k] = v; else delete n[k]; lsSet('np_tabs', JSON.stringify(n)); };
      i.onchange = function () { render(); };
      l.appendChild(i); bd.appendChild(l);
    });
    det.appendChild(bd); c.appendChild(det); box.appendChild(c);
    if (!isAdmin()) return login();
    panel();
  }

  function login() {
    var S0 = S('article');
    var c = h('div', 'sc'); c.appendChild(h('h2', '', '🔐 அட்மின் உள்நுழைவு'));
    var l1 = h('label', '', 'மின்னஞ்சல்'), em = h('input'); em.type = 'email'; em.autocomplete = 'username'; em.value = S0.adminEmail || ''; l1.appendChild(em);
    var l2 = h('label', '', 'கடவுச்சொல்'), pw = h('input'); pw.type = 'password'; pw.autocomplete = 'current-password'; l2.appendChild(pw);
    var row = h('div', 'st-row'), go = h('button', '', 'உள்நுழை'); go.type = 'button'; row.appendChild(go);
    var msg = h('p', 'note', 'இது Firebase Authentication-ல் நீங்கள் உருவாக்கிய அட்மின் கணக்கு (README பார்க்கவும்).');
    function doLogin() { go.disabled = true; msg.textContent = 'சரிபார்க்கிறது…'; S0.login(em.value.trim(), pw.value).then(load).catch(function (e) { msg.textContent = '⚠ ' + e.message; go.disabled = false; }); }
    go.onclick = doLogin; pw.onkeydown = function (e) { if (e.key === 'Enter') doLogin(); };
    c.append(l1, l2, row, msg); st.box.appendChild(c);
  }

  function panel() {
    var box = st.box, head = h('div', 'sc');
    var types = h('div', 'st-row'); types.setAttribute('role', 'tablist'); types.setAttribute('aria-label', 'வகை');
    function chip(key, txt, n) {
      var b = h('button', st.typ === key ? '' : 'alt', txt + (n ? ' · ' + n : '')); b.type = 'button'; b.setAttribute('aria-pressed', st.typ === key ? 'true' : 'false');
      b.onclick = function () { st.typ = key; render(); }; types.appendChild(b);
    }
    chip('all', 'எல்லாம்', totalPending());
    KINDS.forEach(function (k) { chip(k, KIND[k][0] + ' ' + KIND[k][2], pendingN(k)); });
    head.appendChild(types);
    var tabs = h('div', 'st-row');
    function inType(a) { return st.typ === 'all' || a._k === st.typ; }
    Object.keys(STAT).forEach(function (k) {
      var n = st.all.filter(function (a) { return inType(a) && a.status === k; }).length;
      var b = h('button', k === st.stat ? '' : 'alt', STAT[k] + ' (' + n + ')'); b.type = 'button';
      b.onclick = function () { st.stat = k; render(); }; tabs.appendChild(b);
    });
    var rf = h('button', 'alt', '↻ புதுப்பி'); rf.type = 'button'; rf.onclick = load; tabs.appendChild(rf);
    if (S('article').mode === 'cloud') { var lo = h('button', 'warn', 'வெளியேறு'); lo.type = 'button'; lo.onclick = function () { S('article').logout(); st.all = []; render(); }; tabs.appendChild(lo); }
    head.appendChild(tabs); box.appendChild(head);
    var out = h('div'); out.style.cssText = 'display:grid;gap:12px'; box.appendChild(out);
    var rows = st.all.filter(function (a) { return inType(a) && a.status === st.stat; });
    if (!st.listed) { out.appendChild(h('div', 'st-empty', 'ஏற்றுகிறது…')); return; }
    if (!rows.length) { out.appendChild(h('div', 'st-empty', 'இந்தப் பிரிவில் பதிவுகள் இல்லை.')); return; }
    rows.forEach(function (a) { out.appendChild(card(a)); });
  }

  function card(a) {
    var k = a._k, Sx = S(k), c = h('div', 'sc'), top = h('div'); top.style.cssText = 'display:flex;gap:12px;align-items:flex-start';
    var im = h('div'); im.style.cssText = 'width:64px;height:80px;flex:none;border-radius:10px;overflow:hidden;display:grid;place-items:center;font-weight:800;font-size:26px;background:repeating-conic-gradient(rgba(128,128,128,.18) 0 25%,transparent 0 50%) 0 0/12px 12px';
    if (a.photo) { var p = h('img'); p.src = a.photo; p.alt = ''; p.style.cssText = 'width:100%;height:100%;object-fit:contain;object-position:bottom'; im.appendChild(p); } else im.textContent = (a.name && a.name !== '-' ? a.name : a.title || '✍').charAt(0);
    var tx = h('div'); tx.style.cssText = 'min-width:0;display:grid;gap:2px';
    var badge = h('span', 'note', KIND[k][0] + ' ' + label(k)); badge.style.fontWeight = '800';
    var t = h('strong', '', a.title); t.style.overflowWrap = 'anywhere';
    var by = h('span', 'note', (a.name && a.name !== '-' ? a.name : '') + (a.role && a.role !== '-' ? ' · ' + a.role : '') + (a.extra ? ' · ' + a.extra : '') + (a.photo && k === 'article' ? (a.cutout ? ' · ✂ cut-out' : ' · (அசல் படம்)') : ''));
    var dt = h('span', 'note', date(a.createdAt)); tx.append(badge, t, by, dt); top.append(im, tx); c.appendChild(top);
    c.appendChild(h('p', 'note', a.summary));
    var det = document.createElement('details'), sm = h('summary', '', 'முழு விவரத்தைப் படி'), bd = h('div', 'body'); bd.style.cssText = 'white-space:pre-wrap;line-height:1.8;overflow-wrap:anywhere';
    bd.textContent = a.body; det.append(sm, bd); c.appendChild(det);
    var row = h('div', 'st-row');
    function btn(txt, cls, fn) { var b = h('button', cls, txt); b.type = 'button'; b.onclick = function () { b.disabled = true; fn().then(load).catch(function (e) { toast('⚠ ' + e.message); b.disabled = false; if (/உள்நுழை|அமர்வு/.test(e.message)) render(); }); }; row.appendChild(b); }
    if (a.status !== 'approved') btn('✔ ஏற்று (முகப்பில் காட்டு)', '', function () { return Sx.setStatus(a.id, 'approved').then(function () { toast('✔ ஏற்கப்பட்டது'); }); });
    if (a.status === 'approved') btn('⏸ முகப்பிலிருந்து எடு', 'alt', function () { return Sx.setStatus(a.id, 'pending').then(function () { toast('காத்திருப்புக்கு மாற்றப்பட்டது'); }); });
    if (a.status === 'pending') btn('✖ நிராகரி', 'alt', function () { return Sx.setStatus(a.id, 'rejected').then(function () { toast('நிராகரிக்கப்பட்டது'); }); });
    btn('🗑 நீக்கு', 'warn', function () { if (!confirm('இந்தப் பதிவை நிரந்தரமாக நீக்கவா?')) return Promise.reject(new Error('ரத்து செய்யப்பட்டது')); return Sx.remove(a.id).then(function () { toast('நீக்கப்பட்டது'); }); });
    c.appendChild(row); return c;
  }

  var A = window.ArticleAdmin = window.ArticleAdmin || {};
  /* el-க்குள் ஒருங்கிணைந்த பெட்டியைக் காட்டும்; preset: 'article' | 'shopping' | 'events' (பழைய இணைப்புகளுக்கு) */
  A.mountAll = function (el, preset) { st.box = el; if (preset && KINDS.indexOf(preset) >= 0) st.typ = preset; if (isAdmin()) load(); else render(); };
  /* செட்டிங்ஸ் தலைப்பில் காத்திருப்பு எண்ணிக்கை காட்ட */
  A.watchPending = function (fn) { st.onCount = fn; if (isAdmin()) { var keep = st.box; Promise.all(KINDS.map(function (k) { return S(k).listAll().catch(function () { return []; }); })).then(function (ls) { var n = 0; ls.forEach(function (l) { l.forEach(function (a) { if (a.status === 'pending') n++; }); }); try { fn(n); } catch (e) {} }); } };
})();
