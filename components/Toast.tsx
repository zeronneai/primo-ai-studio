"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { Check, AlertCircle } from "lucide-react";

type ToastType = "success" | "error";
type ToastState = { message: string; type: ToastType } | null;

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-2 bg-primo-surface border border-primo-border rounded-lg px-4 py-3 shadow-2xl fade-in">
          {toast.type === "success" ? (
            <Check className="h-4 w-4 text-primo-accent" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-400" />
          )}
          <span className="text-sm text-primo-text">{toast.message}</span>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback no-op para no romper si se usa fuera del provider.
    return { showToast: () => {} };
  }
  return ctx;
}
