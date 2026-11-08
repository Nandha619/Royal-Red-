/* இணையதளக் கோப்புகளை (repo root) desktop/app-க்கு நகலெடுக்கிறது */
const fs = require('fs'), path = require('path');
const src = path.join(__dirname, '..'), dst = path.join(__dirname, 'app');
fs.rmSync(dst, { recursive: true, force: true }); fs.mkdirSync(dst, { recursive: true });
const ok = /\.(html|js|css|json|svg|png|jpg|jpeg|webp|ico|woff2?|mp3|mp4)$/i;
for (const f of fs.readdirSync(src)) {
  const p = path.join(src, f);
  if (fs.statSync(p).isFile() && ok.test(f) && f !== 'sw.js' && f !== 'package.json') fs.copyFileSync(p, path.join(dst, f));
}
fs.mkdirSync(path.join(__dirname, 'build'), { recursive: true });
fs.copyFileSync(path.join(src, 'icon-512.png'), path.join(__dirname, 'build', 'icon.png'));
console.log('app files:', fs.readdirSync(dst).length);
