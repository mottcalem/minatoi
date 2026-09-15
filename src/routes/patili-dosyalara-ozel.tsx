import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  ChevronRight,
  Crown,
  ImagePlus,
  PawPrint,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const Route = createFileRoute("/patili-dosyalara-ozel")({
  head: () => ({
    meta: [
      { title: "Patili Dostlara Özel — MinaToi" },
      {
        name: "description",
        content:
          "Patili dostunuzun fotoğrafını kostümlü veya illüstrasyonlu, size özel bir cam tabloya dönüştürün.",
      },
    ],
  }),
  component: PatiliDosyalaraOzel,
});

const SIZES = ["25 × 35 cm", "35 × 50 cm", "50 × 70 cm", "60 × 90 cm"];
const COSTUMES = ["Korsan", "Prens / Prenses", "Bekçi", "Müdür", "Çöpçü"];
const STYLES = ["Sulu boya", "Kara kalem", "Yağlı boya", "Pop art"];
const EXAMPLES = [
  "/images/patili-ornek-1.jpg",
  "/images/patili-ornek-2.jpg",
  "/images/patili-ornek-3.jpg",
];
type PortraitKind = "costume" | "illustration";

function PatiliDosyalaraOzel() {
  const [kind, setKind] = useState<PortraitKind>("costume");
  const [size, setSize] = useState(SIZES[0]);
  const [orientation, setOrientation] = useState("Dikey");
  const [treatment, setTreatment] = useState(COSTUMES[0]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const inputId = useId();

  useEffect(() => {
    if (!file) return setPreview("");
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function choose(candidate?: File) {
    if (!candidate) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(candidate.type))
      return setError("Lütfen JPG, PNG veya WebP formatında bir görsel seçin.");
    if (candidate.size > 12 * 1024 * 1024)
      return setError("Görsel dosyası en fazla 12 MB olabilir.");
    setError("");
    setFile(candidate);
  }

  const message = useMemo(
    () =>
      `Merhaba, patili dostum için kişiye özel tablo siparişi vermek istiyorum.\n\nTasarım türü: ${kind === "costume" ? "Kostümlü Portre" : "İllüstrasyon Portre"}\n${kind === "costume" ? "Kostüm" : "Stil"}: ${treatment}\nÖlçü: ${size}\nYön: ${orientation}${file ? `\nFotoğraf: ${file.name}` : ""}\n\nFotoğrafımı bu mesaja ek olarak gönderiyorum.`,
    [file, kind, orientation, size, treatment],
  );

  function switchKind(next: PortraitKind) {
    setKind(next);
    setTreatment(next === "costume" ? COSTUMES[0] : STYLES[0]);
  }

  return (
    <main className="overflow-hidden">
      <section className="relative bg-stone-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_82%,rgba(185,105,44,.38),transparent_30%),radial-gradient(circle_at_88%_15%,rgba(217,168,86,.3),transparent_28%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_.85fr] lg:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[.24em] text-amber-300">
              MinaToi patili dostlar
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-6xl">
              Patili dostunuzun portresi, eşsiz bir anıya dönüşsün.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-stone-300 sm:text-lg">
              Fotoğrafını paylaşın; onu ister eğlenceli bir kostümle, ister sanatsal bir
              illüstrasyonla kişiye özel cam tabloya dönüştürelim.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-stone-200">
              <Feature icon={<PawPrint />} text="Patili dosta özel tasarım" />
              <Feature icon={<ShieldCheck />} text="Tasarım onayı" />
              <Feature icon={<Check />} text="Ücretsiz kargo" />
            </div>
          </div>
          <div className="relative min-h-80 overflow-hidden rounded-[2rem] border border-white/20 bg-stone-900 shadow-2xl">
            <img
              src={EXAMPLES[0]}
              alt="Kişiye özel patili dost portresi örneği"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
            <div className="absolute bottom-6 left-6 rounded-2xl border border-white/20 bg-black/35 px-4 py-3 backdrop-blur-sm">
              <p className="font-display text-xl">Onun karakteri, onun portresi.</p>
              <p className="mt-1 text-sm text-stone-300">
                Fotoğrafını yükle, birlikte tasarlayalım.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">
            Tasarım türünü seçin
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            Patili dostunuza özel bir portre
          </h2>
          <p className="mt-3 text-muted-foreground">
            Kostümlü veya illüstrasyonlu portreyi seçin; tasarım alanı tercihinize göre yenilensin.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2" role="tablist">
          <Choice
            active={kind === "costume"}
            icon={<Crown />}
            title="Kostümlü Portre"
            text="Dostunuzu seçtiğiniz eğlenceli karaktere dönüştürelim."
            onClick={() => switchKind("costume")}
          />
          <Choice
            active={kind === "illustration"}
            icon={<Sparkles />}
            title="İllüstrasyon Portre"
            text="Fotoğrafını farklı bir sanat stilinde yeniden yorumlayalım."
            onClick={() => switchKind("illustration")}
          />
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(290px,.65fr)]">
          <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-elegant sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">
                  {kind === "costume" ? "Kostümlü portre" : "İllüstrasyon portre"}
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold">
                  Patili dostunuzun fotoğrafını yükleyin
                </h2>
              </div>
              <ImagePlus className="h-7 w-7 text-primary" />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Yüzü net görünen, gün ışığında çekilmiş bir fotoğraf en iyi sonucu verir.
            </p>
            <div className="mt-7 space-y-6">
              <Options title="Tablo ölçüsü" value={size} options={SIZES} onChange={setSize} />
              <Options
                title="Yön seçimi"
                value={orientation}
                options={["Dikey", "Yatay"]}
                onChange={setOrientation}
              />
              <Options
                title={kind === "costume" ? "Kostümünü seç" : "İllüstrasyon stilini seç"}
                value={treatment}
                options={kind === "costume" ? COSTUMES : STYLES}
                onChange={setTreatment}
              />
              <div>
                <p className="mb-2 text-sm font-semibold text-stone-800">Fotoğraf / görsel</p>
                {preview ? (
                  <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
                    <img
                      src={preview}
                      alt="Yüklenen patili dost fotoğrafı"
                      className="h-64 w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-stone-950/75 text-white"
                      aria-label="Görseli kaldır"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="border-t bg-white px-4 py-3 text-sm font-medium text-stone-700">
                      {file?.name}
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor={inputId}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      choose(event.dataTransfer.files[0]);
                    }}
                    className="flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/[.035] px-6 text-center transition hover:border-primary hover:bg-primary/[.07]"
                  >
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
                      <Upload className="h-6 w-6" />
                    </span>
                    <span className="mt-4 font-semibold">Fotoğrafı buraya sürükleyin</span>
                    <span className="mt-1 text-sm text-muted-foreground">
                      veya dosya seçmek için tıklayın
                    </span>
                    <span className="mt-4 text-xs text-muted-foreground">
                      JPG, PNG veya WebP · En fazla 12 MB
                    </span>
                  </label>
                )}
                <input
                  id={inputId}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(event) => choose(event.target.files?.[0])}
                />
                {error && (
                  <p role="alert" className="mt-2 text-sm text-red-600">
                    {error}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-7 border-t border-stone-100 pt-6">
              <WhatsAppButton message={message} size="lg" className="w-full">
                <span className="flex items-center justify-center gap-2">
                  Portre talebini gönder <ChevronRight className="h-4 w-4" />
                </span>
              </WhatsAppButton>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                WhatsApp açıldığında fotoğrafınızı mesaja ekleyerek talebinizi tamamlayın.
              </p>
            </div>
          </section>
          <aside className="space-y-5">
            <Info title="Fotoğraf ipuçları">
              <ul className="space-y-3">
                <li>Yüzü önden ve net görünen bir kare seçin.</li>
                <li>Gün ışığı, göz ve tüy detaylarını daha iyi gösterir.</li>
                <li>Gözlük, tasma ya da sevdiğiniz bir aksesuar fotoğrafta kalabilir.</li>
                <li>Dikey/yatay seçiminiz fotoğrafın oranına uygun olmalı.</li>
              </ul>
            </Info>
            <Info title="Özenle hazırlanır">
              <p>
                Her çalışma, gönderdiğiniz fotoğraf esas alınarak kişiselleştirilir. Tasarım üretim
                öncesinde onayınıza sunulur.
              </p>
              <div className="mt-5 border-t border-stone-100 pt-4 text-xs font-semibold text-stone-700">
                4 mm temperli cam · UV baskı · canlı ve solmaz renkler
              </div>
            </Info>
            <div className="rounded-3xl bg-stone-950 p-6 text-stone-100">
              <PawPrint className="h-5 w-5 text-amber-300" />
              <h3 className="mt-3 font-display text-xl font-bold">Örnek çalışmalar</h3>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {EXAMPLES.map((src, index) => (
                  <img
                    key={src}
                    src={src}
                    alt={`Patili dost portre örneği ${index + 1}`}
                    className="aspect-[3/4] rounded-lg object-cover"
                  />
                ))}
              </div>
              <WhatsAppButton
                className="mt-5 w-full"
                message={`Merhaba, ${kind === "costume" ? "kostümlü portre" : "illüstrasyon portre"} için örnek çalışma görmek istiyorum.`}
              >
                Daha fazla örnek iste
              </WhatsAppButton>
            </div>
          </aside>
        </div>
      </section>
      <section className="border-y border-stone-200 bg-stone-50">
        <div className="mx-auto max-w-5xl px-4 py-14 text-center sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">Nasıl çalışır?</p>
          <div className="mt-8 grid gap-7 sm:grid-cols-3">
            {[
              ["01", "Tarzını seçin", "Kostümlü veya illüstrasyonlu portreyi belirleyin."],
              [
                "02",
                "Fotoğrafını paylaşın",
                "Dostunuzun en sevdiğiniz karesini ve detayları gönderin.",
              ],
              [
                "03",
                "Onaylayın, keyfini çıkarın",
                "Özel tasarımınız hazırlanır ve güvenle size ulaştırılır.",
              ],
            ].map(([number, title, text]) => (
              <div key={number}>
                <span className="font-display text-4xl text-primary/35">{number}</span>
                <h3 className="mt-2 font-display text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="flex items-center gap-2">
      {icon}
      {text}
    </span>
  );
}
function Choice({
  active,
  icon,
  title,
  text,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`rounded-3xl border p-6 text-left transition ${active ? "border-primary bg-primary text-primary-foreground shadow-glow" : "border-stone-200 bg-white hover:border-primary/50"}`}
    >
      <span className={active ? "text-amber-200" : "text-primary"}>{icon}</span>
      <h3 className="mt-4 font-display text-2xl font-bold">{title}</h3>
      <p className={`mt-2 text-sm leading-6 ${active ? "text-white/80" : "text-muted-foreground"}`}>
        {text}
      </p>
      <span className="mt-5 flex items-center gap-1 text-sm font-semibold">
        Seç <ChevronRight className="h-4 w-4" />
      </span>
    </button>
  );
}
function Options({
  title,
  value,
  options,
  onChange,
}: {
  title: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-stone-800">
        {title}
        <span className="ml-1 font-normal text-muted-foreground">· {value}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${value === option ? "border-stone-900 bg-stone-900 text-white" : "border-stone-300 bg-white text-stone-700 hover:border-stone-500"}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
function Info({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 text-sm leading-6 text-muted-foreground shadow-sm">
      <h3 className="font-display text-xl font-bold text-stone-900">{title}</h3>
      <div className="mt-3 [&_li]:relative [&_li]:pl-4 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:text-primary [&_li]:before:content-['•']">
        {children}
      </div>
    </section>
  );
}
