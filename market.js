/* Shopping — OLX போல வாங்க / விற்க, Hotstar பாணி தோற்றம் (இருண்ட பின்னணி, பெரிய பேனர், கிடைமட்ட வரிசைகள்).
   Market.mount(sc, hostEl) — சேமிப்பு/ஒப்புதல் ArticleStore('shopping') வழியாக (நிர்வாகி ஒப்புதல் அவசியம்). */
(function () {
  'use strict';
  var S, root, host, all = [], cat = 'all', q = '';
  var CATS = [['car', '🚗', 'கார்'], ['bike', '🏍', 'பைக்'], ['mobile', '📱', 'மொபைல்'], ['rent', '🏠', 'வாடகை வீடு'], ['elec', '📺', 'மின்னணு'], ['furn', '🛋', 'வீட்டுப் பொருள்'], ['other', '🛒', 'மற்றவை']];
  var CN = {}; CATS.forEach(function (c) { CN[c[0]] = c; });
  function h(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function css() {
    if (document.getElementById('mkCss')) return; var st = document.createElement('style'); st.id = 'mkCss';
    st.textContent = '.mk,.mk-ov{--b:#0b1020;--c:#161c30;--t:#f4f6fb;--m:#9aa4bd;--g:#ffc83d;--r:#d71920}.mk{background:var(--b);color:var(--t);min-height:100%;padding:0 0 calc(env(safe-area-inset-bottom,0px) + 90px);font:500 14px/1.45 "Noto Sans Tamil",system-ui,sans-serif;position:relative}' +
      '#sec.mk{padding:0;background:#0b1020;color:#f4f6fb}#sec.mk h1{color:#ffc83d;margin:0;font-size:19px;text-align:left;text-shadow:none;border:0;padding:0}#sec.mk h2{color:#f4f6fb;border:0;padding:0;margin:0;font-size:17px;text-align:left;text-shadow:none;background:none}#sec.mk h2:after,#sec.mk h2:before{display:none}.mk b,.mk-ov b{color:inherit}.mk-hi b{color:#fff}.mk-hi span{color:#ffc83d}.mk .mk-ci b{color:#ffc83d}.mk *{box-sizing:border-box}.mk button{font:inherit;cursor:pointer;color:inherit}' +
      '.mk-top{position:sticky;top:0;z-index:5;display:flex;gap:8px;align-items:center;padding:10px 12px;background:linear-gradient(180deg,#0b1020 70%,rgba(11,16,32,0))}' +
      '.mk-top h1{margin:0;font:800 19px/1 inherit;color:var(--g);letter-spacing:.02em;white-space:nowrap}' +
      '.mk-s{flex:1;min-width:0;height:38px;border-radius:99px;border:1px solid #2a3350;background:var(--c);color:var(--t);padding:0 14px;font:inherit}' +
      '.mk-hero{position:relative;margin:0 12px;border-radius:16px;overflow:hidden;aspect-ratio:16/10;background:#1b2340;box-shadow:0 10px 30px rgba(0,0,0,.5)}' +
      '.mk-hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.mk-hero:after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(11,16,32,.96) 0,rgba(11,16,32,.35) 55%,rgba(11,16,32,0) 100%)}' +
      '.mk-hi{position:absolute;left:14px;right:14px;bottom:12px;z-index:2}.mk-hi b{display:block;font:800 20px/1.25 inherit;text-shadow:0 2px 8px #000}.mk-hi span{color:var(--g);font-weight:800;font-size:17px}' +
      '.mk .mk-hb{color:#111;margin-top:8px;display:inline-flex;gap:6px;align-items:center;height:36px;padding:0 18px;border-radius:99px;border:0;background:#fff;color:#111;font-weight:800}' +
      '.mk-dots{position:absolute;top:10px;right:12px;z-index:2;display:flex;gap:5px}.mk-dots i{width:6px;height:6px;border-radius:50%;background:#fff6}.mk-dots i.on{background:var(--g);width:16px;border-radius:4px}' +
      '.mk-cats{display:flex;gap:12px;overflow-x:auto;padding:14px 12px 4px;scrollbar-width:none}.mk-cats::-webkit-scrollbar{display:none}' +
      '.mk-cat{flex:none;display:grid;justify-items:center;gap:5px;width:64px;background:none;border:0;padding:0;color:var(--m)}.mk-cat i{font-style:normal;width:54px;height:54px;border-radius:50%;display:grid;place-items:center;font-size:25px;background:var(--c);border:2px solid transparent}' +
      '.mk-cat span{font-size:11px;font-weight:700;text-align:center;line-height:1.15}.mk-cat.on{color:var(--g)}.mk-cat.on i{border-color:var(--g);box-shadow:0 0 14px rgba(255,200,61,.4)}' +
      '.mk-row{margin-top:16px}.mk-rh{display:flex;justify-content:space-between;align-items:baseline;padding:0 14px 8px}.mk-rh h2{margin:0;font:800 17px/1 inherit}.mk-rh small{color:var(--m)}' +
      '.mk-rs{display:flex;gap:10px;overflow-x:auto;padding:0 12px 6px;scroll-snap-type:x proximity;scroll-padding-inline:12px;scrollbar-width:none}.mk-rs::-webkit-scrollbar{display:none}' +
      '.mk-card{flex:none;width:138px;scroll-snap-align:start;background:none;border:0;padding:0;text-align:left;color:inherit}' +
      '.mk-ci{position:relative;aspect-ratio:3/4;border-radius:12px;overflow:hidden;background:#1b2340;display:grid;place-items:center;font-size:40px;transition:transform .15s}.mk-card:active .mk-ci{transform:scale(.97)}' +
      '.mk-ci img{width:100%;height:100%;object-fit:cover}.mk-ci b{position:absolute;left:6px;bottom:6px;background:rgba(11,16,32,.88);color:var(--g);border-radius:8px;padding:3px 8px;font-size:13px;font-weight:800}' +
      '.mk-ct{margin-top:6px;font-size:13px;font-weight:700;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.mk-cl{color:var(--m);font-size:11px;margin-top:2px}' +
      '.mk-hot{margin:16px 12px 0;border-radius:18px;padding:12px 0 12px;box-shadow:0 8px 24px rgba(0,0,0,.45),inset 0 0 0 2px rgba(255,200,61,.55)}.mk-hot .mk-rs{padding:0 12px 4px}.mk-hot .mk-card{width:150px}' +
      '.mk-hh{display:flex;align-items:center;gap:10px;padding:0 12px 10px}.mk-hh h2{font:800 20px/1.1 inherit!important}.mk-hh small{color:#ffe9a8}.mk-hi2{font-size:34px}.mk-hadd{margin-left:auto;height:34px;padding:0 14px;border-radius:99px;border:0;background:#ffc83d;color:#1a0f0a!important;font-weight:800}.mk-hn{margin:0 12px;padding:16px;border:2px dashed rgba(255,255,255,.4);border-radius:12px;text-align:center;color:#fff;font-size:13px}' +
      '.mk-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:0 12px}.mk-grid .mk-card{width:auto}' +
      '.mk-empty{margin:40px 20px;text-align:center;color:var(--m)}.mk-empty b{display:block;color:var(--t);font-size:17px;margin-bottom:6px}' +
      '.mk-fab{position:fixed;right:16px;bottom:calc(env(safe-area-inset-bottom,0px) + 18px);z-index:30;display:flex;gap:8px;align-items:center;height:50px;padding:0 22px;border-radius:99px;border:0;background:linear-gradient(180deg,#e02a2a,#b3121a);color:#fff;font-weight:800;font-size:15px;box-shadow:0 8px 22px rgba(215,25,32,.5)}' +
      '.mk-ov{position:fixed;inset:0;z-index:60;background:var(--b);color:var(--t);overflow-y:auto;overscroll-behavior:contain;font:500 14px/1.5 "Noto Sans Tamil",system-ui,sans-serif}.mk-ov *{box-sizing:border-box}.mk-ov button{font:inherit;cursor:pointer}' +
      '.mk-bar{position:sticky;top:0;z-index:3;display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(11,16,32,.92);backdrop-filter:blur(8px)}.mk-bar b{font-size:16px}' +
      '.mk-back{width:38px;height:38px;border-radius:50%;border:0;background:#222a45;color:#fff;font-size:18px}' +
      '.mk-gal{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;background:#000}.mk-gal::-webkit-scrollbar{display:none}.mk-gal img{flex:none;width:100%;max-height:62vh;object-fit:contain;scroll-snap-align:center}' +
      '.mk-in{padding:14px 16px 120px;max-width:640px;margin:0 auto}.mk-pr{font:800 26px/1.1 inherit;color:var(--g)}.mk-ti{font:700 19px/1.35 inherit;margin:6px 0}' +
      '.mk-chips{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.mk-chips span{background:var(--c);border:1px solid #2a3350;border-radius:99px;padding:4px 12px;font-size:12px;color:#cfd6ea}' +
      '.mk-ds{white-space:pre-wrap;color:#d6dcee;margin:10px 0}.mk-sl{display:flex;align-items:center;gap:10px;background:var(--c);border-radius:14px;padding:12px;margin-top:12px}.mk-sl i{font-style:normal;width:42px;height:42px;border-radius:50%;background:#2a3350;display:grid;place-items:center;font-size:20px}' +
      '.mk-act{position:fixed;left:0;right:0;bottom:0;z-index:4;display:flex;gap:10px;padding:10px 14px calc(env(safe-area-inset-bottom,0px) + 10px);background:rgba(11,16,32,.96);border-top:1px solid #222a45}' +
      '.mk-ov .mk-act a,.mk-ov .mk-act button{flex:1;display:grid;place-items:center;height:48px;border-radius:12px;border:0;font-weight:800;font-size:15px;text-decoration:none;color:#fff}.mk-call{background:linear-gradient(180deg,#e02a2a,#b3121a)}.mk-wa{background:#1fa855}.mk-sh{flex:0 0 52px!important;background:#222a45}' +
      '.mk-fm{padding:12px 16px 40px;max-width:560px;margin:0 auto;display:grid;gap:12px}.mk-fm label{display:grid;gap:5px;color:var(--m);font-size:12px;font-weight:700}' +
      '.mk-fm input,.mk-fm select,.mk-fm textarea{width:100%;background:var(--c);color:var(--t);border:1px solid #2a3350;border-radius:10px;padding:10px 12px;font:inherit;font-size:14px}.mk-fm textarea{min-height:90px;resize:vertical}' +
      '.mk-ph{display:flex;gap:8px;flex-wrap:wrap}.mk-ph .t,.mk-ph label{width:78px;height:78px;border-radius:12px;background:var(--c);border:2px dashed #3a4468;display:grid;place-items:center;overflow:hidden;color:var(--g);font-size:26px;cursor:pointer;position:relative}.mk-ph img{width:100%;height:100%;object-fit:cover}' +
      '.mk-ph .t u{position:absolute;top:2px;right:2px;width:20px;height:20px;border-radius:50%;background:#000a;color:#fff;font-size:12px;display:grid;place-items:center;text-decoration:none}' +
      '.mk-go{height:48px;border-radius:12px;border:0;background:linear-gradient(180deg,#e02a2a,#b3121a);color:#fff;font-weight:800;font-size:16px}.mk-go:disabled{opacity:.5}.mk-er{color:#ff8a80;min-height:18px;font-size:13px}.mk-hp{position:absolute;left:-9999px;opacity:0}';
    document.head.appendChild(st);
  }
  function parse(a) {
    var parts = String(a.summary || '').split(' · '), c = 'other';
    for (var i = 0; i < CATS.length; i++) if (parts[0] && parts[0].indexOf(CATS[i][2]) >= 0) c = CATS[i][0];
    var ex = []; try { ex = JSON.parse(a.photos || '[]') || []; } catch (e) {}
    return { a: a, cat: c, loc: parts[1] || '', det: parts.slice(2).join(' · '), imgs: [a.photo].concat(ex).filter(Boolean), price: a.extra || '', phone: (a.role || '').replace(/[^\d+]/g, '') };
  }
  function card(m) {
    var c = h('button', 'mk-card'); c.type = 'button'; var ci = h('div', 'mk-ci');
    if (m.imgs[0]) { var i = h('img'); i.src = m.imgs[0]; i.alt = m.a.title; i.loading = 'lazy'; ci.appendChild(i); } else ci.textContent = CN[m.cat][1];
    if (m.price) ci.appendChild(h('b', '', m.price)); c.appendChild(ci); c.appendChild(h('div', 'mk-ct', m.a.title)); if (m.loc) c.appendChild(h('div', 'mk-cl', '📍 ' + m.loc));
    c.onclick = function () { detail(m); }; return c;
  }
  function row(title, list, grid) {
    var r = h('section', 'mk-row'), hd = h('div', 'mk-rh'); hd.appendChild(h('h2', '', title)); hd.appendChild(h('small', '', list.length + ' விளம்பரம்')); r.appendChild(hd);
    var s = h('div', grid ? 'mk-grid' : 'mk-rs'); list.forEach(function (m) { s.appendChild(card(m)); }); r.appendChild(s); return r;
  }
  var HOT = ['car', 'bike', 'rent'];
  var HOTC = { car: ['#7d0b12', '#d71920'], bike: ['#0a1f5c', '#2455d6'], rent: ['#06371f', '#0f8a4b'] };
  function hot(c, list) {
    var w = h('section', 'mk-hot'), g = HOTC[c[0]]; w.style.background = 'linear-gradient(135deg,' + g[0] + ',' + g[1] + ')';
    var hd = h('div', 'mk-hh'); hd.appendChild(h('span', 'mk-hi2', c[1])); var t = h('div'); t.appendChild(h('h2', '', c[2])); t.appendChild(h('small', '', list.length ? list.length + ' விளம்பரம்' : 'இன்னும் இல்லை')); hd.appendChild(t);
    var ad = h('button', 'mk-hadd', '＋ சேர்க்க'); ad.type = 'button'; ad.onclick = function () { form(c[0]); }; hd.appendChild(ad); w.appendChild(hd);
    if (list.length) { var s2 = h('div', 'mk-rs'); list.forEach(function (m) { s2.appendChild(card(m)); }); w.appendChild(s2); }
    else w.appendChild(h('div', 'mk-hn', c[2] + ' விற்க / வாடகைக்கு விட வேண்டுமா? “＋ சேர்க்க” தொடவும்.'));
    return w;
  }
  var heroT = null;
  function draw() {
    clearInterval(heroT); root.innerHTML = ''; root.classList.add('mk');
    var top = h('div', 'mk-top'); top.appendChild(h('h1', '', '🛒 ' + (nm() || 'Shopping')));
    var s = h('input', 'mk-s'); s.type = 'search'; s.placeholder = '🔍 கார், பைக், மொபைல்…'; s.value = q; s.oninput = function () { q = s.value.trim().toLowerCase(); body(); }; top.appendChild(s); root.appendChild(top);
    root.appendChild(h('div', 'mk-hero-w')); var cs = h('div', 'mk-cats');
    [['all', '✨', 'அனைத்தும்']].concat(CATS).forEach(function (c) { var b = h('button', 'mk-cat' + (cat === c[0] ? ' on' : '')); b.type = 'button'; b.innerHTML = '<i>' + c[1] + '</i><span>' + c[2] + '</span>'; b.onclick = function () { cat = c[0]; draw(); }; cs.appendChild(b); });
    root.appendChild(cs); root.appendChild(h('div', 'mk-body'));
    var fab = h('button', 'mk-fab', '＋ விற்க'); fab.type = 'button'; fab.onclick = function () { form(); }; root.appendChild(fab);
    body();
  }
  function nm() { var n = {}; try { n = JSON.parse(localStorage.getItem('np_tabs') || '{}') || {}; } catch (e) {} return n.shopping || ''; }
  function body() {
    var b = root.querySelector('.mk-body'), hw = root.querySelector('.mk-hero-w'); if (!b) return; b.innerHTML = ''; hw.innerHTML = ''; clearInterval(heroT);
    var L = all.filter(function (m) { return (cat === 'all' || m.cat === cat) && (!q || (m.a.title + ' ' + m.loc + ' ' + m.det + ' ' + m.a.summary).toLowerCase().indexOf(q) >= 0); });
    if (!all.length) { var e = h('div', 'mk-empty'); e.appendChild(h('b', '', 'இன்னும் விளம்பரங்கள் இல்லை')); e.append('கார், பைக், மொபைல் எதுவானாலும் “＋ விற்க” தொட்டு முதலில் சேர்க்கலாம் — நிர்வாகி ஒப்புதல் அளித்ததும் இங்கே தெரியும்.'); b.appendChild(e); return; }
    if (!L.length) { var e2 = h('div', 'mk-empty'); e2.appendChild(h('b', '', 'எதுவும் கிடைக்கவில்லை')); e2.append('வேறு பிரிவு அல்லது சொல்லைத் தேர்வு செய்யவும்.'); b.appendChild(e2); return; }
    var feat = [];
    if (feat.length && !q) {
      var hero = h('div', 'mk-hero'), im = h('img'), hi = h('div', 'mk-hi'), dots = h('div', 'mk-dots'), k = 0;
      hero.appendChild(im); hero.appendChild(dots); hero.appendChild(hi);
      var set = function () { var m = feat[k]; im.src = m.imgs[0]; hi.innerHTML = ''; hi.appendChild(h('b', '', m.a.title)); hi.appendChild(h('span', '', m.price)); var bt = h('button', 'mk-hb', '▶ பார்க்க'); bt.type = 'button'; bt.onclick = function () { detail(m); }; hi.appendChild(document.createElement('br')); hi.appendChild(bt);
        dots.innerHTML = ''; feat.forEach(function (_, j) { dots.appendChild(h('i', j === k ? 'on' : '')); }); };
      set(); if (feat.length > 1) heroT = setInterval(function () { if (!document.body.contains(hero)) { clearInterval(heroT); return; } k = (k + 1) % feat.length; set(); }, 4500);
      hw.appendChild(h('div', '')); hw.firstChild.style.height = '4px'; hw.appendChild(hero);
    }
    if (cat === 'all' && !q) {
      CATS.forEach(function (c) { var l = L.filter(function (m) { return m.cat === c[0]; }); if (HOT.indexOf(c[0]) >= 0) b.appendChild(hot(c, l)); else if (l.length) b.appendChild(row(c[1] + ' ' + c[2], l)); });
    } else b.appendChild(row((cat === 'all' ? '🔍 முடிவுகள்' : CN[cat][1] + ' ' + CN[cat][2]), L, true));
  }
  function ov() { closeOv(); var o = h('div', 'mk-ov'); host.appendChild(o); return o; }
  function closeOv() { if (host) [].forEach.call(host.querySelectorAll('.mk-ov'), function (e) { e.remove(); }); }
  function detail(m) {
    var o = ov(), bar = h('div', 'mk-bar'), bk = h('button', 'mk-back', '←'); bk.type = 'button'; bk.onclick = closeOv; bar.appendChild(bk); bar.appendChild(h('b', '', CN[m.cat][1] + ' ' + CN[m.cat][2])); o.appendChild(bar);
    if (m.imgs.length) { var g = h('div', 'mk-gal'); m.imgs.forEach(function (u) { var i = h('img'); i.src = u; i.alt = m.a.title; g.appendChild(i); }); o.appendChild(g); }
    var n = h('div', 'mk-in'); n.appendChild(h('div', 'mk-pr', m.price || 'விலை பேசித் தீர்மானிக்கலாம்')); n.appendChild(h('div', 'mk-ti', m.a.title));
    var ch = h('div', 'mk-chips'); if (m.loc) ch.appendChild(h('span', '', '📍 ' + m.loc)); if (m.det) m.det.split(' ; ').forEach(function (d) { ch.appendChild(h('span', '', d)); }); if (m.a.createdAt) ch.appendChild(h('span', '', '🕒 ' + new Date(m.a.createdAt).toLocaleDateString('ta-IN'))); n.appendChild(ch);
    if (m.a.body && m.a.body !== m.a.summary) n.appendChild(h('div', 'mk-ds', m.a.body));
    var sl = h('div', 'mk-sl'); sl.appendChild(h('i', '', '👤')); var st = h('div'); st.appendChild(h('b', '', m.a.name && m.a.name !== '-' ? m.a.name : 'விற்பவர்')); st.appendChild(document.createElement('br')); st.appendChild(h('small', '', m.phone)); sl.appendChild(st); n.appendChild(sl);
    o.appendChild(n);
    if (m.phone) {
      var ac = h('div', 'mk-act'), call = h('a', 'mk-call', '📞 அழைக்க'); call.href = 'tel:' + m.phone;
      var num = m.phone.replace(/^\+/, ''); if (num.length === 10) num = '91' + num;
      var wa = h('a', 'mk-wa', '🟢 WhatsApp'); wa.href = 'https://wa.me/' + num + '?text=' + encodeURIComponent('வணக்கம், "' + m.a.title + '" ' + (m.price ? '(' + m.price + ') ' : '') + 'விளம்பரம் பற்றி விசாரிக்க விரும்புகிறேன்.'); wa.target = '_blank'; wa.rel = 'noopener';
      var sh = h('button', 'mk-sh', '📤'); sh.type = 'button'; sh.setAttribute('aria-label', 'பகிர்'); sh.onclick = function () { var d = { title: m.a.title, text: m.a.title + ' — ' + m.price + (m.loc ? ' · ' + m.loc : '') + ' · ' + m.phone }; if (navigator.share) navigator.share(d).catch(function () {}); else if (navigator.clipboard) navigator.clipboard.writeText(d.text); };
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
      im.onerror = function () { URL.revokeObjectURL(u); rej(new Error('படத்தைப் படிக்க முடியவில்லை')); }; im.src = u;
    });
  }
  function form(pre) {
    var o = ov(), bar = h('div', 'mk-bar'), bk = h('button', 'mk-back', '✕'); bk.type = 'button'; bk.onclick = closeOv; bar.appendChild(bk); bar.appendChild(h('b', '', '＋ விளம்பரம் சேர்க்க')); o.appendChild(bar);
    var fm = h('div', 'mk-fm'), imgs = [], busy = false, t0 = Date.now(), L = S.limits;
    fm.innerHTML = '<div><div class="mk-ph" id="mP"></div><small style="color:#9aa4bd">📷 முதல் படம் முகப்புப் படம் — அதிகபட்சம் 4</small></div>' +
      '<label>பிரிவு<select id="mC">' + CATS.map(function (c) { return '<option value="' + c[0] + '">' + c[1] + ' ' + c[2] + '</option>'; }).join('') + '</select></label>' +
      '<label>தலைப்பு *<input id="mT" maxlength="' + L.title + '" placeholder="எ.கா. Maruti Swift 2018"></label>' +
      '<label>விலை (₹) *<input id="mX" inputmode="numeric" maxlength="14" placeholder="450000"></label>' +
      '<label>ஊர் / இடம் *<input id="mL" maxlength="60"></label>' +
      '<label>விவரம் (ஆண்டு · ஓடிய கி.மீ. · எரிபொருள்)<input id="mD" maxlength="100" placeholder="2018 · 45,000 km · Petrol"></label>' +
      '<label>முழு விளக்கம்<textarea id="mB" maxlength="3000"></textarea></label>' +
      '<label>உங்கள் பெயர்<input id="mN" maxlength="' + L.name + '"></label>' +
      '<label>கைபேசி எண் *<input id="mR" type="tel" inputmode="tel" maxlength="15"></label>' +
      '<input class="mk-hp" id="mH" tabindex="-1" autocomplete="off" aria-hidden="true"><div class="mk-er" id="mE" role="alert"></div>' +
      '<button class="mk-go" id="mS" type="button">சமர்ப்பிக்கவும்</button><small style="color:#9aa4bd">நிர்வாகி ஒப்புதல் அளித்த பிறகே விளம்பரம் அனைவருக்கும் தெரியும்.' + (S.mode === 'local' ? ' (சோதனை முறை: இந்தச் சாதனத்தில் மட்டும்.)' : '') + '</small>';
    o.appendChild(fm); if (pre) fm.querySelector('#mC').value = pre; var Q = function (s) { return fm.querySelector(s); }, er = function (m) { Q('#mE').textContent = m || ''; };
    function ph() {
      var w = Q('#mP'); w.innerHTML = '';
      imgs.forEach(function (d, i) { var t = h('div', 't'), im = h('img'); im.src = d; t.appendChild(im); var x = h('u', '', '✕'); x.onclick = function () { imgs.splice(i, 1); ph(); }; t.appendChild(x); w.appendChild(t); });
      if (imgs.length < 4) { var l = h('label', '', '＋'); l.setAttribute('for', 'mF'); w.appendChild(l); var f = h('input'); f.type = 'file'; f.id = 'mF'; f.accept = 'image/*'; f.multiple = true; f.hidden = true;
        f.onchange = function () { var fs = [].slice.call(f.files).slice(0, 4 - imgs.length); if (!fs.length) return; busy = true; Q('#mS').disabled = true; er('படங்கள் செயல்படுகின்றன…');
          Promise.all(fs.map(function (x, k) { return shrink(x, imgs.length + k === 0 && !k ? 1100 : 900, .8, imgs.length + k === 0 && !k ? 380000 : 130000); })).then(function (r) { imgs = imgs.concat(r).slice(0, 4); er(''); }).catch(function (e) { er(e.message); }).then(function () { busy = false; Q('#mS').disabled = false; ph(); }); };
        w.appendChild(f); }
    }
    ph();
    Q('#mS').onclick = function () {
      er(''); if (busy) { er('படங்கள் செயல்படுகின்றன…'); return; } if (Q('#mH').value) { closeOv(); return; }
      if (Date.now() - t0 < 3000) { er('சிறிது நேரம் கழித்து மீண்டும் அழுத்தவும்'); return; }
      var last = +localStorage.getItem('np_post_last') || 0; if (Date.now() - last < 20000) { er('அடுத்ததை சிறிது நேரம் கழித்து அனுப்பவும்'); return; }
      var t = Q('#mT').value.trim(), px = Q('#mX').value.replace(/[^\d]/g, ''), lc = Q('#mL').value.trim(), ph0 = Q('#mR').value.replace(/[^\d+]/g, '');
      if (!imgs.length) { er('குறைந்தது ஒரு படத்தைச் சேர்க்கவும்'); return; } if (!t) { er('தலைப்பை எழுதவும்'); return; } if (!px) { er('விலையை எழுதவும்'); return; } if (!lc) { er('ஊர் / இடத்தை எழுதவும்'); return; } if (ph0.replace(/\D/g, '').length < 10) { er('சரியான கைபேசி எண்ணை எழுதவும்'); return; }
      var c = CN[Q('#mC').value], det = Q('#mD').value.trim().replace(/ · /g, ' ; ');
      var a = { kind: 'shopping', name: Q('#mN').value.trim() || '-', role: ph0, title: t, extra: '₹ ' + Number(px).toLocaleString('en-IN'), summary: c[1] + ' ' + c[2] + ' · ' + lc.replace(/ · /g, ' ') + (det ? ' · ' + det : ''),
        body: Q('#mB').value.trim(), photo: imgs[0], photos: JSON.stringify(imgs.slice(1)), cutout: false };
      Q('#mS').disabled = true; Q('#mS').textContent = 'அனுப்புகிறது…';
      S.submit(a).then(function () { try { localStorage.setItem('np_post_last', String(Date.now())); } catch (e) {}
        fm.innerHTML = '<div class="mk-empty"><b>✔ நன்றி!</b>நிர்வாகியின் ஒப்புதலுக்கு அனுப்பப்பட்டது. ஒப்புதல் கிடைத்ததும் விளம்பரம் இங்கே தெரியும்.</div>'; var ok = h('button', 'mk-go', 'சரி'); ok.type = 'button'; ok.onclick = function () { closeOv(); load(); }; fm.appendChild(ok);
      }).catch(function (x) { er('அனுப்ப முடியவில்லை: ' + (x.message || '')); Q('#mS').disabled = false; Q('#mS').textContent = 'சமர்ப்பிக்கவும்'; });
    };
  }
  function load() {
    S.listApproved('shopping').then(function (l) { all = l.map(parse); draw(); }).catch(function () { all = []; draw(); var e = h('div', 'mk-empty', 'ஏற்ற முடியவில்லை. இணைய இணைப்பைச் சரிபார்க்கவும்.'); root.querySelector('.mk-body').appendChild(e); });
  }
  window.Market = {
    mount: function (sc, hostEl) { css(); host = hostEl || sc.parentNode; root = sc; S = window.ArticleStore.forKind('shopping'); cat = 'all'; q = ''; closeOv(); sc.classList.remove('art'); root.innerHTML = ''; root.classList.add('mk'); load(); },
    unmount: function (sc) { clearInterval(heroT); closeOv(); if (sc) sc.classList.remove('mk'); }
  };
})();
