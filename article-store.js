/* Articles சேமிப்பு — Firebase Firestore (REST) அல்லது சோதனை முறை (localStorage).
   கட்டுரை நிலை: pending (காத்திருப்பு) → approved (ஏற்றது) / rejected (நிராகரித்தது)
   பொது பக்கத்தில் approved மட்டுமே தெரியும். ஒப்புதல் / நீக்கம் அட்மினுக்கு மட்டும் (Firestore rules + Firebase Auth). */
(function () {
  'use strict';
  var C = window.ARTICLES_CFG || {};
  var cloud = !!(C.projectId && C.apiKey);
  var AKEY = 'np_art_admin_v1';
  var COL = { article: 'articles', shopping: 'shopping', events: 'events' };
  var LKEYS = { article: 'np_articles_local_v1', shopping: 'np_shopping_local_v1', events: 'np_events_local_v1' };
  var LIM = { name: 80, role: 120, title: 200, summary: 400, body: 30000, extra: 120 };
  var KINDS = ['article', 'shopping', 'events'];
  var kindOf = function (a) { return a.kind || 'article'; };

  function jget(k, s) { try { return JSON.parse((s ? sessionStorage : localStorage).getItem(k) || 'null'); } catch (e) { return null; } }
  function jset(k, v, s) { try { (s ? sessionStorage : localStorage).setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

  /* ---------- Firestore REST ---------- */
  var DOC = function () { return 'https://firestore.googleapis.com/v1/projects/' + encodeURIComponent(C.projectId) + '/databases/(default)/documents'; };
  function enc(a) {
    return { fields: {
      name: { stringValue: a.name }, role: { stringValue: a.role }, title: { stringValue: a.title },
      summary: { stringValue: a.summary }, extra: { stringValue: a.extra || '' }, body: { stringValue: a.body }, photo: { stringValue: a.photo || '' },
      cutout: { booleanValue: !!a.cutout }, status: { stringValue: a.status },
      kind: { stringValue: a.kind || 'article' }, photos: { stringValue: a.photos || '' },
      createdAt: { integerValue: String(a.createdAt) }
    } };
  }
  function dec(d) {
    var f = d.fields || {}, s = function (k) { return f[k] && f[k].stringValue != null ? f[k].stringValue : ''; };
    return {
      id: d.name.split('/').pop(), name: s('name'), role: s('role'), title: s('title'), summary: s('summary'), extra: s('extra'), body: s('body'),
      photo: s('photo'), kind: s('kind') || 'article', photos: s('photos'), cutout: !!(f.cutout && f.cutout.booleanValue), status: s('status') || 'pending',
      createdAt: f.createdAt && f.createdAt.integerValue ? +f.createdAt.integerValue : 0
    };
  }
  function http(url, opt, tok) {
    opt = opt || {}; opt.headers = Object.assign({ 'Content-Type': 'application/json' }, opt.headers || {});
    if (tok) opt.headers.Authorization = 'Bearer ' + tok;
    return fetch(url, opt).then(function (r) {
      return r.text().then(function (t) {
        var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) {}
        if (!r.ok) { var m = j && j.error && (j.error.message || j.error.status) || ('HTTP ' + r.status); var e = new Error(m); e.status = r.status; throw e; }
        return j;
      });
    });
  }
  function query(col, status, tok) {
    var sq = { from: [{ collectionId: col }], limit: 200 };
    if (status) sq.where = { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: status } } };
    return http(DOC() + ':runQuery?key=' + encodeURIComponent(C.apiKey), { method: 'POST', body: JSON.stringify({ structuredQuery: sq }) }, tok)
      .then(function (rows) { return (rows || []).filter(function (r) { return r.document; }).map(function (r) { return dec(r.document); }); });
  }
  var byNew = function (a, b) { return b.createdAt - a.createdAt; };

  /* ---------- அட்மின் உள்நுழைவு (Firebase Auth REST) ---------- */
  function session() { var s = jget(AKEY, true); return s && s.idToken ? s : null; }
  function token() {
    var s = session(); if (!s) return Promise.reject(new Error('அட்மின் உள்நுழைவு தேவை'));
    if (Date.now() < s.exp - 60000) return Promise.resolve(s.idToken);
    return http('https://securetoken.googleapis.com/v1/token?key=' + encodeURIComponent(C.apiKey), {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(s.refreshToken)
    }).then(function (j) {
      s.idToken = j.id_token; s.refreshToken = j.refresh_token; s.exp = Date.now() + (+j.expires_in) * 1000; jset(AKEY, s, true); return s.idToken;
    }).catch(function () { try { sessionStorage.removeItem(AKEY); } catch (e) {} throw new Error('அமர்வு முடிந்தது — மீண்டும் உள்நுழையவும்'); });
  }

  function make(kind) {
  var col = COL[kind] || 'articles', LKEY = LKEYS[kind] || LKEYS.article, CKEY = 'np_' + kind + '_cache_v1';
  var Store = {
    kind: kind,
    mode: cloud ? 'cloud' : 'local',
    limits: LIM,
    adminEmail: C.adminEmail || '',

    /* பொது: ஏற்கப்பட்ட கட்டுரைகள் */
    listApproved: function () {
      if (!cloud) return Promise.resolve((jget(LKEY) || []).filter(function (a) { return a.status === 'approved'; }).sort(byNew));
      return query(col, 'approved').then(function (l) { l.sort(byNew); jset(CKEY, l.slice(0, 30)); return l; })
        .catch(function (e) { var c = jget(CKEY); if (c) return c; throw e; });
    },
    /* பொது: புதிய கட்டுரை → எப்போதும் pending */
    submit: function (a) {
      var r = {
        name: String(a.name || '').trim().slice(0, LIM.name), role: String(a.role || '').trim().slice(0, LIM.role),
        title: String(a.title || '').trim().slice(0, LIM.title), summary: String(a.summary || '').trim().slice(0, LIM.summary), extra: String(a.extra || '').trim().slice(0, LIM.extra),
        body: String(a.body || '').trim().slice(0, LIM.body), photo: a.photo || '', photos: typeof a.photos === 'string' ? a.photos.slice(0, 600000) : '', cutout: !!a.cutout,
        kind: KINDS.indexOf(a.kind) >= 0 ? a.kind : 'article', extra: String(a.extra || '').trim().slice(0, LIM.extra),
        status: 'pending', createdAt: Date.now()
      };
      if (r.kind !== 'article' && !r.body) r.body = r.summary;
      if (r.kind !== 'article' && !r.role) r.role = '-';
      if (r.kind !== 'article') { if (!r.name) r.name = '-'; if (!r.summary) r.summary = r.title; if (!r.body) r.body = r.summary; }
      if (!r.name || !r.role || !r.title || !r.summary || !r.body) return Promise.reject(new Error('எல்லா புலங்களையும் நிரப்பவும்'));
      if (!cloud) {
        var l = jget(LKEY) || []; r.id = uid(); l.push(r);
        return jset(LKEY, l) ? Promise.resolve(r.id) : Promise.reject(new Error('சேமிக்க இடம் போதவில்லை — சிறிய படத்தைப் பயன்படுத்தவும்'));
      }
      return http(DOC() + '/' + col + '?key=' + encodeURIComponent(C.apiKey), { method: 'POST', body: JSON.stringify(enc(r)) })
        .then(function (d) { return d.name.split('/').pop(); });
    },

    /* அட்மின் */
    isAdmin: function () { return cloud ? !!session() : true; },
    adminName: function () { var s = session(); return s ? s.email : ''; },
    login: function (email, pass) {
      if (!cloud) return Promise.resolve();
      return http('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + encodeURIComponent(C.apiKey), {
        method: 'POST', body: JSON.stringify({ email: email, password: pass, returnSecureToken: true })
      }).then(function (j) {
        jset(AKEY, { email: j.email, idToken: j.idToken, refreshToken: j.refreshToken, exp: Date.now() + (+j.expiresIn) * 1000 }, true);
      }).catch(function (e) { throw new Error(/INVALID|EMAIL|PASSWORD|CREDENTIAL/i.test(e.message) ? 'மின்னஞ்சல் அல்லது கடவுச்சொல் சரியில்லை' : e.message); });
    },
    logout: function () { try { sessionStorage.removeItem(AKEY); } catch (e) {} },
    listAll: function () {
      if (!cloud) return Promise.resolve((jget(LKEY) || []).slice().sort(byNew));
      return token().then(function (t) { return query(col, '', t); }).then(function (l) { return l.sort(byNew); });
    },
    setStatus: function (id, status) {
      if (!cloud) {
        var l = jget(LKEY) || []; l.forEach(function (a) { if (a.id === id) a.status = status; }); jset(LKEY, l); return Promise.resolve();
      }
      return token().then(function (t) {
        return http(DOC() + '/' + col + '/' + encodeURIComponent(id) + '?updateMask.fieldPaths=status&key=' + encodeURIComponent(C.apiKey),
          { method: 'PATCH', body: JSON.stringify({ fields: { status: { stringValue: status } } }) }, t);
      });
    },
    remove: function (id) {
      if (!cloud) { jset(LKEY, (jget(LKEY) || []).filter(function (a) { return a.id !== id; })); return Promise.resolve(); }
      return token().then(function (t) {
        return http(DOC() + '/' + col + '/' + encodeURIComponent(id) + '?key=' + encodeURIComponent(C.apiKey), { method: 'DELETE' }, t);
      });
    }
  };
  return Store;
  }
  var cache = {};
  var Main = make('article');
  Main.forKind = function (k) { return cache[k] || (cache[k] = k === 'article' ? Main : make(k)); };
  window.ArticleStore = Main;
})();
