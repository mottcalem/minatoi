import { useEffect, useState } from "react";
import { getCustomContent, saveCustomContent } from "@/data/customContentActions";
import { DESIGN_SECTIONS, type DesignSection, type CustomContent } from "@/data/customContent";
import { uploadProductImages } from "@/data/uploadActions";

const inputClass = "w-full rounded-lg border border-stone-200 p-2 text-sm";
export function CustomContentManager() {
  const [content, setContent] = useState<CustomContent | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  useEffect(() => {
    getCustomContent()
      .then(setContent)
      .catch(() => {
        setError(true);
        setMessage("İçerik yüklenemedi. Sayfayı yenileyin.");
      });
  }, []);
  function notify(text: string, failed = false) {
    setMessage(text);
    setError(failed);
  }
  async function upload(section: DesignSection, files: FileList | null, cover: boolean) {
    if (!files?.length || !content) return;
    const selected = Array.from(files);
    if (
      selected.length > 10 ||
      selected.some(
        (file) =>
          !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
          file.size > 5 * 1024 * 1024,
      )
    ) {
      notify(
        "Bir seferde en fazla 10 JPG, PNG veya WebP yükleyin. Her dosya en fazla 5 MB olmalı.",
        true,
      );
      return;
    }
    setBusy(true);
    notify("");
    try {
      const encoded = await Promise.all(
        selected.map(
          (file) =>
            new Promise<{ name: string; dataUrl: string }>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve({ name: file.name, dataUrl: String(reader.result) });
              reader.onerror = () => reject(new Error("Dosya okunamadı."));
              reader.readAsDataURL(file);
            }),
        ),
      );
      const result = await uploadProductImages({
        data: {
          token: localStorage.getItem("admin_token") ?? "",
          slug: `design-${section}`,
          files: encoded,
        },
      });
      setContent((current) =>
        !current
          ? current
          : cover
            ? { ...current, covers: { ...current.covers, [section]: result.urls[0] } }
            : {
                ...current,
                examples: {
                  ...current.examples,
                  [section]: [
                    ...current.examples[section],
                    ...result.urls.map((image, index) => ({
                      image,
                      label: selected[index].name.replace(/\.[^.]+$/, "").slice(0, 100),
                    })),
                  ],
                },
              },
      );
      notify("Görseller yüklendi. Yayına almak için değişiklikleri kaydedin.");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Görsel yüklenemedi.", true);
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (!content) return;
    setBusy(true);
    notify("");
    try {
      await saveCustomContent({
        data: {
          token: localStorage.getItem("admin_token") ?? "",
          content: {
            ...content,
            styles: content.styles.map((style) => style.trim()).filter(Boolean),
            petStyles: content.petStyles.map((style) => style.trim()).filter(Boolean),
          },
        },
      });
      setContent(await getCustomContent());
      notify("Değişiklikler kaydedildi. Siteyi yenilediğinizde görünür.");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Kaydedilemedi.", true);
    } finally {
      setBusy(false);
    }
  }
  function move(section: DesignSection, index: number, offset: number) {
    if (!content) return;
    const next = [...content.examples[section]];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    setContent({ ...content, examples: { ...content.examples, [section]: next } });
  }
  return (
    <section className="space-y-6 rounded-2xl border bg-white p-5">
      <h2 className="font-display text-2xl font-bold">Özel Tasarımlar / Örnekler</h2>
      <p className="text-sm text-stone-600">
        Ana sayfadaki dört büyük kartın kapaklarını, illüstrasyon tarzlarını ve örnek çalışma
        bantlarını buradan yönetin. Kostüm ürünlerini Ürün Yönetimi → Patili Dostlara Özel
        bölümünden, normal kategorileri Kategoriler sekmesinden ekleyebilirsiniz.
      </p>
      {content && (
        <fieldset disabled={busy} className="space-y-6 disabled:opacity-60">
          {(["styles", "petStyles"] as const).map((key) => (
            <label key={key} className="block text-sm font-semibold">
              {key === "styles"
                ? "Kişiye özel illüstrasyon tarzları"
                : "Patili illüstrasyon tarzları"}
              <span className="block font-normal text-stone-500">
                Her satıra bir tarz yazın. Satır ekleyerek yeni tarz ekleyebilirsiniz.
              </span>
              <textarea
                className={inputClass}
                rows={4}
                value={content[key].join("\n")}
                onChange={(event) =>
                  setContent({ ...content, [key]: event.target.value.split("\n") })
                }
              />
            </label>
          ))}
          {(Object.entries(DESIGN_SECTIONS) as [DesignSection, string][]).map(
            ([section, title]) => (
              <section key={section} className="space-y-4 rounded-xl border p-4">
                <h3 className="font-semibold">{title}</h3>
                <img
                  src={content.covers[section]}
                  alt={`${title} ana sayfa kapağı`}
                  className="h-40 w-40 rounded-xl object-cover"
                />
                <label className="block text-sm">
                  Ana sayfa kapak görselini değiştir
                  <input
                    className="block"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      void upload(section, e.target.files, true);
                      e.target.value = "";
                    }}
                  />
                </label>
                <h4 className="font-semibold">
                  Örnek çalışmalar ({content.examples[section].length})
                </h4>
                <p className="text-xs text-stone-500">
                  Görselleri ekleyin, açıklamalarını düzenleyin ve sıralayın. Listeden kaldırmak
                  dosyayı silmez.
                </p>
                <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {content.examples[section].map((example, index) => (
                    <div
                      key={`${example.image}-${index}`}
                      className="space-y-2 rounded-lg border p-2"
                    >
                      <img
                        src={example.image}
                        alt={example.label}
                        className="aspect-[3/4] w-full rounded-lg object-cover"
                      />
                      <input
                        aria-label={`${title} ${index + 1}. örnek açıklaması`}
                        className={inputClass}
                        value={example.label}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            examples: {
                              ...content.examples,
                              [section]: content.examples[section].map((item, i) =>
                                i === index ? { ...item, label: e.target.value } : item,
                              ),
                            },
                          })
                        }
                      />
                      <div className="flex gap-3 text-sm">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => move(section, index, -1)}
                          aria-label="Örneği öne taşı"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={index === content.examples[section].length - 1}
                          onClick={() => move(section, index, 1)}
                          aria-label="Örneği sona taşı"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="text-red-600"
                          onClick={() =>
                            setContent({
                              ...content,
                              examples: {
                                ...content.examples,
                                [section]: content.examples[section].filter((_, i) => i !== index),
                              },
                            })
                          }
                        >
                          Kaldır
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <label className="block text-sm">
                  Örnek çalışma ekle
                  <input
                    className="block"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      void upload(section, e.target.files, false);
                      e.target.value = "";
                    }}
                  />
                </label>
              </section>
            ),
          )}
          <button
            type="button"
            onClick={save}
            className="rounded-full bg-primary px-6 py-3 text-white"
          >
            Değişiklikleri Kaydet
          </button>
        </fieldset>
      )}
      <p role="status" className={error ? "text-red-600" : "text-green-700"}>
        {busy ? "İşlem sürüyor…" : message}
      </p>
    </section>
  );
}
