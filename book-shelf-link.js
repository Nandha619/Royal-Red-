/* book.html ↔ bookshelf.html இணைப்பு.
   index.html இதைத் தானாக ஏற்றும். book.html-ஐ தனியாகத் திறந்தாலும் வேண்டுமானால்
   அதன் கடைசியில் <script src="book-shelf-link.js"></script> சேர்க்கலாம். */
(function(){
'use strict';
if(window.__shelfAPI)return;
var ov=null;
function $(s){return document.querySelector(s)}
function closeShelf(){if(ov){ov.remove();ov=null;document.body.style.overflow=''}}

/* ஸ்டுடியோவில் இப்போது உள்ள புத்தகத் தகவல் (திரையிலிருந்து நேரடியாக) */
function readState(){
  var books=[],map={};
  [].forEach.call(document.querySelectorAll('input[data-bid][data-bk]'),function(el){
    var id=el.dataset.bid;
    if(!map[id]){map[id]={id:id};books.push(map[id])}
    map[id][el.dataset.bk]=el.value;
  });
  var g=function(s){var e=$(s);return e?e.value:''};
  return {
    org:g('#f-org'),
    labels:{author:g('#l-author')||'எழுத்தாளர்',publisher:g('#l-publisher')||'பதிப்பகம்',off:g('#l-off')||'தள்ளுபடி'},
    books:books
  };
}
/* ஸ்டுடியோவில் சேர்த்த அட்டைப் படங்கள், லோகோ */
function bgUrl(el){
  if(!el)return '';
  var m=(getComputedStyle(el).backgroundImage||'').match(/url\(["']?(.*?)["']?\)/);
  return m?m[1]:'';
}
function readMedia(){
  var covers={};
  [].forEach.call(document.querySelectorAll('[id^="th-"]'),function(el){
    var u=bgUrl(el);if(u)covers[el.id.slice(3)]={url:u};
  });
  var lu=bgUrl($('#logoThumb'));
  return {covers:covers,logo:lu?{url:lu}:null};
}
/* புத்தகத்தின் நேரத்திற்கு சென்று வீடியோ ஓட்டு */
function playAt(i){
  closeShelf();
  var seek=$('#seek'),n=document.querySelectorAll('#books .book').length||1,total=+seek.max||90;
  seek.value=Math.min(total-0.1,i*total/n+0.05);
  seek.dispatchEvent(new Event('input',{bubbles:true}));
  var pb=$('#play');
  if(pb&&pb.textContent.trim()!=='நிறுத்து')pb.click();
  var ph=$('#phone');if(ph)ph.scrollIntoView({behavior:'smooth',block:'center'});
}
window.__shelfAPI={state:readState,media:readMedia,playAt:playAt,close:closeShelf};

function openShelf(){
  if(ov)return;
  var pb=$('#play');if(pb&&pb.textContent.trim()==='நிறுத்து')pb.click();
  ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:999;background:#190D06';
  ov.innerHTML='<iframe src="bookshelf.html" style="width:100%;height:100%;border:0" title="நூலகம்"></iframe>';
  document.body.appendChild(ov);document.body.style.overflow='hidden';
}
function addBtn(){
  var row=$('.row2');if(!row||$('#openShelf'))return;
  var b=document.createElement('button');
  b.id='openShelf';b.type='button';b.className='btn primary small';b.textContent='📚 நூலகம்';
  b.onclick=openShelf;row.appendChild(b);
}
if(!window.__noShelfBtn)addBtn();
var m=location.hash.match(/play=(\d+)/);
if(m)setTimeout(function(){playAt(+m[1])},700);
})();
