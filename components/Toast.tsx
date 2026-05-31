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
        <div
          className={`fixed bottom-6 right-6 z-[200] flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg fade-in text-white ${
            toast.type === "success" ? "bg-primo-accentGreen" : "bg-red-500"
          }`}
        >
          {toast.type === "success" ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
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
