/* பகிரப்பட்ட media சேமிப்பு (IndexedDB).
   செட்டிங் பக்கத்தில் சேர்த்த வீடியோ / படம் / அட்டை / லோகோ ஆகியவை இங்கே சேமிக்கப்படும்;
   முதல் பக்கம் (app) அதையே எடுத்துக் காட்டும். */
(function () {
  'use strict';
  var DB = 'tk-media', ST = 'kv', dbp = null;
  function open() {
    if (dbp) return dbp;
    dbp = new Promise(function (res, rej) {
      try {
        var r = indexedDB.open(DB, 1);
        r.onupgradeneeded = function () { r.result.createObjectStore(ST); };
        r.onsuccess = function () { res(r.result); };
        r.onerror = function () { rej(r.error); };
      } catch (e) { rej(e); }
    });
    dbp.catch(function () { dbp = null; });
    return dbp;
  }
  function run(mode, fn) {
    return open().then(function (db) {
      return new Promise(function (res, rej) {
        var t = db.transaction(ST, mode), q = fn(t.objectStore(ST));
        t.oncomplete = function () { res(q ? q.result : undefined); };
        t.onerror = t.onabort = function () { rej(t.error); };
      });
    });
  }
  window.MediaStore = {
    put: function (k, v) { return run('readwrite', function (s) { return s.put(v, k); }).catch(function () {}); },
    get: function (k) { return run('readonly', function (s) { return s.get(k); }).catch(function () { return null; }); },
    del: function (k) { return run('readwrite', function (s) { return s.delete(k); }).catch(function () {}); },
    keys: function (prefix) {
      return run('readonly', function (s) { return s.getAllKeys(); })
        .then(function (a) { return (a || []).filter(function (k) { return String(k).indexOf(prefix || '') === 0; }); })
        .catch(function () { return []; });
    },
    delPrefix: function (prefix) {
      var self = this;
      return this.keys(prefix).then(function (a) { return Promise.all(a.map(function (k) { return self.del(k); })); });
    }
  };
})();
