/* உரிமையாளர் உள்நுழைவு — index.html (app) மற்றும் settings.html இரண்டிலும் பகிரப்படும்.
   இது ஒரு வசதிக்கான பூட்டு மட்டுமே (tamper-proof DRM அல்ல).
   ஒரே tab-ல் app ↔ settings மாறும்போது மீண்டும் கேட்காது; பக்கத்தை reload செய்தால் / புதிய tab-ல் கேட்கும். */
(function () {
  'use strict';
  var css = '' +
    '#ownerGate{position:fixed;inset:0;z-index:999999;background:radial-gradient(ellipse at top,#4a0a10 0%,#1c0508 55%,#0a0204 100%);display:flex;align-items:center;justify-content:center;padding:20px;font-family:"Noto Sans Tamil","Latha","Nirmala UI",system-ui,sans-serif;color:#13233c;box-sizing:border-box}' +
    '#ownerGate *{box-sizing:border-box}' +
    '#ownerGate[hidden]{display:none!important}' +
    '#ownerCard{width:min(100%,420px);background:#fff;border-radius:22px;padding:28px 24px;box-shadow:0 25px 80px #0008;text-align:center}' +
    '#ownerLogo{width:76px;height:76px;border-radius:20px;margin:0 auto 12px;display:grid;place-items:center;background:linear-gradient(145deg,#FFD84D,#E0A400);color:#101010;font-size:34px;font-weight:900;box-shadow:0 8px 24px #e0a40044}' +
    '#ownerCard h1{font-size:23px;margin:8px 0 4px;color:#101b31;font-weight:800}' +
    '#ownerCard .sub{font-size:13px;color:#65718a;margin:0 0 22px}' +
    '#ownerCard label{display:grid;text-align:left;color:#33415b;font-weight:700;margin:12px 0;gap:6px;font-size:14px}' +
    '#ownerCard input{width:100%;font:inherit;background:#f7f9fc;border:1px solid #d5deed;border-radius:10px;padding:12px;color:#17233a}' +
    '#ownerCard button{width:100%;margin-top:12px;border:0;font:inherit;font-weight:800;cursor:pointer;border-radius:10px;background:var(--accent,#B3121A);color:var(--on,#fff);padding:13px}' +
    '#ownerCard .hint{font-size:12px;color:#66738b;margin-top:15px;line-height:1.6}' +
    '#ownerMsg{min-height:22px;font-size:13px;color:#c51c2c;margin-top:8px}' +
    '#ownerLockBtn{position:fixed;left:10px;bottom:calc(env(safe-area-inset-bottom,0px) + 10px);z-index:99990;width:38px;height:38px;border:0;border-radius:50%;padding:0;display:grid;place-items:center;box-shadow:0 3px 12px #0003;font:inherit;font-size:17px;line-height:1;opacity:.75;background:var(--accent,#B3121A);color:var(--on,#fff);cursor:pointer}' +
    '#ownerLockBtn:hover,#ownerLockBtn:focus-visible{opacity:1}' +
    '#ownerLockBtn[hidden]{display:none!important}';
  var html = '' +
    '<div id="ownerGate" role="dialog" aria-modal="true" aria-labelledby="ownerTitle">' +
    '<section id="ownerCard">' +
    '<div id="ownerLogo">தீ</div>' +
    '<h1 id="ownerTitle">NEWS STUDIO</h1>' +
    '<p class="sub" id="ownerSubtitle">உரிமையாளர் உள்நுழைவு</p>' +
    '<form id="ownerForm" autocomplete="on">' +
    '<label>பயனர்பெயர்<input id="ownerUser" name="username" autocomplete="username" required maxlength="50" placeholder="உங்கள் பயனர்பெயர்"></label>' +
    '<label>கடவுச்சொல்<input id="ownerPass" name="password" type="password" autocomplete="current-password" required minlength="8" placeholder="குறைந்தது 8 எழுத்துகள்"></label>' +
    '<label id="ownerConfirmWrap" hidden>கடவுச்சொல்லை மீண்டும் உள்ளிடவும்<input id="ownerConfirm" type="password" autocomplete="new-password" minlength="8" placeholder="உறுதிப்படுத்தவும்"></label>' +
    '<button id="ownerSubmit" type="submit">உள்நுழை</button>' +
    '<div id="ownerMsg" role="status" aria-live="polite"></div>' +
    '</form>' +
    '<p class="hint" id="ownerHint">இந்தச் சாதனத்தில் மட்டுமே உள்நுழைவு விவரங்கள் சேமிக்கப்படும். கடவுச்சொல்லை மறந்தால் தரவு இழப்பைத் தவிர்க்க முன்கூட்டியே backup வைத்திருங்கள்.</p>' +
    '</section></div>' +
    '<button id="ownerLockBtn" type="button" hidden title="பூட்டு / வெளியேறு" aria-label="பூட்டு / வெளியேறு">🔒</button>';

  function boot() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var box = document.createElement('div'); box.innerHTML = html;
    while (box.firstChild) document.body.appendChild(box.firstChild);

    var $ = function (id) { return document.getElementById(id); };
    var gate = $('ownerGate'), form = $('ownerForm'), user = $('ownerUser'), pass = $('ownerPass'), confirm = $('ownerConfirm'),
      confirmWrap = $('ownerConfirmWrap'), submit = $('ownerSubmit'), msg = $('ownerMsg'), subtitle = $('ownerSubtitle'),
      hint = $('ownerHint'), lock = $('ownerLockBtn');
    var KEY = 'tk_owner_auth_v1', SESS = 'tk_owner_session_v1', setup = false, failures = 0, nextTry = 0;
    var read = function () { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
    var bytesToHex = function (b) { return Array.from(new Uint8Array(b)).map(function (x) { return x.toString(16).padStart(2, '0'); }).join(''); };
    var hexToBytes = function (h) { return new Uint8Array((h.match(/.{1,2}/g) || []).map(function (x) { return parseInt(x, 16); })); };
    async function digest(password, salt) {
      if (!crypto.subtle) throw new Error('இந்த WebView பாதுகாப்பான கடவுச்சொல் சரிபார்ப்பை ஆதரிக்கவில்லை. Android System WebView-ஐ புதுப்பிக்கவும்.');
      var enc = new TextEncoder(), key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
      return bytesToHex(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: hexToBytes(salt), iterations: 210000, hash: 'SHA-256' }, key, 256));
    }
    function show() {
      setup = !read(); gate.hidden = false; lock.hidden = true; confirmWrap.hidden = !setup;
      subtitle.textContent = setup ? 'முதல் முறை — உரிமையாளர் கணக்கை உருவாக்கவும்' : 'உரிமையாளர் உள்நுழைவு';
      submit.textContent = setup ? 'கணக்கை உருவாக்கி திறக்கவும்' : 'உள்நுழை';
      hint.textContent = setup ? 'பயனர்பெயர் மற்றும் குறைந்தது 8 எழுத்துகளுள்ள வலுவான கடவுச்சொல்லை அமைக்கவும். இவை இந்தச் சாதனத்தில் சேமிக்கப்படும்.' : 'தனிப்பட்ட பயன்பாட்டிற்கான உள்நுழைவு. கடவுச்சொல்லை யாருடனும் பகிர வேண்டாம்.';
      msg.textContent = ''; pass.value = ''; confirm.value = ''; setTimeout(function () { user.focus(); }, 100);
    }
    function unlock() { gate.hidden = true; lock.hidden = false; try { sessionStorage.setItem(SESS, '1'); } catch (e) {} }
    form.addEventListener('submit', async function (e) {
      e.preventDefault(); msg.textContent = '';
      if (Date.now() < nextTry) { msg.textContent = 'சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.'; return; }
      var u = user.value.trim(), p = pass.value;
      if (!u || p.length < 8) { msg.textContent = 'பயனர்பெயரை உள்ளிட்டு, குறைந்தது 8 எழுத்துகள் கொண்ட கடவுச்சொல்லைப் பயன்படுத்தவும்.'; return; }
      submit.disabled = true;
      try {
        if (setup) {
          if (p !== confirm.value) { msg.textContent = 'இரண்டு கடவுச்சொற்களும் ஒன்றாக இல்லை.'; return; }
          var salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16))), hash = await digest(p, salt);
          localStorage.setItem(KEY, JSON.stringify({ username: u, salt: salt, hash: hash, version: 1 })); unlock();
        } else {
          var rec = read();
          if (!rec || u !== rec.username || await digest(p, rec.salt) !== rec.hash) {
            failures++; if (failures >= 5) { nextTry = Date.now() + 30000; failures = 0; }
            msg.textContent = 'பயனர்பெயர் அல்லது கடவுச்சொல் சரியில்லை.'; return;
          }
          failures = 0; unlock();
        }
      } catch (err) { msg.textContent = 'பிழை: ' + (err.message || 'உள்நுழைவு செயல்படவில்லை'); if (setup) localStorage.removeItem(KEY); }
      finally { submit.disabled = false; }
    });
    lock.addEventListener('click', function () { try { sessionStorage.removeItem(SESS); } catch (e) {} show(); });

    /* reload செய்தால் / புதிய tab-ல் எப்போதும் கேட்கும்; app ↔ settings மாறும்போது கேட்காது */
    var navType = ''; try { var n = performance.getEntriesByType('navigation')[0]; navType = n ? n.type : ''; } catch (e) {}
    var ok = false; try { ok = sessionStorage.getItem(SESS) === '1'; } catch (e) {}
    if (ok && read() && navType !== 'reload') { gate.hidden = true; lock.hidden = false; } else show();

    /* சிறிது நேரம் பின்னணியில் இருந்து திரும்பினால் மீண்டும் பூட்டும் */
    var hiddenAt = 0;
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) hiddenAt = Date.now();
      else if (hiddenAt && Date.now() - hiddenAt > 120000 && gate.hidden) { try { sessionStorage.removeItem(SESS); } catch (e) {} show(); }
    });
  }
  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
