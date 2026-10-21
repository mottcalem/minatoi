export const DESIGN_SECTIONS = {
  personalPrint: "Kişiye Özel — Doğrudan Baskı",
  personalIllustration: "Kişiye Özel — İllüstrasyon",
  petCostume: "Patili Dostlar — Kostümlü Portre",
  petIllustration: "Patili Dostlar — İllüstrasyon",
} as const;
export type DesignSection = keyof typeof DESIGN_SECTIONS;
export type CustomContent = {
  covers: Record<DesignSection, string>;
  styles: string[];
  petStyles: string[];
  examples: Record<DesignSection, { label: string; image: string }[]>;
};
const DIRECT_PRINT_EXAMPLES = [
  "/images/direct-print-examples/cift-portresi.jpg",
  "/images/direct-print-examples/erkek-portresi.jpg",
  "/images/direct-print-examples/siyah-beyaz-portre.jpg",
  "/images/direct-print-examples/yakin-plan-portre.jpg",
  "/images/direct-print-examples/gunluk-portre.jpg",
] as const;
const ILLUSTRATION_PRINT_EXAMPLES = [
  ["Karakalem", "/images/illustration-print-examples/karakalem-erkek.jpg"],
  ["Kübik portre", "/images/illustration-print-examples/kubik-erkek.jpg"],
  ["Sulu boya", "/images/illustration-print-examples/sulu-boya-erkek.jpg"],
  ["Kübik çift portresi", "/images/illustration-print-examples/kubik-cift.jpg"],
  ["Sulu boya çift portresi", "/images/illustration-print-examples/sulu-boya-cift.jpg"],
  ["Karakalem", "/images/illustration-print-examples/karakalem-kadin.jpg"],
  ["Kübik portre", "/images/illustration-print-examples/kubik-kadin.jpg"],
  ["Eskiz", "/images/illustration-print-examples/eskiz-kadin.jpg"],
] as const;
const COSTUME_EXAMPLES = [
  ["Korsan", "/products/Patili Dostlara Özel_Kostümlü Portre Yeni Sistem/Korsan/Korsan_1.png"],
  ["Prens", "/products/Patili Dostlara Özel_Kostümlü Portre Yeni Sistem/Prens/Prens_1.png"],
  ["Prenses", "/products/Patili Dostlara Özel_Kostümlü Portre Yeni Sistem/Prenses/Prenses_1.png"],
  ["Hemşire", "/products/Patili Dostlara Özel_Kostümlü Portre Yeni Sistem/Hemşire/Hemşire_1.png"],
  ["Müdür", "/products/Patili Dostlara Özel_Kostümlü Portre Yeni Sistem/Müdür/Müdür_1.png"],
  ["Çöpçü", "/products/Patili Dostlara Özel_Kostümlü Portre Yeni Sistem/Çöpçü/Çöpçü_1.png"],
] as const;
const ILLUSTRATION_EXAMPLES = [
  [
    "İllüstrasyonlu Portre",
    "/products/Patili Dostlara Özel_İllüstrasyonlu Portre/İllüstrasyonlu Portre/İllüstrasyonlu Portre_1.png",
  ],
  ["Karakalem", "/images/patili-ornek-1.jpg"],
  ["Sulu boya", "/images/patili-ornek-2.jpg"],
  ["Yağlı boya", "/images/patili-ornek-3.jpg"],
] as const;
export const DEFAULT_CUSTOM_CONTENT: CustomContent = {
  covers: {
    petCostume: "/images/patili-ornek-1.jpg",
    petIllustration: "/images/patili-ornek-2.jpg",
    personalPrint: "/images/kisiye-ozel-ornek.jpg",
    personalIllustration: "/images/patili-ornek-3.jpg",
  },
  styles: ["Kara kalem", "Sulu boya", "Mozaik yağlıboya"],
  petStyles: ["Karakalem", "Sulu boya", "Yağlı boya"],
  examples: {
    personalPrint: DIRECT_PRINT_EXAMPLES.map((image) => ({ label: "Doğrudan baskı", image })),
    personalIllustration: ILLUSTRATION_PRINT_EXAMPLES.map(([label, image]) => ({ label, image })),
    petCostume: COSTUME_EXAMPLES.map(([label, image]) => ({ label, image })),
    petIllustration: ILLUSTRATION_EXAMPLES.map(([label, image]) => ({ label, image })),
  },
};
