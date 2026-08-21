import Link from "next/link";
import { Logo } from "./Logo";
export function Footer(){return <footer><div><Logo light/><p>Duvarlara değil, yaşam alanlarına karakter katıyoruz.</p></div><div><b>Keşfet</b><Link href="/kategori/cam-tablolar">Tüm tablolar</Link><Link href="/kisiye-ozel">Kişiye özel</Link><a href="#">Çok satanlar</a></div><div><b>Minatoi</b><Link href="/hikayemiz">Hikâyemiz</Link><a href="#">Kargo & teslimat</a><a href="#">İade koşulları</a></div><div><b>Bizi takip et</b><a href="#">Instagram ↗</a><a href="#">Pinterest ↗</a></div></footer>}
