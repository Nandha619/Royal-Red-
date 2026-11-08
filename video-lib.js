/* ரெண்டர் செய்த வீடியோக்களின் நூலகம் (IndexedDB — MediaStore வழியாக).
   Mobile TV / Books ஆகியவை MP4 தயாரானதும் இங்கே சேமிக்கும்; Settings → Share → My videos காட்டும். */
(function () {
  'use strict';
  var P = 'vid:', MAX = 15;
  function recs() {
    return MediaStore.keys(P).then(function (ks) { return Promise.all(ks.map(function (k) { return MediaStore.get(k); })); })
      .then(function (a) { return a.filter(function (r) { return r && r.blob; }); });
  }
  function prune() {
    return MediaStore.keys(P).then(function (ks) {
      ks.sort(); var extra = ks.slice(0, Math.max(0, ks.length - MAX));
      return Promise.all(extra.map(function (k) { return MediaStore.del(k); }));
    });
  }
  window.VideoLib = {
    /* kind: 'tv' | 'books' → வெற்றியானால் பதிவு, இல்லையெனில் null (இடம் இல்லை போன்றவை) */
    save: function (kind, blob, name) {
      if (!window.MediaStore || !blob) return Promise.resolve(null);
      var id = Date.now().toString(36), rec = { id: id, kind: kind, name: name || 'video.mp4', ts: Date.now(), size: blob.size, blob: blob };
      return MediaStore.put(P + id, rec).then(function () { return MediaStore.get(P + id); })
        .then(function (r) { if (!r || r.id !== id) return null; return prune().then(function () { return rec; }); })
        .catch(function () { return null; });
    },
    list: function () { return recs().then(function (a) { return a.sort(function (x, y) { return y.ts - x.ts; }); }); },
    remove: function (id) { return MediaStore.del(P + id); }
  };
})();
