import type { ReactNode } from "react";

export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro?: ReactNode;
  sections: { heading: string; body: ReactNode }[];
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <header className="mb-8 border-b border-border pb-6">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Son güncelleme: {updated}</p>
      </header>
      {intro && <div className="mb-8 text-sm leading-relaxed text-muted-foreground">{intro}</div>}
      <div className="space-y-8">
        {sections.map((s, i) => (
          <section key={i}>
            <h2 className="font-display text-lg font-semibold">
              {i + 1}. {s.heading}
            </h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">{s.body}</div>
          </section>
        ))}
      </div>
    </article>
  );
}
