import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  ChevronRight,
  ImagePlus,
  Palette,
  Printer,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const Route = createFileRoute("/kisiye-ozel")({
  head: () => ({
    meta: [
      { title: "Kişiye Özel — MinaToi" },
      {
        name: "description",
        content:
          "Fotoğrafınızı doğrudan bası veya illüstrasyon tasarıma dönüştürün. Size özel MinaToi tasarımınızı kolayca oluşturun.",
      },
    ],
  }),
  component: KisiyeOzel,
});

const SIZES = ["25 × 35 cm", "35 × 50 cm", "50 × 70 cm", "60 × 90 cm"];
const STYLES = ["Sulu boya", "Yağlı boya", "Kara kalem", "Mozaik"];
type DesignKind = "print" | "illustration";

function KisiyeOzel() {
  const [kind, setKind] = useState<DesignKind>("print");
  const [size, setSize] = useState(SIZES[0]);
  const [orientation, setOrientation] = useState("Dikey");
  const [style, setStyle] = useState(STYLES[0]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [fileError, setFileError] = useState("");
  const inputId = useId();

  useEffect(() => {
    if (!file) return setPreview("");
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  function selectFile(candidate?: File) {
    if (!candidate) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(candidate.type))
      return setFileError("Lütfen JPG, PNG veya WebP formatında bir görsel seçin.");
    if (candidate.size > 12 * 1024 * 1024)
      return setFileError("Görsel dosyası en fazla 12 MB olabilir.");
    setFileError("");
    setFile(candidate);
  }
  const message = useMemo(
    () =>
      `Merhaba, kişiye özel tasarım siparişi vermek istiyorum.\n\nTasarım türü: ${kind === "print" ? "Doğrudan Bası" : "İllüstrasyon Tasarım"}\nÖlçü: ${size}\nYön: ${orientation}${kind === "illustration" ? `\nStil: ${style}` : ""}${file ? `\nFotoğraf: ${file.name}` : ""}\n\nFotoğrafımı bu mesaja ek olarak gönderiyorum.`,
    [file, kind, orientation, size, style],
  );
  return (
    <main className="overflow-hidden">
      <section className="relative bg-stone-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(190,133,73,.4),transparent_28%),radial-gradient(circle_at_10%_90%,rgba(125,73,39,.38),transparent_32%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_.85fr] lg:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[.24em] text-amber-300">
              MinaToi atölye
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-6xl">
              Anılarınızı size özel bir tasarıma dönüştürelim.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-stone-300 sm:text-lg">
              En sevdiğiniz fotoğrafı olduğu gibi basalım ya da özgün bir illüstrasyonla yeniden
              yorumlayalım. Tasarımınız, seçtiğiniz ölçü ve yönle atölyede sizin için hazırlanır.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-stone-200">
              <Feature icon={<Sparkles />} text="Kişiye özel çalışma" />
              <Feature icon={<ShieldCheck />} text="Özenli tasarım onayı" />
              <Feature icon={<Check />} text="Türkiye'ye ücretsiz kargo" />
            </div>
          </div>
          <div className="relative min-h-80 overflow-hidden rounded-[2rem] border border-white/20 bg-stone-900 shadow-2xl">
            <img
              src="/images/kisiye-ozel-ornek.jpg"
              alt="Sulu boya stilinde kişiye özel portre örneği"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
            <div className="absolute bottom-6 left-6 rounded-2xl border border-white/20 bg-black/35 px-4 py-3 backdrop-blur-sm">
              <p className="font-display text-xl">Senin hikâyen, senin tasarımın.</p>
              <p className="mt-1 text-sm text-stone-300">
                Fotoğrafını yükle, birlikte hazırlayalım.
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
            Kişiye özel tasarım seçenekleri
          </h2>
          <p className="mt-3 text-muted-foreground">
            Fotoğrafınız için en uygun yöntemi seçin; aşağıdaki alanlar seçiminize göre yenilenir.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2" role="tablist">
          <DesignChoice
            active={kind === "print"}
            icon={<Printer />}
            title="Doğrudan Bası"
            text="Fotoğrafınızın doğal görünümünü koruyan, net ve canlı baskı."
            onClick={() => setKind("print")}
          />
          <DesignChoice
            active={kind === "illustration"}
            icon={<Palette />}
            title="İllüstrasyon Tasarım"
            text="Fotoğrafınızı seçtiğiniz sanat stiliyle özel bir illüstrasyona dönüştürelim."
            onClick={() => setKind("illustration")}
          />
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(290px,.65fr)]">
          <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-elegant sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">
                  {kind === "print" ? "Doğrudan bası" : "İllüstrasyon tasarım"}
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold">Fotoğrafınızı yükleyin</h2>
              </div>
              <ImagePlus className="h-7 w-7 text-primary" />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {kind === "print"
                ? "Yüklediğiniz görsel, seçtiğiniz ölçüde aslına sadık kalınarak hazırlanır."
                : "Tasarım ekibimiz görselinizi seçtiğiniz stile göre yorumlar ve onayınıza sunar."}
            </p>
            <div className="mt-7 space-y-6">
              <OptionGroup title="Tablo ölçüsü" value={size} options={SIZES} onChange={setSize} />
              <OptionGroup
                title="Yön seçimi"
                value={orientation}
                options={["Dikey", "Yatay"]}
                onChange={setOrientation}
              />
              {kind === "illustration" && (
                <OptionGroup
                  title="İllüstrasyon stili"
                  value={style}
                  options={STYLES}
                  onChange={setStyle}
                />
              )}
              <div>
                <p className="mb-2 text-sm font-semibold text-stone-800">Fotoğraf / görsel</p>
                {preview ? (
                  <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
                    <img
                      src={preview}
                      alt="Yüklenen fotoğraf önizlemesi"
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
                      selectFile(event.dataTransfer.files[0]);
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
                  onChange={(event) => selectFile(event.target.files?.[0])}
                />
                {fileError && (
                  <p role="alert" className="mt-2 text-sm text-red-600">
                    {fileError}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-7 border-t border-stone-100 pt-6">
              <WhatsAppButton message={message} size="lg" className="w-full">
                <span className="flex items-center justify-center gap-2">
                  Tasarım talebini gönder <ChevronRight className="h-4 w-4" />
                </span>
              </WhatsAppButton>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                WhatsApp açıldığında fotoğrafınızı mesaja ekleyerek talebinizi tamamlayın.
              </p>
            </div>
          </section>
          <aside className="space-y-5">
            <InfoCard title="Fotoğraf boyutu hakkında">
              <p>
                En iyi sonuç için net, iyi ışıkta çekilmiş ve yüksek çözünürlüklü bir fotoğraf
                yükleyin.
              </p>
              <ul className="mt-4 space-y-2">
                <li>35 × 50 cm için en az 3400 × 4800 px</li>
                <li>50 × 70 cm için en az 4800 × 6700 px</li>
                <li>60 × 90 cm için en az 5700 × 8600 px</li>
              </ul>
            </InfoCard>
            <InfoCard title="Fotoğraf ipuçları">
              <ul className="space-y-3">
                <li>Yüz, obje veya kompozisyon net olmalı.</li>
                <li>Portrelerde göz hizasından çekilen fotoğraflar daha iyi sonuç verir.</li>
                <li>Dikey/yatay seçiminiz fotoğrafın oranıyla uyumlu olmalı.</li>
                <li>
                  {kind === "illustration"
                    ? "İllüstrasyon çalışması üretim öncesi onayınıza sunulur."
                    : "Renkler ve detaylar baskıya en uygun şekilde hazırlanır."}
                </li>
              </ul>
            </InfoCard>
            <div className="rounded-3xl bg-stone-950 p-6 text-stone-100">
              <Sparkles className="h-5 w-5 text-amber-300" />
              <h3 className="mt-3 font-display text-xl font-bold">
                Örnek çalışma mı görmek istiyorsunuz?
              </h3>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                Tasarım türüne göre örnekleri WhatsApp üzerinden sizinle paylaşalım.
              </p>
              <WhatsAppButton
                className="mt-5 w-full"
                message={`Merhaba, ${kind === "print" ? "doğrudan bası" : "illüstrasyon tasarım"} için örnek çalışma görmek istiyorum.`}
              >
                Örnekleri iste
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
              [
                "01",
                "Tasarıma karar verin",
                "Doğrudan bası veya illüstrasyon seçeneğini belirleyin.",
              ],
              [
                "02",
                "Fotoğrafınızı paylaşın",
                "Görselinizi yükleyin ve sipariş detaylarını gönderin.",
              ],
              [
                "03",
                "Onaylayın, keyfini çıkarın",
                "Tasarımınız hazırlanır; özenle paketlenip size ulaştırılır.",
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

function Feature({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <span className="flex items-center gap-2">
      {icon}
      {text}
    </span>
  );
}
function DesignChoice({
  active,
  icon,
  title,
  text,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
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
function OptionGroup({
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
function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 text-sm leading-6 text-muted-foreground shadow-sm">
      <h3 className="font-display text-xl font-bold text-stone-900">{title}</h3>
      <div className="mt-3 [&_li]:relative [&_li]:pl-4 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:text-primary [&_li]:before:content-['•']">
        {children}
      </div>
    </section>
  );
}
