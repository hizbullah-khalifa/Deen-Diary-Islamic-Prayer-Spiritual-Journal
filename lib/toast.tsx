"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Check, X, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastValue {
  toast: (type: ToastType, message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

function Icon({ type }: { type: ToastType }) {
  const cls = "h-4 w-4 shrink-0";
  if (type === "success") return <Check className={`${cls} text-success`} />;
  if (type === "error") return <X className={`${cls} text-destructive`} />;
  if (type === "warning")
    return <AlertTriangle className={`${cls} text-accent-foreground`} />;
  return <Info className={`${cls} text-primary`} />;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const toast = useCallback(
    (type: ToastType, message: string, duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setItems((prev) => [...prev, { id, type, message, duration }]);
    },
    []
  );

  useEffect(() => {
    if (!items.length) return;
    const latest = items[items.length - 1];
    if (!latest.duration) return;
    const t = setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== latest.id));
    }, latest.duration);
    return () => clearTimeout(t);
  }, [items]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-20 inset-x-4 z-[100] pointer-events-none flex flex-col items-center gap-2 sm:bottom-6"
      >
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto toast-in w-full max-w-sm rounded-xl bg-card border border-border px-4 py-3 shadow-lg flex items-start gap-3"
          >
            <Icon type={t.type} />
            <p className="text-sm flex-1 text-card-foreground leading-snug pt-0.5">
              {t.message}
            </p>
            <button
              aria-label="Dismiss"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}