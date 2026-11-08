/* இணையதளக் கோப்புகளை tauri/app-க்கு நகலெடுத்து, இணையம் இல்லாமல் இயங்கும்படி மாற்றுகிறது */
const fs = require('fs'), path = require('path');
const src = path.join(__dirname, '..'), dst = path.join(__dirname, 'app');
fs.rmSync(dst, { recursive: true, force: true }); fs.mkdirSync(dst, { recursive: true });
const ok = /\.(html|js|css|json|svg|png|jpg|jpeg|webp|ico|woff2?|mp3|mp4)$/i;
for (const f of fs.readdirSync(src)) {
  const p = path.join(src, f);
  if (fs.statSync(p).isFile() && ok.test(f) && f !== 'sw.js') fs.copyFileSync(p, path.join(dst, f));
}
/* mp4-muxer: CDN-க்குப் பதில் உள்ளேயே */
const mux = path.join(__dirname, 'node_modules', 'mp4-muxer', 'build', 'mp4-muxer.js');
if (!fs.existsSync(mux)) throw new Error('mp4-muxer missing — run npm install first');
fs.copyFileSync(mux, path.join(dst, 'mp4-muxer.js'));
const bridge = `<script>(function(){function open(u){try{window.__TAURI_INTERNALS__.invoke('plugin:opener|open_url',{url:u});return true}catch(e){return false}}
var ext=function(u){try{var x=new URL(u,location.href);return /^(https?|mailto|tel):/.test(x.protocol)&&x.origin!==location.origin?x.href:null}catch(e){return null}};
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;var u=ext(a.getAttribute('href'));if(u&&!a.hasAttribute('download')){e.preventDefault();open(u)}},true);
var wo=window.open;window.open=function(u){var x=u&&ext(u);if(x&&open(x))return null;return wo.apply(window,arguments)}})();</script>`;
for (const f of fs.readdirSync(dst).filter(f => f.endsWith('.html'))) {
  const p = path.join(dst, f); let s = fs.readFileSync(p, 'utf8');
  s = s.replace(/https:\/\/cdn\.jsdelivr\.net\/npm\/mp4-muxer@[\d.]+\/build\/mp4-muxer\.js/g, 'mp4-muxer.js');
  s = s.replace(/<head>/i, m => m + bridge);
  fs.writeFileSync(p, s);
}
console.log('app files:', fs.readdirSync(dst).length);
