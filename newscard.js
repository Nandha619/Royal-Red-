/* NEWS CARD — Settings → 🗞 News Card.
   3 templates (Classic · Breaking · Simple) × 3 sizes (4:5 all-apps · 1:1 · 9:16 story/status).
   Everything on the card is editable. The logo can be dragged and pinched on the card itself.
   "Brand" items (logo, QR, tagline, contact, colour) are saved on this device; "News" items (headline, script,
   photo, reporter, date, tag) change for every card — "New news" clears them.
   NewsCard.mount(hostEl) */
(function () {
  'use strict';
  var W = 1080, KEY = 'tk_card';
  var SIZES = [['4:5', 'All apps', 1350], ['1:1', 'Square', 1080], ['9:16', 'Story / Status', 1920]];
  var TPLS = ['📰 Classic', '🔴 Breaking', '✨ Simple'];
  var FONT = '"Noto Sans Tamil","Nirmala UI",Latha,"Tamil Sangam MN","Noto Sans",system-ui,sans-serif';
  var MONTHS = ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'];
  var ACC = [['Purple', '#5b17b5'], ['Red', '#c8102e'], ['Blue', '#1457c7'], ['Green', '#0f8a4b'], ['Orange', '#e8590c'], ['Black', '#1a1a1a']];

  function todayTa() { var d = new Date(); return d.getDate() + '/ ' + MONTHS[d.getMonth()] + '/ ' + d.getFullYear(); }
  var DEF = {
    tpl: 0, fmt: 0,
    logo1: 'கிருஷ்ணகிரி', logo2: 'எக்ஸ்பிரஸ்', logoCol1: '#141414', useAccLogo: true,
    tagline: 'மெய்ப்பொருள் காண்பது அறிவு', contactLbl: 'செய்தி & விளம்பர தொடர்புக்கு', phone: '9489-21-2424',
    acc: '#5b17b5', showQr: true, qrUrl: '',
    tag: 'BREAKING NEWS',
    headline: 'புதிய வீட்டு வசதி வாரியத்திற்கு\nபுதிய தார் சாலை',
    script: 'கிருஷ்ணகிரி புதிய வீட்டு வசதி வாரியப் பகுதி மக்களின் நீண்ட நாள் கோரிக்கையை நிறைவேற்றும் வகையில், கிருஷ்ணகிரி சட்டமன்ற உறுப்பினர் தார் சாலை அமைக்கும் பணியை பூமி பூஜையுடன் துவக்கி வைத்தார்.',
    reporter: '', date: '', caption: '', z: 1, px: 0, py: 0,
    lg: [{ x: 0, y: 0, s: 1 }, { x: 0, y: 0, s: 1 }, { x: 0, y: 0, s: 1 }]
  };
  var S, H = 1350, logoImg = null, qrImg = null, photo = null, cv, root, timer, fontsOK = false, UI = {};
  var HIT = { logo: null, photo: null };   /* rectangles from the last draw, in card pixels */

  function load() {
    var o = {}; try { o = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) {}
    S = Object.assign({}, DEF, o);
    if (!S.date) S.date = todayTa();
    if (!Array.isArray(S.lg) || S.lg.length < 3) S.lg = DEF.lg.map(function (x) { return Object.assign({}, x); });
    S.tpl = Math.max(0, Math.min(2, S.tpl | 0)); S.fmt = Math.max(0, Math.min(2, S.fmt | 0));
    S.logoData = o.logoData || ''; S.qrData = o.qrData || '';
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Could not save — storage is full'); } }
  function toast(m) { var t = document.getElementById('toast'); if (!t) return; t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove('on'); }, 2600); }
  function h(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  var LG = function () { return S.lg[S.tpl]; };

  function css() {
    if (document.getElementById('ncCss')) return;
    var s = document.createElement('style'); s.id = 'ncCss';
    s.textContent =
      '.nc{display:grid;gap:10px;max-width:1100px;margin:0 auto;padding:10px 10px 56px}' +
      '.nc-pv{position:sticky;top:54px;z-index:4;display:grid;place-items:center;padding:6px 0;background:linear-gradient(180deg,var(--s-bg,#15100e) 88%,transparent)}' +
      '.nc-pv canvas{height:min(38vh,540px);width:auto;max-width:100%;border-radius:8px;background:#fff;box-shadow:0 6px 22px rgba(0,0,0,.55);touch-action:none;cursor:grab}' +
      '.nc-ed{display:grid;gap:10px;min-width:0}' +
      '.nc textarea,.nc input[type=text]{width:100%;font:inherit;font-size:14px}' +
      '.nc textarea{min-height:84px;resize:vertical}' +
      '.nc .nc-act{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px}' +
      '.nc .nc-seg{display:flex;gap:6px;flex-wrap:wrap}.nc .nc-seg button{flex:1 1 90px;min-height:40px}' +
      '.nc .nc-seg button[aria-pressed=true]{background:var(--s-acc,#ffc83d);border-color:var(--s-acc,#ffc83d);color:#1a0f0a}' +
      '.nc .nc-seg small{display:block;font-size:10px;font-weight:600;opacity:.8}' +
      '.nc .nc-plat{display:grid;grid-template-columns:repeat(auto-fit,minmax(92px,1fr));gap:8px}' +
      '.nc-th{display:flex;gap:10px;flex-wrap:wrap;align-items:center}' +
      '.nc-th button{width:36px;height:36px;min-height:0;padding:0;border-radius:50%;border:3px solid transparent;cursor:pointer}' +
      '.nc-th button.on{border-color:#fff;transform:scale(1.12)}' +
      '.nc-th input[type=color]{width:44px;height:36px;padding:0;border:0;background:none}' +
      '.nc-tag{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.nc-tag img{height:44px;max-width:120px;object-fit:contain;background:#fff;border-radius:6px;padding:2px}' +
      '@media (min-width:900px){.nc{grid-template-columns:minmax(300px,420px) minmax(0,1fr);align-items:start;column-gap:18px}.nc-pv{grid-column:1;grid-row:1;top:64px;padding:0}.nc-pv canvas{height:auto;width:100%;max-height:calc(100vh - 150px);width:auto;max-width:100%}.nc-ed{grid-column:2;grid-row:1}}';
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
  /* biggest font (≤ max) whose wrapped text fits the box */
  function fit(g, text, wt, max, min, maxW, maxH, lh, maxLines, style) {
    var s = max, lines;
    for (; s >= min; s -= 2) {
      g.font = (style ? style + ' ' : '') + wt + ' ' + s + 'px ' + FONT; lines = wrap(g, text, maxW);
      if (lines.length * s * lh <= maxH && (!maxLines || lines.length <= maxLines)) break;
    }
    return { lines: lines, size: s };
  }
  function rr(g, x, y, w, hh, r) {
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + hh, r); g.arcTo(x + w, y + hh, x, y + hh, r); g.arcTo(x, y + hh, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  function cover(g, im, x, y, w, hh, r) {
    var k = Math.max(w / im.width, hh / im.height) * S.z, dw = im.width * k, dh = im.height * k;
    var mx = Math.max(0, (dw - w) / 2), my = Math.max(0, (dh - hh) / 2);
    var ox = Math.max(-mx, Math.min(mx, S.px)), oy = Math.max(-my, Math.min(my, S.py));
    g.save(); if (r) rr(g, x, y, w, hh, r); else { g.beginPath(); g.rect(x, y, w, hh); } g.clip();
    g.drawImage(im, x + (w - dw) / 2 + ox, y + (hh - dh) / 2 + oy, dw, dh); g.restore();
  }
  function emptyPhoto(g, x, y, w, hh, r, dark) {
    var bg = g.createLinearGradient(0, y, 0, y + hh);
    if (dark) { bg.addColorStop(0, '#1d2433'); bg.addColorStop(1, '#0a0d14'); } else { bg.addColorStop(0, '#dfe1e8'); bg.addColorStop(1, '#bfc3d0'); }
    g.save(); if (r) rr(g, x, y, w, hh, r); else { g.beginPath(); g.rect(x, y, w, hh); } g.clip(); g.fillStyle = bg; g.fillRect(x, y, w, hh);
    g.fillStyle = dark ? 'rgba(255,255,255,.28)' : 'rgba(0,0,0,.33)'; g.font = '700 44px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ADD A PHOTO', x + w / 2, y + hh * (dark ? .3 : .5)); g.restore();
  }
  function shadowOn(g, b, y) { g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = b; g.shadowOffsetY = y || 0; }
  function shadowOff(g) { g.shadowColor = 'transparent'; g.shadowBlur = 0; g.shadowOffsetY = 0; }

  /* logo: drawn inside its box (bx,by,bw,bh), then moved / scaled by the user's finger settings */
  function logo(g, bx, by, bw, bh, plate) {
    var l = LG(), cx = bx + bw / 2 + l.x, cy = by + bh / 2 + l.y;
    g.save(); g.translate(cx, cy); g.scale(l.s, l.s); g.translate(-bw / 2, -bh / 2);
    if (plate) { shadowOn(g, 22, 6); g.fillStyle = 'rgba(255,255,255,.96)'; rr(g, 0, 0, bw, bh, 22); g.fill(); shadowOff(g); }
    var pad = plate ? 14 : 0, iw = bw - pad * 2, ih = bh - pad * 2;
    if (logoImg) {
      var k = Math.min(iw / logoImg.width, ih / logoImg.height), dw = logoImg.width * k, dh = logoImg.height * k;
      g.drawImage(logoImg, pad + (iw - dw) / 2, pad + (ih - dh) / 2, dw, dh);
    } else {
      g.textAlign = 'left'; g.textBaseline = 'middle';
      var a = fit(g, S.logo1, '900', Math.round(ih * .43), 24, iw * .67, ih * .5, 1, 1, 'italic');
      g.font = 'italic 900 ' + a.size + 'px ' + FONT; g.fillStyle = S.logoCol1; g.fillText(S.logo1, pad + 6, pad + ih * .26);
      var b = fit(g, S.logo2, '900', Math.round(ih * .62), 28, iw * .96, ih * .66, 1, 1, 'italic');
      g.font = 'italic 900 ' + b.size + 'px ' + FONT; g.fillStyle = S.useAccLogo ? S.acc : S.logoCol1; g.fillText(S.logo2, pad, pad + ih * .7);
    }
    g.restore();
    HIT.logo = [cx - bw * l.s / 2, cy - bh * l.s / 2, bw * l.s, bh * l.s];
  }
  function qr(g, x, y, s, plate) {
    if (!S.showQr || !qrImg) return;
    if (plate) { shadowOn(g, 18, 4); g.fillStyle = '#fff'; rr(g, x - 8, y - 8, s + 16, s + 16, 14); g.fill(); shadowOff(g); }
    else { g.fillStyle = '#fff'; g.fillRect(x - 4, y - 4, s + 8, s + 8); }
    g.drawImage(qrImg, x, y, s, s);
  }
  function phone(g, x, yc, size, col, right) {
    if (!S.phone) return 0;
    g.textBaseline = 'middle'; g.font = '900 ' + size + 'px ' + FONT;
    var w = g.measureText(S.phone).width, d = size * .95, tot = d + 10 + w, x0 = right ? x - tot : x;
    g.fillStyle = '#25d366'; g.beginPath(); g.arc(x0 + d / 2, yc, d / 2, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.font = '600 ' + Math.round(d * .55) + 'px ' + FONT; g.textAlign = 'center'; g.fillText('☎', x0 + d / 2, yc + 1);
    g.fillStyle = col; g.font = '900 ' + size + 'px ' + FONT; g.textAlign = 'left'; g.fillText(S.phone, x0 + d + 10, yc + 1);
    return tot;
  }

  /* ================= TEMPLATE 1 · CLASSIC (white, newspaper header) ================= */
  function drawClassic(g) {
    var A = S.acc, top = 332, headH = 134, barH = 46, scriptH = Math.round(H * .205), barY = H - barH, scriptY = barY - scriptH, phY = top + headH, phH = scriptY - phY - 6;
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
    logo(g, 24, 6, 780, 276, false);
    qr(g, 818, 14, 250, false);
    /* tagline + date */
    g.textBaseline = 'middle'; g.textAlign = 'left';
    g.fillStyle = A; g.fillRect(0, 293, 118, 5);
    g.font = '800 25px ' + FONT; var tg = '>>> ' + S.tagline, tw = Math.min(g.measureText(tg).width, 650);
    g.fillStyle = A; g.fillText('>>>', 130, 297); var aw = g.measureText('>>> ').width;
    g.fillStyle = '#222'; g.fillText(S.tagline, 130 + aw, 297, 650 - aw);
    g.fillStyle = '#111'; g.fillRect(130 + tw + 12, 295, Math.max(0, 790 - (130 + tw + 12)), 2);
    g.fillStyle = A; g.beginPath(); g.moveTo(822, 280); g.lineTo(1080, 280); g.lineTo(1080, 322); g.lineTo(806, 322); g.closePath(); g.fill();
    g.textAlign = 'center'; g.font = 'italic 800 25px ' + FONT; g.fillStyle = '#fff'; g.fillText(S.date, 944, 302, 252);
    /* headline */
    var f = fit(g, S.headline, '800', 66, 30, W - 70, headH, 1.12, 2), lh = f.size * 1.12;
    g.font = '800 ' + f.size + 'px ' + FONT; g.fillStyle = '#0a0a0a'; g.textAlign = 'center';
    var y0 = top + headH / 2 - (f.lines.length - 1) * lh / 2 + 4;
    f.lines.forEach(function (l, i) { g.fillText(l, W / 2, y0 + i * lh); });
    /* photo */
    HIT.photo = [0, phY, W, phH];
    if (photo) cover(g, photo, 0, phY, W, phH); else emptyPhoto(g, 0, phY, W, phH, 0, false);
    var ag = g.createLinearGradient(0, 0, W, 0); ag.addColorStop(0, A); ag.addColorStop(1, '#ffc83d'); g.fillStyle = ag; g.fillRect(0, phY + phH, W, 6);
    /* script */
    var sy0 = scriptY + 4, sh = scriptH - 8, sf = fit(g, S.script, '700', 42, 20, W - 80, sh, 1.3, 0), sl = sf.size * 1.3;
    g.font = '700 ' + sf.size + 'px ' + FONT; g.fillStyle = '#0a0a0a'; g.textAlign = 'center';
    var sy = sy0 + sh / 2 - (sf.lines.length - 1) * sl / 2;
    sf.lines.forEach(function (l, i) { g.fillText(l, W / 2 - 6, sy + i * sl); });
    g.fillStyle = '#111'; g.fillRect(1064, scriptY + 20, 3, scriptH - 36); g.beginPath(); g.arc(1065.5, barY - 12, 6, 0, 7); g.fill();
    /* bottom bar */
    var bg = g.createLinearGradient(0, 0, 716, 0); bg.addColorStop(0, A); bg.addColorStop(1, A); g.fillStyle = bg; g.fillRect(0, barY, 716, barH);
    g.textAlign = 'left'; g.font = '800 23px ' + FONT; g.fillStyle = '#fff'; var lw = Math.min(g.measureText(S.contactLbl).width, 330);
    g.fillText(S.contactLbl, 24, barY + barH / 2 + 1, 330); phone(g, 24 + lw + 16, barY + barH / 2, 31, '#fff', false);
    if (S.reporter) { g.fillStyle = '#222'; g.textAlign = 'left'; g.font = '700 30px ' + FONT; g.fillText('✍', 782, barY + barH / 2 + 1); g.font = '800 30px ' + FONT; g.fillText(S.reporter, 846, barY + barH / 2 + 1, 205); }
  }

  /* ================= TEMPLATE 2 · BREAKING (full-bleed photo, broadcast look) ================= */
  function drawBreaking(g) {
    var A = S.acc, P = H > 1500 ? 140 : 0, barH = 70, barY = H - P - barH, scriptH = Math.round(H * .15), scriptY = barY - 20 - scriptH,
      headH = Math.round(H * .19), headY = scriptY - 16 - headH, tagH = 68, tagY = headY - tagH - 16;
    g.fillStyle = '#0a0d14'; g.fillRect(0, 0, W, H);
    HIT.photo = [0, 0, W, H];
    if (photo) cover(g, photo, 0, 0, W, H); else emptyPhoto(g, 0, 0, W, H, 0, true);
    var t = g.createLinearGradient(0, 0, 0, 330 + P); t.addColorStop(0, 'rgba(0,0,0,.7)'); t.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = t; g.fillRect(0, 0, W, 330 + P);
    var b = g.createLinearGradient(0, tagY - 160, 0, H); b.addColorStop(0, 'rgba(0,0,0,0)'); b.addColorStop(.45, 'rgba(0,0,0,.78)'); b.addColorStop(1, 'rgba(0,0,0,.95)'); g.fillStyle = b; g.fillRect(0, tagY - 160, W, H - tagY + 160);
    logo(g, 36, 36 + P * .35, 470, 150, true);
    qr(g, W - 36 - 176, 44 + P * .35, 176, true);
    /* tag */
    g.textBaseline = 'middle'; g.textAlign = 'left';
    var tag = (S.tag || '').toUpperCase(), tf = '900 40px ' + FONT; g.font = 'italic ' + tf; var tw = Math.max(120, g.measureText(tag).width) + 70;
    shadowOn(g, 20, 6); g.fillStyle = '#e11d2e'; g.beginPath(); g.moveTo(44 + 20, tagY); g.lineTo(44 + tw + 20, tagY); g.lineTo(44 + tw, tagY + tagH); g.lineTo(44, tagY + tagH); g.closePath(); g.fill(); shadowOff(g);
    g.fillStyle = '#fff'; g.fillRect(44 + 6, tagY + 14, 8, tagH - 28);
    g.fillStyle = '#fff'; g.font = 'italic ' + tf; g.fillText(tag, 44 + 36, tagY + tagH / 2 + 2, tw - 60);
    g.font = '700 27px ' + FONT; g.fillStyle = 'rgba(255,255,255,.92)'; shadowOn(g, 8, 2); g.fillText(S.date, 44 + tw + 40, tagY + tagH / 2 + 2, W - tw - 130); shadowOff(g);
    /* headline */
    var f = fit(g, S.headline, '900', 78, 34, W - 88, headH, 1.14, 3), lh = f.size * 1.14;
    g.font = '900 ' + f.size + 'px ' + FONT; g.fillStyle = '#fff'; g.textAlign = 'left'; shadowOn(g, 14, 3);
    f.lines.forEach(function (l, i) { g.fillText(l, 44, headY + f.size * .6 + i * lh); }); shadowOff(g);
    /* script */
    g.fillStyle = A; g.fillRect(30, scriptY + 4, 7, scriptH - 8);
    var sf = fit(g, S.script, '700', 36, 20, W - 100, scriptH, 1.3, 0), sl = sf.size * 1.3;
    g.font = '700 ' + sf.size + 'px ' + FONT; g.fillStyle = '#f1f1f1'; shadowOn(g, 8, 2);
    var sy = scriptY + scriptH / 2 - (sf.lines.length - 1) * sl / 2;
    sf.lines.forEach(function (l, i) { g.fillText(l, 56, sy + i * sl); }); shadowOff(g);
    /* bar */
    g.fillStyle = A; g.fillRect(0, barY, W, barH);
    g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(0, barY, W, 4);
    g.textAlign = 'left'; g.fillStyle = '#fff'; g.font = '800 23px ' + FONT; var lw = Math.min(g.measureText(S.contactLbl).width, 330);
    g.fillText(S.contactLbl, 32, barY + barH / 2 + 2, 330); phone(g, 32 + lw + 16, barY + barH / 2, 32, '#fff', false);
    if (S.reporter) { g.textAlign = 'right'; g.font = '800 30px ' + FONT; g.fillStyle = '#fff'; g.fillText(S.reporter, W - 32, barY + barH / 2 + 2, 230); var rw = Math.min(g.measureText(S.reporter).width, 230); g.textAlign = 'left'; g.font = '700 28px ' + FONT; g.fillText('✍', W - 32 - rw - 42, barY + barH / 2 + 2); }
  }

  /* ================= TEMPLATE 3 · SIMPLE (clean, rounded photo, footer card) ================= */
  function drawSimple(g) {
    var A = S.acc, P = H > 1500 ? 90 : 0, M = 36, phX = M, phY = M + P, phW = W - 2 * M, phH = Math.round(H * .5),
      headY = phY + phH + 30, headH = Math.round(H * .14), footY = H - P - 100 - 10, ruleY = headY + headH + 6, scriptY = ruleY + 26, scriptH = footY - 16 - scriptY;
    var bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#fbfaf6'); bg.addColorStop(1, '#efece4'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
    HIT.photo = [phX, phY, phW, phH];
    shadowOn(g, 26, 10); g.fillStyle = '#ccc'; rr(g, phX, phY, phW, phH, 30); g.fill(); shadowOff(g);
    if (photo) cover(g, photo, phX, phY, phW, phH, 30); else emptyPhoto(g, phX, phY, phW, phH, 30, false);
    var sh = g.createLinearGradient(0, phY + phH - 220, 0, phY + phH); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.55)');
    g.save(); rr(g, phX, phY, phW, phH, 30); g.clip(); g.fillStyle = sh; g.fillRect(phX, phY + phH - 220, phW, 220); g.restore();
    logo(g, phX + 22, phY + 22, 420, 130, true);
    qr(g, phX + phW - 22 - 150, phY + 22, 150, true);
    /* tag chip + date on photo */
    g.textBaseline = 'middle'; g.textAlign = 'left'; g.font = '900 31px ' + FONT;
    var tag = S.tag || '', tw = Math.max(90, g.measureText(tag).width) + 44, cy = phY + phH - 44;
    g.fillStyle = A; rr(g, phX + 24, cy - 28, tw, 56, 28); g.fill(); g.fillStyle = '#fff'; g.fillText(tag, phX + 24 + 22, cy + 2, tw - 36);
    g.textAlign = 'right'; g.font = '700 26px ' + FONT; g.fillStyle = '#fff'; shadowOn(g, 8, 2); g.fillText(S.date, phX + phW - 26, cy + 2, phW - tw - 90); shadowOff(g);
    /* headline */
    var f = fit(g, S.headline, '800', 62, 30, W - 2 * M - 40, headH, 1.15, 3), lh = f.size * 1.15;
    g.font = '800 ' + f.size + 'px ' + FONT; g.fillStyle = '#12121a'; g.textAlign = 'left';
    f.lines.forEach(function (l, i) { g.fillText(l, M + 14, headY + f.size * .58 + i * lh); });
    g.fillStyle = A; rr(g, M + 14, ruleY, 96, 8, 4); g.fill();
    /* script */
    var sf = fit(g, S.script, '600', 36, 19, W - 2 * M - 40, scriptH, 1.32, 0), sl = sf.size * 1.32;
    g.font = '600 ' + sf.size + 'px ' + FONT; g.fillStyle = '#2b2b33'; g.textAlign = 'left';
    sf.lines.forEach(function (l, i) { g.fillText(l, M + 14, scriptY + sf.size * .6 + i * sl); });
    /* footer card */
    shadowOn(g, 16, 4); g.fillStyle = '#fff'; rr(g, M, footY, W - 2 * M, 100, 26); g.fill(); shadowOff(g);
    g.fillStyle = A; rr(g, M, footY, 12, 100, 6); g.fill();
    g.textBaseline = 'middle';
    if (S.reporter) { g.textAlign = 'left'; g.fillStyle = '#777'; g.font = '700 20px ' + FONT; g.fillText('Reporter', M + 36, footY + 32); g.fillStyle = '#14141c'; g.font = '800 31px ' + FONT; g.fillText('✍ ' + S.reporter, M + 36, footY + 68, 400); }
    else { g.textAlign = 'left'; g.fillStyle = '#555'; g.font = '700 22px ' + FONT; g.fillText(S.contactLbl, M + 36, footY + 50, 520); }
    phone(g, W - M - 30, footY + 50, 34, '#14141c', true);
  }

  function draw() {
    if (!cv) return;
    H = SIZES[S.fmt][2]; if (cv.width !== W) cv.width = W; if (cv.height !== H) cv.height = H;
    cv.style.aspectRatio = W + ' / ' + H;
    var g = cv.getContext('2d'); g.clearRect(0, 0, W, H); shadowOff(g); g.textBaseline = 'middle';
    HIT.logo = null; HIT.photo = null;
    [drawClassic, drawBreaking, drawSimple][S.tpl](g);
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
      if (!qrLib) qrLib = new Promise(function (ok, no) { var s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js'; s.onload = ok; s.onerror = function () { qrLib = null; no(new Error('QR needs internet once — or upload a QR image')); }; document.head.appendChild(s); });
      qrLib.then(make, rej);
    });
  }

  /* ---------- UI helpers ---------- */
  function card(title) { var c = h('div', 'sc'); if (title) c.appendChild(h('h2', '', title)); return c; }
  function lab(t, el) { var l = h('label', '', t); l.appendChild(el); return l; }
  function txt(key, ph) { var i = h('input'); i.type = 'text'; i.value = S[key] || ''; if (ph) i.placeholder = ph; i.oninput = function () { S[key] = i.value; save(); redraw(); }; return i; }
  function area(key, rows) { var t = h('textarea'); t.rows = rows || 3; t.value = S[key] || ''; t.oninput = function () { S[key] = t.value; save(); redraw(); }; return t; }
  function file(label, cls, cb) {
    var l = h('label', cls || 'alt', label), i = h('input'); i.type = 'file'; i.accept = 'image/*'; i.hidden = true; l.style.cursor = 'pointer';
    i.onchange = function () { var f = i.files[0]; i.value = ''; if (f) cb(f); }; l.appendChild(i); return l;
  }
  function btn(label, cls, fn) { var b = h('button', cls || 'alt', label); b.type = 'button'; b.onclick = fn; return b; }
  function slider(get, set, min, max, step) { var r = h('input'); r.type = 'range'; r.min = min; r.max = max; r.step = step; r.value = get(); r.oninput = function () { set(+r.value); save(); redraw(); }; r.sync = function () { r.value = get(); }; return r; }
  function seg(items, get, set) {
    var box = h('div', 'nc-seg');
    items.forEach(function (it, i) { var b = h('button'); b.type = 'button'; b.innerHTML = it; b.onclick = function () { set(i); mark(); }; box.appendChild(b); });
    function mark() { [].forEach.call(box.children, function (b, i) { b.setAttribute('aria-pressed', i === get() ? 'true' : 'false'); }); }
    mark(); return box;
  }
  function syncSliders() { Object.keys(UI).forEach(function (k) { if (UI[k] && UI[k].sync) UI[k].sync(); }); }

  /* ---------- export / share ---------- */
  function toBlob(type) { return new Promise(function (r) { cv.toBlob(r, type, .93); }); }
  function fname(ext) { return 'news-card-' + SIZES[S.fmt][0].replace(':', 'x') + '-' + new Date().toISOString().slice(0, 10) + '.' + ext; }
  function capText() {
    if (S.caption && S.caption.trim()) return S.caption.trim();
    var t = S.headline.replace(/\s*\n\s*/g, ' ').trim();
    return (t ? t + '\n\n' : '') + (S.phone ? S.contactLbl + ' ' + S.phone : '');
  }
  function download(type, ext, quiet) {
    draw(); return toBlob(type).then(function (b) {
      if (!b) { toast('Could not create the image'); return null; }
      var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = fname(ext); document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500); if (!quiet) toast('✔ Saved ' + ext.toUpperCase()); return b;
    });
  }
  function copyText(t) {
    try { if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t).then(function () { return true; }, function () { return false; }); } catch (e) {}
    var a = h('textarea'); a.value = t; a.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(a); a.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) {} a.remove(); return Promise.resolve(ok);
  }
  function nativeShare() {
    draw(); return toBlob('image/jpeg').then(function (b) {
      if (!b) { toast('Could not create the image'); return; }
      var f = new File([b], fname('jpg'), { type: 'image/jpeg' }), cap = capText();
      if (navigator.canShare && navigator.canShare({ files: [f] })) navigator.share({ files: [f], title: cap.split('\n')[0], text: cap }).catch(function () {});
      else { download('image/jpeg', 'jpg', true); copyText(cap); toast('This browser cannot share pictures directly — saved the image and copied the caption'); }
    });
  }
  var PLAT = {
    wa: ['WhatsApp', function (c) { return 'https://wa.me/?text=' + encodeURIComponent(c); }],
    fb: ['Facebook', function () { return 'https://www.facebook.com/'; }],
    ig: ['Instagram', function () { return 'https://www.instagram.com/'; }],
    x: ['X', function (c) { return 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(c.slice(0, 270)); }],
    yt: ['YouTube', function () { return 'https://studio.youtube.com/'; }]
  };
  function toPlatform(k) {
    var cap = capText(), p = PLAT[k];
    download('image/jpeg', 'jpg', true).then(function () { return copyText(cap); }).then(function () {
      toast('Image saved · caption copied — attach the image in ' + p[0]); window.open(p[1](cap), '_blank', 'noopener');
    });
  }

  /* ---------- build ---------- */
  function build(host) {
    host.innerHTML = ''; UI = {};
    var wrapEl = h('div', 'nc'), pv = h('div', 'nc-pv'), ed = h('div', 'nc-ed');
    cv = h('canvas'); cv.width = W; cv.height = SIZES[S.fmt][2]; pv.appendChild(cv); wrapEl.append(pv, ed);

    /* 1 · design */
    var ds = card('Design');
    ds.appendChild(h('p', 'note', 'Template'));
    ds.appendChild(seg(TPLS, function () { return S.tpl; }, function (i) { S.tpl = i; save(); syncSliders(); draw(); }));
    ds.appendChild(h('p', 'note', 'Size — one card for every app'));
    ds.appendChild(seg(SIZES.map(function (s) { return s[0] + '<small>' + s[1] + '</small>'; }), function () { return S.fmt; }, function (i) { S.fmt = i; save(); draw(); }));
    ds.appendChild(h('p', 'note', '4:5 works on Instagram, Facebook, WhatsApp, X and YouTube posts. 1:1 is the safest square. 9:16 is for Stories, Reels covers and WhatsApp Status.'));

    /* 2 · news */
    var nw = card('This news');
    var zr = slider(function () { return S.z; }, function (v) { S.z = v; }, 1, 4, 0.01), pxr = slider(function () { return S.px; }, function (v) { S.px = v; }, -540, 540, 2), pyr = slider(function () { return S.py; }, function (v) { S.py = v; }, -700, 700, 2);
    UI.pz = zr; UI.px = pxr; UI.py = pyr;
    function resetPhoto() { S.z = 1; S.px = 0; S.py = 0; syncSliders(); save(); draw(); }
    var phRow = h('div', 'st-row');
    phRow.append(file('📷 Choose photo', 'btn st-btn primary', function (f) {
      readImg(f, 2000).then(function (c) { photo = c; resetPhoto(); }, function (e) { toast(e.message); });
    }), btn('✖ Remove', 'alt', function () { photo = null; draw(); }), btn('↺ Reset', 'alt', resetPhoto));
    var det = h('details', 'st-sec'); det.appendChild(h('summary', '', '🔍 Photo position — precise'));
    var di = h('div', 'st-native'); di.append(lab('Zoom', zr), lab('← →', pxr), lab('↑ ↓', pyr)); det.appendChild(di);
    var dIn = txt('date', '14/ ஜூலை/ 2026'), dateRow = h('div', 'st-row');
    dateRow.append(lab('Date', dIn), btn('↻ Today', 'alt', function () { S.date = todayTa(); dIn.value = S.date; save(); redraw(); }));
    nw.append(
      lab('Headline (up to 2–3 lines — Enter = new line)', area('headline', 2)),
      phRow, h('p', 'note', 'Drag the photo on the card to move it; pinch (or mouse wheel) to zoom.'), det,
      lab('Script', area('script', 5)),
      lab('Label — “BREAKING NEWS”, “JUST IN”, “செய்தி”… (Breaking & Simple)', txt('tag', 'BREAKING NEWS')),
      lab('Reporter name', txt('reporter', 'நரேஷ்')),
      dateRow,
      btn('🆕 New news (clear headline, script, photo, reporter)', 'alt', function () {
        S.headline = ''; S.script = ''; S.reporter = ''; S.date = todayTa(); S.caption = ''; S.z = 1; S.px = 0; S.py = 0; photo = null; save(); build(host); draw();
      })
    );

    /* 3 · logo position */
    var lp = card('Logo position');
    var ls = slider(function () { return LG().s; }, function (v) { LG().s = v; }, 0.3, 3, 0.01),
      lx = slider(function () { return LG().x; }, function (v) { LG().x = v; }, -560, 560, 2),
      ly = slider(function () { return LG().y; }, function (v) { LG().y = v; }, -700, 700, 2);
    UI.ls = ls; UI.lx = lx; UI.ly = ly;
    lp.append(h('p', 'note', 'Touch the logo on the card and drag it left, right, up or down. Pinch with two fingers to make it bigger or smaller (mouse: wheel). Each template remembers its own logo position.'),
      lab('Size', ls), lab('← Left · Right →', lx), lab('↑ Up · Down ↓', ly),
      btn('↺ Reset logo position', 'alt', function () { S.lg[S.tpl] = { x: 0, y: 0, s: 1 }; syncSliders(); save(); draw(); }));

    /* 4 · share */
    var sh = card('Save & share');
    var ar = h('div', 'nc-act');
    ar.append(btn('↗ Share image', 'st-btn primary', nativeShare), btn('⬇ JPG', 'alt', function () { download('image/jpeg', 'jpg'); }), btn('⬇ PNG', 'alt', function () { download('image/png', 'png'); }));
    var cp = area('caption', 3); cp.placeholder = 'Caption for posts (empty = headline + contact)';
    var pl = h('div', 'nc-plat'); Object.keys(PLAT).forEach(function (k) { pl.appendChild(btn(PLAT[k][0], 'alt', function () { toPlatform(k); })); });
    sh.append(ar, h('p', 'note', '“Share image” opens your phone’s share sheet with the picture attached — choose WhatsApp, Facebook, Instagram, X, YouTube… The buttons below save the picture, copy the caption and open that app so you can attach it.'),
      lab('Caption', cp), pl);

    /* 5 · brand (set once) */
    var br = h('details', 'st-sec'); br.appendChild(h('summary', '', '🏷 Logo image · QR · contact · colour (set once)'));
    var bi = h('div', 'st-native');

    var lg = card('Logo');
    var lgPrev = h('div', 'nc-tag'), lgImg = h('img'); lgImg.style.display = logoImg ? '' : 'none'; if (S.logoData) lgImg.src = S.logoData; lgPrev.appendChild(lgImg);
    lgPrev.append(file('⬆ Upload logo (PNG)', 'alt', function (f) {
      readImg(f, 900, true).then(function (c) { S.logoData = c.toDataURL('image/png'); fromData(S.logoData, function (im) { logoImg = im; lgImg.src = S.logoData; lgImg.style.display = ''; save(); draw(); }); }, function (e) { toast(e.message); });
    }), btn('✖ Use text logo', 'alt', function () { S.logoData = ''; logoImg = null; lgImg.style.display = 'none'; save(); draw(); }));
    var lt = h('label', 'toggle'); lt.appendChild(h('span', '', 'Second logo line uses the card colour'));
    var lc = h('input'); lc.type = 'checkbox'; lc.checked = !!S.useAccLogo; lc.onchange = function () { S.useAccLogo = lc.checked; save(); draw(); }; lt.appendChild(lc);
    lg.append(lgPrev, h('p', 'note', 'No logo image? The card draws the two-line name below.'), lab('Logo line 1', txt('logo1')), lab('Logo line 2', txt('logo2')), lt);

    var qc = card('QR code');
    var qt = h('label', 'toggle'); qt.appendChild(h('span', '', 'Show QR on the card')); var qk = h('input'); qk.type = 'checkbox'; qk.checked = !!S.showQr; qk.onchange = function () { S.showQr = qk.checked; save(); draw(); }; qt.appendChild(qk);
    var qPrev = h('div', 'nc-tag'), qImgEl = h('img'); qImgEl.style.display = qrImg ? '' : 'none'; if (S.qrData) qImgEl.src = S.qrData; qPrev.appendChild(qImgEl);
    var qUrl = txt('qrUrl', 'https://youtube.com/@yourchannel');
    function setQr(d) { S.qrData = d; fromData(d, function (im) { qrImg = im; qImgEl.src = d || ''; qImgEl.style.display = d ? '' : 'none'; save(); draw(); }); }
    qPrev.append(file('⬆ Upload QR image', 'alt', function (f) { readImg(f, 700).then(function (c) { setQr(c.toDataURL('image/png')); }, function (e) { toast(e.message); }); }), btn('✖ Remove', 'alt', function () { setQr(''); }));
    var qGen = btn('⚡ Make QR from the link above', 'alt', function () {
      if (!S.qrUrl.trim()) { toast('Type the link first'); return; }
      qrFromUrl(S.qrUrl.trim()).then(setQr, function (e) { toast(e.message || 'QR failed'); });
    });
    qc.append(qt, lab('Link to put in the QR (website, YouTube channel, WhatsApp…)', qUrl), qGen, qPrev);

    var ct = card('Text & colour'), th = h('div', 'nc-th');
    function themeBtns() {
      th.innerHTML = '';
      ACC.forEach(function (a) { var b = h('button'); b.type = 'button'; b.title = a[0]; b.style.background = a[1]; if (S.acc.toLowerCase() === a[1]) b.className = 'on'; b.onclick = function () { S.acc = a[1]; save(); themeBtns(); draw(); }; th.appendChild(b); });
      var ci = h('input'); ci.type = 'color'; ci.value = S.acc; ci.title = 'My colour'; ci.oninput = function () { S.acc = ci.value; save(); draw(); }; ci.onchange = themeBtns; th.appendChild(ci);
    }
    themeBtns();
    ct.append(lab('Tagline (Classic)', txt('tagline')), lab('Contact line', txt('contactLbl')), lab('Phone / WhatsApp number', txt('phone')), lab('Card colour', th));
    bi.append(lg, qc, ct); br.appendChild(bi);

    ed.append(ds, nw, lp, sh, br);
    host.appendChild(wrapEl);
    bindGestures();
  }

  /* ---------- finger gestures: logo (drag + pinch) · photo (drag + pinch) ---------- */
  function bindGestures() {
    var pts = {}, mode = null, last = null, d0 = 0, base = 1;
    function toCard(e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H]; }
    function inR(p, r) { return r && p[0] >= r[0] && p[0] <= r[0] + r[2] && p[1] >= r[1] && p[1] <= r[1] + r[3]; }
    function pick(e) { var p = toCard(e); return inR(p, HIT.logo) ? 'logo' : (photo && inR(p, HIT.photo) ? 'photo' : null); }
    function zRange() { return mode === 'logo' ? [0.3, 3] : [1, 4]; }
    function getZ() { return mode === 'logo' ? LG().s : S.z; }
    function setZ(v) { var r = zRange(); v = Math.max(r[0], Math.min(r[1], v)); if (mode === 'logo') LG().s = v; else S.z = v; }
    function dist() { var k = Object.keys(pts); return Math.hypot(pts[k[0]][0] - pts[k[1]][0], pts[k[0]][1] - pts[k[1]][1]); }
    cv.addEventListener('pointerdown', function (e) {
      var n = Object.keys(pts).length;
      if (n === 0) { mode = pick(e); if (!mode) return; }
      else if (!mode) return;
      pts[e.pointerId] = [e.clientX, e.clientY]; try { cv.setPointerCapture(e.pointerId); } catch (x) {}
      last = [e.clientX, e.clientY];
      if (Object.keys(pts).length === 2) { d0 = dist(); base = getZ(); }
      cv.style.cursor = 'grabbing'; e.preventDefault();
    });
    cv.addEventListener('pointermove', function (e) {
      if (!pts[e.pointerId]) {
        if (!Object.keys(pts).length) { var m = pick(e); cv.style.cursor = m ? 'grab' : 'default'; }
        return;
      }
      pts[e.pointerId] = [e.clientX, e.clientY];
      if (Object.keys(pts).length >= 2) { if (d0 > 5) { setZ(base * dist() / d0); draw(); } }
      else if (last) {
        var s = W / cv.getBoundingClientRect().width, dx = (e.clientX - last[0]) * s, dy = (e.clientY - last[1]) * s; last = [e.clientX, e.clientY];
        if (mode === 'logo') { LG().x += dx; LG().y += dy; } else { S.px += dx; S.py += dy; }
        draw();
      }
    });
    function up(e) {
      delete pts[e.pointerId]; var k = Object.keys(pts);
      last = k.length === 1 ? pts[k[0]].slice() : null; if (k.length === 1) { d0 = 0; }
      if (!k.length) { mode = null; cv.style.cursor = ''; syncSliders(); save(); }
    }
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', function (e) {
      var m = pick(e); if (!m) return; e.preventDefault(); var keep = mode; mode = m;
      setZ(getZ() * (e.deltaY < 0 ? 1.06 : 0.94)); mode = keep; draw(); syncSliders(); save();
    }, { passive: false });
  }

  function mount(host) {
    css(); load(); root = host;
    fromData(S.logoData, function (im) { logoImg = im; draw(); });
    fromData(S.qrData, function (im) { qrImg = im; draw(); });
    build(host); fonts(); draw();
  }
  window.NewsCard = { mount: mount, draw: draw };
})();
