/* YouTube helper — shared by index.html (Mobile TV) and settings.html (▶ YouTube tab).
   - Settings are saved on this device (localStorage 'tk_yt') on top of YT_DEFAULT (youtube-config.js).
   - The API key (optional, only used to list a channel's videos) is kept on this device only and is never part of the public config. */
(function () {
  'use strict';
  var KEY = 'tk_yt', KAPI = 'tk_yt_api';
  var DEF = { on: false, mode: 'latest', channel: '', channelId: '', videoId: '', title: '', mute: true, loop: true };
  var PUB = ['on', 'mode', 'channel', 'channelId', 'videoId', 'title', 'mute', 'loop'];

  function jget(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function clean(c) {
    var o = {};
    o.on = !!c.on;
    o.mode = c.mode === 'video' || c.mode === 'live' ? c.mode : 'latest';   /* 'uploads' (old) = 'latest' */
    o.channel = String(c.channel || '').slice(0, 200);
    o.channelId = /^UC[\w-]{22}$/.test(c.channelId || '') ? c.channelId : '';
    o.videoId = /^[\w-]{11}$/.test(c.videoId || '') ? c.videoId : '';
    o.title = String(c.title || '').slice(0, 200);
    o.mute = c.mute !== false;
    o.loop = c.loop !== false;
    return o;
  }
  function get() { return clean(Object.assign({}, DEF, window.YT_DEFAULT || {}, jget(KEY) || {})); }
  function set(patch) {
    var c = clean(Object.assign(get(), patch || {}));
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
    return c;
  }
  function apiKey() { try { return (localStorage.getItem(KAPI) || '').trim(); } catch (e) { return ''; } }
  function setApiKey(k) { try { if (k) localStorage.setItem(KAPI, String(k).trim()); else localStorage.removeItem(KAPI); } catch (e) {} }

  /* ---------- parsing what the owner pastes ---------- */
  function videoId(s) {
    s = String(s || '').trim(); if (!s) return '';
    if (/^[\w-]{11}$/.test(s)) return s;
    var m = s.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/|\/v\/)([\w-]{11})/);
    return m ? m[1] : '';
  }
  function channelRef(s) {
    s = String(s || '').trim(); if (!s) return null;
    var m = s.match(/(UC[\w-]{22})/); if (m) return { id: m[1] };
    m = s.match(/@([\w.\-]+)/); if (m) return { handle: '@' + m[1] };
    if (/^[\w.\-]+$/.test(s)) return { handle: '@' + s };
    return null;
  }
  var thumb = function (id) { return /^[\w-]{11}$/.test(id || '') ? 'https://i.ytimg.com/vi/' + id + '/mqdefault.jpg' : ''; };

  /* ---------- player URL ---------- */
  function embedUrl(c, opt) {
    c = c || get(); opt = opt || {};
    var q = ['playsinline=1', 'rel=0', 'modestbranding=1', 'enablejsapi=1'];
    if (opt.autoplay !== false) q.push('autoplay=1');
    if (c.mute && opt.autoplay !== false) q.push('mute=1');
    try { if (/^https?:$/.test(location.protocol)) q.push('origin=' + encodeURIComponent(location.origin)); } catch (e) {}
    var base = 'https://www.youtube.com/embed/';
    if (c.mode === 'live') return c.channelId ? base + 'live_stream?channel=' + c.channelId + '&' + q.join('&') : '';
    if (c.mode === 'latest') {   /* the channel's uploads playlist always starts with the newest upload (Shorts included) */
      if (!c.channelId) return '';
      q.push('list=UU' + c.channelId.slice(2));
      return base + 'videoseries?' + q.join('&');
    }
    if (!c.videoId) return '';
    if (c.loop) q.push('loop=1', 'playlist=' + c.videoId);
    return base + c.videoId + '?' + q.join('&');
  }
  function label(c) {
    c = c || get();
    if (c.mode === 'live') return c.channelId ? 'Channel live stream' : '';
    if (c.mode === 'latest') return c.channelId ? 'Latest upload (auto)' : '';
    return c.videoId ? (c.title || 'Video ' + c.videoId) : '';
  }

  /* ---------- YouTube Data API (optional key) ---------- */
  function api(path, params) {
    var k = apiKey();
    if (!k) return Promise.reject(new Error('Add an API key to list your videos'));
    return fetch('https://www.googleapis.com/youtube/v3/' + path + '?' + params + '&key=' + encodeURIComponent(k)).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok || j.error) throw new Error((j.error && j.error.message) || 'HTTP ' + r.status);
        return j;
      });
    });
  }
  function resolveChannel(ref) {
    var q = ref.id ? 'id=' + encodeURIComponent(ref.id) : 'forHandle=' + encodeURIComponent(ref.handle);
    return api('channels', 'part=id,snippet&' + q).then(function (j) {
      var it = (j.items || [])[0]; if (!it) throw new Error('Channel not found');
      return { id: it.id, title: (it.snippet && it.snippet.title) || '' };
    });
  }
  function listVideos(channelId, max) {
    return api('playlistItems', 'part=snippet&maxResults=' + (max || 30) + '&playlistId=UU' + channelId.slice(2)).then(function (j) {
      return (j.items || []).map(function (it) {
        var s = it.snippet || {}, id = s.resourceId && s.resourceId.videoId;
        return { id: id, title: s.title || '', date: (s.publishedAt || '').slice(0, 10) };
      }).filter(function (v) { return /^[\w-]{11}$/.test(v.id || '') && v.title !== 'Private video' && v.title !== 'Deleted video'; });
    });
  }
  /* title of one video without an API key (YouTube oEmbed) */
  function titleOf(id) {
    return fetch('https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + id))
      .then(function (r) { if (!r.ok) throw new Error('x'); return r.json(); })
      .then(function (j) { return String(j.title || ''); }).catch(function () { return ''; });
  }
  function publicConfig() {
    var c = get(), o = {}; PUB.forEach(function (k) { o[k] = c[k]; }); return JSON.stringify(o, null, 2);
  }

  window.YT = {
    get: get, set: set, apiKey: apiKey, setApiKey: setApiKey,
    videoId: videoId, channelRef: channelRef, thumb: thumb,
    embedUrl: embedUrl, label: label, ready: function (c) { return !!embedUrl(c || get()); },
    resolveChannel: resolveChannel, listVideos: listVideos, titleOf: titleOf, publicConfig: publicConfig
  };
})();
