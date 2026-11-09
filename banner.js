/* Events — greeting poster maker. Full-page photo + big typographic headline -> WhatsApp Status poster (1080x1920).
   Banner.mount(sc, hostEl) / Banner.unmount(sc) */
(function () {
  'use strict';
  var W = 1080, H = 1920;
  var F = { bold: '"Bebas Neue",Impact,"Arial Narrow",sans-serif', script: '"Great Vibes","Brush Script MT",cursive', serif: '"Playfair Display",Georgia,serif' };
  var OCC = [['Birthday', 'HAPPY', 'BIRTHDAY'], ['Wedding', 'HAPPY', 'WEDDING'], ['Anniversary', 'HAPPY', 'ANNIVERSARY'], ['Pongal', 'HAPPY', 'PONGAL'], ['Diwali', 'HAPPY', 'DIWALI'], ['New Year', 'HAPPY', 'NEW YEAR'], ['Grand opening', 'GRAND', 'OPENING'], ['Congratulations', 'HEARTY', 'CONGRATS'], ['Welcome', 'WARM', 'WELCOME'], ['Condolence', 'IN LOVING', 'MEMORY'], ['Custom', '', '']];
  var STY = ['Bold', 'Elegant', 'Poster'];
  var ACC = [['Gold', '#ffc83d', '#fff1b0'], ['Red', '#ff3b4a', '#ffb3b9'], ['Cyan', '#2fd4ff', '#c4f3ff'], ['Green', '#3ee57f', '#c2ffd9'], ['Pink', '#ff5fb0', '#ffc6e4'], ['White', '#ffffff', '#ffffff']];
  var root, st, cv, timer, imgs = {};
  function h(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function css() {
    if (document.getElementById('bnCss')) return; var s = document.createElement('style'); s.id = 'bnCss';
    s.textContent = '#sec.bn{padding:0;background:#0b1020;color:#f4f6fb}.bn *{box-sizing:border-box}.bn-w{max-width:560px;margin:0 auto;padding:12px 14px 40px;display:grid;gap:12px;font:500 14px/1.45 system-ui,"Noto Sans Tamil",sans-serif}' +
      '.bn h1{margin:4px 0 0;font:800 22px/1.2 inherit;color:#ffc83d;text-align:center;text-shadow:none;border:0;padding:0}.bn-n{text-align:center;color:#9aa4bd;font-size:12.5px;margin:0}' +
      '.bn-pv{position:sticky;top:0;z-index:3;display:grid;place-items:center;background:linear-gradient(180deg,#0b1020 85%,rgba(11,16,32,0));padding:6px 0 10px}.bn-pv canvas{height:min(52vh,470px);aspect-ratio:9/16;border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,.6);background:#222}' +
      '.bn-c{background:#161c30;border:1px solid #232b48;border-radius:14px;padding:12px;display:grid;gap:10px}.bn-c h3{margin:0;font:800 14px/1 inherit;color:#fff;display:flex;gap:8px;align-items:center;border:0;padding:0;text-shadow:none;text-align:left}.bn-c h3 i{font-style:normal;width:22px;height:22px;border-radius:50%;background:#ffc83d;color:#1a0f0a;display:grid;place-items:center;font-size:12px}' +
      '.bn label{display:grid;gap:4px;font-size:12px;font-weight:700;color:#9aa4bd}.bn input[type=text],.bn select{width:100%;height:40px;border:1px solid #2a3350;border-radius:10px;padding:0 10px;font:inherit;font-size:14px;background:#0f1428;color:#f4f6fb}' +
      '.bn-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}.bn-seg{display:flex;gap:6px}.bn-seg button{flex:1;height:38px;border-radius:10px;border:1px solid #2a3350;background:#0f1428;color:#cfd6ea;font:inherit;font-weight:700;cursor:pointer}.bn-seg button.on{background:#ffc83d;color:#1a0f0a;border-color:#ffc83d}' +
      '.bn-th{display:flex;gap:10px;flex-wrap:wrap}.bn-th button{width:38px;height:38px;border-radius:50%;border:3px solid transparent;cursor:pointer}.bn-th button.on{border-color:#fff;transform:scale(1.1)}' +
      '.bn-pr{display:flex;gap:10px;align-items:center}.bn-ph{flex:none;width:64px;height:64px;border-radius:14px;border:2px dashed #3a4468;background:#0f1428;display:grid;place-items:center;overflow:hidden;color:#ffc83d;font-size:26px;cursor:pointer;position:relative}.bn-ph.big{width:92px;height:122px}.bn-ph img{width:100%;height:100%;object-fit:cover}.bn-ph input{display:none}' +
      '.bn-g{display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center}.bn-x{width:36px;height:36px;border-radius:50%;border:0;background:#3a1620;color:#ff8a80;font-size:16px;cursor:pointer}' +
      '.bn-add{height:42px;border-radius:10px;border:2px dashed #3a4468;background:#0f1428;color:#ffc83d;font-weight:800;cursor:pointer}.bn-btn{height:50px;border-radius:12px;border:0;font-weight:800;font-size:15px;cursor:pointer;color:#fff;background:linear-gradient(180deg,#e02a2a,#b3121a)}.bn-btn.wa{background:#1fa855}.bn-bt{display:grid;grid-template-columns:1fr 1fr;gap:10px}.bn small{color:#9aa4bd}';
    document.head.appendChild(s);
    if (!document.getElementById('bnFonts')) { var l = document.createElement('link'); l.id = 'bnFonts'; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Great+Vibes&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap'; document.head.appendChild(l); }
  }
  function load(key, f, max) {
    return new Promise(function (res) {
      var u = URL.createObjectURL(f), im = new Image();
      im.onload = function () { var k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); imgs[key] = c; res(); };
      im.onerror = function () { URL.revokeObjectURL(u); res(); }; im.src = u;
    });
  }
  function cover(g, im, x, y, w, hh) { var k = Math.max(w / im.width, hh / im.height), sw = w / k, sh = hh / k; g.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, x, y, w, hh); }
  /* text that shrinks to fit maxW; returns font size */
  function tx(g, t, x, y, font, size, maxW, o) {
    o = o || {}; t = o.up ? String(t).toUpperCase() : String(t); if (!t) return 0; var s = size, sp = o.sp || 0;
    for (; s > 18; s -= 4) { g.font = (o.w || '') + ' ' + s + 'px ' + font; try { g.letterSpacing = (sp * s) + 'px'; } catch (e) {} if (g.measureText(t).width <= maxW) break; }
    g.textAlign = o.al || 'center'; g.textBaseline = 'middle'; var ax = x; if (sp && g.textAlign === 'center') ax = x + sp * s / 2;
    if (o.sh) { g.shadowColor = 'rgba(0,0,0,.65)'; g.shadowBlur = o.sh; g.shadowOffsetY = o.sh / 4; }
    if (o.stroke) { g.lineJoin = 'round'; g.lineWidth = o.stroke; g.strokeStyle = o.sc || '#000'; g.strokeText(t, ax, y); }
    if (o.grad) { var gr = g.createLinearGradient(0, y - s / 2, 0, y + s / 2); gr.addColorStop(0, o.grad[0]); gr.addColorStop(1, o.grad[1]); g.fillStyle = gr; } else g.fillStyle = o.fill || '#fff';
    if (!o.line) g.fillText(t, ax, y); g.shadowColor = 'transparent'; g.shadowBlur = 0; g.shadowOffsetY = 0; try { g.letterSpacing = '0px'; } catch (e) {}
    return s;
  }
  function draw() {
    var g = cv.getContext('2d'), A = ACC[st.acc], gr = st.guests.filter(function (x) { return x.n.trim() || imgs['g' + x.id]; }), n = gr.length;
    g.clearRect(0, 0, W, H);
    if (imgs.main) { cover(g, imgs.main, 0, 0, W, H); }
    else { var bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#14060a'); bg.addColorStop(.5, '#2a0a12'); bg.addColorStop(1, '#0a0508'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
      g.save(); g.translate(W / 2, 900); for (var i = 0; i < 24; i++) { g.rotate(Math.PI / 12); g.fillStyle = 'rgba(255,255,255,' + (i % 2 ? .05 : 0) + ')'; g.beginPath(); g.moveTo(0, 0); g.lineTo(-120, -1900); g.lineTo(120, -1900); g.fill(); } g.restore();
      g.fillStyle = 'rgba(255,255,255,.3)'; g.font = '700 46px ' + F.bold; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ADD A PHOTO', W / 2, 900); }
    var t = g.createLinearGradient(0, 0, 0, 760); t.addColorStop(0, 'rgba(0,0,0,.82)'); t.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = t; g.fillRect(0, 0, W, 760);
    var b = g.createLinearGradient(0, 1000, 0, H); b.addColorStop(0, 'rgba(0,0,0,0)'); b.addColorStop(.55, 'rgba(0,0,0,.72)'); b.addColorStop(1, 'rgba(0,0,0,.93)'); g.fillStyle = b; g.fillRect(0, 1000, W, H - 1000);
    var l1 = st.l1.trim(), l2 = st.l2.trim(), grad = [A[2], A[1]], sty = st.sty;
    /* ---- headline ---- */
    if (sty === 0) {            /* Bold: spaced small line + giant accent line */
      if (l1 && l2) { tx(g, l1, W / 2, 150, F.bold, 120, 900, { up: 1, sp: .22, sh: 18 }); tx(g, l2, W / 2, 360, F.bold, 360, 1000, { up: 1, grad: grad, stroke: 10, sc: 'rgba(0,0,0,.55)', sh: 30 }); }
      else tx(g, l1 || l2, W / 2, 260, F.bold, 380, 1000, { up: 1, grad: grad, stroke: 10, sc: 'rgba(0,0,0,.55)', sh: 30 });
    } else if (sty === 1) {     /* Elegant: script + serif */
      if (l1 && l2) { tx(g, l1.charAt(0) + l1.slice(1).toLowerCase(), W / 2, 190, F.script, 230, 940, { fill: A[1], sh: 22 }); tx(g, l2, W / 2, 370, F.serif, 170, 960, { up: 1, w: '900', sp: .06, fill: '#fff', sh: 24 }); }
      else tx(g, l1 || l2, W / 2, 280, F.serif, 190, 960, { up: 1, w: '900', sp: .05, fill: '#fff', sh: 24 });
    } else {                    /* Poster: left aligned stacked */
      if (l1) tx(g, l1, 70, 170, F.bold, 250, 940, { up: 1, al: 'left', fill: '#fff', sh: 20 }); if (l2) tx(g, l2, 70, l1 ? 400 : 250, F.bold, 380, 950, { up: 1, al: 'left', grad: grad, stroke: 8, sc: 'rgba(0,0,0,.5)', sh: 26 });
      g.fillStyle = A[1]; g.fillRect(70, l1 ? 560 : 440, 160, 12);
    }
    /* ---- bottom: name, role, greeters, footer ---- */
    var yb = H - 64;
    if (st.foot.trim()) { tx(g, st.foot, W / 2, yb, F.bold, 50, 940, { up: 1, sp: .12, fill: A[2] }); yb -= 78; } else yb -= 10;
    var rows = n > 6 ? 2 : 1, dia = n <= 3 ? 190 : n <= 6 ? 150 : 125, lblH = 40;
    if (n) {
      var per = rows === 2 ? Math.ceil(n / 2) : n, gh = rows * (dia + lblH + 14), gTop = yb - gh, cw = Math.min(210, (W - 100) / per);
      gr.forEach(function (x, i) { var r = rows === 2 ? (i < per ? 0 : 1) : 0, inRow = rows === 2 ? (r === 0 ? per : n - per) : n, c = rows === 2 ? (r === 0 ? i : i - per) : i, cx = W / 2 + (c - (inRow - 1) / 2) * cw, cy = gTop + r * (dia + lblH + 14) + dia / 2, key = 'g' + x.id;
        g.save(); g.beginPath(); g.arc(cx, cy, dia / 2, 0, 7); g.clip(); if (imgs[key]) cover(g, imgs[key], cx - dia / 2, cy - dia / 2, dia, dia); else { g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(cx - dia / 2, cy - dia / 2, dia, dia); g.fillStyle = 'rgba(255,255,255,.6)'; g.font = Math.round(dia * .5) + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('👤', cx, cy); } g.restore();
        g.lineWidth = 6; g.strokeStyle = A[1]; g.beginPath(); g.arc(cx, cy, dia / 2, 0, 7); g.stroke();
        if (x.n.trim()) tx(g, x.n.trim(), cx, cy + dia / 2 + 28, 'system-ui,"Noto Sans Tamil",sans-serif', 28, cw - 8, { w: '700', fill: '#fff', sh: 8 }); });
      tx(g, 'WITH LOVE FROM', W / 2, gTop - 36, F.bold, 40, 800, { sp: .3, fill: A[1] }); yb = gTop - 80;
    } else yb -= 20;
    if (st.role.trim()) { tx(g, st.role, W / 2, yb - 20, F.bold, 56, 940, { up: 1, sp: .16, fill: A[2], sh: 12 }); yb -= 90; }
    tx(g, st.name.trim() || 'Your Name', W / 2, yb - 100, sty === 1 ? F.script : F.bold, sty === 1 ? 250 : 230, 980, { up: sty !== 1, fill: '#fff', sh: 26, sp: sty === 1 ? 0 : .03 });
  }
  function redraw() { clearTimeout(timer); timer = setTimeout(function () { try { draw(); } catch (e) {} }, 60); }
  function photoBtn(key, big, max) {
    var b = h('label', 'bn-ph' + (big ? ' big' : ''), '📷'), f = h('input'); f.type = 'file'; f.accept = 'image/*'; b.appendChild(f);
    function show() { if (imgs[key]) { b.textContent = ''; var i = h('img'); i.src = imgs[key].toDataURL('image/jpeg', .5); b.appendChild(i); b.appendChild(f); } }
    f.onchange = function () { var x = f.files[0]; if (!x) return; load(key, x, max).then(function () { show(); redraw(); }); }; show(); return b;
  }
  function inp(ph, val, max, cb) { var i = h('input'); i.type = 'text'; i.maxLength = max; i.placeholder = ph; i.value = val; i.oninput = function () { cb(i.value); redraw(); }; return i; }
  function card(n, t) { var c = h('div', 'bn-c'), hd = h('h3'); hd.innerHTML = '<i>' + n + '</i>' + t; c.appendChild(hd); return c; }
  function render() {
    root.innerHTML = ''; var w = h('div', 'bn-w'); root.appendChild(w);
    w.appendChild(h('h1', '', '🎊 Greeting Poster')); w.appendChild(h('p', 'bn-n', 'Full-page photo + bold typography → ready for WhatsApp Status.'));
    var pv = h('div', 'bn-pv'); cv = h('canvas'); cv.width = W; cv.height = H; pv.appendChild(cv); w.appendChild(pv);
    var c1 = card(1, 'Occasion & headline'), sel = h('select'); OCC.forEach(function (o, i) { var op = h('option', '', o[0]); op.value = i; sel.appendChild(op); }); sel.value = st.occ;
    var r = h('div', 'bn-row'), i1 = inp('Line 1', st.l1, 20, function (v) { st.l1 = v; }), i2 = inp('Line 2 (big)', st.l2, 20, function (v) { st.l2 = v; });
    sel.onchange = function () { st.occ = +sel.value; if (OCC[st.occ][1] || OCC[st.occ][2]) { st.l1 = i1.value = OCC[st.occ][1]; st.l2 = i2.value = OCC[st.occ][2]; } redraw(); };
    r.append(i1, i2); var sg = h('div', 'bn-seg'); STY.forEach(function (n, i) { var b = h('button', i === st.sty ? 'on' : '', n); b.type = 'button'; b.onclick = function () { st.sty = i; [].forEach.call(sg.children, function (x, j) { x.className = j === i ? 'on' : ''; }); redraw(); }; sg.appendChild(b); });
    var th = h('div', 'bn-th'); ACC.forEach(function (t, i) { var b = h('button', i === st.acc ? 'on' : ''); b.type = 'button'; b.title = t[0]; b.setAttribute('aria-label', t[0]); b.style.background = t[1]; b.onclick = function () { st.acc = i; [].forEach.call(th.children, function (x, j) { x.className = j === i ? 'on' : ''; }); redraw(); }; th.appendChild(b); });
    c1.append(sel, r, sg, th); w.appendChild(c1);
    var c2 = card(2, 'Main person (full-page photo)'), pr = h('div', 'bn-pr'); pr.appendChild(photoBtn('main', true, 1800)); var col = h('div'); col.style.cssText = 'display:grid;gap:8px;flex:1;min-width:0';
    col.append(inp('Name', st.name, 40, function (v) { st.name = v; }), inp('Role / age (optional)', st.role, 50, function (v) { st.role = v; })); pr.appendChild(col); c2.appendChild(pr); w.appendChild(c2);
    var c3 = card(3, 'Greeters <span style="font-weight:600;color:#9aa4bd">(up to 12)</span>'), gl = h('div'); gl.style.cssText = 'display:grid;gap:8px'; c3.appendChild(gl);
    var add = h('button', 'bn-add', '＋ Add greeter'); add.type = 'button';
    function gRows() { gl.innerHTML = ''; st.guests.forEach(function (x, i) { var row = h('div', 'bn-g'); row.appendChild(photoBtn('g' + x.id, false, 420)); row.appendChild(inp('Name', x.n, 30, function (v) { x.n = v; })); var rm = h('button', 'bn-x', '✕'); rm.type = 'button'; rm.setAttribute('aria-label', 'Remove'); rm.onclick = function () { delete imgs['g' + x.id]; st.guests.splice(i, 1); gRows(); redraw(); }; row.appendChild(rm); gl.appendChild(row); }); add.style.display = st.guests.length >= 12 ? 'none' : ''; }
    add.onclick = function () { st.guests.push({ id: ++st.seq, n: '' }); gRows(); redraw(); }; c3.appendChild(add); w.appendChild(c3); gRows();
    var c4 = card(4, 'Footer line <span style="font-weight:600;color:#9aa4bd">(optional)</span>'); c4.appendChild(inp('e.g. From all your friends', st.foot, 60, function (v) { st.foot = v; })); w.appendChild(c4);
    var bt = h('div', 'bn-bt'), dl = h('button', 'bn-btn', '⬇ Download'), sh = h('button', 'bn-btn wa', '🟢 WhatsApp Status'); dl.type = sh.type = 'button';
    function blob(cb) { draw(); cv.toBlob(cb, 'image/jpeg', .92); }
    dl.onclick = function () { blob(function (b) { var u = URL.createObjectURL(b), a = h('a'); a.href = u; a.download = 'poster-' + Date.now() + '.jpg'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 4000); }); };
    sh.onclick = function () { blob(function (b) { var f = new File([b], 'poster.jpg', { type: 'image/jpeg' }); if (navigator.canShare && navigator.canShare({ files: [f] })) navigator.share({ files: [f], title: st.l1 + ' ' + st.l2 }).catch(function () {}); else dl.onclick(); }); };
    bt.append(dl, sh); w.appendChild(bt); draw();
  }
  window.Banner = {
    mount: function (sc) { css(); root = sc; sc.classList.remove('art'); sc.classList.add('bn'); st = st || { occ: 0, l1: OCC[0][1], l2: OCC[0][2], sty: 0, acc: 0, name: '', role: '', foot: '', guests: [], seq: 0 };
      render(); var fl = document.fonts && document.fonts.load ? Promise.all(['120px "Bebas Neue"', '120px "Great Vibes"', '900 120px "Playfair Display"'].map(function (f) { return document.fonts.load(f).catch(function () {}); })) : Promise.resolve(); fl.then(function () { try { draw(); } catch (e) {} }); },
    unmount: function (sc) { clearTimeout(timer); if (sc) sc.classList.remove('bn'); }
  };
})();
