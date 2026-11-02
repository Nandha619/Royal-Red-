# NEWS STUDIO (Royal-Red)

Theekkathir channel broadcasting tool — E-Paper, Mobile TV news studio, Book studio.

## இரண்டு பக்கங்கள்

| பக்கம் | வேலை |
| --- | --- |
| `index.html` | **App (காட்சி மட்டும்)** — E-Paper · Mobile TV · Book Shelf, Download, ⚙ செட்டிங்ஸ் பொத்தான் |
| `settings.html` | **செட்டிங்ஸ்** — எல்லா மாற்றங்களும் ஒரே வடிவமைப்பில்: E-Paper · Mobile TV · Book Shelf · தோற்றம் · பிற பகுதிகள் |

- E-Paper: PDF சேர்த்தல் / நீக்குதல், பதிவிறக்கத் தேதி, புரட்டும் ஒலி — செட்டிங்ஸ் → E-Paper
- E-Paper வாசிப்பு FlippingBook பாணியில்: முகப்பு அட்டை தனியாக + இரட்டைப் பக்கம் (மொபைலில் ஒற்றைப் பக்கம்), வளையும் பக்கப் புரட்டல், விளிம்பு தடிமன், slider, thumbnails, zoom, முழுத்திரை, ஒலி
- Mobile TV: செய்திகள், footage, சேனல் அமைப்பு, MP4 — செட்டிங்ஸ் → Mobile TV (`news.html?mode=settings`)
- Book Shelf: புத்தகத் தலைப்பு / எழுத்தாளர் / விலை / அட்டை, தீம், MP4 — செட்டிங்ஸ் → Book Shelf (`book.html?mode=settings`)
- செட்டிங்ஸில் சேர்த்த வீடியோ / படம் / அட்டை / PDF ஆகியவை IndexedDB-ல் சேமிக்கப்பட்டு app-ல் தெரியும்.

## Deploy
Host the folder as a static site / PWA and open `index.html`.

## Files
- `index.html` — App interface (காட்சி மட்டும்)
- `settings.html` — செட்டிங் பக்கம் (தாவல்கள்)
- `settings.css` — அனைத்து செட்டிங் பக்கங்களுக்கும் பொதுவான தோற்றம்
- `news.html` — Mobile TV (`?mode=view` காட்சி · `?mode=settings` செட்டிங்ஸ்)
- `book.html` — Book studio (`?mode=view` காட்சி · `?mode=settings` செட்டிங்ஸ்)
- `bookshelf.html` — தனிப் புத்தக அலமாரி
- `flipbook.js` — E-Paper flip-book இயந்திரம் (pdf.js படங்களை 3D strips-ஆக வளைத்துப் புரட்டும்)
- `media-store.js` — பகிரப்பட்ட media சேமிப்பு (IndexedDB)
- `owner-gate.js` — உரிமையாளர் உள்நுழைவு (app + settings)
- `theme.js` — shared themes
- `articles.js` / `articles.css` — Articles: எழுத்தாளர் அலமாரி, பழங்காலத் தாள் வாசிப்பு, எழுதும் படிவம்
- `article-store.js` — Articles சேமிப்பு (Firebase Firestore REST / சோதனை முறை)
- `articles-config.js` — Firebase அமைப்பு (3 மதிப்புகள்)
- `articles-admin.js` — செட்டிங்ஸ் → Articles (அட்மின் ஒப்புதல்)
- `cutout.js` — புகைப்படப் பின்னணி நீக்கம் (உருவம் மட்டும் PNG)
- `sw.js` — service worker

## Articles அமைப்பு (எல்லோரும் எழுத · அட்மின் ஒப்புதல்)

Book Shelf → **Articles**: எழுத்தாளர் உருவம் அலமாரியில் நிற்கும்; பெயர் + பதவி மேலே; கட்டுரை குறித்த சில வரிகள் கீழே கட்டத்தில்; தொட்டால் பழங்காலத் தாள் பாணி முழு வாசிப்புப் பக்கம் (A− / A+ எழுத்து அளவு).
யார் வேண்டுமானாலும் "✍ நீங்களும் கட்டுரை எழுதுங்கள்" மூலம் அனுப்பலாம் → நிலை **காத்திருப்பு** → செட்டிங்ஸ் → **✍ Articles**-ல் அட்மின் **ஏற்றால் மட்டுமே** முதன்மைப் பக்கத்தில் தெரியும்.
JPG புகைப்படம் பதிவேற்றினால் உருவம் மட்டும் வெட்டிய PNG ஆக மாறும் (சாதனத்திலேயே; முதல் முறை ~40 MB மாதிரி இறக்கம், இணையம் தேவை).

### ஒருமுறை அமைப்பு (இலவச Firebase) — இது இல்லாமல் "சோதனை முறை" (அந்தச் சாதனத்தில் மட்டும்)
1. https://console.firebase.google.com → புதிய project → **Build → Firestore Database** → Create (production mode).
2. **Build → Authentication → Sign-in method → Email/Password** இயக்கி, **Users → Add user** மூலம் அட்மின் மின்னஞ்சல் + கடவுச்சொல் உருவாக்கவும்.
3. **Project settings → General** → Web API Key மற்றும் Project ID-ஐ `articles-config.js`-ல் நிரப்பி (`adminEmail` உடன்) commit செய்யவும்.
4. **Firestore → Rules** என்பதில் இதை ஒட்டி Publish (`ADMIN@EMAIL` → உங்கள் அட்மின் மின்னஞ்சல்):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /articles/{id} {
      allow read: if resource.data.status == 'approved'
                  || (request.auth != null && request.auth.token.email == 'ADMIN@EMAIL');
      allow create: if request.resource.data.status == 'pending'
                    && request.resource.data.keys().hasOnly(['name','role','title','summary','body','photo','cutout','status','createdAt'])
                    && request.resource.data.name.size() <= 80
                    && request.resource.data.role.size() <= 120
                    && request.resource.data.title.size() <= 200
                    && request.resource.data.summary.size() <= 400
                    && request.resource.data.body.size() <= 30000
                    && request.resource.data.photo.size() <= 800000;
      allow update, delete: if request.auth != null && request.auth.token.email == 'ADMIN@EMAIL';
    }
  }
}
```
இந்த rules-ஆல் பொதுமக்கள் *காத்திருப்பு* கட்டுரையை உருவாக்க மட்டுமே முடியும்; ஒப்புதல் / நீக்கம் / காத்திருப்புப் பட்டியலைப் பார்த்தல் அட்மினுக்கு மட்டும்.

### தற்போதைய நிலை: முழுவதும் localStorage / IndexedDB (HTML மட்டும்)
`articles-config.js` காலியாக இருப்பதால் Articles "சோதனை முறை"-ல் இயங்கும்: கட்டுரைகள், ஒப்புதல் நிலை, Shopping/Events படங்கள் அனைத்தும் அந்தச் சாதனத்தின் உலாவியிலேயே சேமிக்கப்படும்; சர்வர் எதுவும் தேவையில்லை.
### அடுத்த upgrade (இணையதளம் / ஒரே தரவு)க்கான தயாரிப்பு
- எல்லா Articles தரவு அணுகலும் `article-store.js` (`window.ArticleStore`) ஒரே இடத்தில் உள்ளது: `listApproved / submit / listAll / setStatus / remove / login`. UI (`articles.js`, `articles-admin.js`) இந்த API-ஐ மட்டுமே அழைக்கும்.
- பின்தளம் மாற்ற: `article-store.js`-ல் அதே முறைகளை புதிய சேவைக்கு (Firebase, அல்லது சொந்த API) செயல்படுத்தினால் போதும்; UI மாற்றம் தேவையில்லை. Firebase ஏற்கனவே எழுதப்பட்டுள்ளது — `articles-config.js` நிரப்பினால் இயங்கும்.
- Shopping / Events படங்கள் (`MediaStore` + `np_si_*`) அதே முறையில் பின்னர் சேவையகத்திற்கு நகர்த்தலாம்.
