/* செட்டிங்ஸ் → 📣 பகிர்: ஒரே இடத்தில் எழுதி இணையதளம் + Facebook/Instagram (Meta Business Suite) + WhatsApp-க்கு அனுப்புதல்.
   இணையதளம்: நேரடியாக வெளியாகும். Meta / WhatsApp: உலாவியில் இருந்து தானாக இடுவதற்கு Meta அனுமதிக்காது (சேவையகம் + API தேவை);
   அதனால் caption நகலெடுத்து, Business Suite-ஐத் திறந்து, படத்தைத் தயாராக வைக்கிறது. */
(function () {
  'use strict';
  var KINDS = { article: ['📝 Article', 'Articles'], shopping: ['🛒 Shop poster', 'Shopping'], events: ['🎪 Event poster', 'Events'] };
  var box, file = null, dataUrl = '';
  function h(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function toast(m) { var t = document.getElementById('toast'); if (!t) return; t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove('on'); }, 2600); }
  function shrink(f, max) {
    return new Promise(function (res, rej) {
      var u = URL.createObjectURL(f), im = new Image();
      im.onload = function () {
        var k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
        var q = .85, d = c.toDataURL('image/jpeg', q); while (d.length * .75 > 600000 && q > .4) { q -= .1; d = c.toDataURL('image/jpeg', q); } res(d);
      };
      im.onerror = function () { URL.revokeObjectURL(u); rej(new Error('Could not read the image')); }; im.src = u;
    });
  }
  function copy(text) {
    try { if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return false; }); } catch (e) {}
    var t = document.createElement('textarea'); t.value = text; t.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(t); t.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) {} t.remove(); return Promise.resolve(ok);
  }
  function blobOf(d) { var a = d.split(','), m = /:(.*?);/.exec(a[0])[1], b = atob(a[1]), n = b.length, u = new Uint8Array(n); while (n--) u[n] = b.charCodeAt(n); return new Blob([u], { type: m }); }

  function render() {
    box.innerHTML = '';
    var c = h('div', 'sc'); c.appendChild(h('h2', '', '📣 Share from one place'));
    c.appendChild(h('p', 'note', 'Write once → website, Facebook, Instagram, WhatsApp. (The website publishes directly; see the notes below for the others.)'));
    var l0 = h('label', '', 'Publish as'), ks = h('select'); Object.keys(KINDS).forEach(function (k) { var o = h('option', '', KINDS[k][0]); o.value = k; ks.appendChild(o); }); l0.appendChild(ks);
    var l1 = h('label', '', 'Title *'), ti = h('input'); ti.type = 'text'; ti.maxLength = 200; l1.appendChild(ti);
    var l2 = h('label', '', 'Caption / text * (used everywhere)'), tx = h('textarea'); tx.className = 'big'; tx.maxLength = 4000; l2.appendChild(tx);
    var row = h('div', 'st-row'), pick = h('label', 'btn', '📷 JPG image'), fi = h('input'); fi.type = 'file'; fi.accept = 'image/*'; fi.hidden = true; pick.appendChild(fi); pick.style.cursor = 'pointer'; row.appendChild(pick);
    var pv = h('div'); pv.style.cssText = 'max-width:220px'; var im = h('img'); im.style.cssText = 'width:100%;border-radius:10px;display:none'; pv.appendChild(im);
    fi.onchange = function (e) { var f = e.target.files[0]; e.target.value = ''; if (!f) return; shrink(f, 1200).then(function (d) { dataUrl = d; file = new File([blobOf(d)], 'post.jpg', { type: 'image/jpeg' }); im.src = d; im.style.display = 'block'; }).catch(function (x) { toast('⚠ ' + x.message); }); };
    c.append(l0, l1, l2, row, pv);

    function caption() { return (ti.value.trim() + '\n\n' + tx.value.trim()).trim(); }
    function valid() { if (!ti.value.trim() || !tx.value.trim()) { toast('Title and text are both required'); return false; } return true; }
    function publishSite() {
      var S = window.ArticleStore.forKind(ks.value), k = ks.value, t = tx.value.trim();
      return S.submit({ kind: k, name: k === 'article' ? 'NEWS STUDIO' : '-', role: k === 'article' ? 'நிர்வாகம்' : '', title: ti.value.trim(), summary: t.slice(0, 280), body: t, photo: dataUrl, cutout: false, extra: '' })
        .then(function (id) { return S.setStatus(id, 'approved'); });
    }
    var b = h('div', 'st-row');
    function btn(txt, cls, fn) { var x = h('button', cls, txt); x.type = 'button'; x.onclick = fn; b.appendChild(x); return x; }
    btn('🚀 One click: website + Meta Business Suite', '', function () {
      if (!valid()) return;
      var w = window.open('https://business.facebook.com/latest/composer', '_blank');   /* பயனர் தொடுதலுடன் உடனே திறக்க வேண்டும் */
      copy(caption()).then(function (ok) { toast(ok ? '✔ Caption copied — paste it in Business Suite' : 'Copy the caption manually'); });
      publishSite().then(function () { toast('✔ Published on the website · paste in Business Suite, choose Facebook + Instagram and tap Publish'); if (!w) toast('⚠ New tab was blocked — tap "Open Meta Business Suite" below'); })
        .catch(function (e) { toast('⚠ Could not publish on the website: ' + e.message); });
    });
    btn('🌐 Publish on the website only', 'alt', function () { if (!valid()) return; publishSite().then(function () { toast('✔ Published on the website'); }).catch(function (e) { toast('⚠ ' + e.message); }); });
    btn('📘 Open Meta Business Suite', 'alt', function () { if (!valid()) return; copy(caption()); window.open('https://business.facebook.com/latest/composer', '_blank'); toast('Caption copied'); });
    btn('🟢 Share on WhatsApp (Status)', 'alt', function () {
      if (!valid()) return; var data = { text: caption() };
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) data.files = [file];
      if (navigator.share) navigator.share(data).catch(function () {}); else window.open('https://wa.me/?text=' + encodeURIComponent(caption()), '_blank');
    });
    btn('📋 Copy caption', 'alt', function () { if (valid()) copy(caption()).then(function () { toast('✔ Copied'); }); });
    btn('⬇ Download image', 'alt', function () { if (!dataUrl) { toast('Add an image first'); return; } var a = h('a'); a.href = dataUrl; a.download = 'post.jpg'; document.body.appendChild(a); a.click(); a.remove(); });
    c.appendChild(b); box.appendChild(c);

    var g = h('div', 'sc'); g.appendChild(h('h2', '', 'ℹ What is automatic, what is manual?'));
    var ul = h('div', 'note'); ul.style.cssText = 'line-height:1.9;white-space:pre-wrap';
    ul.textContent = '✔ Website: publishes directly with one click.\n▸ Facebook page + Instagram: Meta Business Suite lets you choose both in one composer (this button opens it with the caption ready; download the image and attach it). Full automation needs the Meta API + a server (Cloud Function) — a later step.\n▸ WhatsApp Status: there is no API that lets Meta post automatically; the "Share on WhatsApp" button opens the share sheet — choose My Status there. If you turn on "Share status to Instagram/Facebook Stories" in WhatsApp, it also goes to those.';
    g.appendChild(ul); box.appendChild(g);
  }
  /* ---------- 🎞 My videos: Mobile TV / Books-ல் தயாரான MP4 — பதிவிறக்கம் அல்லது WhatsApp Status ---------- */
  var urls = [];
  function fmt(n) { return n >= 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB'; }
  function when(ts) { var d = new Date(ts); return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
  function dl(r) { var u = URL.createObjectURL(r.blob), a = h('a'); a.href = u; a.download = r.name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 4000); }
  function shareVideo(r) {
    var f = new File([r.blob], r.name, { type: 'video/mp4' });
    if (navigator.canShare && navigator.canShare({ files: [f] })) {
      navigator.share({ files: [f], title: r.name }).catch(function () {});   /* share sheet → WhatsApp → My status */
    } else { dl(r); toast('⬇ Downloaded — open WhatsApp → Status → + and pick this video'); }
  }
  function mountVideos(el, onCount) {
    urls.forEach(function (u) { URL.revokeObjectURL(u); }); urls = [];
    if (!window.VideoLib) { el.textContent = ''; return; }
    VideoLib.list().then(function (a) {
      el.innerHTML = ''; if (onCount) onCount(a.length);
      var c = h('div', 'sc');
      c.appendChild(h('p', 'note', 'Videos you render in Mobile TV and Books are saved here automatically. Download them, or share to WhatsApp Status from your phone.'));
      if (!a.length) c.appendChild(h('div', 'st-empty', 'No videos yet — render one in Mobile TV or Books.'));
      a.forEach(function (r) {
        var row = h('div', 'vrow'), u = URL.createObjectURL(r.blob); urls.push(u);
        row.style.cssText = 'display:grid;grid-template-columns:96px minmax(0,1fr);gap:10px;align-items:start;padding:8px 0;border-top:1px solid var(--s-line)';
        var v = h('video'); v.src = u; v.controls = true; v.playsInline = true; v.preload = 'metadata'; v.style.cssText = 'width:96px;aspect-ratio:9/16;object-fit:cover;border-radius:8px;background:#000';
        var side = h('div'); side.style.cssText = 'display:grid;gap:6px;min-width:0';
        var nm = h('b', '', (r.kind === 'books' ? '📚 ' : '📺 ') + r.name); nm.style.cssText = 'font-size:13px;word-break:break-all';
        var meta = h('span', 'note', (r.kind === 'books' ? 'Books' : 'Mobile TV') + ' · ' + fmt(r.size) + ' · ' + when(r.ts));
        var acts = h('div', 'st-row');
        function b(t, cls, fn) { var x = h('button', cls, t); x.type = 'button'; x.onclick = fn; acts.appendChild(x); }
        b('⬇ Download', '', function () { dl(r); });
        b('🟢 WhatsApp Status', 'alt', function () { shareVideo(r); });
        b('🗑', 'alt', function () { if (confirm('Delete this video?')) VideoLib.remove(r.id).then(function () { mountVideos(el, onCount); }); });
        side.append(nm, meta, acts); row.append(v, side); c.appendChild(row);
      });
      el.appendChild(c);
    });
  }
  window.ShareHub = { mount: function (el) { box = el; if (!box.firstChild) render(); }, mountVideos: mountVideos };
})();
