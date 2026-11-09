/* Events → வாழ்த்து பேனர் (தெரு flex-banner போல): வாழ்த்தப்படுபவர் + வாழ்த்துபவர்களின் படம் & பெயர் → WhatsApp Status (9:16) போஸ்டர் */
(function () {
  'use strict';
  var W = 1080, H = 1920, FONT = '"Noto Serif Tamil","Noto Sans Tamil",serif';
  var OCC = [['பிறந்தநாள் வாழ்த்துகள்', '🎂'], ['திருமண வாழ்த்துகள்', '💐'], ['பொங்கல் வாழ்த்துகள்', '🌾'], ['தீபாவளி வாழ்த்துகள்', '🪔'], ['புத்தாண்டு வாழ்த்துகள்', '🎆'], ['திறப்பு விழா வாழ்த்துகள்', '🎉'], ['வெற்றி வாழ்த்துகள்', '🏆'], ['பதவியேற்பு வாழ்த்துகள்', '👏'], ['நினைவஞ்சலி', '🕯'], ['இனிய வாழ்த்துகள்', '✨']];
  var TH = [['சிவப்பு-தங்கம்', '#4a0409', '#b3121a', '#ffd45e'], ['பச்சை', '#052a17', '#0f8a4b', '#ffe08a'], ['நீலம்', '#081649', '#2455d6', '#ffd45e'], ['ஊதா', '#2c0646', '#8a2be2', '#ffd45e'], ['ஆரஞ்சு', '#5a1d00', '#ff7a00', '#fff1a8'], ['கருப்பு-தங்கம்', '#0a0a0a', '#3a3a3a', '#ffc83d']];
  var host, root, st, cv, timer, imgs = {};
  function h(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function css() {
    if (document.getElementById('bnCss')) return; var s = document.createElement('style'); s.id = 'bnCss';
    s.textContent = '#sec.bn{padding:0;background:#fff8e6;color:#2a1410}.bn *{box-sizing:border-box}.bn-w{max-width:560px;margin:0 auto;padding:12px 14px 40px;display:grid;gap:12px;font:500 14px/1.45 "Noto Sans Tamil",system-ui,sans-serif}' +
      '.bn h1{margin:4px 0 0;font:800 22px/1.2 inherit;color:#8f0d14;text-align:center}.bn-n{text-align:center;color:#8a6a52;font-size:12.5px;margin:0}' +
      '.bn-pv{position:sticky;top:0;z-index:3;display:grid;place-items:center;background:#fff8e6;padding:6px 0}.bn-pv canvas{height:min(46vh,420px);aspect-ratio:9/16;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.35);background:#222}' +
      '.bn-c{background:#fff;border:1px solid #ecd6a0;border-radius:14px;padding:12px;display:grid;gap:10px;box-shadow:0 2px 10px rgba(160,100,10,.1)}.bn-c h3{margin:0;font:800 14px/1 inherit;color:#8f0d14;display:flex;gap:8px;align-items:center}.bn-c h3 i{font-style:normal;width:22px;height:22px;border-radius:50%;background:#ffc83d;display:grid;place-items:center;font-size:12px}' +
      '.bn label{display:grid;gap:4px;font-size:12px;font-weight:700;color:#8a6a52}.bn input[type=text],.bn select{width:100%;height:40px;border:1px solid #e3c98c;border-radius:10px;padding:0 10px;font:inherit;font-size:14px;background:#fff;color:#2a1410}' +
      '.bn-th{display:flex;gap:8px;flex-wrap:wrap}.bn-th button{width:44px;height:44px;border-radius:50%;border:3px solid transparent;cursor:pointer}.bn-th button.on{border-color:#2a1410;transform:scale(1.08)}' +
      '.bn-pr{display:flex;gap:10px;align-items:center}.bn-ph{flex:none;width:64px;height:64px;border-radius:14px;border:2px dashed #d3b266;background:#fffaf0;display:grid;place-items:center;overflow:hidden;color:#b3121a;font-size:26px;cursor:pointer;position:relative}.bn-ph img{width:100%;height:100%;object-fit:cover}.bn-ph input{display:none}' +
      '.bn-g{display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center}.bn-x{width:36px;height:36px;border-radius:50%;border:0;background:#fde3e1;color:#b3121a;font-size:16px;cursor:pointer}' +
      '.bn-add{height:42px;border-radius:10px;border:2px dashed #d3b266;background:#fffaf0;color:#8f0d14;font-weight:800;cursor:pointer}.bn-btn{height:50px;border-radius:12px;border:0;font-weight:800;font-size:15px;cursor:pointer;color:#fff;background:linear-gradient(180deg,#e02a2a,#b3121a)}.bn-btn.wa{background:#1fa855}.bn-bt{display:grid;grid-template-columns:1fr 1fr;gap:10px}';
    document.head.appendChild(s);
  }
  function load(key, f) {
    return new Promise(function (res) {
      var u = URL.createObjectURL(f), im = new Image();
      im.onload = function () { var k = Math.min(1, 900 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); imgs[key] = c; res(); };
      im.onerror = function () { URL.revokeObjectURL(u); res(); }; im.src = u;
    });
  }
  function fit(g, txt, max, w, wt) { var s = max; do { g.font = (wt || 800) + ' ' + s + 'px ' + FONT; s -= 2; } while (g.measureText(txt).width > w && s > 16); return s; }
  function cover(g, im, x, y, w, hh) { var k = Math.max(w / im.width, hh / im.height), sw = w / k, sh = hh / k; g.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, x, y, w, hh); }
  function rr(g, x, y, w, hh, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + hh, r); g.arcTo(x + w, y + hh, x, y + hh, r); g.arcTo(x, y + hh, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function person(g, key, x, y, d, circle, gold) {
    g.save(); if (circle) { g.beginPath(); g.arc(x + d / 2, y + d / 2, d / 2, 0, 7); g.closePath(); } else rr(g, x, y, d, d, 26);
    g.clip(); if (imgs[key]) cover(g, imgs[key], x, y, d, d); else { g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x, y, d, d); g.fillStyle = 'rgba(255,255,255,.55)'; g.font = Math.round(d * .55) + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('👤', x + d / 2, y + d / 2); } g.restore();
    g.lineWidth = Math.max(4, d * .025); g.strokeStyle = gold; if (circle) { g.beginPath(); g.arc(x + d / 2, y + d / 2, d / 2, 0, 7); g.stroke(); } else { rr(g, x, y, d, d, 26); g.stroke(); }
  }
  function draw() {
    var g = cv.getContext('2d'), T = TH[st.th], d0 = T[1], m0 = T[2], gold = T[3], gr = st.guests.filter(function (x) { return x.n.trim() || imgs['g' + x.id]; });
    g.clearRect(0, 0, W, H); var bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, d0); bg.addColorStop(.5, m0); bg.addColorStop(1, d0); g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.save(); g.translate(W / 2, 640); for (var i = 0; i < 28; i++) { g.rotate(Math.PI * 2 / 28); g.fillStyle = 'rgba(255,255,255,' + (i % 2 ? .07 : .0) + ')'; g.beginPath(); g.moveTo(0, 0); g.lineTo(-90, -1700); g.lineTo(90, -1700); g.closePath(); g.fill(); } g.restore();
    var rg = g.createRadialGradient(W / 2, 640, 50, W / 2, 640, 800); rg.addColorStop(0, 'rgba(255,230,150,.35)'); rg.addColorStop(1, 'rgba(255,230,150,0)'); g.fillStyle = rg; g.fillRect(0, 0, W, H);
    for (var s = 0; s < 46; s++) { var px = (s * 977 % 1000) + 40, py = (s * 613 % 1800) + 60, r = 3 + (s % 5) * 2; g.fillStyle = 'rgba(255,215,100,' + (.25 + (s % 4) * .12) + ')'; g.beginPath(); g.arc(px, py, r, 0, 7); g.fill(); }
    g.lineWidth = 10; g.strokeStyle = gold; g.strokeRect(22, 22, W - 44, H - 44); g.lineWidth = 3; g.strokeRect(44, 44, W - 88, H - 88);
    /* தலைப்பு ரிப்பன் */
    g.fillStyle = 'rgba(0,0,0,.45)'; rr(g, 70, 84, W - 140, 190, 30); g.fill(); var rb = g.createLinearGradient(0, 70, 0, 260); rb.addColorStop(0, '#ffe08a'); rb.addColorStop(1, '#e0a21a'); g.fillStyle = rb; rr(g, 70, 70, W - 140, 190, 30); g.fill(); g.lineWidth = 5; g.strokeStyle = '#7a4a00'; g.stroke();
    g.fillStyle = '#3a0508'; g.textAlign = 'center'; g.textBaseline = 'middle'; var ts = fit(g, st.title, 108, 640); g.fillText(st.title, W / 2, 168);
    g.font = '80px sans-serif'; g.fillText(OCC[st.occ][1], 140, 168); g.fillText(OCC[st.occ][1], W - 140, 168);
    /* வாழ்த்தப்படுபவர் */
    var n = gr.length, M = n === 0 ? 800 : n <= 4 ? 640 : n <= 8 ? 560 : 480, mt = n === 0 ? 340 : 310, mx = (W - M) / 2;
    g.fillStyle = 'rgba(0,0,0,.35)'; rr(g, mx - 6, mt + 14, M + 12, M + 12, 34); g.fill(); person(g, 'main', mx, mt, M, false, gold);
    var py2 = mt + M + 26, pg = g.createLinearGradient(0, py2, 0, py2 + 120); pg.addColorStop(0, '#ffe08a'); pg.addColorStop(1, '#e0a21a'); g.fillStyle = pg; rr(g, 100, py2, W - 200, 120, 24); g.fill(); g.lineWidth = 4; g.strokeStyle = '#7a4a00'; g.stroke();
    g.fillStyle = '#3a0508'; g.textAlign = 'center'; g.textBaseline = 'middle'; fit(g, st.name || 'பெயர்', 80, W - 280); g.fillText(st.name || 'பெயர்', W / 2, py2 + 62);
    var yEnd = py2 + 120; if (st.role.trim()) { g.fillStyle = '#fff'; fit(g, st.role, 46, W - 200, 600); g.fillText(st.role, W / 2, yEnd + 44); yEnd += 70; }
    /* வாழ்த்துபவர்கள் */
    if (n) {
      var ry = yEnd + 26; g.fillStyle = 'rgba(0,0,0,.4)'; rr(g, 270, ry, W - 540, 64, 32); g.fill(); g.lineWidth = 3; g.strokeStyle = gold; g.stroke(); g.fillStyle = gold; fit(g, 'வாழ்த்துபவர்கள்', 38, W - 600); g.fillText('வாழ்த்துபவர்கள்', W / 2, ry + 34);
      var top = ry + 90, bot = H - (st.foot.trim() ? 130 : 80), cols = n <= 3 ? n : n <= 8 ? 4 : n <= 10 ? 5 : 6; cols = Math.max(1, cols); var rows = Math.ceil(n / cols), cw = (W - 120) / cols, ch = (bot - top) / rows, cell = Math.min(cw, ch * .98), dia = cell * .66;
      gr.forEach(function (x, i) { var r = Math.floor(i / cols), c = i % cols, inRow = r === rows - 1 ? n - cols * (rows - 1) : cols, ox = (W - inRow * cw) / 2, cx = ox + c * cw + cw / 2, cy = top + r * ch + (ch - cell) / 2;
        person(g, 'g' + x.id, cx - dia / 2, cy, dia, true, gold); var nm = x.n.trim(); if (nm) { g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'top'; var fs = fit(g, nm, Math.min(34, cell * .17), cw - 10, 700); g.fillText(nm, cx, cy + dia + 8); } });
    }
    if (st.foot.trim()) { g.fillStyle = gold; g.textAlign = 'center'; g.textBaseline = 'middle'; fit(g, st.foot, 40, W - 160, 700); g.fillText(st.foot, W / 2, H - 82); }
  }
  function redraw() { clearTimeout(timer); timer = setTimeout(function () { try { draw(); } catch (e) {} }, 60); }
  function photoBtn(key, onset) {
    var b = h('label', 'bn-ph', '📷'), f = h('input'); f.type = 'file'; f.accept = 'image/*'; b.appendChild(f);
    function show() { if (imgs[key]) { b.textContent = ''; var i = h('img'); i.src = imgs[key].toDataURL('image/jpeg', .5); b.appendChild(i); b.appendChild(f); } }
    f.onchange = function () { var x = f.files[0]; if (!x) return; load(key, x).then(function () { show(); redraw(); if (onset) onset(); }); }; show(); return b;
  }
  function render() {
    root.innerHTML = ''; var w = h('div', 'bn-w'); root.appendChild(w);
    w.appendChild(h('h1', '', '🎊 வாழ்த்து பேனர்')); w.appendChild(h('p', 'bn-n', 'படம் + பெயர் சேர்த்தால் WhatsApp Status-க்கான தெரு-பேனர் போஸ்டர் தயார்.'));
    var pv = h('div', 'bn-pv'); cv = h('canvas'); cv.width = W; cv.height = H; pv.appendChild(cv); w.appendChild(pv);
    var c1 = h('div', 'bn-c'); c1.appendChild(h('h3', '')); c1.firstChild.innerHTML = '<i>1</i>எந்த நிகழ்ச்சி?';
    var sel = h('select'); OCC.forEach(function (o, i) { var op = h('option', '', o[1] + ' ' + o[0]); op.value = i; sel.appendChild(op); }); sel.value = st.occ;
    var ti = h('input'); ti.type = 'text'; ti.maxLength = 40; ti.value = st.title; sel.onchange = function () { st.occ = +sel.value; st.title = OCC[st.occ][0]; ti.value = st.title; redraw(); }; ti.oninput = function () { st.title = ti.value; redraw(); };
    var lb = h('label', '', 'தலைப்பு'); lb.appendChild(ti); c1.append(sel, lb);
    var th = h('div', 'bn-th'); TH.forEach(function (t, i) { var b = h('button', i === st.th ? 'on' : ''); b.type = 'button'; b.title = t[0]; b.style.background = 'linear-gradient(135deg,' + t[1] + ',' + t[2] + ' 60%,' + t[3] + ')'; b.onclick = function () { st.th = i; [].forEach.call(th.children, function (x, j) { x.className = j === i ? 'on' : ''; }); redraw(); }; th.appendChild(b); }); c1.appendChild(th); w.appendChild(c1);
    var c2 = h('div', 'bn-c'); c2.appendChild(h('h3', '')); c2.firstChild.innerHTML = '<i>2</i>வாழ்த்தப்படுபவர்'; var pr = h('div', 'bn-pr'); pr.appendChild(photoBtn('main')); var col = h('div'); col.style.cssText = 'display:grid;gap:8px;flex:1;min-width:0';
    var nm = h('input'); nm.type = 'text'; nm.maxLength = 40; nm.placeholder = 'பெயர்'; nm.value = st.name; nm.oninput = function () { st.name = nm.value; redraw(); }; var rl = h('input'); rl.type = 'text'; rl.maxLength = 50; rl.placeholder = 'பதவி / வயது (விருப்பம்)'; rl.value = st.role; rl.oninput = function () { st.role = rl.value; redraw(); }; col.append(nm, rl); pr.appendChild(col); c2.appendChild(pr); w.appendChild(c2);
    var c3 = h('div', 'bn-c'); c3.appendChild(h('h3', '')); c3.firstChild.innerHTML = '<i>3</i>வாழ்த்துபவர்கள் <span style="font-weight:600;color:#8a6a52">(12 வரை)</span>'; var gl = h('div'); gl.style.cssText = 'display:grid;gap:8px'; c3.appendChild(gl);
    var add = h('button', 'bn-add', '＋ வாழ்த்துபவரைச் சேர்'); add.type = 'button';
    function gRows() { gl.innerHTML = ''; st.guests.forEach(function (x, i) { var r = h('div', 'bn-g'); r.appendChild(photoBtn('g' + x.id)); var ip = h('input'); ip.type = 'text'; ip.maxLength = 30; ip.placeholder = 'பெயர்'; ip.value = x.n; ip.oninput = function () { x.n = ip.value; redraw(); }; r.appendChild(ip); var rm = h('button', 'bn-x', '✕'); rm.type = 'button'; rm.onclick = function () { delete imgs['g' + x.id]; st.guests.splice(i, 1); gRows(); redraw(); }; r.appendChild(rm); gl.appendChild(r); }); add.style.display = st.guests.length >= 12 ? 'none' : ''; }
    add.onclick = function () { st.guests.push({ id: ++st.seq, n: '' }); gRows(); redraw(); }; c3.appendChild(add); w.appendChild(c3); gRows();
    var c4 = h('div', 'bn-c'); c4.appendChild(h('h3', '')); c4.firstChild.innerHTML = '<i>4</i>கீழ் வரி <span style="font-weight:600;color:#8a6a52">(விருப்பம்)</span>'; var ft = h('input'); ft.type = 'text'; ft.maxLength = 60; ft.placeholder = 'எ.கா. இப்படிக்கு — நண்பர்கள் குழு'; ft.value = st.foot; ft.oninput = function () { st.foot = ft.value; redraw(); }; c4.appendChild(ft); w.appendChild(c4);
    var bt = h('div', 'bn-bt'), dl = h('button', 'bn-btn', '⬇ பதிவிறக்கு'), sh = h('button', 'bn-btn wa', '🟢 WhatsApp Status'); dl.type = sh.type = 'button';
    function blob(cb) { draw(); cv.toBlob(cb, 'image/jpeg', .92); }
    dl.onclick = function () { blob(function (b) { var u = URL.createObjectURL(b), a = h('a'); a.href = u; a.download = 'banner-' + Date.now() + '.jpg'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 4000); }); };
    sh.onclick = function () { blob(function (b) { var f = new File([b], 'banner.jpg', { type: 'image/jpeg' }); if (navigator.canShare && navigator.canShare({ files: [f] })) navigator.share({ files: [f], title: st.title }).catch(function () {}); else dl.onclick(); }); };
    bt.append(dl, sh); w.appendChild(bt); draw();
  }
  window.Banner = {
    mount: function (sc, hostEl) { css(); host = hostEl; root = sc; sc.classList.remove('art'); sc.classList.add('bn'); st = st || { occ: 0, title: OCC[0][0], th: 0, name: '', role: '', foot: '', guests: [], seq: 0 };
      render(); (document.fonts && document.fonts.load ? Promise.all([document.fonts.load('800 60px "Noto Serif Tamil"'), document.fonts.load('700 30px "Noto Sans Tamil"')]).catch(function () {}) : Promise.resolve()).then(function () { try { draw(); } catch (e) {} }); },
    unmount: function (sc) { clearTimeout(timer); if (sc) sc.classList.remove('bn'); }
  };
})();
