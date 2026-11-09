/* Settings pages: ஒரே வரிசை chip-தாவல்கள் (கீழ்-நோக்கி விரியும் பட்டியலுக்குப் பதில்) + Bright mode */
(function () {
  var root = document.documentElement;
  function bright() { var b = false; try { b = localStorage.getItem('tk_bright') === '1'; } catch (e) {} root.classList.toggle('bright', b); }
  bright(); addEventListener('storage', bright); addEventListener('message', function (e) { if (e.data && e.data.bright !== undefined) { try { localStorage.setItem('tk_bright', e.data.bright ? '1' : '0'); } catch (_) {} bright(); } });
  if (!root.classList.contains('m-settings')) return;
  function $(s, r) { return (r || document).querySelector(s); }
  function byTxt(t) { return [].filter.call(document.querySelectorAll('details.pn'), function (d) { return d.querySelector('summary').textContent.replace(/^[^A-Za-z]+/, '').indexOf(t) === 0; })[0]; }
  function build() {
    var key, tabs, anchor;
    if ($('#essBox')) {                       /* Mobile TV */
      key = 'pg_tv'; anchor = $('#essBox'); var g = function (id) { return $('#' + id); };
      tabs = [['✎', 'Text', [g('essBox'), g('tkBox')]], ['⬆', 'Video', [g('vidBox'), g('renderNote')]], ['🎨', 'Look', [g('subZoom'), g('subWm'), g('subTheme'), g('subCardPh')]],
        ['⚙', 'More', [g('subOut'), g('subBulk'), g('subMore'), g('subOnce')]]];
      var mh = $('.moreh'); if (mh) mh.style.display = 'none';
    } else if ($('.panels')) {                /* Books */
      key = 'pg_bk'; anchor = $('.panels').firstElementChild;
      tabs = [['🎤', 'Speaker', [byTxt('Speaker')]], ['📚', 'Books', [byTxt('Books')]], ['✎', 'Info', [byTxt('General info'), byTxt('Contact')]],
        ['🎨', 'Look', [byTxt('Theme'), byTxt('What shows'), byTxt('Change words')]]];
    } else return;
    tabs.forEach(function (t) { t[2] = t[2].filter(Boolean); });
    var nav = document.createElement('div'); nav.className = 'pgr'; nav.style.order = '0'; nav.setAttribute('role', 'tablist');
    var cur = 0; try { cur = Math.min(+sessionStorage.getItem(key) || 0, tabs.length - 1); } catch (e) {}
    var btns = tabs.map(function (t, i) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.innerHTML = '<i>' + t[0] + '</i><span>' + t[1] + '</span>';
      b.onclick = function () { show(i); }; nav.appendChild(b); return b;
    });
    anchor.parentNode.insertBefore(nav, anchor);
    function show(n) {
      cur = n; try { sessionStorage.setItem(key, n); } catch (e) {}
      tabs.forEach(function (t, i) {
        var on = i === n; btns[i].setAttribute('aria-selected', on);
        t[2].forEach(function (el) {
          el.classList.toggle('pg-off', !on);
          if (on && el.tagName === 'DETAILS' && el.classList.contains('pn')) { el.open = true; el.classList.toggle('pg-solo', t[2].length === 1); }
        });
      });
    }
    show(cur);
    window.addEventListener('hashchange', function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(build, 0); }); else setTimeout(build, 0);
})();
