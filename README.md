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
- `sw.js` — service worker
