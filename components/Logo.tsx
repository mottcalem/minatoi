import Image from "next/image";
import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`brand-logo${light ? " brand-logo-light" : ""}`} aria-label="Minatoi ana sayfa">
      <Image src="/minatoi-logo.jpg" alt="Minatoi" width={160} height={41} priority />
    </Link>
  );
}
