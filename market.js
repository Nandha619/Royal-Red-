/* Shopping — classifieds. One "Add" button; the seller types a category title and the ad appears under that title.
   Category titles are collapsed rows; tap one to open it: one big sliding ad + the other ads as small lines.
   Market.mount(sc, hostEl) — storage/approval through ArticleStore('shopping') (admin approval required). */
(function () {
  'use strict';
  var S, root, host, all = [], openCat = '', q = '', tms = [];
  function h(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function css() {
    if (document.getElementById('mkCss')) return; var st = document.createElement('style'); st.id = 'mkCss';
    st.textContent = '.mk,.mk-ov{--b:#0b1020;--c:#161c30;--t:#f4f6fb;--m:#9aa4bd;--g:#ffc83d}' +
      '.mk{background:var(--b);color:var(--t);min-height:100%;padding:0 0 calc(env(safe-area-inset-bottom,0px) + 90px);font:500 14px/1.45 system-ui,"Noto Sans Tamil",sans-serif;position:relative}' +
      '#sec.mk{padding:0;background:#0b1020;color:#f4f6fb}#sec.mk h1{color:#ffc83d;margin:0;font-size:19px;text-align:left;text-shadow:none;border:0;padding:0}.mk b,.mk-ov b{color:inherit}#sec.mk h2{margin:0;padding:0;border:0;background:none;text-shadow:none}#sec.mk h2:before,#sec.mk h2:after{display:none!important;content:none!important}.mk *,.mk-ov *{box-sizing:border-box}.mk button{font:inherit;cursor:pointer;color:inherit}' +
      '.mk-top{position:sticky;top:0;z-index:5;display:flex;gap:8px;align-items:center;padding:10px 12px;background:linear-gradient(180deg,#0b1020 75%,rgba(11,16,32,0))}.mk-top h1{margin:0;font:800 19px/1 inherit;white-space:nowrap}' +
      '.mk-s{flex:1;min-width:0;height:38px;border-radius:99px;border:1px solid #2a3350;background:var(--c);color:var(--t);padding:0 14px;font:inherit}' +
      '.mk-list{display:grid;grid-template-columns:minmax(0,1fr);gap:10px;padding:6px 12px}.mk-hero{min-width:0;overflow:hidden}' +
      '.mk-cat{border-radius:16px;background:var(--c);border:1px solid #232b48;overflow:hidden}.mk-cat.open{border-color:rgba(255,200,61,.55);box-shadow:0 8px 24px rgba(0,0,0,.4)}' +
      '.mk-ch{width:100%;display:flex;align-items:center;gap:10px;padding:14px;background:none;border:0;text-align:left}.mk-ch h2{margin:0;flex:1;min-width:0;font:800 17px/1.2 inherit;color:#fff!important;border:0;padding:0;background:none;text-shadow:none;text-align:left}.mk-ch h2:before,.mk-ch h2:after{display:none}' +
      '.mk-ch small{color:var(--m);font-weight:700}.mk-ch i{font-style:normal;color:var(--g);transition:transform .2s}.mk-cat.open .mk-ch i{transform:rotate(180deg)}' +
      '.mk-pan{padding:0 10px 12px}' +
      '.mk-sd{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;border-radius:14px;background:#000}.mk-sd::-webkit-scrollbar{display:none}' +
      '.mk-sl1{flex:none;width:100%;scroll-snap-align:center;position:relative;aspect-ratio:16/10;border:0;padding:0;background:#1b2340;text-align:left;color:#fff;overflow:hidden}.mk-sl1 img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}' +
      '.mk-sl1:after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(11,16,32,.95) 0,rgba(11,16,32,.2) 55%,rgba(11,16,32,0))}.mk-sl1 div{position:absolute;left:12px;right:12px;bottom:10px;z-index:2}.mk-sl1 b{display:block;font:800 18px/1.25 inherit;text-shadow:0 2px 8px #000}.mk-sl1 span{color:var(--g);font-weight:800;font-size:16px}.mk-sl1 small{display:block;color:#cfd6ea;font-size:12px}' +
      '.mk-hero{margin-bottom:4px}.mk-pan.hero{padding:0}.mk-pan.hero .mk-sl1{aspect-ratio:4/5}.mk-pan.hero .mk-sd{border-radius:16px;box-shadow:0 10px 28px rgba(0,0,0,.5)}.mk-strip{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding:10px 0 2px}.mk-strip::-webkit-scrollbar{display:none}.mk-strip .mk-ln{flex:none;width:auto;max-width:170px;padding:4px 12px 4px 4px;border-radius:99px;background:#161c30;border:1px solid #232b48}.mk-strip .mk-ln.on{background:#ffc83d;border-color:#ffc83d;color:#1a0f0a}.mk-strip .mk-ln img,.mk-strip .mk-ln u{width:28px;height:28px;border-radius:50%}.mk-strip .mk-ln span{font-size:12px}' +
      '.mk-dots{display:flex;justify-content:center;gap:5px;margin:8px 0 4px}.mk-dots i{width:6px;height:6px;border-radius:50%;background:#46507a}.mk-dots i.on{background:var(--g);width:16px;border-radius:4px}' +
      '.mk-ln{display:flex;align-items:center;gap:10px;width:100%;padding:6px;border-radius:10px;border:0;background:none;text-align:left}.mk-ln.on{background:#1e2644}.mk-ln img,.mk-ln u{flex:none;width:40px;height:40px;border-radius:8px;object-fit:cover;background:#2a3350;display:grid;place-items:center;text-decoration:none;font-size:18px}' +
      '.mk-ln span{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:13px;font-weight:700}.mk-ln b{color:var(--g);font-size:13px;white-space:nowrap}' +
      '.mk-empty{margin:40px 20px;text-align:center;color:var(--m)}.mk-empty b{display:block;color:var(--t);font-size:17px;margin-bottom:6px}' +
      '.mk-fab{position:fixed;right:16px;bottom:calc(env(safe-area-inset-bottom,0px) + 18px);z-index:30;display:flex;gap:8px;align-items:center;height:50px;padding:0 22px;border-radius:99px;border:0;background:linear-gradient(180deg,#e02a2a,#b3121a);color:#fff;font-weight:800;font-size:15px;box-shadow:0 8px 22px rgba(215,25,32,.5)}' +
      '.mk-ov{position:fixed;inset:0;z-index:60;background:var(--b);color:var(--t);overflow-y:auto;overscroll-behavior:contain;font:500 14px/1.5 system-ui,sans-serif}.mk-ov button{font:inherit;cursor:pointer}' +
      '.mk-bar{position:sticky;top:0;z-index:3;display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(11,16,32,.92);backdrop-filter:blur(8px)}.mk-bar b{font-size:16px}' +
      '.mk-back{width:38px;height:38px;border-radius:50%;border:0;background:#222a45;color:#fff;font-size:18px}' +
      '.mk-gal{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;background:#000}.mk-gal::-webkit-scrollbar{display:none}.mk-gal img{flex:none;width:100%;max-height:62vh;object-fit:contain;scroll-snap-align:center}' +
      '.mk-in{padding:14px 16px 120px;max-width:640px;margin:0 auto}.mk-pr{font:800 26px/1.1 inherit;color:var(--g)}.mk-ti{font:700 19px/1.35 inherit;margin:6px 0}' +
      '.mk-chips{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.mk-chips span{background:var(--c);border:1px solid #2a3350;border-radius:99px;padding:4px 12px;font-size:12px;color:#cfd6ea}' +
      '.mk-ds{white-space:pre-wrap;color:#d6dcee;margin:10px 0}.mk-sll{display:flex;align-items:center;gap:10px;background:var(--c);border-radius:14px;padding:12px;margin-top:12px}.mk-sll i{font-style:normal;width:42px;height:42px;border-radius:50%;background:#2a3350;display:grid;place-items:center;font-size:20px}' +
      '.mk-act{position:fixed;left:0;right:0;bottom:0;z-index:4;display:flex;gap:10px;padding:10px 14px calc(env(safe-area-inset-bottom,0px) + 10px);background:rgba(11,16,32,.96);border-top:1px solid #222a45}' +
      '.mk-ov .mk-act a,.mk-ov .mk-act button{flex:1;display:grid;place-items:center;height:48px;border-radius:12px;border:0;font-weight:800;font-size:15px;text-decoration:none;color:#fff}.mk-call{background:linear-gradient(180deg,#e02a2a,#b3121a)}.mk-wa{background:#1fa855}.mk-sh{flex:0 0 52px!important;background:#222a45}' +
      '.mk-fm{padding:12px 16px 40px;max-width:560px;margin:0 auto;display:grid;gap:12px}.mk-fm label{display:grid;gap:5px;color:var(--m);font-size:12px;font-weight:700}' +
      '.mk-fm input,.mk-fm textarea{width:100%;background:var(--c);color:var(--t);border:1px solid #2a3350;border-radius:10px;padding:10px 12px;font:inherit;font-size:14px}.mk-fm textarea{min-height:90px;resize:vertical}' +
      '.mk-ph{display:flex;gap:8px;flex-wrap:wrap}.mk-ph .t,.mk-ph label{width:78px;height:78px;border-radius:12px;background:var(--c);border:2px dashed #3a4468;display:grid;place-items:center;overflow:hidden;color:var(--g);font-size:26px;cursor:pointer;position:relative}.mk-ph img{width:100%;height:100%;object-fit:cover}' +
      '.mk-ph .t u{position:absolute;top:2px;right:2px;width:20px;height:20px;border-radius:50%;background:#000a;color:#fff;font-size:12px;display:grid;place-items:center;text-decoration:none}' +
      '.mk-go{height:48px;border-radius:12px;border:0;background:linear-gradient(180deg,#e02a2a,#b3121a);color:#fff;font-weight:800;font-size:16px}.mk-go:disabled{opacity:.5}.mk-er{color:#ff8a80;min-height:18px;font-size:13px}.mk-hp{position:absolute;left:-9999px;opacity:0}';
    document.head.appendChild(st);
  }
  function parse(a) {
    var parts = String(a.summary || '').split(' · '), c = (parts[0] || '').replace(/^[^\p{L}\p{N}]+/u, '').trim() || 'Other';
    var ex = []; try { ex = JSON.parse(a.photos || '[]') || []; } catch (e) {}
    return { a: a, cat: c, key: c.toLowerCase(), loc: parts[1] || '', det: parts.slice(2).join(' · '), imgs: [a.photo].concat(ex).filter(Boolean), price: a.extra || '', phone: (a.role || '').replace(/[^\d+]/g, '') };
  }
  function nm() { var n = {}; try { n = JSON.parse(localStorage.getItem('np_tabs') || '{}') || {}; } catch (e) {} return n.shopping || ''; }
  function stop() { tms.forEach(clearInterval); tms = []; }

  function panel(list, hero) {
    var p = h('div', 'mk-pan' + (hero ? ' hero' : '')), sd = h('div', 'mk-sd'), dots = h('div', 'mk-dots'), lines = h('div', hero ? 'mk-strip' : 'mk-lns'), k = 0;
    list.forEach(function (m, li) {
      var b = h('button', 'mk-sl1'); b.type = 'button'; if (m.imgs[0]) { var i = h('img'); i.src = m.imgs[0]; i.alt = m.a.title; b.appendChild(i); }
      var d = h('div'); d.appendChild(h('b', '', m.a.title)); if (m.price) d.appendChild(h('span', '', m.price)); if (m.loc) d.appendChild(h('small', '', '📍 ' + m.loc)); b.appendChild(d); b.onclick = function () { detail(m); }; sd.appendChild(b);
      dots.appendChild(h('i')); var ln = h('button', 'mk-ln'); ln.type = 'button'; if (m.imgs[0]) { var t = h('img'); t.src = m.imgs[0]; t.alt = ''; ln.appendChild(t); } else ln.appendChild(h('u', '', '🛒'));
      ln.appendChild(h('span', '', m.a.title)); if (m.price && !hero) ln.appendChild(h('b', '', m.price)); ln.onclick = hero ? function () { sd.scrollTo({ left: li * sd.clientWidth, behavior: 'smooth' }); } : function () { detail(m); }; lines.appendChild(ln);
    });
    function mark() { k = Math.round(sd.scrollLeft / Math.max(1, sd.clientWidth)); [].forEach.call(dots.children, function (e, j) { e.className = j === k ? 'on' : ''; }); [].forEach.call(lines.children, function (e, j) { e.className = 'mk-ln' + (j === k ? ' on' : ''); if (hero && j === k) { var x = e.offsetLeft - (lines.clientWidth - e.offsetWidth) / 2; lines.scrollTo({ left: x, behavior: 'smooth' }); } }); }
    sd.addEventListener('scroll', function () { clearTimeout(sd._t); sd._t = setTimeout(mark, 60); }); mark();
    p.appendChild(sd); if (list.length > 1) { if (!hero) p.appendChild(dots); p.appendChild(lines); }
    if (list.length > 1) tms.push(setInterval(function () { if (!document.body.contains(sd)) { stop(); return; } var n = (Math.round(sd.scrollLeft / Math.max(1, sd.clientWidth)) + 1) % list.length; sd.scrollTo({ left: n * sd.clientWidth, behavior: 'smooth' }); }, 4500));
    setTimeout(mark, 0); return p;
  }
  function draw() {
    stop(); root.innerHTML = ''; root.classList.add('mk');
    var top = h('div', 'mk-top'); top.appendChild(h('h1', '', '🛒 ' + (nm() || 'Shopping')));
    var s = h('input', 'mk-s'); s.type = 'search'; s.placeholder = '🔍 Search ads…'; s.value = q; s.oninput = function () { q = s.value.trim().toLowerCase(); body(); }; top.appendChild(s); root.appendChild(top);
    root.appendChild(h('div', 'mk-list')); var fab = h('button', 'mk-fab', '＋ Add'); fab.type = 'button'; fab.onclick = form; root.appendChild(fab); body();
  }
  function body() {
    var b = root.querySelector('.mk-list'); if (!b) return; b.innerHTML = ''; stop();
    if (!all.length) { var e = h('div', 'mk-empty'); e.appendChild(h('b', '', 'No ads yet')); e.append('Tap “＋ Add”, type a category title and post your ad. It shows here once the admin approves it.'); b.appendChild(e); return; }
    var L = all.filter(function (m) { return !q || (m.a.title + ' ' + m.cat + ' ' + m.loc + ' ' + m.det).toLowerCase().indexOf(q) >= 0; });
    if (!L.length) { var e2 = h('div', 'mk-empty'); e2.appendChild(h('b', '', 'Nothing found')); e2.append('Try a different word.'); b.appendChild(e2); return; }
    var groups = [], idx = {}; L.forEach(function (m) { if (!(m.key in idx)) { idx[m.key] = groups.length; groups.push({ t: m.cat, k: m.key, l: [] }); } groups[idx[m.key]].l.push(m); });
    if (!q) { var hw = h('section', 'mk-hero'); hw.appendChild(panel(L, true)); b.appendChild(hw); }
    groups.forEach(function (g) {
      var open = !!q || openCat === g.k, c = h('section', 'mk-cat' + (open ? ' open' : '')), hd = h('button', 'mk-ch'); hd.type = 'button';
      hd.appendChild(h('h2', '', g.t)); hd.appendChild(h('small', '', g.l.length + (g.l.length > 1 ? ' ads' : ' ad'))); hd.appendChild(h('i', '', '▾'));
      hd.onclick = function () { openCat = openCat === g.k ? '' : g.k; body(); }; c.appendChild(hd); if (open) c.appendChild(panel(g.l)); b.appendChild(c);
    });
  }
  function ov() { closeOv(); var o = h('div', 'mk-ov'); host.appendChild(o); return o; }
  function closeOv() { if (host) [].forEach.call(host.querySelectorAll('.mk-ov'), function (e) { e.remove(); }); }
  function detail(m) {
    var o = ov(), bar = h('div', 'mk-bar'), bk = h('button', 'mk-back', '←'); bk.type = 'button'; bk.onclick = closeOv; bar.appendChild(bk); bar.appendChild(h('b', '', m.cat)); o.appendChild(bar);
    if (m.imgs.length) { var g = h('div', 'mk-gal'); m.imgs.forEach(function (u) { var i = h('img'); i.src = u; i.alt = m.a.title; g.appendChild(i); }); o.appendChild(g); }
    var n = h('div', 'mk-in'); n.appendChild(h('div', 'mk-pr', m.price || 'Price on request')); n.appendChild(h('div', 'mk-ti', m.a.title));
    var ch = h('div', 'mk-chips'); if (m.loc) ch.appendChild(h('span', '', '📍 ' + m.loc)); if (m.det) m.det.split(' ; ').forEach(function (d) { ch.appendChild(h('span', '', d)); }); if (m.a.createdAt) ch.appendChild(h('span', '', '🕒 ' + new Date(m.a.createdAt).toLocaleDateString('en-IN'))); n.appendChild(ch);
    if (m.a.body && m.a.body !== m.a.summary) n.appendChild(h('div', 'mk-ds', m.a.body));
    var sl = h('div', 'mk-sll'); sl.appendChild(h('i', '', '👤')); var st = h('div'); st.appendChild(h('b', '', m.a.name && m.a.name !== '-' ? m.a.name : 'Seller')); st.appendChild(document.createElement('br')); st.appendChild(h('small', '', m.phone)); sl.appendChild(st); n.appendChild(sl);
    o.appendChild(n);
    if (m.phone) {
      var ac = h('div', 'mk-act'), call = h('a', 'mk-call', '📞 Call'); call.href = 'tel:' + m.phone;
      var num = m.phone.replace(/^\+/, ''); if (num.length === 10) num = '91' + num;
      var wa = h('a', 'mk-wa', '🟢 WhatsApp'); wa.href = 'https://wa.me/' + num + '?text=' + encodeURIComponent('Hello, I am interested in your ad "' + m.a.title + '" ' + (m.price ? '(' + m.price + ') ' : '') + '— is it still available?'); wa.target = '_blank'; wa.rel = 'noopener';
      var sh = h('button', 'mk-sh', '📤'); sh.type = 'button'; sh.setAttribute('aria-label', 'Share'); sh.onclick = function () { var d = { title: m.a.title, text: m.a.title + ' — ' + m.price + (m.loc ? ' · ' + m.loc : '') + ' · ' + m.phone }; if (navigator.share) navigator.share(d).catch(function () {}); else if (navigator.clipboard) navigator.clipboard.writeText(d.text); };
      ac.append(call, wa, sh); o.appendChild(ac);
    }
  }
  function shrink(file, max, qlt, cap) {
    return new Promise(function (res, rej) {
      var u = URL.createObjectURL(file), im = new Image();
      im.onload = function () {
        var k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(im.width * k)); c.height = Math.max(1, Math.round(im.height * k));
        var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
        var q2 = qlt, d = c.toDataURL('image/jpeg', q2); while (d.length * .75 > cap && q2 > .35) { q2 -= .1; d = c.toDataURL('image/jpeg', q2); } res(d);
      };
      im.onerror = function () { URL.revokeObjectURL(u); rej(new Error('Could not read the image')); }; im.src = u;
    });
  }
  function form() {
    var o = ov(), bar = h('div', 'mk-bar'), bk = h('button', 'mk-back', '✕'); bk.type = 'button'; bk.onclick = closeOv; bar.appendChild(bk); bar.appendChild(h('b', '', '＋ Post an ad')); o.appendChild(bar);
    var fm = h('div', 'mk-fm'), imgs = [], busy = false, t0 = Date.now(), L = S.limits, seen = {}, opts = '';
    all.forEach(function (m) { if (!seen[m.key]) { seen[m.key] = 1; opts += '<option value="' + m.cat.replace(/"/g, '&quot;') + '">'; } });
    fm.innerHTML = '<div><div class="mk-ph" id="mP"></div><small style="color:#9aa4bd">📷 First photo is the cover — up to 4</small></div>' +
      '<label>Category title *<input id="mC" list="mCl" maxlength="30" placeholder="e.g. Cars, Bikes, House rent, Mobiles"></label><datalist id="mCl">' + opts + '</datalist>' +
      '<small style="color:#9aa4bd;margin-top:-6px">Your ad is shown under this title. Same title = same group.</small>' +
      '<label>Ad title *<input id="mT" maxlength="' + L.title + '" placeholder="e.g. Maruti Swift 2018"></label>' +
      '<label>Price (₹) *<input id="mX" inputmode="numeric" maxlength="14" placeholder="450000"></label>' +
      '<label>Place *<input id="mL" maxlength="60"></label>' +
      '<label>Details (year · km · fuel …)<input id="mD" maxlength="100" placeholder="2018 · 45,000 km · Petrol"></label>' +
      '<label>Description<textarea id="mB" maxlength="3000"></textarea></label>' +
      '<label>Your name<input id="mN" maxlength="' + L.name + '"></label>' +
      '<label>Phone number *<input id="mR" type="tel" inputmode="tel" maxlength="15"></label>' +
      '<input class="mk-hp" id="mH" tabindex="-1" autocomplete="off" aria-hidden="true"><div class="mk-er" id="mE" role="alert"></div>' +
      '<button class="mk-go" id="mS" type="button">Submit</button><small style="color:#9aa4bd">Your ad becomes visible to everyone after the admin approves it.' + (S.mode === 'local' ? ' (Test mode: saved on this device only.)' : '') + '</small>';
    o.appendChild(fm); var Q = function (s) { return fm.querySelector(s); }, er = function (m) { Q('#mE').textContent = m || ''; };
    function ph() {
      var w = Q('#mP'); w.innerHTML = '';
      imgs.forEach(function (d, i) { var t = h('div', 't'), im = h('img'); im.src = d; t.appendChild(im); var x = h('u', '', '✕'); x.onclick = function () { imgs.splice(i, 1); ph(); }; t.appendChild(x); w.appendChild(t); });
      if (imgs.length < 4) { var l = h('label', '', '＋'); l.setAttribute('for', 'mF'); w.appendChild(l); var f = h('input'); f.type = 'file'; f.id = 'mF'; f.accept = 'image/*'; f.multiple = true; f.hidden = true;
        f.onchange = function () { var fs = [].slice.call(f.files).slice(0, 4 - imgs.length); if (!fs.length) return; busy = true; Q('#mS').disabled = true; er('Processing photos…');
          Promise.all(fs.map(function (x, k) { var first = imgs.length + k === 0; return shrink(x, first ? 1100 : 900, .8, first ? 380000 : 130000); })).then(function (r) { imgs = imgs.concat(r).slice(0, 4); er(''); }).catch(function (e) { er(e.message); }).then(function () { busy = false; Q('#mS').disabled = false; ph(); }); };
        w.appendChild(f); }
    }
    ph();
    Q('#mS').onclick = function () {
      er(''); if (busy) { er('Processing photos…'); return; } if (Q('#mH').value) { closeOv(); return; }
      if (Date.now() - t0 < 3000) { er('Please wait a moment and tap again'); return; }
      var last = +localStorage.getItem('np_post_last') || 0; if (Date.now() - last < 20000) { er('Please wait a little before posting another'); return; }
      var cat = Q('#mC').value.replace(/\s+/g, ' ').trim().replace(/ · /g, ' '), t = Q('#mT').value.trim(), px = Q('#mX').value.replace(/[^\d]/g, ''), lc = Q('#mL').value.trim(), ph0 = Q('#mR').value.replace(/[^\d+]/g, '');
      if (!imgs.length) { er('Add at least one photo'); return; } if (!cat) { er('Type a category title'); return; } if (!t) { er('Enter the ad title'); return; } if (!px) { er('Enter the price'); return; } if (!lc) { er('Enter the place'); return; } if (ph0.replace(/\D/g, '').length < 10) { er('Enter a valid phone number'); return; }
      var ex = all.filter(function (m) { return m.key === cat.toLowerCase(); })[0]; if (ex) cat = ex.cat;
      var det = Q('#mD').value.trim().replace(/ · /g, ' ; ');
      var a = { kind: 'shopping', name: Q('#mN').value.trim() || '-', role: ph0, title: t, extra: '₹ ' + Number(px).toLocaleString('en-IN'), summary: cat + ' · ' + lc.replace(/ · /g, ' ') + (det ? ' · ' + det : ''),
        body: Q('#mB').value.trim(), photo: imgs[0], photos: JSON.stringify(imgs.slice(1)), cutout: false };
      Q('#mS').disabled = true; Q('#mS').textContent = 'Sending…';
      S.submit(a).then(function () { try { localStorage.setItem('np_post_last', String(Date.now())); } catch (e) {}
        fm.innerHTML = '<div class="mk-empty"><b>✔ Thank you!</b>Sent for admin approval. Your ad will appear here once approved.</div>'; var ok = h('button', 'mk-go', 'OK'); ok.type = 'button'; ok.onclick = function () { closeOv(); load(); }; fm.appendChild(ok);
      }).catch(function (x) { er('Could not send: ' + (x.message || '')); Q('#mS').disabled = false; Q('#mS').textContent = 'Submit'; });
    };
  }
  function load() {
    S.listApproved('shopping').then(function (l) { all = l.map(parse); draw(); }).catch(function () { all = []; draw(); root.querySelector('.mk-list').appendChild(h('div', 'mk-empty', 'Could not load. Check your internet connection.')); });
  }
  window.Market = {
    mount: function (sc, hostEl) { css(); host = hostEl || sc.parentNode; root = sc; S = window.ArticleStore.forKind('shopping'); openCat = ''; q = ''; closeOv(); sc.classList.remove('art'); root.innerHTML = ''; root.classList.add('mk'); load(); },
    unmount: function (sc) { stop(); closeOv(); if (sc) sc.classList.remove('mk'); }
  };
})();
