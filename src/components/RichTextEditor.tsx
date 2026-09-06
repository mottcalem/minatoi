import { useEffect, useRef } from "react";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

const TOOLBAR_BUTTON =
  "flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-semibold text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition";

/**
 * Harici bağımlılığı olmayan hafif rich text editor.
 * Tarayıcının yerleşik contentEditable + execCommand API'sini kullanır.
 */
export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useRef<HTMLDivElement>(null);

  // Dış değer değiştiğinde (ör. ürün düzenleme formu doldurulurken) içeriği senkronla.
  useEffect(() => {
    if (editor.current && editor.current.innerHTML !== value) {
      editor.current.innerHTML = value;
    }
  }, [value]);

  function exec(command: string, argument?: string) {
    editor.current?.focus();
    document.execCommand(command, false, argument);
    onChange(editor.current?.innerHTML ?? "");
  }

  function handleInput() {
    onChange(editor.current?.innerHTML ?? "");
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    // Ctrl/Cmd+B,I,U tarayıcıda zaten çalışıyor; burada yalnızca düz metin yapıştırmayı zorunlu kılıyoruz.
    if ((event.ctrlKey || event.metaKey) && event.key === "v") return;
  }

  function handlePaste(event: React.ClipboardEvent) {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }

  function addLink() {
    const url = window.prompt("Bağlantı adresi (https://…)");
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      window.alert("Bağlantı https:// veya http:// ile başlamalı.");
      return;
    }
    exec("createLink", url);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-stone-200 bg-stone-50 px-2 py-1.5">
        <button
          type="button"
          title="Kalın (Ctrl+B)"
          aria-label="Kalın"
          className={TOOLBAR_BUTTON}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("bold")}
        >
          <b>B</b>
        </button>
        <button
          type="button"
          title="İtalik (Ctrl+I)"
          aria-label="İtalik"
          className={TOOLBAR_BUTTON}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("italic")}
        >
          <i>I</i>
        </button>
        <button
          type="button"
          title="Altı çizili (Ctrl+U)"
          aria-label="Altı çizili"
          className={TOOLBAR_BUTTON}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("underline")}
        >
          <u>U</u>
        </button>
        <span className="mx-1 h-5 w-px bg-stone-200" aria-hidden="true" />
        <button
          type="button"
          title="Başlık 2"
          aria-label="Başlık 2"
          className={`${TOOLBAR_BUTTON} text-base`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("formatBlock", "<h2>")}
        >
          H2
        </button>
        <button
          type="button"
          title="Başlık 3"
          aria-label="Başlık 3"
          className={TOOLBAR_BUTTON}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("formatBlock", "<h3>")}
        >
          H3
        </button>
        <button
          type="button"
          title="Paragraf"
          aria-label="Paragraf"
          className={TOOLBAR_BUTTON}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("formatBlock", "<p>")}
        >
          ¶
        </button>
        <span className="mx-1 h-5 w-px bg-stone-200" aria-hidden="true" />
        <button
          type="button"
          title="Sıralı liste"
          aria-label="Sıralı liste"
          className={TOOLBAR_BUTTON}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("insertOrderedList")}
        >
          1.
        </button>
        <button
          type="button"
          title="Madde işaretli liste"
          aria-label="Madde işaretli liste"
          className={TOOLBAR_BUTTON}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("insertUnorderedList")}
        >
          •
        </button>
        <span className="mx-1 h-5 w-px bg-stone-200" aria-hidden="true" />
        <button
          type="button"
          title="Bağlantı ekle"
          aria-label="Bağlantı ekle"
          className={TOOLBAR_BUTTON}
          onMouseDown={(e) => e.preventDefault()}
          onClick={addLink}
        >
          🔗
        </button>
        <button
          type="button"
          title="Biçimlendirmeyi temizle"
          aria-label="Biçimlendirmeyi temizle"
          className={TOOLBAR_BUTTON}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("removeFormat")}
        >
          ✕
        </button>
      </div>
      <div
        ref={editor}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Tam açıklama"
        data-placeholder={placeholder}
        onInput={handleInput}
        onBlur={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className="prose-admin-editor min-h-[10rem] px-3 py-2.5 text-sm text-stone-800 outline-none [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-stone-400"
      />
    </div>
  );
}
