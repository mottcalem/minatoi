export type Product = { slug:string; name:string; code:string; category:string; price:number; oldPrice?:number; colors:string[]; image?:string; badge?:string };
export const products: Product[] = [
  {slug:"kozmik-isikli-meditasyon",name:"Kozmik Işıklı Meditasyon",code:"ZN113",category:"Zen",price:610,oldPrice:760,colors:["#09111d","#d2a64a","#7264a8"],image:"/zn113p.jpeg",badge:"Çok Satan"},
  {slug:"ahsap-kubik-yuz",name:"Ahşap Kübik Yüz",code:"TL123",category:"Tasarımcı",price:610,colors:["#282133","#e85d3f","#efbd4d"],image:"/tl123p.jpeg",badge:"Yeni"},
  {slug:"okyanusta-alev-bulutlari",name:"Okyanusta Alev Bulutları",code:"AR104",category:"Işık & Renk",price:610,colors:["#0f151b","#be8640","#ebe2ce"],image:"/ar104p.jpeg"},
  {slug:"geometrik-mozaik-deve",name:"Geometrik Mozaik Deve",code:"HY109",category:"Hayvanlar",price:610,oldPrice:720,colors:["#191124","#f2308b","#44b9cf"],image:"/hy109p.jpeg",badge:"Favori"},
  {slug:"hokusai-buyuk-dalga",name:"Hokusai Büyük Dalga",code:"ST111",category:"Sanatçı",price:610,colors:["#d8cfb8","#31546c","#152c3e"]},
  {slug:"galata-kulesi-manzara",name:"Galata Kulesi Manzara",code:"MA104",category:"Manzara",price:610,colors:["#c57b5e","#f2c37e","#384d63"]},
  {slug:"saskin-kediler-grubu",name:"Şaşkın Kediler Grubu",code:"KD107",category:"Kedi",price:610,colors:["#e8d0b1","#a65c42","#293238"]},
  {slug:"vitray-ataturk",name:"Vitray Atatürk",code:"MK110",category:"Atatürk",price:610,colors:["#18262e","#b44b3e","#d8a94c"]},
];
export const formatPrice=(n:number)=>new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",maximumFractionDigits:0}).format(n);
