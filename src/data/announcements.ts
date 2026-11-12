/** Kayan duyuru bandında gösterilen metinler; sıra listedeki sırayı takip eder. */
export type Announcement = { id: number; text: string };

export const DEFAULT_ANNOUNCEMENTS: string[] = [
  "Türkiye'nin Her Yerine Ücretsiz Kargo",
  "4mm Temperli Cam",
  "Solmaz Ömürlük Renkler",
  "Hasarsız Teslimat Garantisi",
];

/** Eski kayıtlardaki artık sunulmayan ödeme duyurularını gösterme. */
export function currentAnnouncements(items: string[]): string[] {
  return items.filter((text) => !/kap[ıi]da\s*ödeme/iu.test(text));
}
