import { ChevronRight } from "lucide-react";

export function DesignChoice({
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
      className={`flex h-44 w-full flex-col rounded-2xl border p-4 text-left transition ${active ? "border-primary bg-primary text-primary-foreground shadow-glow" : "border-stone-200 bg-white hover:border-primary/50"}`}
    >
      <h3 className="font-display text-[22px] font-bold leading-7">{title}</h3>
      <p className={`mt-2 text-sm leading-6 ${active ? "text-white/80" : "text-muted-foreground"}`}>
        {text}
      </p>
      <span className="mt-auto flex items-center gap-1 pt-3 text-sm font-semibold">
        Seç <ChevronRight className="h-4 w-4" />
      </span>
    </button>
  );
}
