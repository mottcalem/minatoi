import { waLink } from "@/data/site";

type Props = {
  message: string;
  className?: string;
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "outline";
};

export function WhatsAppButton({
  message,
  className = "",
  children,
  size = "md",
  variant = "solid",
}: Props) {
  const sizes = {
    sm: "px-3 py-2 text-sm gap-2",
    md: "px-5 py-3 text-sm gap-2",
    lg: "px-6 py-4 text-base gap-2.5",
  }[size];
  const styles =
    variant === "solid"
      ? "bg-whatsapp text-whatsapp-foreground hover:brightness-110"
      : "border border-whatsapp text-whatsapp hover:bg-whatsapp/10";
  return (
    <a
      href={waLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center rounded-full font-semibold transition shadow-elegant ${sizes} ${styles} ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
        <path d="M20.5 3.5A11.9 11.9 0 0 0 12 0C5.4 0 .1 5.3.1 11.9c0 2.1.6 4.1 1.6 5.9L0 24l6.4-1.7a11.9 11.9 0 0 0 5.6 1.4h.01c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.4-8.3zM12 21.3h-.01a9.4 9.4 0 0 1-4.8-1.3l-.34-.2-3.8 1 1-3.7-.22-.36a9.4 9.4 0 1 1 17.5-4.9c0 5.2-4.2 9.4-9.4 9.4zm5.4-7c-.3-.15-1.75-.86-2-.95-.27-.1-.46-.15-.65.15-.2.3-.74.95-.9 1.14-.17.2-.34.22-.62.07-.3-.15-1.25-.46-2.4-1.48-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.34.45-.5.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.65-1.6-.9-2.18-.24-.57-.48-.5-.65-.5h-.55c-.2 0-.5.07-.77.37-.27.3-1.02 1-1.02 2.45s1.05 2.85 1.2 3.05c.15.2 2.07 3.17 5 4.45.7.3 1.25.48 1.68.62.7.22 1.34.2 1.85.12.56-.08 1.75-.72 2-1.4.25-.7.25-1.3.18-1.42-.07-.13-.27-.2-.57-.35z" />
      </svg>
      {children ?? "WhatsApp'tan İletişim"}
    </a>
  );
}

export function WhatsAppFloating() {
  const msg =
    "Merhaba, MinaToi web sitesinden yazıyorum. Ürünleriniz hakkında bilgi alabilir miyim?";
  return (
    <a
      href={waLink(msg)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp ile iletişime geç"
      className="fixed bottom-24 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-elegant hover:scale-105 transition"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.5 3.5A11.9 11.9 0 0 0 12 0C5.4 0 .1 5.3.1 11.9c0 2.1.6 4.1 1.6 5.9L0 24l6.4-1.7a11.9 11.9 0 0 0 5.6 1.4h.01c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.4-8.3zM12 21.3h-.01a9.4 9.4 0 0 1-4.8-1.3l-.34-.2-3.8 1 1-3.7-.22-.36a9.4 9.4 0 1 1 17.5-4.9c0 5.2-4.2 9.4-9.4 9.4zm5.4-7c-.3-.15-1.75-.86-2-.95-.27-.1-.46-.15-.65.15-.2.3-.74.95-.9 1.14-.17.2-.34.22-.62.07-.3-.15-1.25-.46-2.4-1.48-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.34.45-.5.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.65-1.6-.9-2.18-.24-.57-.48-.5-.65-.5h-.55c-.2 0-.5.07-.77.37-.27.3-1.02 1-1.02 2.45s1.05 2.85 1.2 3.05c.15.2 2.07 3.17 5 4.45.7.3 1.25.48 1.68.62.7.22 1.34.2 1.85.12.56-.08 1.75-.72 2-1.4.25-.7.25-1.3.18-1.42-.07-.13-.27-.2-.57-.35z" />
      </svg>
    </a>
  );
}
