"use client";

import { isValidHex, normalizeHex } from "@/lib/utils/palette";

export function ColorPicker({
  label,
  value,
  onChange,
  helperText,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  helperText?: string;
}) {
  const valid = isValidHex(value);
  // El input type=color exige #rrggbb válido; si es inválido usamos negro.
  const colorValue = valid ? normalizeHex(value) : "#000000";

  return (
    <div>
      <label className="block text-xs font-medium text-primo-text mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={colorValue}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-10 shrink-0 rounded-md border border-primo-border bg-primo-bg cursor-pointer p-0.5"
          aria-label={`${label} color picker`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          spellCheck={false}
          className={`w-full bg-primo-bg border rounded-md px-3 py-2 text-sm font-mono text-primo-text focus:outline-none transition-colors ${
            valid
              ? "border-primo-border focus:border-primo-accent"
              : "border-red-500 focus:border-red-500"
          }`}
        />
      </div>
      {helperText && (
        <p className="text-[11px] text-primo-muted mt-1">{helperText}</p>
      )}
      {!valid && (
        <p className="text-[11px] text-red-500 mt-1">
          Formato inválido (usa #RRGGBB)
        </p>
      )}
    </div>
  );
}
