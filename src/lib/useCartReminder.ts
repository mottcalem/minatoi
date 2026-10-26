import { useCallback, useEffect, useRef, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { cartPayload } from "@/data/orderCustomization";
const storageKey = "minatoi-cart-reminder-v1";
type Identity = { id: string; access: string; email?: string; createdAt?: number };
const emailValid = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 100;
async function reminderRequest(action: string, data: unknown) {
  const response = await fetch(`/api/cart-reminders/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    keepalive: true,
    signal: AbortSignal.timeout(5000),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Sepet bağlantısı açılamadı.");
  return result;
}
export function useCartReminder(couponCode: string, setCoupon: (value: string) => void) {
  const { items, ready, restore } = useCart();
  const [email, setEmailValue] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [notice, setNotice] = useState("");
  const [restoring, setRestoring] = useState(false);
  const identity = useRef<Identity | null>(null);
  const serialized = JSON.stringify(cartPayload(items));
  const lastSaved = useRef("");
  const latest = useRef<{
    id: string;
    access: string;
    email: string;
    items: unknown;
    couponCode: string;
  } | null>(null);
  const chain = useRef(Promise.resolve());
  const wasEmpty = useRef(false);
  useEffect(() => {
    if (!ready) return;
    let active = true;
    async function initialize() {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const id = params.get("cart") ?? params.get("stopcart");
      const access = params.get("key");
      if (id && access) {
        setRestoring(true);
        try {
          if (params.has("stopcart")) {
            await reminderRequest("unsubscribe", { id, access });
            if (active) setNotice("Sepet hatırlatma e-postaları kapatıldı.");
          } else {
            const saved = await reminderRequest("restore", { id, access });
            if (!active) return;
            identity.current = { id, access, email: saved.email, createdAt: Date.now() };
            restore(saved.items);
            setEmailValue(saved.email);
            setCoupon(saved.couponCode);
            try {
              localStorage.setItem(storageKey, JSON.stringify(identity.current));
            } catch {
              /* Optional storage. */
            }
            setNotice("Sepetiniz geri yüklendi. Siparişinizi tamamlayabilirsiniz.");
          }
        } catch (error) {
          if (active) setNotice(error instanceof Error ? error.message : "Sepet açılamadı.");
        } finally {
          if (active) {
            if (!identity.current)
              identity.current = {
                id: crypto.randomUUID(),
                access: Array.from(crypto.getRandomValues(new Uint8Array(32)), (v) =>
                  v.toString(16).padStart(2, "0"),
                ).join(""),
                createdAt: Date.now(),
              };
            history.replaceState(null, "", window.location.pathname + window.location.search);
            setRestoring(false);
            setInitialized(true);
          }
        }
        return;
      }
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");
        if (
          saved &&
          Date.now() - (saved.createdAt ?? 0) < 7 * 86400000 &&
          /^[a-f0-9-]{36}$/.test(saved.id) &&
          /^[a-f0-9]{64}$/.test(saved.access)
        ) {
          identity.current = saved;
          if (emailValid(saved.email ?? "")) setEmailValue(saved.email);
        }
      } catch {
        /* Optional storage. */
      }
      if (!identity.current) {
        identity.current = {
          createdAt: Date.now(),
          id: crypto.randomUUID(),
          access: Array.from(crypto.getRandomValues(new Uint8Array(32)), (v) =>
            v.toString(16).padStart(2, "0"),
          ).join(""),
        };
        try {
          localStorage.setItem(storageKey, JSON.stringify(identity.current));
        } catch {
          /* Optional storage. */
        }
      }
      if (active) setInitialized(true);
    }
    void initialize();
    return () => {
      active = false;
    };
  }, [ready, restore, setCoupon]);
  const save = useCallback(() => {
    const payload = latest.current;
    if (!payload) return Promise.resolve();
    const signature = JSON.stringify(payload);
    if (signature === lastSaved.current) return chain.current;
    lastSaved.current = signature;
    chain.current = chain.current.then(async () => {
      try {
        await reminderRequest("capture", payload);
      } catch {
        if (lastSaved.current === signature) lastSaved.current = "";
      }
    });
    return chain.current;
  }, []);
  useEffect(() => {
    if (!initialized || !identity.current || !emailValid(email.trim())) {
      latest.current = null;
      return;
    }
    if (wasEmpty.current && serialized !== "[]") {
      identity.current = {
        id: crypto.randomUUID(),
        access: Array.from(crypto.getRandomValues(new Uint8Array(32)), (v) =>
          v.toString(16).padStart(2, "0"),
        ).join(""),
        createdAt: Date.now(),
      };
      lastSaved.current = "";
    }
    wasEmpty.current = serialized === "[]";
    const contact = email.trim().toLowerCase();
    latest.current = {
      ...identity.current,
      email: contact,
      items: JSON.parse(serialized),
      couponCode,
    };
    identity.current = { ...identity.current, email: contact };
    try {
      localStorage.setItem(storageKey, JSON.stringify(identity.current));
    } catch {
      /* Optional storage. */
    }
    const timer = setTimeout(() => void save(), 800);
    return () => clearTimeout(timer);
  }, [initialized, email, serialized, couponCode, save]);
  useEffect(() => {
    function flush() {
      if (latest.current)
        navigator.sendBeacon(
          "/api/cart-reminders/capture",
          new Blob([JSON.stringify(latest.current)], { type: "application/json" }),
        );
    }
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      if (latest.current) void save();
    };
  }, [save]);
  const setEmail = (value: string) => {
    if (!value.trim() && identity.current?.email) {
      const previous = identity.current;
      void reminderRequest("capture", {
        ...previous,
        email: previous.email,
        items: [],
        couponCode: "",
      }).catch(() => {});
      identity.current = {
        id: crypto.randomUUID(),
        access: Array.from(crypto.getRandomValues(new Uint8Array(32)), (v) =>
          v.toString(16).padStart(2, "0"),
        ).join(""),
        createdAt: Date.now(),
      };
      latest.current = null;
      lastSaved.current = "";
      try {
        localStorage.setItem(storageKey, JSON.stringify(identity.current));
      } catch {
        /* Optional storage. */
      }
    }
    setEmailValue(value);
  };
  const linkOrder = async (order: { id: string; access: string }) => {
    await save();
    if (!identity.current) return;
    try {
      await reminderRequest("link", {
        ...identity.current,
        orderId: order.id,
        orderAccess: order.access,
      });
    } catch {
      /* Email-based payment suppression remains active. */
    }
  };
  return { email, setEmail, notice, restoring, save, linkOrder };
}
