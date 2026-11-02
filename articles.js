/* Articles — தமிழ் ஓலைச்சுவடி பாணி: Top 5 எழுத்தாளர்கள் (அதிக ஏற்கப்பட்ட கட்டுரைகள்) + 6-வது "மேலும் கட்டுரைகள்" பட்டியல்,
   பழங்காலத் தாள் வாசிப்பு, பொது எழுதும் படிவம். index.html-ன் #sec உள்ளே: ArticleShelf.mount(secEl, hostEl)
   ஏற்கப்பட்ட (approved) கட்டுரைகள் மட்டுமே தெரியும். */
(function () {
  'use strict';
  var S = window.ArticleStore, clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var ls = { g: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, s: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  var TOP = 5;
  var root, host, arts = [], items = [], more = [], pos = 0, shown = -1, drag = false, SP = 120, els = [], loading = false, failed = false;
  var $ = function (s, r) { return (r || root).querySelector(s); };
  function h(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  var initial = function (n) { return (String(n || '').trim().charAt(0) || '✍'); };
  function dateTa(ms) { try { return new Date(ms).toLocaleDateString('ta-IN', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return ''; } }
  function portrait(a, cls) {
    if (!a.photo) return null;
    var im = h('img', a.cutout ? cls || '' : ((cls || '') + ' flat').trim()); im.alt = a.name; im.src = a.photo; im.draggable = false; return im;
  }

  /* ---------- எழுத்தாளர் குழுவாக்கம்: அதிக கட்டுரை → Top 5; மற்றவை → "மேலும்" ---------- */
  function group() {
    var m = {}, order = [];
    arts.forEach(function (a) {                       /* arts: புதியது முதலில் */
      var k = a.name.trim().toLowerCase().replace(/\s+/g, ' ');
      if (!m[k]) { m[k] = { key: k, name: a.name, role: a.role, photo: '', cutout: false, arts: [], latest: a.createdAt }; order.push(m[k]); }
      var w = m[k]; w.arts.push(a);
      if (!w.photo && a.photo) { w.photo = a.photo; w.cutout = a.cutout; }
    });
    order.sort(function (x, y) { return y.arts.length - x.arts.length || y.latest - x.latest; });
    var top = order.slice(0, TOP); more = [];
    order.slice(TOP).forEach(function (w) { w.arts.forEach(function (a) { more.push(a); }); });
    more.sort(function (x, y) { return y.createdAt - x.createdAt; });
    items = top.map(function (w) { return { w: w }; });
    if (more.length) items.push({ more: true });
  }

  /* ---------- அமைப்பு ---------- */
  function build() {
    root.innerHTML = '';
    var as = h('div', 'as');
    as.innerHTML =
      '<div class="orn">❖ ❖ ❖</div><h1>கட்டுரைக் களஞ்சியம்</h1>' +
      '<p class="hint">எழுத்தாளர்களை பக்கவாட்டில் தள்ளுங்கள் · தொட்டால் கட்டுரைகள்</p>' +
      '<button class="wr" id="aW" type="button">✍ நீங்களும் கட்டுரை எழுதுங்கள்</button>' +
      '<section class="info" id="aI" aria-live="polite"><div class="lg" id="aL"></div>' +
      '<div class="tx"><b id="aN"></b><span id="aR"></span><em id="aK"></em></div></section>' +
      '<section class="stage" id="aS" aria-label="எழுத்தாளர்கள்"><div class="row" id="aRow"></div></section>' +
      '<div class="ctl"><button class="arrow" id="aP" type="button" aria-label="முந்தைய எழுத்தாளர்">‹</button><div class="cnt" id="aC"></div><button class="arrow" id="aX" type="button" aria-label="அடுத்த எழுத்தாளர்">›</button></div>' +
      '<div class="cards" id="aCards"></div>' +
      '<div class="msg" id="aM" hidden></div>';
    root.appendChild(as);
    $('#aW').onclick = openForm;
    $('#aP').onclick = function () { go(Math.round(pos) - 1); };
    $('#aX').onclick = function () { go(Math.round(pos) + 1); };
    var stg = $('#aS'), sx = 0, sp0 = 0, moved = 0;
    stg.addEventListener('pointerdown', function (e) { drag = true; moved = 0; sx = e.clientX; sp0 = pos; stg.classList.add('drag'); try { stg.setPointerCapture(e.pointerId); } catch (x) {} });
    stg.addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx)); pos = clamp(sp0 - dx / SP, -.3, items.length - .7); layout(); });
    function end(e) {
      if (!drag) return; drag = false; stg.classList.remove('drag');
      if (moved < 8) { var t = e.target.closest && e.target.closest('.bk'), k = t ? +t.dataset.i : Math.round(sp0); if (t && k === Math.round(sp0)) { go(k); tapItem(k); return; } pos = k; }
      go(Math.round(pos));
    }
    stg.addEventListener('pointerup', end); stg.addEventListener('pointercancel', end);
    addEventListener('resize', function () { if (root && root.isConnected && $('#aS') && root.offsetParent) layout(); });
  }
  function tapItem(k) {
    var it = items[k]; if (!it) return;
    if (it.more) openList(); else if (it.w.arts.length === 1) openReader(it.w.arts[0]);
  }

  function fill() {
    var row = $('#aRow'); row.innerHTML = ''; els = [];
    items.forEach(function (it, i) {
      var d = h('div', 'bk'); d.dataset.i = i; var lf = h('div', 'lf');
      if (it.more) {
        lf.classList.add('mo'); lf.appendChild(h('div', 'mi', '📜')); lf.appendChild(h('div', 'mt', 'மேலும் கட்டுரைகள்')); lf.appendChild(h('div', 'mn', more.length + ' தலைப்புகள்'));
      } else {
        var w = it.w, pt = h('div', 'pt'), im = portrait(w);
        if (im) pt.appendChild(im); else pt.appendChild(h('div', 'ph', initial(w.name)));
        lf.appendChild(pt); lf.appendChild(h('div', 'rb', w.name));
      }
      d.appendChild(lf); row.appendChild(d); els.push(d);
    });
    var has = items.length > 0;
    ['#aI', '#aS', '.ctl', '#aCards'].forEach(function (s) { var e = $(s); if (e) e.hidden = !has; });
    var m = $('#aM');
    if (!has) {
      m.hidden = false; m.innerHTML = '';
      if (loading) m.textContent = 'ஏற்றுகிறது…';
      else if (failed) { m.append('கட்டுரைகளை ஏற்ற முடியவில்லை. இணைய இணைப்பைச் சரிபார்க்கவும்.'); var r = h('button', '', '↻ மீண்டும் முயற்சி'); r.onclick = refresh; m.appendChild(document.createElement('br')); m.appendChild(r); }
      else { m.appendChild(h('b', '', 'இன்னும் கட்டுரைகள் இல்லை')); m.appendChild(document.createElement('br')); m.append('முதல் கட்டுரையை நீங்களே எழுதுங்கள் — நிர்வாகி ஒப்புதல் அளித்ததும் இங்கே தோன்றும்.'); }
    } else m.hidden = true;
    pos = clamp(Math.round(pos), 0, Math.max(0, items.length - 1)); shown = -1; layout();
  }
  function size() {
    var sw = $('#aS').clientWidth || 360, bw = clamp(sw * .44, 120, 180);
    SP = clamp(sw * .34, 84, 170); var st = $('#aS').style; st.setProperty('--bw', bw + 'px'); st.setProperty('--bh', (bw * 1.22) + 'px');
  }
  function layout() {
    if (!$('#aS')) return; size(); var n = items.length;
    els.forEach(function (el, i) {
      var d = i - pos, a = Math.abs(d), sg = d < 0 ? -1 : 1, m = Math.min(a, 1);
      var x = sg * (m * SP + Math.max(0, a - 1) * SP * .7), s = Math.max(.5, 1 - .3 * m - .08 * Math.max(0, a - 1)), ry = clamp(-d * 30, -45, 45);
      el.style.transform = 'translateX(calc(-50% + ' + x + 'px)) rotateY(' + ry + 'deg) scale(' + s + ')';
      el.style.zIndex = 100 - Math.round(a * 10); el.style.filter = 'brightness(' + (1 - .32 * m) + ')';
      el.classList.toggle('on', Math.round(pos) === i);
    });
    if (!n) return; var c = clamp(Math.round(pos), 0, n - 1); if (c !== shown) { shown = c; show(c); }
  }
  function artCard(a, showWho) {
    var c = h('button', 'card'); c.type = 'button';
    c.appendChild(h('div', 'k', '📝 ' + (showWho ? a.name + ' · ' : '') + dateTa(a.createdAt)));
    c.appendChild(h('div', 'ct', a.title)); c.appendChild(h('p', '', a.summary)); c.appendChild(h('div', 'go', 'முழுக் கட்டுரையைப் படிக்க ▸'));
    c.onclick = function () { openReader(a); }; return c;
  }
  function show(i) {
    var it = items[i]; if (!it) return;
    var lg = $('#aL'), box = $('#aCards'); lg.innerHTML = ''; box.innerHTML = '';
    if (it.more) {
      lg.textContent = '📜'; $('#aN').textContent = 'மேலும் கட்டுரைகள்'; $('#aR').textContent = 'பிற எழுத்தாளர்களின் கட்டுரைத் தலைப்புகள்'; $('#aK').textContent = more.length + ' தலைப்புகள்';
      var b = h('button', 'card morebtn'); b.type = 'button'; b.appendChild(h('div', 'ct', '📜 தலைப்புகளின் பட்டியலைக் காண்க')); b.appendChild(h('div', 'go', 'தொடுங்கள் ▸')); b.onclick = openList; box.appendChild(b);
    } else {
      var w = it.w, im = portrait(w); if (im) lg.appendChild(im); else lg.textContent = initial(w.name);
      $('#aN').textContent = w.name; $('#aR').textContent = w.role; $('#aK').textContent = w.arts.length + ' கட்டுரை' + (w.arts.length > 1 ? 'கள்' : '');
      w.arts.forEach(function (a) { box.appendChild(artCard(a)); });
    }
    $('#aC').textContent = (i + 1) + ' / ' + items.length; $('#aP').disabled = i <= 0; $('#aX').disabled = i >= items.length - 1;
    var inf = $('#aI'); inf.classList.remove('pop'); void inf.offsetWidth; inf.classList.add('pop');
  }
  function go(i) { pos = clamp(i, 0, Math.max(0, items.length - 1)); layout(); }
  function refresh() {
    loading = true; failed = false; items = []; fill();
    return S.listApproved().then(function (l) { arts = l; group(); }).catch(function () { failed = true; arts = []; items = []; })
      .then(function () { loading = false; fill(); });
  }

  /* ---------- "மேலும் கட்டுரைகள்" தலைப்புப் பட்டியல் ---------- */
  function openList() {
    closeOverlays();
    var rd = h('div', 'rd ls'), bar = h('div', 'rd-bar'), back = h('button', 'back', '← திரும்பு'); bar.appendChild(back);
    var pg = h('div', 'rd-pg'); pg.appendChild(h('div', 'rd-orn', '❖ ❖ ❖')); pg.appendChild(h('h1', 'rd-h', 'மேலும் கட்டுரைகள்'));
    var ul = h('div', 'tl');
    more.forEach(function (a) {
      var r = h('button', 'tr'); r.type = 'button'; r.appendChild(h('span', 'tt', a.title)); r.appendChild(h('span', 'tw', a.name + ' · ' + a.role)); r.onclick = function () { openReader(a, openList); }; ul.appendChild(r);
    });
    pg.appendChild(ul); rd.append(bar, pg); host.appendChild(rd); back.onclick = closeOverlays;
  }

/* ---------- வாசிப்புப் பக்கம் (பழங்காலத் தாள்) ---------- */
  function openReader(a, from) {
    if (!a) return; closeOverlays();
    var rf = clamp(+ls.g('np_art_fs') || 19, 15, 30);
    var rd = h('div', 'rd'); rd.setAttribute('role', 'dialog'); rd.setAttribute('aria-label', a.title); rd.style.setProperty('--rf', rf + 'px');
    var bar = h('div', 'rd-bar'), back = h('button', 'back', '← திரும்பு'), sp = h('span', 'sp'), mi = h('button', '', 'A−'), pl = h('button', '', 'A+');
    mi.setAttribute('aria-label', 'எழுத்தைச் சிறிதாக்கு'); pl.setAttribute('aria-label', 'எழுத்தைப் பெரிதாக்கு');
    bar.append(back, sp, mi, pl);
    var pg = h('div', 'rd-pg');
    pg.appendChild(h('div', 'rd-orn', '❦ ❦ ❦'));
    pg.appendChild(h('h1', 'rd-h', a.title));
    var by = h('div', 'rd-by'), av = h('div', 'av'), im = portrait(a); if (im) av.appendChild(im); else av.textContent = initial(a.name);
    var who = h('div'); who.appendChild(h('div', 'nm', a.name)); who.appendChild(h('div', 'rl', a.role)); by.append(av, who);
    pg.appendChild(by); pg.appendChild(h('div', 'rd-dt', dateTa(a.createdAt)));
    var body = h('div', 'rd-body');
    String(a.body).replace(/\r/g, '').split(/\n\s*\n/).forEach(function (p) { p = p.trim(); if (p) { var e = h('p'); e.textContent = p; body.appendChild(e); } });
    pg.appendChild(body); pg.appendChild(h('div', 'rd-end', '❦'));
    rd.append(bar, pg); host.appendChild(rd);
    function setF(v) { rf = clamp(v, 15, 30); rd.style.setProperty('--rf', rf + 'px'); ls.s('np_art_fs', String(rf)); }
    mi.onclick = function () { setF(rf - 2); }; pl.onclick = function () { setF(rf + 2); };
    back.onclick = function () { closeOverlays(); if (from) from(); }; rd.scrollTop = 0; back.focus({ preventScroll: true });
  }
  function closeOverlays() { if (!host) return; [].forEach.call(host.querySelectorAll('.rd,.fm'), function (e) { e.remove(); }); }

  /* ---------- எழுதும் படிவம் ---------- */
  function openForm() {
    closeOverlays(); var L = S.limits, photo = '', cut = false, busy = false, t0 = Date.now();
    var fm = h('div', 'fm'), box = h('div', 'fm-box'); fm.appendChild(box);
    box.innerHTML =
      '<div class="fm-hd"><h2>✍ கட்டுரை எழுதுங்கள்</h2><button class="fm-x" type="button" aria-label="மூடு">✕</button></div>' +
      '<p class="fm-note">யார் வேண்டுமானாலும் எழுதலாம். சமர்ப்பித்த பின் நிர்வாகி ஒப்புதல் அளித்தால் மட்டுமே முதன்மைப் பக்கத்தில் தெரியும்.</p>' +
      '<div id="fF">' +
      '<label>எழுத்தாளர் பெயர் *<input type="text" id="fN" maxlength="' + L.name + '" autocomplete="name"></label>' +
      '<label>பதவி *<small>எ.கா. ஆசிரியர், மாணவர், பத்திரிகையாளர்</small><input type="text" id="fR" maxlength="' + L.role + '"></label>' +
      '<div class="fm-ph"><div class="fm-prev" id="fPv">படம் இல்லை</div><div class="fm-pt"><div>உங்கள் புகைப்படம் (JPG) — உருவம் மட்டும் தானாக வெட்டப்படும்</div>' +
      '<label class="fm-btn" for="fP" style="margin:0">📷 புகைப்படம் தேர்வு</label><input type="file" id="fP" accept="image/jpeg,image/png,image/webp,image/*" hidden>' +
      '<div class="fm-bar" id="fB" hidden><i></i></div><div id="fS"></div></div></div>' +
      '<label>கட்டுரைத் தலைப்பு *<input type="text" id="fT" maxlength="' + L.title + '"></label>' +
      '<label>கட்டுரை குறித்த சில வரிகள் *<small>முகப்பில் கட்டத்தில் தெரியும் (அதிகபட்சம் ' + L.summary + ' எழுத்துகள்)</small><textarea id="fU" maxlength="' + L.summary + '"></textarea></label>' +
      '<label>முழுக் கட்டுரை *<small>பத்திகளுக்கு இடையே ஒரு வெற்று வரி விடவும்</small><textarea class="lg" id="fG" maxlength="' + L.body + '"></textarea></label>' +
      '<input class="fm-hp" id="fH" type="text" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<div class="fm-err" id="fE" role="alert"></div>' +
      '<button class="fm-btn pri" id="fSub" type="button">சமர்ப்பிக்கவும்</button>' +
      (S.mode === 'local' ? '<div class="fm-mode">சோதனை முறை: கட்டுரை இந்தச் சாதனத்தில் மட்டும் சேமிக்கப்படும். (README → Articles அமைப்பு)</div>' : '') +
      '</div>';
    host.appendChild(fm);
    var q = function (s) { return box.querySelector(s); }, err = function (m) { q('#fE').textContent = m || ''; };
    q('.fm-x').onclick = closeOverlays;
    q('#fP').onchange = function (e) {
      var f = e.target.files[0]; e.target.value = ''; if (!f) return;
      if (!/^image\//.test(f.type)) { err('படக் கோப்பை மட்டும் தேர்வு செய்யவும்'); return; }
      err(''); busy = true; photo = ''; cut = false; q('#fSub').disabled = true;
      var bar = q('#fB'), fill = bar.firstChild; bar.hidden = false; q('#fPv').textContent = '…';
      PhotoCutout.process(f, function (msg, frac) { q('#fS').textContent = msg; fill.style.width = Math.round((frac || 0) * 100) + '%'; }).then(function (r) {
        photo = r.dataUrl; cut = r.cutout; var im = h('img'); im.src = photo; im.alt = ''; var pv = q('#fPv'); pv.innerHTML = ''; pv.appendChild(im);
        q('#fS').textContent = cut ? '✔ உருவம் மட்டும் வெட்டப்பட்டது' : '⚠ தானாக வெட்ட முடியவில்லை (இணையம் தேவை) — அசல் படம் பயன்படும்';
      }).catch(function (x) { err(x.message || 'படத்தைச் செயல்படுத்த முடியவில்லை'); q('#fPv').textContent = 'படம் இல்லை'; q('#fS').textContent = ''; })
        .then(function () { busy = false; bar.hidden = true; q('#fSub').disabled = false; });
    };
    q('#fSub').onclick = function () {
      err(''); if (busy) { err('படம் செயல்படுகிறது, சற்று காத்திருக்கவும்'); return; }
      if (q('#fH').value) { closeOverlays(); return; }                       /* bot trap */
      if (Date.now() - t0 < 4000) { err('சிறிது நேரம் கழித்து மீண்டும் அழுத்தவும்'); return; }
      var last = +ls.g('np_art_last') || 0; if (Date.now() - last < 30000) { err('அடுத்த கட்டுரையை சிறிது நேரம் கழித்து அனுப்பவும்'); return; }
      var a = { name: q('#fN').value, role: q('#fR').value, title: q('#fT').value, summary: q('#fU').value, body: q('#fG').value, photo: photo, cutout: cut };
      if (!a.name.trim() || !a.role.trim() || !a.title.trim() || !a.summary.trim() || !a.body.trim()) { err('* குறித்த எல்லா புலங்களையும் நிரப்பவும்'); return; }
      q('#fSub').disabled = true; q('#fSub').textContent = 'அனுப்புகிறது…';
      S.submit(a).then(function () {
        ls.s('np_art_last', String(Date.now()));
        var f = q('#fF'); f.innerHTML = ''; var ok = h('div', 'fm-ok'); ok.appendChild(h('b', '', '✔ நன்றி!'));
        ok.append('உங்கள் கட்டுரை நிர்வாகியின் ஒப்புதலுக்கு அனுப்பப்பட்டது. ஒப்புதல் கிடைத்ததும் அலமாரியில் தோன்றும்.'); f.appendChild(ok);
        var c = h('button', 'fm-btn pri', 'சரி'); c.onclick = function () { closeOverlays(); if (S.mode === 'local') refresh(); }; f.appendChild(c);
      }).catch(function (x) { err('அனுப்ப முடியவில்லை: ' + (x.message || '')); q('#fSub').disabled = false; q('#fSub').textContent = 'சமர்ப்பிக்கவும்'; });
    };
    fm.scrollTop = 0; q('#fN').focus({ preventScroll: true });
  }

    window.ArticleShelf = {
    mount: function (sc, hostEl) {
      host = hostEl || sc.parentNode; sc.classList.add('art');
      root = sc; if (!root.querySelector('#aS')) build();
      closeOverlays(); refresh();
    },
    unmount: function (sc) { if (sc) sc.classList.remove('art'); closeOverlays(); }
  };
})();
