/* flipbook.js — FlippingBook பாணி PDF வாசிப்பு.
   - அகலத் திரையில் இரட்டைப் பக்கம் (முகப்பு அட்டை தனியாக), மொபைலில் ஒற்றைப் பக்கம்
   - பக்கம் உண்மையாக வளைந்து புரளும் (3D strips), நிழல், புத்தக விளிம்பு தடிமன்
   - இழுத்துப் புரட்டு · ஓரத்தைத் தொடு · அம்புக்குறி · slider · thumbnails · zoom · முழுத்திரை · ஒலி
   பயன்பாடு: var fb = new FlipBook(hostEl, {layout:()=>'auto', isActive:()=>true, onPage:fn, toast:fn});
              fb.open(pdfDoc, startPageIndex) */
(function () {
  'use strict';

  var CSS = '' +
    '.fb-root{position:absolute;inset:0;overflow:hidden;display:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;' +
    'background:radial-gradient(ellipse at 50% 38%,#4b4b4f 0%,#26262a 55%,#131316 100%);color:#fff;font-family:inherit}' +
    '.fb-root.on{display:block}' +
    '.fb-view{position:absolute;left:0;right:0;top:0;bottom:var(--fbBar,76px);touch-action:none;overflow:hidden;cursor:grab}' +
    '.fb-view.drag{cursor:grabbing}' +
    '.fb-min .fb-bar,.fb-min .fb-nav,.fb-min .fb-thumbs{display:none!important}' +
    '.fb-pill{display:none;position:absolute;left:50%;bottom:calc(10px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:5;padding:5px 12px;border-radius:99px;background:rgba(0,0,0,.5);color:#fff;font:700 12px/1 inherit;font-variant-numeric:tabular-nums;pointer-events:none;opacity:.85}' +
    '.fb-min .fb-pill{display:block}' +
    '.fb-zoom{position:absolute;left:50%;top:50%;transform-origin:50% 50%;will-change:transform}' +
    '.fb-book{position:relative;width:100%;height:100%}' +
    '.fb-pg{position:absolute;top:0;background:#f6f6f6 center/100% 100% no-repeat;overflow:hidden}' +
    '.fb-pg.loading:before{content:"";position:absolute;left:50%;top:50%;width:26px;height:26px;margin:-13px 0 0 -13px;border:3px solid rgba(0,0,0,.15);border-top-color:#888;border-radius:50%;animation:fbspin .8s linear infinite}' +
    '@keyframes fbspin{to{transform:rotate(360deg)}}' +
    '.fb-pg:after{content:"";position:absolute;inset:0;pointer-events:none}' +
    '.fb-L:after{background:linear-gradient(to left,rgba(0,0,0,.30),rgba(0,0,0,.10) 7%,rgba(0,0,0,0) 20%)}' +
    '.fb-R:after{background:linear-gradient(to right,rgba(0,0,0,.30),rgba(0,0,0,.10) 7%,rgba(0,0,0,0) 20%)}' +
    '.fb-single .fb-R:after{background:linear-gradient(to right,rgba(0,0,0,.14),rgba(0,0,0,0) 6%)}' +
    '.fb-sh{position:absolute;top:0;pointer-events:none;opacity:0}' +
    '.fb-shR{background:linear-gradient(to right,rgba(0,0,0,.45),rgba(0,0,0,.18) 35%,rgba(0,0,0,0) 75%)}' +
    '.fb-shL{background:linear-gradient(to left,rgba(0,0,0,.40),rgba(0,0,0,.15) 35%,rgba(0,0,0,0) 75%)}' +
    '.fb-leaf{position:absolute;top:0;display:none;transform-style:preserve-3d;pointer-events:none}' +
    '.fb-strip{position:absolute;top:0;left:0;transform-style:preserve-3d;transform-origin:0 50%;will-change:transform}' +
    '.fb-face{position:absolute;top:0;left:0;height:100%;overflow:hidden;backface-visibility:hidden;-webkit-backface-visibility:hidden;background-color:#f6f6f6;background-repeat:no-repeat}' +
    '.fb-back{transform:rotateY(180deg)}' +
    '.fb-face.blank{background-image:linear-gradient(90deg,#e9e4d8,#f5f1e6)!important}' +
    '.fb-fs,.fb-bs{position:absolute;inset:0;background:#000;opacity:0;pointer-events:none}' +
    '.fb-nav{position:absolute;top:calc((100% - var(--fbBar,76px))/2);transform:translateY(-50%);z-index:4;width:44px;height:64px;border:0;padding:0;color:#fff;background:rgba(0,0,0,.28);' +
    'font:300 40px/1 system-ui,sans-serif;cursor:pointer;display:grid;place-items:center;transition:opacity .2s,background .2s}' +
    '.fb-nav:hover{background:rgba(0,0,0,.5)}.fb-nav:active{background:rgba(0,0,0,.65)}' +
    '.fb-prev{left:0;border-radius:0 12px 12px 0}.fb-next{right:0;border-radius:12px 0 0 12px}' +
    '.fb-nav[disabled]{opacity:0;pointer-events:none}' +
    '.fb-bar{position:absolute;left:0;right:0;bottom:0;z-index:5;padding:2px 10px calc(env(safe-area-inset-bottom,0px) + 6px);background:linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,.72) 38%)}' +
    '.fb-prog{display:block;width:100%;height:22px;margin:0;background:transparent;accent-color:var(--red,#d71920);cursor:pointer}' +
    '.fb-row{display:flex;align-items:center;justify-content:space-between;gap:4px}' +
    '.fb-grp{display:flex;align-items:center;gap:4px}' +
    '.fb-btn{flex:none;width:38px;height:38px;border:0;border-radius:50%;background:rgba(255,255,255,.12);color:#fff;display:grid;place-items:center;cursor:pointer;padding:0;transition:background .2s,transform .15s}' +
    '.fb-btn:hover{background:rgba(255,255,255,.22)}.fb-btn:active{transform:scale(.92)}.fb-btn.act{background:var(--red,#d71920)}' +
    '.fb-btn svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
    '.fb-pgn{min-width:84px;text-align:center;font-weight:800;font-size:13px;background:rgba(255,255,255,.14);padding:8px 12px;border-radius:99px;white-space:nowrap;font-variant-numeric:tabular-nums}' +
    '.fb-thumbs{position:absolute;left:0;right:0;bottom:var(--fbBar,76px);max-height:58%;z-index:6;overflow:auto;padding:12px;background:rgba(14,14,16,.95);' +
    'display:none;grid-template-columns:repeat(auto-fill,minmax(86px,1fr));gap:12px;box-shadow:0 -10px 30px rgba(0,0,0,.5);overscroll-behavior:contain}' +
    '.fb-thumbs.on{display:grid;animation:fbup .25s ease}@keyframes fbup{from{transform:translateY(16px);opacity:0}}' +
    '.fb-th{position:relative;aspect-ratio:var(--fbAsp,.72);border-radius:4px;background:#e9e9e9 center/cover no-repeat;cursor:pointer;outline:2px solid transparent;outline-offset:2px}' +
    '.fb-th.on{outline-color:var(--red,#d71920)}' +
    '.fb-th i{position:absolute;left:0;right:0;bottom:0;padding:2px 0;text-align:center;font:700 11px system-ui;font-style:normal;background:rgba(0,0,0,.6);color:#fff;border-radius:0 0 4px 4px}' +
    '@media (prefers-reduced-motion:reduce){.fb-thumbs.on{animation:none}}';

  var I = {
    grid: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1"/></svg>',
    zin: '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.8-4.8M10.5 7.8v5.4M7.8 10.5h5.4"/></svg>',
    zout: '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.8-4.8M7.8 10.5h5.4"/></svg>',
    full: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    exit: '<svg viewBox="0 0 24 24"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>',
    snd: '<svg viewBox="0 0 24 24"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11"/></svg>',
    mute: '<svg viewBox="0 0 24 24"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>'
  };

  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function FlipBook(host, opt) {
    opt = opt || {};
    if (!document.getElementById('fb-css')) { var st = el('style'); st.id = 'fb-css'; st.textContent = CSS; document.head.appendChild(st); }

    var S = 14, BMAX = 42;                 /* strips, அதிகபட்ச வளைவு (டிகிரி) */
    var pdf = null, N = 0, aspect = .72, W = 0, H = 0, pw = 0, ph = 0, spread = false, lay = 'auto';
    var state = 0, maxState = 0, busy = false, flip = null, gen = 0;
    var z = 1, px = 0, py = 0;
    var cache = {}, best = {}, queue = [], running = false, thumbDone = {};
    var strips = [], leafF = -2, leafB = -2;

    /* ---------- DOM ---------- */
    var root = el('div', 'fb-root');
    root.innerHTML =
      '<div class="fb-view"><div class="fb-zoom"><div class="fb-book">' +
      '<div class="fb-pg fb-L"></div><div class="fb-pg fb-R"></div>' +
      '<div class="fb-sh fb-shL"></div><div class="fb-sh fb-shR"></div>' +
      '<div class="fb-leaf"></div></div></div></div>' +
      '<button class="fb-nav fb-prev" type="button" aria-label="முந்தைய பக்கம்">‹</button>' +
      '<button class="fb-nav fb-next" type="button" aria-label="அடுத்த பக்கம்">›</button>' +
      '<div class="fb-thumbs" role="listbox" aria-label="பக்கங்கள்"></div>' +
      '<div class="fb-bar"><input class="fb-prog" type="range" min="0" max="0" value="0" aria-label="பக்கம்">' +
      '<div class="fb-row"><div class="fb-grp"><button class="fb-btn fb-bTh" type="button" aria-label="பக்கப் படங்கள்">' + I.grid + '</button></div>' +
      '<div class="fb-pgn" aria-live="polite">0 / 0</div>' +
      '<div class="fb-grp"><button class="fb-btn fb-bZo" type="button" aria-label="சிறிதாக்கு">' + I.zout + '</button>' +
      '<button class="fb-btn fb-bZi" type="button" aria-label="பெரிதாக்கு">' + I.zin + '</button>' +
      '<button class="fb-btn fb-bFs" type="button" aria-label="முழுத்திரை">' + I.full + '</button>' +
      '<button class="fb-btn fb-bSn" type="button" aria-label="ஒலி">' + I.snd + '</button>' +
      (opt.onDownload ? '<button class="fb-btn fb-bDl" type="button" aria-label="பதிவிறக்கு"><svg viewBox="0 0 24 24"><path d="M12 4v11M7.5 11l4.5 4.5 4.5-4.5M5 19.5h14"/></svg></button>' : '') +
      '</div></div></div>';
    var pill = el('div', 'fb-pill'); root.appendChild(pill);
    if (opt.minimal) root.classList.add('fb-min');
    host.appendChild(root);
    var q$ = function (s) { return root.querySelector(s); };
    var view = q$('.fb-view'), zoomEl = q$('.fb-zoom'), book = q$('.fb-book'), pgL = q$('.fb-L'), pgR = q$('.fb-R'),
      shL = q$('.fb-shL'), shR = q$('.fb-shR'), leaf = q$('.fb-leaf'), bar = q$('.fb-bar'), prog = q$('.fb-prog'),
      pgn = q$('.fb-pgn'), thumbs = q$('.fb-thumbs'), bPrev = q$('.fb-prev'), bNext = q$('.fb-next'),
      bTh = q$('.fb-bTh'), bFs = q$('.fb-bFs'), bSn = q$('.fb-bSn');

    /* ---------- வரிசை (sequential render queue) ---------- */
    function enqueue(fn, hi) {
      return new Promise(function (res, rej) {
        var t = { fn: fn, res: res, rej: rej, g: gen };
        if (hi) queue.unshift(t); else queue.push(t);
        pump();
      });
    }
    function pump() {
      if (running) return;
      var t = queue.shift(); if (!t) return;
      running = true;
      var done = function () { running = false; pump(); };
      if (t.g !== gen) { t.rej(new Error('stale')); done(); return; }
      t.fn().then(function (r) { t.res(r); done(); }, function (e) { t.rej(e); done(); });
    }

    /* ---------- பக்கம் → படம் ---------- */
    function renderPage(n, qlt, hi) {
      var key = gen + ':' + n + '@' + qlt;
      if (cache[key]) return cache[key];
      var p = enqueue(function () {
        return pdf.getPage(n + 1).then(function (page) {
          var vp0 = page.getViewport({ scale: 1 }), dpr = Math.min(window.devicePixelRatio || 1, 2.5);
          var tw = Math.round(pw * dpr * qlt), th = Math.round(ph * dpr * qlt), mx = 4096;
          if (Math.max(tw, th) > mx) { var k = mx / Math.max(tw, th); tw = Math.round(tw * k); th = Math.round(th * k); }
          var s = Math.min(tw / vp0.width, th / vp0.height), vp = page.getViewport({ scale: s });
          var c = el('canvas'); c.width = tw; c.height = th;
          var cx = c.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, tw, th);
          return page.render({ canvasContext: cx, viewport: vp, transform: [1, 0, 0, 1, (tw - vp.width) / 2, (th - vp.height) / 2] }).promise.then(function () {
            return new Promise(function (r) { c.toBlob(r, 'image/jpeg', .92); });
          });
        }).then(function (blob) { return URL.createObjectURL(blob); });
      }, hi).then(function (u) {
        var b = best[n]; if (!b || b.q < qlt) best[n] = { url: u, q: qlt, g: gen };
        trim();
        return u;
      });
      cache[key] = p;
      p.catch(function () { delete cache[key]; });
      return p;
    }
    function bestUrl(n) { var b = best[n]; return b && b.g === gen ? b.url : ''; }
    function curIdx() { return pageIndex(); }
    function trim() {
      var keys = Object.keys(best); if (keys.length < 30) return;
      var c = curIdx();
      keys.forEach(function (k) { if (Math.abs(+k - c) > 9) { try { URL.revokeObjectURL(best[k].url); } catch (e) {} delete best[k]; Object.keys(cache).forEach(function (ck) { if (ck.split(':')[1].split('@')[0] === k) delete cache[ck]; }); } });
    }

    /* ---------- நிலை ↔ பக்கம் ---------- */
    function recalcMax() {
      var L = Math.ceil(N / 2);
      maxState = spread ? (N % 2 === 0 ? L : L - 1) : N - 1;
      if (maxState < 0) maxState = 0;
    }
    function pageIndex() { return spread ? (state === 0 ? 0 : 2 * state - 1) : state; }
    function stateOfPage(i) { i = clamp(i, 0, Math.max(0, N - 1)); return spread ? Math.min(maxState, Math.ceil(i / 2)) : i; }
    function shiftFor(s) { if (!spread) return 0; if (s === 0) return -pw / 2; if (s === maxState && N % 2 === 0 && N > 0) return pw / 2; return 0; }

    /* ---------- அளவு ---------- */
    function layout() {
      if (!pdf) return;
      var r = root.getBoundingClientRect(); if (!r.width || !r.height) return;
      var oldPi = pageIndex(), oldSpread = spread, oldPw = pw;
      W = r.width; H = r.height;
      var barH = opt.minimal ? 0 : (bar.offsetHeight || 76); root.style.setProperty('--fbBar', barH + 'px');
      lay = opt.layout ? opt.layout() : 'auto';
      spread = lay === 'double' || (lay === 'auto' && W > H * 1.05);
      var availW = W - (opt.minimal ? 0 : 20), availH = H - barH - (opt.minimal ? 0 : 52);
      pw = Math.max(80, Math.floor(Math.min(spread ? availW / 2 : availW, availH * aspect)));
      ph = Math.floor(pw / aspect);
      recalcMax();
      var sized = !oldPw || Math.abs(pw - oldPw) > 2 || oldSpread !== spread;
      if (sized) { gen++; queue = []; }
      state = stateOfPage(oldPi);
      var bw = spread ? pw * 2 : pw;
      zoomEl.style.width = bw + 'px'; zoomEl.style.height = ph + 'px';
      book.style.perspective = Math.round(pw * 7) + 'px';
      root.classList.toggle('fb-single', !spread);
      pgL.style.cssText = 'left:0;width:' + pw + 'px;height:' + ph + 'px';
      pgR.style.cssText = 'left:' + (spread ? pw : 0) + 'px;width:' + pw + 'px;height:' + ph + 'px';
      shL.style.cssText = 'left:0;width:' + pw + 'px;height:' + ph + 'px';
      shR.style.cssText = 'left:' + (spread ? pw : 0) + 'px;width:' + pw + 'px;height:' + ph + 'px';
      leaf.style.cssText = 'left:' + (spread ? pw : 0) + 'px;width:' + pw + 'px;height:' + ph + 'px';
      pgL.style.display = shL.style.display = spread ? '' : 'none';
      if (sized) buildLeaf();
      thumbs.style.setProperty('--fbAsp', aspect);
      prog.max = Math.max(0, N - 1);
      if (flip) { flip = null; busy = false; leaf.style.display = 'none'; }
      applyZoom(); renderStatic(); updateUI();
      if (sized) prefetch();
    }

    function buildLeaf() {
      leaf.innerHTML = ''; strips = []; leafF = leafB = -2;
      var sw = pw / S, parent = leaf;
      for (var i = 0; i < S; i++) {
        var s = el('div', 'fb-strip'), f = el('div', 'fb-face fb-front'), b = el('div', 'fb-face fb-back'), fs = el('div', 'fb-fs'), bs = el('div', 'fb-bs');
        s.style.width = sw + 'px'; s.style.height = ph + 'px';
        if (i > 0) s.style.left = sw + 'px';
        f.style.width = (sw + .8) + 'px'; b.style.width = (sw + .8) + 'px';
        f.style.backgroundSize = pw + 'px ' + ph + 'px'; b.style.backgroundSize = pw + 'px ' + ph + 'px';
        f.style.backgroundPosition = (-i * sw) + 'px 0';
        b.style.backgroundPosition = (.8 - (pw - (i + 1) * sw)) + 'px 0';
        f.appendChild(fs); b.appendChild(bs); s.appendChild(f); s.appendChild(b); parent.appendChild(s); parent = s;
        strips.push({ s: s, f: f, b: b, fs: fs, bs: bs });
      }
    }

    /* ---------- நிலையான பக்கங்கள் ---------- */
    function setSlot(slot, n) {
      slot._n = n;
      if (n < 0 || n >= N) { slot.style.visibility = 'hidden'; slot.style.backgroundImage = 'none'; slot.classList.remove('loading'); return; }
      slot.style.visibility = 'visible';
      var u = bestUrl(n);
      if (u) { slot.style.backgroundImage = 'url(' + u + ')'; slot.classList.remove('loading'); } else { slot.style.backgroundImage = 'none'; slot.classList.add('loading'); }
      renderPage(n, 1, true).then(function (url) { if (slot._n === n) { slot.style.backgroundImage = 'url(' + (bestUrl(n) || url) + ')'; slot.classList.remove('loading'); } }, function () {});
    }
    function setFace(side, n) {                /* side: 'f' | 'b' */
      if (side === 'f') { if (leafF === n) return; leafF = n; } else { if (leafB === n) return; leafB = n; }
      var blank = n < 0 || n >= N;
      strips.forEach(function (t) { var f = t[side]; f.classList.toggle('blank', blank); if (blank) f.style.backgroundImage = 'none'; });
      if (blank) return;
      var apply = function () { var u = bestUrl(n); if (!u) return; strips.forEach(function (t) { t[side].style.backgroundImage = 'url(' + u + ')'; }); };
      if (bestUrl(n)) apply(); else strips.forEach(function (t) { t[side].style.backgroundImage = 'none'; });
      renderPage(n, 1, true).then(function () { if ((side === 'f' ? leafF : leafB) === n) apply(); }, function () {});
    }
    function stackShadow(t, dir, extra) {
      var a = [];
      for (var i = 1; i <= t; i++) a.push((dir * i) + 'px ' + (i * .35).toFixed(2) + 'px 0 ' + (i % 2 ? '#efefef' : '#d2d2d2'));
      a.push((dir * (t + 4)) + 'px 12px 28px rgba(0,0,0,' + (extra || .5) + ')');
      return a.join(',');
    }
    function renderStatic() {
      if (!pdf) return;
      var s = state;
      if (spread) { setSlot(pgL, 2 * s - 1); setSlot(pgR, 2 * s); }
      else { setSlot(pgR, s); }
      var leftCnt = spread ? 2 * s : 0, rightCnt = spread ? Math.max(0, N - 2 * s) : Math.max(0, N - 1 - s);
      var tl = Math.round(Math.min(9, leftCnt / Math.max(1, N) * 12)), tr = Math.round(Math.min(9, rightCnt / Math.max(1, N) * 12));
      pgL.style.boxShadow = stackShadow(tl, -1, .45);
      pgR.style.boxShadow = stackShadow(tr, 1, .45);
      shL.style.opacity = shR.style.opacity = 0;
      applyShift();
    }
    function applyShift() {
      var sh;
      if (flip) { var qq = flip.d > 0 ? flip.p : 1 - flip.p, a = shiftFor(flip.a), b = shiftFor(flip.b); sh = a + (b - a) * qq; }
      else sh = shiftFor(state);
      book.style.transform = 'translateX(' + sh.toFixed(1) + 'px)';
    }

    /* ---------- புரளும் பக்கம் ---------- */
    function applyLeaf(p) {
      var Bp = BMAX * Math.sin(Math.PI * p), base = -180 * p + Bp, b = -Bp / (S - 1);
      for (var i = 0; i < S; i++) {
        var a = i ? b : base, abs = base + i * b, u = Math.min(1, Math.abs(abs) / 180), t = strips[i];
        t.s.style.transform = 'rotateY(' + a.toFixed(2) + 'deg)';
        t.fs.style.opacity = (.5 * u).toFixed(3);
        t.bs.style.opacity = (.5 * (1 - u)).toFixed(3);
      }
      var sh = Math.sin(Math.PI * clamp(p, 0, 1));
      shR.style.opacity = (sh * .9).toFixed(3);
      shL.style.opacity = spread ? (sh * .8).toFixed(3) : 0;
    }
    function begin(d) {
      if (busy || !pdf) return false;
      var a = state, b = a + d;
      if (b < 0 || b > maxState) return false;
      busy = true; flip = { d: d, a: a, b: b, p: d > 0 ? 0 : 1 };
      if (spread) {
        if (d > 0) { setFace('f', 2 * a); setFace('b', 2 * a + 1); setSlot(pgR, 2 * a + 2); setSlot(pgL, 2 * a - 1); }
        else { setFace('f', 2 * a - 2); setFace('b', 2 * a - 1); setSlot(pgL, 2 * a - 3); setSlot(pgR, 2 * a); }
      } else {
        if (d > 0) { setFace('f', a); setFace('b', -1); setSlot(pgR, a + 1); }
        else { setFace('f', a - 1); setFace('b', -1); setSlot(pgR, a); }
      }
      leaf.style.display = 'block'; applyLeaf(flip.p); applyShift();
      return true;
    }
    function finish(ok) {
      var f = flip; flip = null; busy = false; leaf.style.display = 'none';
      if (ok && f) { state = f.b; if (opt.onPage) opt.onPage(pageIndex()); }
      renderStatic(); updateUI(); if (ok) prefetch();
    }
    function animateTo(target) {
      if (!flip) return;
      var from = flip.p, t0 = performance.now(), dist = Math.abs(target - from), dur = Math.max(140, 560 * dist);
      var complete = flip.d > 0 ? target === 1 : target === 0;
      if (complete) sound();
      (function f(t) {
        if (!flip) return;
        var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        flip.p = from + (target - from) * e; applyLeaf(flip.p); applyShift();
        if (k < 1) requestAnimationFrame(f); else finish(complete);
      })(t0);
    }
    function go(d) {
      if (z > 1.02) { zoomTo(1); return; }
      if (begin(d)) animateTo(d > 0 ? 1 : 0);
    }
    function goPage(i) {
      if (!pdf || busy) return;
      var s = stateOfPage(i); if (s === state) return;
      state = s; renderStatic(); updateUI(); sound(); if (opt.onPage) opt.onPage(pageIndex()); prefetch();
    }

    /* ---------- UI நிலை ---------- */
    function labelFor() {
      var i = pageIndex();
      if (!spread) return (i + 1) + ' / ' + N;
      if (state === 0) return '1 / ' + N;
      var l = i + 1, r = i + 2;
      return (r <= N ? l + ' – ' + r : '' + l) + ' / ' + N;
    }
    function updateUI() {
      pgn.textContent = labelFor(); pill.textContent = pgn.textContent;
      prog.value = pageIndex();
      bPrev.disabled = state <= 0; bNext.disabled = state >= maxState;
      var c = pageIndex();
      [].forEach.call(thumbs.children, function (t) { var n = +t.dataset.n, on = spread ? (n === c || (state > 0 && n === c + 1)) : n === c; t.classList.toggle('on', on); });
      bSn.innerHTML = soundOn() ? I.snd : I.mute;
      bSn.classList.toggle('act', !soundOn());
    }
    function prefetch() {
      var c = pageIndex(), list = [];
      for (var d = -2; d <= 4; d++) { var n = c + d; if (n >= 0 && n < N) list.push(n); }
      list.forEach(function (n) { renderPage(n, 1, false).catch(function () {}); });
    }

    /* ---------- ஒலி ---------- */
    var ac = null;
    function soundOn() { return lsGet('np_sound') !== '0'; }
    function sound() {
      if (!soundOn()) return;
      try {
        ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        if (ac.state === 'suspended') ac.resume();
        var sr = ac.sampleRate, len = Math.floor(sr * .38), buf = ac.createBuffer(2, len, sr);
        for (var ch = 0; ch < 2; ch++) {
          var d = buf.getChannelData(ch), last = 0;
          for (var i = 0; i < len; i++) {
            var t = i / len, env = Math.pow(1 - t, 1.6) * (t < .12 ? t / .12 : 1), n = Math.random() * 2 - 1;
            last = last * .72 + n * .28;
            var crack = (Math.random() < .018 ? (Math.random() * 2 - 1) * .9 : 0) * (t > .05 && t < .55 ? 1 : 0);
            d[i] = (last * .55 + n * .25 + crack) * .42 * env * (ch ? .9 : 1);
          }
        }
        var src = ac.createBufferSource(); src.buffer = buf;
        var bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = .7;
        var hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 400;
        var g = ac.createGain(); g.gain.setValueAtTime(.55, ac.currentTime); g.gain.exponentialRampToValueAtTime(.01, ac.currentTime + .4);
        src.connect(hp); hp.connect(bp); bp.connect(g); g.connect(ac.destination); src.start();
      } catch (e) {}
    }

    /* ---------- zoom / pan ---------- */
    var hiT = 0;
    function applyZoom() {
      zoomEl.style.transform = 'translate(-50%,-50%) translate(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px) scale(' + z.toFixed(3) + ')';
      view.style.cursor = z > 1 ? 'move' : '';
      clearTimeout(hiT); if (z > 1.25) hiT = setTimeout(hiRes, 220);
    }
    function clampPan() {
      var bw = (spread ? pw * 2 : pw) * z, bh = ph * z, vw = view.clientWidth, vh = view.clientHeight;
      var lx = Math.max(0, (bw - vw) / 2 + 24), ly = Math.max(0, (bh - vh) / 2 + 24);
      px = clamp(px, -lx, lx); py = clamp(py, -ly, ly);
    }
    function zoomAt(nz, cx, cy) {
      var r = view.getBoundingClientRect(), mx = cx - r.left - r.width / 2, my = cy - r.top - r.height / 2;
      nz = clamp(nz, 1, 5);
      px = mx - (nz / z) * (mx - px); py = my - (nz / z) * (my - py); z = nz;
      if (z < 1.03) { z = 1; px = py = 0; }
      clampPan(); applyZoom();
    }
    function smooth(fn) { zoomEl.style.transition = 'transform .28s cubic-bezier(.2,.8,.2,1)'; fn(); setTimeout(function () { zoomEl.style.transition = ''; }, 320); }
    function zoomTo(v) { var r = view.getBoundingClientRect(); smooth(function () { zoomAt(v, r.left + r.width / 2, r.top + r.height / 2); }); }
    function zoomBy(f) { var r = view.getBoundingClientRect(); smooth(function () { zoomAt(z * f, r.left + r.width / 2, r.top + r.height / 2); }); }
    function hiRes() {
      if (!pdf || flip) return;
      var qlt = Math.min(3, Math.ceil(z)), c = pageIndex(), list = spread ? (state === 0 ? [0] : [c, c + 1]) : [c];
      list.forEach(function (n) {
        if (n < 0 || n >= N) return;
        renderPage(n, qlt, true).then(function () {
          var slot = n === pgL._n ? pgL : (n === pgR._n ? pgR : null), u = bestUrl(n);
          if (slot && u) slot.style.backgroundImage = 'url(' + u + ')';
        }, function () {});
      });
    }

    /* ---------- சைகைகள் ---------- */
    var ptrs = {}, nPtr = 0, g = null, pin = null, lastTap = 0, tapT = 0, tapXY = [0, 0];
    function endDragCancel() { if (flip && g && g.dragging) { animateTo(flip.d > 0 ? 0 : 1); } }
    view.addEventListener('pointerdown', function (e) {
      if (!pdf) return;
      try { view.setPointerCapture(e.pointerId); } catch (x) {}
      if (!ptrs[e.pointerId]) nPtr++;
      ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (nPtr === 2) {
        var k = Object.keys(ptrs).map(function (i) { return ptrs[i]; });
        pin = { d: Math.hypot(k[0].x - k[1].x, k[0].y - k[1].y) || 1, z0: z };
        endDragCancel(); g = null; return;
      }
      g = { x: e.clientX, y: e.clientY, t: Date.now(), moved: 0, px: px, py: py, dir: 0, dragging: false, lx: e.clientX, lt: Date.now(), vx: 0, blocked: false };
    });
    view.addEventListener('pointermove', function (e) {
      var p = ptrs[e.pointerId]; if (!p) return;
      p.x = e.clientX; p.y = e.clientY;
      if (pin && nPtr >= 2) {
        var k = Object.keys(ptrs).map(function (i) { return ptrs[i]; });
        zoomAt(pin.z0 * Math.hypot(k[0].x - k[1].x, k[0].y - k[1].y) / pin.d, (k[0].x + k[1].x) / 2, (k[0].y + k[1].y) / 2); return;
      }
      if (!g) return;
      var dx = e.clientX - g.x, dy = e.clientY - g.y;
      g.moved = Math.max(g.moved, Math.hypot(dx, dy));
      var now = Date.now(); if (now - g.lt > 16) { g.vx = (e.clientX - g.lx) / (now - g.lt); g.lx = e.clientX; g.lt = now; }
      if (z > 1.02) { px = g.px + dx; py = g.py + dy; clampPan(); applyZoom(); view.classList.add('drag'); return; }
      if (!g.dir && !g.blocked && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * .6) {
        var d = dx < 0 ? 1 : -1;
        if (begin(d)) { g.dir = d; g.dragging = true; g.x0 = e.clientX - (dx > 0 ? 8 : -8) * 0; } else g.blocked = true;
      }
      if (g.dragging && flip) {
        var pr = clamp(Math.abs(dx) / (pw * 1.15), 0, 1);
        flip.p = flip.d > 0 ? pr : 1 - pr;
        applyLeaf(flip.p); applyShift(); view.classList.add('drag');
      }
    });
    function up(e) {
      var had = ptrs[e.pointerId]; if (had) { delete ptrs[e.pointerId]; nPtr = Math.max(0, nPtr - 1); }
      view.classList.remove('drag');
      if (pin) { if (nPtr < 2) pin = null; g = null; return; }
      if (!g) return;
      var q = g; g = null;
      if (q.dragging && flip) {
        var d = flip.d, p = flip.p, v = q.vx;
        var ok = d > 0 ? (p > .5 || v < -.5) : (p < .5 || v > .5);
        if (d > 0 && v > .5) ok = false; if (d < 0 && v < -.5) ok = false;
        animateTo(ok ? (d > 0 ? 1 : 0) : (d > 0 ? 0 : 1)); return;
      }
      if (q.moved < 10 && e.type === 'pointerup') {
        var now = Date.now();
        if (now - lastTap < 320 && Math.hypot(e.clientX - tapXY[0], e.clientY - tapXY[1]) < 48) {
          clearTimeout(tapT); lastTap = 0;
          smooth(function () { if (z >= 1.6) zoomAt(1, e.clientX, e.clientY); else zoomAt(2.4, e.clientX, e.clientY); });
        } else {
          lastTap = now; tapXY = [e.clientX, e.clientY];
          tapT = setTimeout(function () { if (z > 1.02) return; tapNav(e.clientX); }, 280);
        }
      }
    }
    view.addEventListener('pointerup', up); view.addEventListener('pointercancel', up);
    function tapNav(cx) {
      var r = book.getBoundingClientRect();
      if (spread) {
        var mid = (r.left + r.right) / 2, shown = state > 0 && !(state === maxState && N % 2 === 0) ;
        if (cx >= r.left && cx <= r.right) { if (cx > mid) go(1); else go(-1); }
      } else {
        var f = (cx - r.left) / (r.width || 1);
        if (f > .66) go(1); else if (f < .34) go(-1);
      }
    }
    view.addEventListener('wheel', function (e) {
      if (!pdf) return; e.preventDefault();
      if (e.ctrlKey || e.metaKey || e.shiftKey) zoomAt(z * (e.deltaY < 0 ? 1.12 : .89), e.clientX, e.clientY);
      else if (z > 1.02) { px -= e.deltaX; py -= e.deltaY; clampPan(); applyZoom(); }
      else go(e.deltaY > 0 || e.deltaX > 0 ? 1 : -1);
    }, { passive: false });
    document.addEventListener('keydown', function (e) {
      if (!pdf || (opt.isActive && !opt.isActive()) || /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '') && document.activeElement !== prog) return;
      var k = e.key;
      if (k === 'ArrowRight' || k === 'PageDown') { go(1); e.preventDefault(); }
      else if (k === 'ArrowLeft' || k === 'PageUp') { go(-1); e.preventDefault(); }
      else if (k === 'Home') goPage(0); else if (k === 'End') goPage(N - 1);
      else if (k === '+' || k === '=') zoomBy(1.35); else if (k === '-' || k === '_') zoomBy(1 / 1.35);
    });

    /* ---------- பொத்தான்கள் ---------- */
    bPrev.onclick = function () { go(-1); }; bNext.onclick = function () { go(1); };
    q$('.fb-bZi').onclick = function () { zoomBy(1.4); }; q$('.fb-bZo').onclick = function () { zoomBy(1 / 1.4); };
    prog.addEventListener('input', function () { var v = +prog.value; pgn.textContent = spread && v > 0 ? (v + 1) + (v + 2 <= N ? ' – ' + (v + 2) : '') + ' / ' + N : (v + 1) + ' / ' + N; });
    prog.addEventListener('change', function () { goPage(+prog.value); });
    bSn.onclick = function () { lsSet('np_sound', soundOn() ? '0' : '1'); updateUI(); if (opt.toast) opt.toast(soundOn() ? 'புரட்டும் ஒலி: இயக்கம்' : 'புரட்டும் ஒலி: நிறுத்தம்'); };
    if (opt.onDownload) q$('.fb-bDl').onclick = function () { opt.onDownload(); };
    bTh.onclick = function () { var on = !thumbs.classList.contains('on'); thumbs.classList.toggle('on', on); bTh.classList.toggle('act', on); if (on) { loadThumbs(); var cur = thumbs.querySelector('.on'); if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'center' }); } };
    if (!root.requestFullscreen && !root.webkitRequestFullscreen) bFs.style.display = 'none';
    bFs.onclick = function () {
      var d = document, on = d.fullscreenElement || d.webkitFullscreenElement;
      try { if (on) (d.exitFullscreen || d.webkitExitFullscreen).call(d); else (root.requestFullscreen || root.webkitRequestFullscreen).call(root); } catch (e) {}
    };
    function fsChange() { var on = document.fullscreenElement || document.webkitFullscreenElement; bFs.innerHTML = on ? I.exit : I.full; setTimeout(layout, 120); }
    document.addEventListener('fullscreenchange', fsChange); document.addEventListener('webkitfullscreenchange', fsChange);

    /* ---------- thumbnails ---------- */
    var io = null;
    function buildThumbs() {
      thumbs.innerHTML = ''; thumbDone = {};
      for (var n = 0; n < N; n++) {
        var t = el('div', 'fb-th'); t.dataset.n = n; t.setAttribute('role', 'option'); t.innerHTML = '<i>' + (n + 1) + '</i>';
        thumbs.appendChild(t);
      }
    }
    thumbs.addEventListener('click', function (e) { var t = e.target.closest('.fb-th'); if (!t) return; goPage(+t.dataset.n); thumbs.classList.remove('on'); bTh.classList.remove('act'); });
    function thumbRender(t) {
      var n = +t.dataset.n; if (thumbDone[n]) return; thumbDone[n] = 1;
      var myGen = gen;
      enqueue(function () {
        return pdf.getPage(n + 1).then(function (page) {
          var vp0 = page.getViewport({ scale: 1 }), tw = 180, s = tw / vp0.width, vp = page.getViewport({ scale: s });
          var c = el('canvas'); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
          var cx = c.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, c.width, c.height);
          return page.render({ canvasContext: cx, viewport: vp }).promise.then(function () { return new Promise(function (r) { c.toBlob(r, 'image/jpeg', .7); }); });
        }).then(function (b) { return URL.createObjectURL(b); });
      }, false).then(function (u) { t.style.backgroundImage = 'url(' + u + ')'; }, function () { if (myGen === gen) thumbDone[n] = 0; });
    }
    function loadThumbs() {
      if ('IntersectionObserver' in window) {
        if (io) io.disconnect();
        io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { thumbRender(en.target); io.unobserve(en.target); } }); }, { root: thumbs, rootMargin: '200px' });
        [].forEach.call(thumbs.children, function (t) { io.observe(t); });
      } else [].forEach.call(thumbs.children, thumbRender);
    }

    /* ---------- வெளி API ---------- */
    var ro = null;
    this.open = function (doc, startIdx) {
      pdf = doc; N = doc.numPages; gen++; queue = []; cache = {}; best = {};
      z = 1; px = py = 0; busy = false; flip = null; leaf.style.display = 'none';
      root.classList.add('on');
      return doc.getPage(1).then(function (p) {
        var vp = p.getViewport({ scale: 1 }); aspect = vp.width / vp.height;
        pw = 0; state = 0;
        buildThumbs();
        layout();
        state = stateOfPage(startIdx || 0); renderStatic(); updateUI(); prefetch();
        if (!ro && window.ResizeObserver) { ro = new ResizeObserver(function () { clearTimeout(ro._t); ro._t = setTimeout(layout, 120); }); ro.observe(root); }
      });
    };
    this.relayout = layout;
    this.next = function () { go(1); }; this.prev = function () { go(-1); };
    this.goto = goPage;
    this.zoom = zoomBy;
    this.info = function () { return { spread: spread, state: state, maxState: maxState, page: pageIndex(), pw: pw, ph: ph, n: N, z: z }; };
    this.root = root;
    this._dbg = { begin: begin, animateTo: animateTo, applyLeaf: applyLeaf, get flip() { return flip; } };
  }

  window.FlipBook = FlipBook;
})();
