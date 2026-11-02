/* எழுத்தாளர் புகைப்படம் (JPG) → உருவம் மட்டும் வெட்டிய (cut-out) PNG.
   சாதனத்திலேயே (browser-ல்) பின்னணி நீக்கப்படும் — படம் எந்த சேவையகத்திற்கும் அனுப்பப்படாது.
   முதல் முறை சுமார் 40 MB மாதிரி இறக்கப்படும் (பிறகு cache-ல் இருக்கும்). */
(function () {
  'use strict';
  var LIBS = [
    'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/+esm',
    'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.5/+esm'
  ];
  var lib = null;
  function loadLib() {
    if (lib) return lib;
    var i = 0;
    function next() {
      if (i >= LIBS.length) return Promise.reject(new Error('lib'));
      return import(LIBS[i++]).then(function (m) { return m.removeBackground || (m.default && m.default.removeBackground) || m.default; }).catch(next);
    }
    lib = next().catch(function (e) { lib = null; throw e; });
    return lib;
  }

  function readImg(file, maxSide) {
    return new Promise(function (res, rej) {
      var url = URL.createObjectURL(file), im = new Image();
      im.onload = function () {
        var w = im.naturalWidth, h = im.naturalHeight, k = Math.min(1, maxSide / Math.max(w, h));
        var c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(url); res(c);
      };
      im.onerror = function () { URL.revokeObjectURL(url); rej(new Error('படத்தைப் படிக்க முடியவில்லை')); };
      im.src = url;
    });
  }
  var toBlob = function (c, type, q) { return new Promise(function (r) { c.toBlob(r, type, q); }); };
  function blobToCanvas(b) {
    return new Promise(function (res, rej) {
      var url = URL.createObjectURL(b), im = new Image();
      im.onload = function () {
        var c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
        c.getContext('2d').drawImage(im, 0, 0); URL.revokeObjectURL(url); res(c);
      };
      im.onerror = function () { URL.revokeObjectURL(url); rej(new Error('cutout decode')); };
      im.src = url;
    });
  }

  /* வெளிப்படையான விளிம்பை வெட்டி, உருவத்தை மட்டும் விட்டு, அளவைக் குறைத்தல் */
  function trim(c, maxH) {
    var w = c.width, h = c.height, d = c.getContext('2d').getImageData(0, 0, w, h).data, x0 = w, y0 = h, x1 = -1, y1 = -1, x, y;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 24) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < 0) return c;
    var pad = Math.round(Math.max(x1 - x0, y1 - y0) * 0.02); x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(w - 1, x1 + pad); y1 = Math.min(h - 1, y1 + pad);
    var cw = x1 - x0 + 1, ch = y1 - y0 + 1, k = Math.min(1, maxH / ch), o = document.createElement('canvas');
    o.width = Math.max(1, Math.round(cw * k)); o.height = Math.max(1, Math.round(ch * k));
    var g = o.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(c, x0, y0, cw, ch, 0, 0, o.width, o.height);
    return o;
  }
  /* PNG, ~600 KB-க்குள் (Firestore ஆவண வரம்பு 1 MB) */
  function pngUnder(c, maxBytes) {
    var h = c.height;
    function pass() {
      var s = c;
      if (h !== c.height) { s = document.createElement('canvas'); s.height = h; s.width = Math.round(c.width * h / c.height); s.getContext('2d').drawImage(c, 0, 0, s.width, s.height); }
      var u = s.toDataURL('image/png');
      return (u.length * 0.75 > maxBytes && h > 220) ? (h = Math.round(h * 0.82), pass()) : u;
    }
    return pass();
  }

  window.PhotoCutout = {
    /* file → { dataUrl, cutout }  (cutout=false ஆனால் அசல் படம் சிறிதாக்கப்பட்டு வரும்) */
    process: function (file, onStatus) {
      var say = onStatus || function () {};
      return readImg(file, 1100).then(function (src) {
        say('மாதிரி ஏற்றுகிறது… (முதல் முறை சற்று நேரமாகும்)', 0);
        return Promise.all([loadLib(), toBlob(src, 'image/png')]).then(function (a) {
          var remove = a[0], blob = a[1];
          return remove(blob, {
            output: { format: 'image/png' },
            progress: function (key, cur, tot) {
              if (/fetch|download/i.test(key)) say('மாதிரி இறக்கப்படுகிறது…', tot ? cur / tot : 0);
              else say('உருவத்தை வெட்டுகிறது…', 1);
            }
          });
        }).then(function (out) { return blobToCanvas(out); }).then(function (c) {
          return { dataUrl: pngUnder(trim(c, 620), 600000), cutout: true };
        }).catch(function (err) {
          console.warn('cutout failed', err);
          var s = src, k = Math.min(1, 520 / s.height), o = document.createElement('canvas');
          o.width = Math.round(s.width * k); o.height = Math.round(s.height * k); o.getContext('2d').drawImage(s, 0, 0, o.width, o.height);
          return { dataUrl: o.toDataURL('image/jpeg', 0.82), cutout: false };
        });
      });
    }
  };
})();
