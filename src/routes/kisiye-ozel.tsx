import { fetchProductsServer } from "@/data/adminProducts";
import { CUSTOM_PRODUCTS } from "@/data/customProducts";
import { getCustomContent } from "@/data/customContentActions";
import { ExampleGallery } from "@/components/ExampleGallery";
import { createFileRoute } from "@tanstack/react-router";
import { Check, ChevronRight, ImagePlus, ShieldCheck, Sparkles, Upload, X } from "lucide-react";
import { useEffect, useId, useState, type ReactNode } from "react";
import { DesignRequestForm } from "@/components/DesignRequestForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const Route = createFileRoute("/kisiye-ozel")({
  head: () => ({
    meta: [
      { title: "Kişiye Özel — MinaToi" },
      {
        name: "description",
        content:
          "Fotoğrafınızı Doğrudan baskı veya illüstrasyon tasarıma dönüştürün. Size özel MinaToi tasarımınızı kolayca oluşturun.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { tab?: DesignKind } => ({
    tab: search.tab === "illustration" ? "illustration" : "print",
  }),
  loader: async () => ({
    content: await getCustomContent(),
    products: await fetchProductsServer(),
  }),
  component: KisiyeOzel,
});

type DesignKind = "print" | "illustration";

function KisiyeOzel() {
  const { content, products } = Route.useLoaderData();
  const { tab } = Route.useSearch();
  const [kind, setKind] = useState<DesignKind>(tab ?? "print");
  useEffect(() => setKind(tab ?? "print"), [tab]);
  const [size, setSize] = useState("25 × 35 cm");
  const [orientation, setOrientation] = useState("Dikey");
  const [style, setStyle] = useState(content.styles[0]);
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
  const slug =
    kind === "print"
      ? "kisiye-ozel-dogrudan-baski"
      : /sulu/i.test(style)
        ? "kisiye-ozel-sulu-boya"
        : /yağ|yag|mozaik/i.test(style)
          ? "kisiye-ozel-yagli-boya"
          : "kisiye-ozel-karakalem";
  const product =
    products.find((p) => p.slug === slug) ?? CUSTOM_PRODUCTS.find((p) => p.slug === slug)!;
  const sizes = product.sizes ?? [];
  const selectedSize = sizes.includes(size) ? size : sizes[0];
  return (
    <main className="overflow-hidden">
      <section className="border-b border-stone-200 bg-white text-stone-900">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.24em] text-stone-500">
              MinaToi atölye
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold leading-tight sm:text-3xl">
              Anılarınızı size özel bir tasarıma dönüştürelim.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              En sevdiğiniz fotoğrafı olduğu gibi basalım ya da özgün bir illüstrasyonla yeniden
              yorumlayalım. Tasarımınız, seçtiğiniz ölçü ve yönle atölyede sizin için hazırlanır.
            </p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
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
            title="Doğrudan Baskı"
            text="Fotoğrafınızın doğal görünümünü koruyan, net ve canlı baskı."
            onClick={() => setKind("print")}
          />
          <DesignChoice
            active={kind === "illustration"}
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
                  {kind === "print" ? "Doğrudan baskı" : "İllüstrasyon tasarım"}
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
              <OptionGroup
                title="Tablo ölçüsü"
                value={selectedSize}
                options={sizes}
                onChange={setSize}
              />
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
                  options={content.styles}
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
            <div className="mt-6">
              <DesignRequestForm
                file={file}
                product={product}
                size={selectedSize}
                orientation={orientation}
                style={kind === "print" ? "Doğrudan baskı" : style}
              />
            </div>
            <ExampleGallery
              examples={
                content.examples[kind === "print" ? "personalPrint" : "personalIllustration"]
              }
            />
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
                message={`Merhaba, ${kind === "print" ? "Doğrudan baskı" : "illüstrasyon tasarım"} için örnek çalışma görmek istiyorum.`}
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
                "Doğrudan baskı veya illüstrasyon seçeneğini belirleyin.",
              ],
              [
                "02",
                "Fotoğrafınızı paylaşın",
                "Görselinizi yükleyin ve tasarımınızı sepete ekleyin.",
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
  title,
  text,
  onClick,
}: {
  active: boolean;
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
      className={`rounded-2xl border p-4 text-left transition ${active ? "border-primary bg-primary text-primary-foreground shadow-glow" : "border-stone-200 bg-white hover:border-primary/50"}`}
    >
      <h3 className="font-display text-xl font-bold">{title}</h3>
      <p className={`mt-2 text-sm leading-6 ${active ? "text-white/80" : "text-muted-foreground"}`}>
        {text}
      </p>
      <span className="mt-3 flex items-center gap-1 text-sm font-semibold">
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
