import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductArt } from "@/components/ProductArt";

export const metadata: Metadata = {
  title: "Kişiye Özel Cam Tablo",
  description: "Fotoğrafınızı doğrudan veya seçtiğiniz illüstrasyon stilinde 4 mm temperli cama basalım. Ücretsiz kargo ve hasarsız teslimat garantisi.",
};

const samples = [
  ["#e7c8b5", "#a74236", "#f0d6ae"], ["#201c1c", "#c45635", "#e7a373"],
  ["#eee8df", "#242321", "#a6a09b"], ["#d0a27d", "#43342d", "#f0d0bd"],
  ["#b7d1d4", "#72584c", "#f1c7a5"],
];

export default function CustomPage() {
  return <><Header/><main className="personal-page"><section className="personal-hero"><div className="personal-copy"><span>ÜCRETSİZ KARGO · TASARIM ONAYI</span><h1>En sevdiğiniz an,<br/><em>camda hayat bulsun.</em></h1><p>Fotoğrafınızı veya görselinizi gönderin; olduğu gibi ya da seçtiğiniz illüstrasyon stiliyle 4 mm temperli cam üzerine basalım.</p><div className="personal-points"><b>4 mm temperli cam</b><b>Solmayan UV baskı</b><b>Hasarsız teslimat</b></div></div><div className="portrait-wall"><div className="portrait-frame one"><ProductArt colors={samples[0]}/></div><div className="portrait-frame two"><ProductArt colors={samples[1]}/></div><div className="portrait-frame three"><ProductArt colors={samples[2]}/></div></div></section><section className="print-options"><div className="section-head"><div><span>FOTOĞRAFINIZ, SİZİN TARZINIZ</span><h2>Nasıl görünmesini istersiniz?</h2></div></div><div className="option-grid"><Link href="/urun/dogrudan-baski" className="print-option"><span>01</span><div><h3>Doğrudan Baskı</h3><p>Fotoğrafınızın doğal renklerini ve özgün halini koruyarak cama basalım.</p><b>Fotoğrafını yükle →</b></div></Link><Link href="/kisiye-ozel#illustrasyon" id="illustrasyon" className="print-option featured"><span>02</span><div><small>EN ÇOK TERCİH EDİLEN</small><h3>İllüstrasyonlu Baskı</h3><p>Fotoğrafınızı seçtiğiniz sanatsal stile dönüştürüp size özel bir eser hazırlayalım.</p><b>Stilleri keşfet →</b></div></Link></div></section><section className="personal-samples"><div className="section-head"><div><span>GERÇEK ANLAR, KALICI ESERLER</span><h2>Örnek çalışmalar</h2></div></div><div className="sample-row">{samples.map((colors,i)=><article key={i}><ProductArt colors={colors}/><span>{["Suluboya","Mozaik","Karakalem","Doğrudan","Dijital Sanat"][i]}</span></article>)}</div></section><section className="personal-steps"><span>3 KOLAY ADIM</span><h2>Fotoğraftan tabloya.</h2><div><article><b>01</b><h3>Yükleyin</h3><p>En sevdiğiniz fotoğrafı güvenle yükleyin.</p></article><article><b>02</b><h3>Onaylayın</h3><p>Baskıdan önce tasarım ön izlemesini görün.</p></article><article><b>03</b><h3>Duvarınıza asın</h3><p>Özel paketinde, ücretsiz kargoyla teslim alın.</p></article></div></section></main><Footer/></>;
}
