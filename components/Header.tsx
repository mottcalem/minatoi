import Link from "next/link";
import { Logo } from "./Logo";
export function Header(){return <><div className="announcement">Türkiye'nin her yerine ücretsiz kargo <span>•</span> Güvenli ödeme</div><header><Logo/><nav><Link href="/kategori/cam-tablolar">Cam Tablolar</Link><Link href="/kategori/cam-tablolar">Kategoriler</Link><Link href="/kisiye-ozel">Kişiye Özel</Link><Link href="/hikayemiz">Hikâyemiz</Link></nav><div className="header-actions"><button aria-label="Ara">⌕</button><Link href="/odeme" className="cart">Sepet <b>1</b></Link></div></header></>}
