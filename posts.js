/* Shopping / Events — யார் வேண்டுமானாலும் சேர்க்கலாம் (JPG படத்துடன்); அட்மின் ஒப்புதலுக்குப் பின் மட்டுமே முதல் பக்கத்தில் தெரியும்.
   PostBoard.mount(secEl, hostEl, 'shopping' | 'events') — சேமிப்பு ArticleStore (kind) வழியாக. */
(function () {
  'use strict';
  var S;
  var CFG = {
    shopping: { ico: '🛒', def: 'Shopping', add: '➕ போஸ்டர் சேர்க்க', head: 'கடை போஸ்டர் சேர்க்க', nameL: 'கடை / விற்பவர் பெயர் (விருப்பம்)', roleL: 'தொடர்பு எண் / முகவரி', extraL: 'விலை (எ.கா. ₹250)', titleL: 'கடை / பொருளின் பெயர் *', sumL: 'போஸ்டர் குறித்த சில வரிகள் (விருப்பம்)', bodyL: 'முழு விவரம் (விருப்பம்)', empty: 'இன்னும் கடை போஸ்டர்கள் இல்லை' },
    events: { ico: '🎪', def: 'Events', add: '➕ போஸ்டர் சேர்க்க', head: 'நிகழ்வு போஸ்டர் சேர்க்க', nameL: 'ஏற்பாட்டாளர் பெயர் (விருப்பம்)', roleL: 'இடம்', extraL: 'தேதி & நேரம் (எ.கா. 15-11-2026, மாலை 5 மணி)', titleL: 'நிகழ்வின் பெயர் *', sumL: 'போஸ்டர் குறித்த சில வரிகள் (விருப்பம்)', bodyL: 'முழு விவரம் (விருப்பம்)', empty: 'இன்னும் நிகழ்வு போஸ்டர்கள் இல்லை' }
  };
  var root, host, kind, C, busyList = false;
  function h(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function title() { var n = {}; try { n = JSON.parse(localStorage.getItem('np_tabs') || '{}') || {}; } catch (e) {} return n[kind] || C.def; }
  function shrink(file, max) {
    return new Promise(function (res, rej) {
      var u = URL.createObjectURL(file), im = new Image();
      im.onload = function () {
        var k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(im.width * k)); c.height = Math.max(1, Math.round(im.height * k));
        var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0, c.width, c.height);
        URL.revokeObjectURL(u); var q = .82, d = c.toDataURL('image/jpeg', q); while (d.length * .75 > 600000 && q > .4) { q -= .1; d = c.toDataURL('image/jpeg', q); } res(d);
      };
      im.onerror = function () { URL.revokeObjectURL(u); rej(new Error('படத்தைப் படிக்க முடியவில்லை')); };
      im.src = u;
    });
  }
  function closeOv() { if (host) [].forEach.call(host.querySelectorAll('.pd,.fm'), function (e) { e.remove(); }); }

  function draw(list) {
    root.innerHTML = '';
    var as = h('div', 'as ps');
    as.appendChild(h('div', 'orn', '❖ ❖ ❖')); as.appendChild(h('h1', '', C.ico + ' ' + title()));
    var wr = h('button', 'wr', C.add); wr.type = 'button'; wr.onclick = openForm; as.appendChild(wr);
    if (!list) { as.appendChild(h('div', 'msg', 'ஏற்றுகிறது…')); root.appendChild(as); return; }
    if (!list.length) { var m = h('div', 'msg'); m.appendChild(h('b', '', C.empty)); m.appendChild(document.createElement('br')); m.append('நீங்களே முதலில் சேர்க்கலாம் — நிர்வாகி ஒப்புதல் அளித்ததும் இங்கே தோன்றும்.'); as.appendChild(m); }
    var g = h('div', 'pg');
    list.forEach(function (a) {
      var c = h('button', 'pc'); c.type = 'button';
      if (a.photo) { var i = h('img'); i.src = a.photo; i.alt = a.title; i.loading = 'lazy'; c.appendChild(i); } else c.appendChild(h('div', 'pi', C.ico));
      var cap = h('div', 'cap'); cap.appendChild(h('div', 'pt2', a.title)); if (a.extra) cap.appendChild(h('div', 'px', a.extra)); c.appendChild(cap);
      c.onclick = function () { openDetail(a); }; g.appendChild(c);
    });
    as.appendChild(g); root.appendChild(as);
  }
  function load() {
    draw(null);
    S.listApproved(kind).then(draw).catch(function () {
      draw([]); var m = h('div', 'msg', 'ஏற்ற முடியவில்லை. இணைய இணைப்பைச் சரிபார்க்கவும்.'); root.querySelector('.as').appendChild(m);
    });
  }
  function openDetail(a) {
    closeOv(); var rd = h('div', 'rd pd'), bar = h('div', 'rd-bar'), back = h('button', 'back', '← திரும்பு'); bar.appendChild(back);
    var pg = h('div', 'rd-pg'); pg.appendChild(h('div', 'rd-orn', '❖ ❖ ❖')); pg.appendChild(h('h1', 'rd-h', a.title));
    if (a.photo) { var f = h('div', 'pd-im'), i = h('img'); i.src = a.photo; i.alt = a.title; f.appendChild(i); pg.appendChild(f); }
    var meta = h('div', 'pd-meta');
    if (a.extra) meta.appendChild(h('div', 'pd-x', (kind === 'shopping' ? '💰 ' : '🗓 ') + a.extra));
    if (a.name && a.name !== '-') meta.appendChild(h('div', '', (kind === 'shopping' ? '🏪 ' : '👤 ') + a.name));
    if (a.role && a.role !== '-') meta.appendChild(h('div', '', (kind === 'shopping' ? '📞 ' : '📍 ') + a.role));
    if (meta.childNodes.length) pg.appendChild(meta);
    var body = h('div', 'rd-body'); if (a.body !== a.title) String(a.body).replace(/\r/g, '').split(/\n\s*\n/).forEach(function (p) { p = p.trim(); if (p) { var e = h('p'); e.textContent = p; body.appendChild(e); } });
    pg.appendChild(body); rd.append(bar, pg); host.appendChild(rd); back.onclick = closeOv;
  }
  function openForm() {
    closeOv(); var L = S.limits, photo = '', busy = false, t0 = Date.now();
    var fm = h('div', 'fm'), box = h('div', 'fm-box'); fm.appendChild(box);
    box.innerHTML =
      '<div class="fm-hd"><h2>' + C.ico + ' ' + C.head + '</h2><button class="fm-x" type="button" aria-label="மூடு">✕</button></div>' +
      '<p class="fm-note">யார் வேண்டுமானாலும் சேர்க்கலாம். நிர்வாகி ஒப்புதல் அளித்தால் மட்டுமே முதல் பக்கத்தில் தெரியும்.</p>' +
      '<div class="fm-ph"><div class="fm-prev" id="pPv">போஸ்டர்</div><div class="fm-pt"><label class="fm-btn" for="pP" style="margin:0">📷 போஸ்டர் (JPG) தேர்வு *</label><input type="file" id="pP" accept="image/jpeg,image/png,image/*" hidden><div id="pS"></div></div></div>' +
      '<label>' + C.titleL + '<input type="text" id="pT" maxlength="' + L.title + '"></label>' +
      '<label>' + C.extraL + '<input type="text" id="pX" maxlength="' + L.extra + '"></label>' +
      '<label>' + C.nameL + '<input type="text" id="pN" maxlength="' + L.name + '"></label>' +
      '<label>' + C.roleL + '<input type="text" id="pR" maxlength="' + L.role + '"></label>' +
      '<label>' + C.sumL + '<textarea id="pU" maxlength="' + L.summary + '"></textarea></label>' +
      '<label>' + C.bodyL + '<textarea class="lg" id="pG" maxlength="' + L.body + '" style="min-height:140px"></textarea></label>' +
      '<input class="fm-hp" id="pH" type="text" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<div class="fm-err" id="pE" role="alert"></div><button class="fm-btn pri" id="pSub" type="button">சமர்ப்பிக்கவும்</button>' +
      (S.mode === 'local' ? '<div class="fm-mode">சோதனை முறை: இந்தச் சாதனத்தில் மட்டும் சேமிக்கப்படும்.</div>' : '');
    host.appendChild(fm);
    var q = function (s) { return box.querySelector(s); }, err = function (m) { q('#pE').textContent = m || ''; };
    q('.fm-x').onclick = closeOv;
    q('#pP').onchange = function (e) {
      var f = e.target.files[0]; e.target.value = ''; if (!f) return;
      if (!/^image\//.test(f.type)) { err('படக் கோப்பை மட்டும் தேர்வு செய்யவும்'); return; }
      err(''); busy = true; q('#pSub').disabled = true; q('#pS').textContent = 'செயல்படுகிறது…';
      shrink(f, 1100).then(function (d) { photo = d; var im = h('img'); im.src = d; im.alt = ''; var pv = q('#pPv'); pv.innerHTML = ''; pv.appendChild(im); q('#pS').textContent = '✔ படம் சேர்க்கப்பட்டது'; })
        .catch(function (x) { err(x.message); q('#pS').textContent = ''; }).then(function () { busy = false; q('#pSub').disabled = false; });
    };
    q('#pSub').onclick = function () {
      err(''); if (busy) { err('படம் செயல்படுகிறது, சற்று காத்திருக்கவும்'); return; }
      if (q('#pH').value) { closeOv(); return; }
      if (Date.now() - t0 < 3000) { err('சிறிது நேரம் கழித்து மீண்டும் அழுத்தவும்'); return; }
      var last = +localStorage.getItem('np_post_last') || 0; if (Date.now() - last < 20000) { err('அடுத்ததை சிறிது நேரம் கழித்து அனுப்பவும்'); return; }
      var a = { kind: kind, name: q('#pN').value, role: q('#pR').value, title: q('#pT').value, extra: q('#pX').value, summary: q('#pU').value, body: q('#pG').value, photo: photo, cutout: false };
      if (!a.photo) { err('போஸ்டர் (JPG) படத்தைச் சேர்க்கவும்'); return; }
      if (!a.title.trim()) { err('தலைப்பை எழுதவும்'); return; }
      q('#pSub').disabled = true; q('#pSub').textContent = 'அனுப்புகிறது…';
      S.submit(a).then(function () {
        try { localStorage.setItem('np_post_last', String(Date.now())); } catch (e) {}
        box.innerHTML = ''; var ok = h('div', 'fm-ok'); ok.appendChild(h('b', '', '✔ நன்றி!')); ok.append('நிர்வாகியின் ஒப்புதலுக்கு அனுப்பப்பட்டது. ஒப்புதல் கிடைத்ததும் இங்கே தோன்றும்.'); box.appendChild(ok);
        var c = h('button', 'fm-btn pri', 'சரி'); c.onclick = function () { closeOv(); if (S.mode === 'local') load(); }; box.appendChild(c);
      }).catch(function (x) { err('அனுப்ப முடியவில்லை: ' + (x.message || '')); q('#pSub').disabled = false; q('#pSub').textContent = 'சமர்ப்பிக்கவும்'; });
    };
    q('#pT').focus({ preventScroll: true });
  }
  window.PostBoard = {
    mount: function (sc, hostEl, k) { if (k === 'shopping' && window.Market) { Market.mount(sc, hostEl); return; } if (window.Market) Market.unmount(sc); host = hostEl || sc.parentNode; root = sc; kind = k; C = CFG[k]; S = window.ArticleStore.forKind(k); sc.classList.add('art'); closeOv(); load(); },
    unmount: function (sc) { if (window.Market) Market.unmount(sc); if (sc) sc.classList.remove('art'); closeOv(); }
  };
})();
