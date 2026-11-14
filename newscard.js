/* NEWS CARD — Settings → 🗞 News Card.
   One-photo news poster (1080×1350, 4:5): logo · QR · tagline · date · headline · photo · script · contact bar · reporter.
   Everything on the card is editable. "Brand" items (logo, QR, tagline, contact, colour) are saved on this device;
   "News" items (headline, script, photo, reporter, date) change for every card — "New news" clears them.
   NewsCard.mount(hostEl) */
(function () {
  'use strict';
  var W = 1080, H = 1350, KEY = 'tk_card';
  var FONT = '"Noto Sans Tamil","Nirmala UI",Latha,"Tamil Sangam MN","Noto Sans",system-ui,sans-serif';
  var MONTHS = ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'];
  var ACC = [['Purple', '#5b17b5'], ['Red', '#c8102e'], ['Blue', '#1457c7'], ['Green', '#0f8a4b'], ['Orange', '#e8590c'], ['Black', '#1a1a1a']];

  function todayTa() { var d = new Date(); return d.getDate() + '/ ' + MONTHS[d.getMonth()] + '/ ' + d.getFullYear(); }
  var DEF = {
    logo1: 'கிருஷ்ணகிரி', logo2: 'எக்ஸ்பிரஸ்', logoCol1: '#141414', useAccLogo: true,
    tagline: 'மெய்ப்பொருள் காண்பது அறிவு', contactLbl: 'செய்தி & விளம்பர தொடர்புக்கு', phone: '9489-21-2424',
    acc: '#5b17b5', showQr: true, qrUrl: '',
    headline: 'புதிய வீட்டு வசதி வாரியத்திற்கு\nபுதிய தார் சாலை',
    script: 'கிருஷ்ணகிரி புதிய வீட்டு வசதி வாரியப் பகுதி மக்களின் நீண்ட நாள் கோரிக்கையை நிறைவேற்றும் வகையில், கிருஷ்ணகிரி சட்டமன்ற உறுப்பினர் தார் சாலை அமைக்கும் பணியை பூமி பூஜையுடன் துவக்கி வைத்தார்.',
    reporter: '', date: '', z: 1, px: 0, py: 0
  };
  var S, logoImg = null, qrImg = null, photo = null, cv, root, timer, fontsOK = false;

  function load() {
    var o = {}; try { o = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) {}
    S = Object.assign({}, DEF, o); if (!S.date) S.date = todayTa();
    S.logoData = o.logoData || ''; S.qrData = o.qrData || '';
  }
  function save() { try { var o = Object.assign({}, S); localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { toast('Could not save — storage is full'); } }
  function toast(m) { var t = document.getElementById('toast'); if (!t) return; t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove('on'); }, 2400); }
  function h(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function css() {
    if (document.getElementById('ncCss')) return;
    var s = document.createElement('style'); s.id = 'ncCss';
    s.textContent =
      '.nc{display:grid;gap:10px;max-width:1100px;margin:0 auto;padding:10px 10px 56px}' +
      '.nc-pv{position:sticky;top:54px;z-index:4;display:grid;place-items:center;padding:6px 0;background:linear-gradient(180deg,var(--s-bg,#15100e) 88%,transparent)}' +
      '.nc-pv canvas{height:min(36vh,520px);aspect-ratio:4/5;width:auto;max-width:100%;border-radius:8px;background:#fff;box-shadow:0 6px 22px rgba(0,0,0,.55);touch-action:none;cursor:grab}' +
      '.nc-ed{display:grid;gap:10px;min-width:0}' +
      '.nc textarea,.nc input[type=text]{width:100%;font:inherit;font-size:14px}' +
      '.nc textarea{min-height:84px;resize:vertical}' +
      '.nc .nc-act{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px}' +
      '.nc-th{display:flex;gap:10px;flex-wrap:wrap;align-items:center}' +
      '.nc-th button{width:36px;height:36px;min-height:0;padding:0;border-radius:50%;border:3px solid transparent;cursor:pointer}' +
      '.nc-th button.on{border-color:#fff;transform:scale(1.12)}' +
      '.nc-th input[type=color]{width:44px;height:36px;padding:0;border:0;background:none}' +
      '.nc-tag{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.nc-tag img{height:44px;max-width:120px;object-fit:contain;background:#fff;border-radius:6px;padding:2px}' +
      '@media (min-width:900px){.nc{grid-template-columns:minmax(300px,420px) minmax(0,1fr);align-items:start;column-gap:18px}.nc-pv{grid-column:1;grid-row:1;top:64px;padding:0}.nc-pv canvas{height:auto;width:100%;max-height:calc(100vh - 150px);aspect-ratio:4/5}.nc-ed{grid-column:2;grid-row:1}}';
    document.head.appendChild(s);
    if (!document.getElementById('ncFont')) {
      var l = document.createElement('link'); l.id = 'ncFont'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@600;800;900&display=swap'; document.head.appendChild(l);
    }
  }
  function fonts() {
    if (fontsOK || !document.fonts || !document.fonts.load) { fontsOK = true; return; }
    Promise.all(['600', '800', '900'].map(function (w) { return document.fonts.load(w + ' 40px "Noto Sans Tamil"', 'தமிழ்'); }))
      .then(function () { fontsOK = true; draw(); }, function () { fontsOK = true; });
  }

  /* ---------- drawing helpers ---------- */
  function wrap(g, text, maxW) {
    var out = [];
    String(text || '').split('\n').forEach(function (para) {
      var words = para.split(/\s+/).filter(Boolean), line = '';
      if (!words.length) { out.push(''); return; }
      words.forEach(function (w) {
        var t = line ? line + ' ' + w : w;
        if (g.measureText(t).width <= maxW || !line) line = t; else { out.push(line); line = w; }
      });
      out.push(line);
    });
    return out;
  }
  /* biggest font (≤ max) whose wrapped text fits the box; returns {lines,size} */
  function fit(g, text, wt, max, min, maxW, maxH, lh, maxLines) {
    var s = max, lines;
    for (; s >= min; s -= 2) {
      g.font = wt + ' ' + s + 'px ' + FONT; lines = wrap(g, text, maxW);
      if (lines.length * s * lh <= maxH && (!maxLines || lines.length <= maxLines)) break;
    }
    return { lines: lines, size: s };
  }
  function cover(g, im, x, y, w, hh, z, px, py) {
    var k = Math.max(w / im.width, hh / im.height) * z, dw = im.width * k, dh = im.height * k;
    var mx = Math.max(0, (dw - w) / 2), my = Math.max(0, (dh - hh) / 2);
    var ox = Math.max(-mx, Math.min(mx, px)), oy = Math.max(-my, Math.min(my, py));
    g.save(); g.beginPath(); g.rect(x, y, w, hh); g.clip();
    g.drawImage(im, x + (w - dw) / 2 + ox, y + (hh - dh) / 2 + oy, dw, dh); g.restore();
  }
  function contain(g, im, x, y, w, hh) {
    var k = Math.min(w / im.width, hh / im.height), dw = im.width * k, dh = im.height * k;
    g.drawImage(im, x, y + (hh - dh) / 2, dw, dh);
  }
  var R = { photo: [0, 468, W, 545], head: [0, 332, W, 134], script: [28, 1020, 1004, 276] };

  function draw() {
    if (!cv) return;
    var g = cv.getContext('2d'), A = S.acc || '#5b17b5';
    g.clearRect(0, 0, W, H); g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
    g.textBaseline = 'middle';

    /* ---- logo ---- */
    if (logoImg) contain(g, logoImg, 24, 6, 780, 276);
    else {
      g.textAlign = 'left';
      var a = fit(g, S.logo1, 'italic 900', 118, 40, 520, 140, 1, 1);
      g.font = 'italic 900 ' + a.size + 'px ' + FONT; g.fillStyle = S.logoCol1; g.fillText(S.logo1, 52, 92);
      var b = fit(g, S.logo2, 'italic 900', 170, 50, 740, 190, 1, 1);
      g.font = 'italic 900 ' + b.size + 'px ' + FONT; g.fillStyle = S.useAccLogo ? A : S.logoCol1; g.fillText(S.logo2, 46, 205);
    }
    /* ---- QR ---- */
    if (S.showQr && qrImg) { g.fillStyle = '#fff'; g.fillRect(814, 10, 258, 258); g.drawImage(qrImg, 818, 14, 250, 250); }
    /* ---- tagline + date ---- */
    g.fillStyle = '#111'; g.fillRect(0, 293, 118, 4);
    g.textAlign = 'left'; g.font = '800 25px ' + FONT; g.fillStyle = '#222';
    var tg = '>>> ' + S.tagline, tw = Math.min(g.measureText(tg).width, 650);
    g.fillText(tg, 130, 296, 650);
    g.fillRect(130 + tw + 10, 294, Math.max(0, 790 - (130 + tw + 10)), 2);
    g.fillStyle = A; g.fillRect(806, 280, 274, 42);
    g.textAlign = 'center'; g.font = 'italic 800 25px ' + FONT; g.fillStyle = '#fff'; g.fillText(S.date, 943, 302, 258);

    /* ---- headline ---- */
    var hr = R.head, f = fit(g, S.headline, '800', 66, 30, W - 70, hr[3], 1.12, 2), lh = f.size * 1.12;
    g.font = '800 ' + f.size + 'px ' + FONT; g.fillStyle = '#0a0a0a'; g.textAlign = 'center';
    var y0 = hr[1] + hr[3] / 2 - (f.lines.length - 1) * lh / 2 + 4;
    f.lines.forEach(function (l, i) { g.fillText(l, W / 2, y0 + i * lh); });

    /* ---- photo ---- */
    var pr = R.photo;
    if (photo) cover(g, photo, pr[0], pr[1], pr[2], pr[3], S.z, S.px, S.py);
    else {
      var bg = g.createLinearGradient(0, pr[1], 0, pr[1] + pr[3]); bg.addColorStop(0, '#d9dbe3'); bg.addColorStop(1, '#bfc3d0');
      g.fillStyle = bg; g.fillRect(pr[0], pr[1], pr[2], pr[3]);
      g.fillStyle = 'rgba(0,0,0,.35)'; g.font = '700 44px ' + FONT; g.fillText('ADD A PHOTO', W / 2, pr[1] + pr[3] / 2);
    }

    /* ---- script ---- */
    var sr = R.script, sf = fit(g, S.script, '700', 42, 20, sr[2], sr[3], 1.3, 0), sl = sf.size * 1.3;
    g.font = '700 ' + sf.size + 'px ' + FONT; g.fillStyle = '#0a0a0a'; g.textAlign = 'center';
    var sy = sr[1] + sr[3] / 2 - (sf.lines.length - 1) * sl / 2;
    sf.lines.forEach(function (l, i) { g.fillText(l, sr[0] + sr[2] / 2, sy + i * sl); });
    /* side rule */
    g.fillStyle = '#111'; g.fillRect(1064, 1040, 3, 270); g.beginPath(); g.arc(1065.5, 1316, 6, 0, 7); g.fill();

    /* ---- contact bar ---- */
    g.fillStyle = A; g.fillRect(0, 1306, 716, 44);
    g.textAlign = 'left'; g.font = '800 23px ' + FONT; g.fillStyle = '#fff';
    var lbl = S.contactLbl; g.fillText(lbl, 24, 1329, 330);
    var lx = 24 + Math.min(g.measureText(lbl).width, 330) + 16;
    if (S.phone) {
      g.fillStyle = '#25d366'; g.beginPath(); g.arc(lx + 15, 1328, 15, 0, 7); g.fill();
      g.fillStyle = '#fff'; g.font = '600 18px ' + FONT; g.textAlign = 'center'; g.fillText('☎', lx + 15, 1329);
      g.textAlign = 'left'; g.font = '900 32px ' + FONT; g.fillText(S.phone, lx + 38, 1329, 716 - lx - 50);
    }
    /* ---- reporter ---- */
    if (S.reporter) {
      g.fillStyle = '#222'; g.textAlign = 'left'; g.font = '700 30px ' + FONT;
      g.fillText('✍', 782, 1329); g.font = '800 30px ' + FONT; g.fillText(S.reporter, 846, 1329, 215);
    }
  }
  function redraw() { clearTimeout(timer); timer = setTimeout(draw, 30); }

  /* ---------- images ---------- */
  function readImg(file, max, png) {
    return new Promise(function (res, rej) {
      var u = URL.createObjectURL(file), im = new Image();
      im.onload = function () {
        var k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(im.width * k)); c.height = Math.max(1, Math.round(im.height * k));
        var g = c.getContext('2d'); if (!png) { g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); }
        g.drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); res(c);
      };
      im.onerror = function () { URL.revokeObjectURL(u); rej(new Error('Could not read that image')); }; im.src = u;
    });
  }
  function fromData(d, cb) { if (!d) { cb(null); return; } var im = new Image(); im.onload = function () { cb(im); }; im.onerror = function () { cb(null); }; im.src = d; }

  var qrLib = null;
  function qrFromUrl(txt) {
    return new Promise(function (res, rej) {
      function make() {
        try {
          var q = window.qrcode(0, 'M'); q.addData(txt); q.make();
          var n = q.getModuleCount(), px = 12, m = 2, c = document.createElement('canvas'); c.width = c.height = (n + m * 2) * px;
          var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.fillStyle = '#000';
          for (var r = 0; r < n; r++) for (var k = 0; k < n; k++) if (q.isDark(r, k)) g.fillRect((k + m) * px, (r + m) * px, px, px);
          res(c.toDataURL('image/png'));
        } catch (e) { rej(e); }
      }
      if (window.qrcode) { make(); return; }
      if (!qrLib) qrLib = new Promise(function (ok, no) { var s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js'; s.onload = ok; s.onerror = function () { no(new Error('QR needs internet once — or upload a QR image')); }; document.head.appendChild(s); });
      qrLib.then(make, rej);
    });
  }

  /* ---------- UI ---------- */
  function card(title) { var c = h('div', 'sc'); if (title) c.appendChild(h('h2', '', title)); return c; }
  function lab(t, el) { var l = h('label', '', t); l.appendChild(el); return l; }
  function txt(key, ph) { var i = h('input'); i.type = 'text'; i.value = S[key] || ''; if (ph) i.placeholder = ph; i.oninput = function () { S[key] = i.value; save(); redraw(); }; return i; }
  function area(key, rows) { var t = h('textarea'); t.rows = rows || 3; t.value = S[key] || ''; t.oninput = function () { S[key] = t.value; save(); redraw(); }; return t; }
  function file(label, cls, cb) {
    var l = h('label', cls || 'alt', label), i = h('input'); i.type = 'file'; i.accept = 'image/*'; i.hidden = true; l.style.cursor = 'pointer';
    i.onchange = function () { var f = i.files[0]; i.value = ''; if (f) cb(f); }; l.appendChild(i); return l;
  }
  function btn(label, cls, fn) { var b = h('button', cls || 'alt', label); b.type = 'button'; b.onclick = fn; return b; }
  function range(key, min, max, step, onch) { var r = h('input'); r.type = 'range'; r.min = min; r.max = max; r.step = step; r.value = S[key]; r.oninput = function () { S[key] = +r.value; save(); redraw(); if (onch) onch(); }; return r; }

  function toBlob(type) { return new Promise(function (r) { cv.toBlob(r, type, .95); }); }
  function fname(ext) { return 'news-card-' + new Date().toISOString().slice(0, 10) + '.' + ext; }
  function download(type, ext) {
    draw(); toBlob(type).then(function (b) {
      if (!b) { toast('Could not create the image'); return; }
      var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = fname(ext); document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500); toast('✔ Saved ' + ext.toUpperCase());
    });
  }
  function share() {
    draw(); toBlob('image/jpeg').then(function (b) {
      if (!b) { toast('Could not create the image'); return; }
      var f = new File([b], fname('jpg'), { type: 'image/jpeg' });
      if (navigator.canShare && navigator.canShare({ files: [f] })) {
        navigator.share({ files: [f], title: S.headline.replace(/\n/g, ' '), text: S.headline.replace(/\n/g, ' ') }).catch(function () {});
      } else { download('image/jpeg', 'jpg'); toast('Sharing is not supported here — saved instead. Send it from your gallery.'); }
    });
  }

  function build(host) {
    host.innerHTML = '';
    var wrapEl = h('div', 'nc'), pv = h('div', 'nc-pv'), ed = h('div', 'nc-ed');
    cv = h('canvas'); cv.width = W; cv.height = H; pv.appendChild(cv); wrapEl.append(pv, ed);

    /* actions */
    var act = card('Save / share'), ar = h('div', 'nc-act');
    ar.append(btn('⬇ JPG', 'st-btn primary', function () { download('image/jpeg', 'jpg'); }), btn('⬇ PNG', 'alt', function () { download('image/png', 'png'); }), btn('↗ Share', 'alt', share));
    act.appendChild(ar); act.appendChild(h('p', 'note', 'Drag the photo on the card to move it; pinch or use the zoom slider to resize it.'));

    /* news (changes every time) */
    var nw = card('1 · This news');
    var dateRow = h('div', 'st-row'), dIn = txt('date', '14/ ஜூலை/ 2026');
    dateRow.append(lab('Date', dIn), btn('↻ Today', 'alt', function () { S.date = todayTa(); dIn.value = S.date; save(); redraw(); }));
    var zr = range('z', 1, 4, 0.01), pxr = range('px', -540, 540, 2), pyr = range('py', -300, 300, 2);
    var phRow = h('div', 'st-row');
    phRow.append(file('📷 Choose photo', 'btn st-btn primary', function (f) {
      readImg(f, 1800).then(function (c) { photo = c; S.z = 1; S.px = 0; S.py = 0; zr.value = 1; pxr.value = 0; pyr.value = 0; save(); draw(); }, function (e) { toast(e.message); });
    }), btn('✖ Remove', 'alt', function () { photo = null; draw(); }), btn('↺ Reset zoom', 'alt', function () { S.z = 1; S.px = 0; S.py = 0; zr.value = 1; pxr.value = 0; pyr.value = 0; save(); draw(); }));
    var det = h('details', 'st-sec'); det.appendChild(h('summary', '', '🔍 Photo position — precise'));
    var di = h('div', 'st-native'); di.append(lab('Zoom', zr), lab('← →', pxr), lab('↑ ↓', pyr)); det.appendChild(di);
    nw.append(
      lab('Headline (up to 2 lines — press Enter for a new line)', area('headline', 2)),
      phRow, det,
      lab('Script', area('script', 5)),
      lab('Reporter name', txt('reporter', 'நரேஷ்')),
      dateRow,
      btn('🆕 New news (clear headline, script, photo, reporter)', 'alt', function () {
        S.headline = ''; S.script = ''; S.reporter = ''; S.date = todayTa(); S.z = 1; S.px = 0; S.py = 0; photo = null; save(); build(host); draw();
      })
    );

    /* brand (set once) */
    var br = h('details', 'st-sec'); br.appendChild(h('summary', '', '🏷 Logo · QR · contact · colour (set once)'));
    var bi = h('div', 'st-native');

    var lg = card('Logo');
    var lgPrev = h('div', 'nc-tag'), lgImg = h('img'); lgImg.style.display = logoImg ? '' : 'none'; if (S.logoData) lgImg.src = S.logoData; lgPrev.appendChild(lgImg);
    lgPrev.append(file('⬆ Upload logo (PNG)', 'alt', function (f) {
      readImg(f, 900, true).then(function (c) { S.logoData = c.toDataURL('image/png'); fromData(S.logoData, function (im) { logoImg = im; lgImg.src = S.logoData; lgImg.style.display = ''; save(); draw(); }); }, function (e) { toast(e.message); });
    }), btn('✖ Use text logo', 'alt', function () { S.logoData = ''; logoImg = null; lgImg.style.display = 'none'; save(); draw(); }));
    var ltoggle = h('label', 'toggle'); ltoggle.appendChild(h('span', '', 'Second logo line uses the card colour'));
    var lc = h('input'); lc.type = 'checkbox'; lc.checked = !!S.useAccLogo; lc.onchange = function () { S.useAccLogo = lc.checked; save(); draw(); }; ltoggle.appendChild(lc);
    lg.append(lgPrev, h('p', 'note', 'No logo image? The card draws the two-line name below.'), lab('Logo line 1', txt('logo1')), lab('Logo line 2', txt('logo2')), ltoggle);

    var qc = card('QR code');
    var qt = h('label', 'toggle'); qt.appendChild(h('span', '', 'Show QR on the card')); var qk = h('input'); qk.type = 'checkbox'; qk.checked = !!S.showQr; qk.onchange = function () { S.showQr = qk.checked; save(); draw(); }; qt.appendChild(qk);
    var qPrev = h('div', 'nc-tag'), qImgEl = h('img'); qImgEl.style.display = qrImg ? '' : 'none'; if (S.qrData) qImgEl.src = S.qrData; qPrev.appendChild(qImgEl);
    var qUrl = txt('qrUrl', 'https://youtube.com/@yourchannel');
    function setQr(d) { S.qrData = d; fromData(d, function (im) { qrImg = im; qImgEl.src = d || ''; qImgEl.style.display = d ? '' : 'none'; save(); draw(); }); }
    qPrev.append(file('⬆ Upload QR image', 'alt', function (f) { readImg(f, 700).then(function (c) { setQr(c.toDataURL('image/png')); }, function (e) { toast(e.message); }); }),
      btn('✖ Remove', 'alt', function () { setQr(''); }));
    var qGen = btn('⚡ Make QR from the link above', 'alt', function () {
      if (!S.qrUrl.trim()) { toast('Type the link first'); return; }
      qrFromUrl(S.qrUrl.trim()).then(setQr, function (e) { toast(e.message || 'QR failed'); });
    });
    qc.append(qt, lab('Link to put in the QR (website, YouTube channel, WhatsApp…)', qUrl), qGen, qPrev);

    var ct = card('Text & colour');
    var th = h('div', 'nc-th');
    function themeBtns() {
      th.innerHTML = '';
      ACC.forEach(function (a) { var b = h('button'); b.type = 'button'; b.title = a[0]; b.style.background = a[1]; if (S.acc.toLowerCase() === a[1]) b.className = 'on'; b.onclick = function () { S.acc = a[1]; save(); themeBtns(); draw(); }; th.appendChild(b); });
      var ci = h('input'); ci.type = 'color'; ci.value = S.acc; ci.title = 'My colour'; ci.oninput = function () { S.acc = ci.value; save(); draw(); }; ci.onchange = themeBtns; th.appendChild(ci);
    }
    themeBtns();
    ct.append(lab('Tagline (under the logo)', txt('tagline')), lab('Contact line', txt('contactLbl')), lab('Phone / WhatsApp number', txt('phone')), lab('Card colour (date tag, contact bar)', th));
    bi.append(lg, qc, ct); br.appendChild(bi);

    ed.append(act, nw, br);
    host.appendChild(wrapEl);
    bindDrag();
  }

  /* ---------- drag / pinch / wheel on the photo ---------- */
  function bindDrag() {
    var pts = {}, last = null, d0 = 0, z0 = 1;
    function inPhoto(e) {
      var r = cv.getBoundingClientRect(), y = (e.clientY - r.top) / r.height * H;
      return y >= R.photo[1] && y <= R.photo[1] + R.photo[3];
    }
    function scale() { return W / cv.getBoundingClientRect().width; }
    cv.addEventListener('pointerdown', function (e) {
      if (!photo || !inPhoto(e)) return;
      pts[e.pointerId] = [e.clientX, e.clientY]; cv.setPointerCapture(e.pointerId); last = [e.clientX, e.clientY];
      var k = Object.keys(pts); if (k.length === 2) { d0 = Math.hypot(pts[k[0]][0] - pts[k[1]][0], pts[k[0]][1] - pts[k[1]][1]); z0 = S.z; }
      cv.style.cursor = 'grabbing';
    });
    cv.addEventListener('pointermove', function (e) {
      if (!pts[e.pointerId]) return;
      pts[e.pointerId] = [e.clientX, e.clientY]; var k = Object.keys(pts);
      if (k.length >= 2) {
        var d = Math.hypot(pts[k[0]][0] - pts[k[1]][0], pts[k[0]][1] - pts[k[1]][1]);
        if (d0 > 5) { S.z = Math.max(1, Math.min(4, z0 * d / d0)); draw(); }
      } else if (last) {
        var s = scale(); S.px += (e.clientX - last[0]) * s; S.py += (e.clientY - last[1]) * s; last = [e.clientX, e.clientY]; draw();
      }
    });
    function up(e) { delete pts[e.pointerId]; last = Object.keys(pts).length === 1 ? pts[Object.keys(pts)[0]] : null; if (!Object.keys(pts).length) { cv.style.cursor = ''; syncSliders(); save(); } }
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', function (e) { if (!photo || !inPhoto(e)) return; e.preventDefault(); S.z = Math.max(1, Math.min(4, S.z * (e.deltaY < 0 ? 1.06 : 0.94))); draw(); syncSliders(); save(); }, { passive: false });
  }
  function syncSliders() {
    var sl = root && root.querySelectorAll('input[type=range]'); if (!sl) return;
    var v = [S.z, S.px, S.py]; [].forEach.call(sl, function (r, i) { if (v[i] != null) r.value = v[i]; });
  }

  function mount(host) {
    css(); load(); root = host;
    fromData(S.logoData, function (im) { logoImg = im; draw(); });
    fromData(S.qrData, function (im) { qrImg = im; draw(); });
    build(host); fonts(); draw();
  }
  window.NewsCard = { mount: mount, draw: draw };
})();
