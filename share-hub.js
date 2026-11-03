/* செட்டிங்ஸ் → 📣 பகிர்: ஒரே இடத்தில் எழுதி இணையதளம் + Facebook/Instagram (Meta Business Suite) + WhatsApp-க்கு அனுப்புதல்.
   இணையதளம்: நேரடியாக வெளியாகும். Meta / WhatsApp: உலாவியில் இருந்து தானாக இடுவதற்கு Meta அனுமதிக்காது (சேவையகம் + API தேவை);
   அதனால் caption நகலெடுத்து, Business Suite-ஐத் திறந்து, படத்தைத் தயாராக வைக்கிறது. */
(function () {
  'use strict';
  var KINDS = { article: ['📝 கட்டுரை', 'Articles'], shopping: ['🛒 கடை போஸ்டர்', 'Shopping'], events: ['🎪 நிகழ்வு போஸ்டர்', 'Events'] };
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
      im.onerror = function () { URL.revokeObjectURL(u); rej(new Error('படத்தைப் படிக்க முடியவில்லை')); }; im.src = u;
    });
  }
  function copy(text) {
    try { if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return false; }); } catch (e) {}
    var t = document.createElement('textarea'); t.value = text; t.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(t); t.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) {} t.remove(); return Promise.resolve(ok);
  }
  function blobOf(d) { var a = d.split(','), m = /:(.*?);/.exec(a[0])[1], b = atob(a[1]), n = b.length, u = new Uint8Array(n); while (n--) u[n] = b.charCodeAt(n); return new Blob([u], { type: m }); }

  function render() {
    box.innerHTML = '';
    var c = h('div', 'sc'); c.appendChild(h('h2', '', '📣 ஒரே இடத்தில் பகிர்'));
    c.appendChild(h('p', 'note', 'ஒருமுறை எழுதுங்கள் → இணையதளம், Facebook, Instagram, WhatsApp அனைத்துக்கும். (இணையதளத்தில் நேரடியாக வெளியாகும்; மற்றவற்றுக்கு கீழே உள்ள விளக்கம் பார்க்கவும்.)'));
    var l0 = h('label', '', 'எங்கே வெளியிட'), ks = h('select'); Object.keys(KINDS).forEach(function (k) { var o = h('option', '', KINDS[k][0]); o.value = k; ks.appendChild(o); }); l0.appendChild(ks);
    var l1 = h('label', '', 'தலைப்பு *'), ti = h('input'); ti.type = 'text'; ti.maxLength = 200; l1.appendChild(ti);
    var l2 = h('label', '', 'Caption / உரை * (எல்லா இடங்களிலும் இதுவே)'), tx = h('textarea'); tx.className = 'big'; tx.maxLength = 4000; l2.appendChild(tx);
    var row = h('div', 'st-row'), pick = h('label', 'btn', '📷 JPG படம்'), fi = h('input'); fi.type = 'file'; fi.accept = 'image/*'; fi.hidden = true; pick.appendChild(fi); pick.style.cursor = 'pointer'; row.appendChild(pick);
    var pv = h('div'); pv.style.cssText = 'max-width:220px'; var im = h('img'); im.style.cssText = 'width:100%;border-radius:10px;display:none'; pv.appendChild(im);
    fi.onchange = function (e) { var f = e.target.files[0]; e.target.value = ''; if (!f) return; shrink(f, 1200).then(function (d) { dataUrl = d; file = new File([blobOf(d)], 'post.jpg', { type: 'image/jpeg' }); im.src = d; im.style.display = 'block'; }).catch(function (x) { toast('⚠ ' + x.message); }); };
    c.append(l0, l1, l2, row, pv);

    function caption() { return (ti.value.trim() + '\n\n' + tx.value.trim()).trim(); }
    function valid() { if (!ti.value.trim() || !tx.value.trim()) { toast('தலைப்பு, உரை இரண்டும் தேவை'); return false; } return true; }
    function publishSite() {
      var S = window.ArticleStore.forKind(ks.value), k = ks.value, t = tx.value.trim();
      return S.submit({ kind: k, name: k === 'article' ? 'NEWS STUDIO' : '-', role: k === 'article' ? 'நிர்வாகம்' : '', title: ti.value.trim(), summary: t.slice(0, 280), body: t, photo: dataUrl, cutout: false, extra: '' })
        .then(function (id) { return S.setStatus(id, 'approved'); });
    }
    var b = h('div', 'st-row');
    function btn(txt, cls, fn) { var x = h('button', cls, txt); x.type = 'button'; x.onclick = fn; b.appendChild(x); return x; }
    btn('🚀 ஒரே கிளிக்: இணையதளம் + Meta Business Suite', '', function () {
      if (!valid()) return;
      var w = window.open('https://business.facebook.com/latest/composer', '_blank');   /* பயனர் தொடுதலுடன் உடனே திறக்க வேண்டும் */
      copy(caption()).then(function (ok) { toast(ok ? '✔ caption நகலெடுக்கப்பட்டது — Business Suite-ல் ஒட்டவும்' : 'caption-ஐக் கைமுறையாக நகலெடுக்கவும்'); });
      publishSite().then(function () { toast('✔ இணையதளத்தில் வெளியானது · Business Suite-ல் ஒட்டி Facebook + Instagram தேர்வு செய்து Publish அழுத்தவும்'); if (!w) toast('⚠ புதிய tab தடுக்கப்பட்டது — கீழே "Meta Business Suite திற" அழுத்தவும்'); })
        .catch(function (e) { toast('⚠ இணையதளத்தில் வெளியிட முடியவில்லை: ' + e.message); });
    });
    btn('🌐 இணையதளத்தில் மட்டும் வெளியிடு', 'alt', function () { if (!valid()) return; publishSite().then(function () { toast('✔ இணையதளத்தில் வெளியானது'); }).catch(function (e) { toast('⚠ ' + e.message); }); });
    btn('📘 Meta Business Suite திற', 'alt', function () { if (!valid()) return; copy(caption()); window.open('https://business.facebook.com/latest/composer', '_blank'); toast('caption நகலெடுக்கப்பட்டது'); });
    btn('🟢 WhatsApp-ல் பகிர் (Status)', 'alt', function () {
      if (!valid()) return; var data = { text: caption() };
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) data.files = [file];
      if (navigator.share) navigator.share(data).catch(function () {}); else window.open('https://wa.me/?text=' + encodeURIComponent(caption()), '_blank');
    });
    btn('📋 caption நகலெடு', 'alt', function () { if (valid()) copy(caption()).then(function () { toast('✔ நகலெடுக்கப்பட்டது'); }); });
    btn('⬇ படம் பதிவிறக்கு', 'alt', function () { if (!dataUrl) { toast('முதலில் படம் சேர்க்கவும்'); return; } var a = h('a'); a.href = dataUrl; a.download = 'post.jpg'; document.body.appendChild(a); a.click(); a.remove(); });
    c.appendChild(b); box.appendChild(c);

    var g = h('div', 'sc'); g.appendChild(h('h2', '', 'ℹ எது தானாக, எது கைமுறை?'));
    var ul = h('div', 'note'); ul.style.cssText = 'line-height:1.9;white-space:pre-wrap';
    ul.textContent = '✔ இணையதளம்: ஒரே கிளிக்கில் நேரடியாக வெளியாகும்.\n▸ Facebook பக்கம் + Instagram: Meta Business Suite ஒரே composer-ல் இரண்டையும் தேர்வு செய்து இடலாம் (இந்தப் பொத்தான் அதைத் திறந்து caption-ஐத் தயாராக வைக்கிறது; படத்தை ⬇ பதிவிறக்கி இணைக்கவும்). முழுத் தானியக்கத்திற்கு Meta API + சேவையகம் (Cloud Function) தேவை — அடுத்த கட்டம்.\n▸ WhatsApp Status: Meta தானாக இட அனுமதிக்கும் API இல்லை; "WhatsApp-ல் பகிர்" பொத்தான் பகிர்வுத் திரையைத் திறக்கும் — அங்கு My Status தேர்வு செய்யவும். WhatsApp-ல் "Share status to Instagram/Facebook Stories" இயக்கினால் அங்கிருந்து அவற்றிலும் போகும்.';
    g.appendChild(ul); box.appendChild(g);
  }
  window.ShareHub = { mount: function (el) { box = el; if (!box.firstChild) render(); } };
})();
