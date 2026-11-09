"use client";

import { useCallback, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { maskCEP, maskCNPJ, maskPhoneInput } from "@/lib/masks";

type MaskKind = "phone-br" | "cep" | "cnpj";

interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  mask?: MaskKind;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

const applyMask = (value: string, mask: MaskKind) => {
  switch (mask) {
    case "phone-br": return maskPhoneInput(value);
    case "cep": return maskCEP(value);
    case "cnpj": return maskCNPJ(value);
    default: return value;
  }
};

export function MaskedInput({ mask, value: externalValue, onChange, placeholder, ...rest }: MaskedInputProps) {
  const [internalValue, setInternalValue] = useState("");
  const lastRaw = useRef("");

  const value = externalValue ?? internalValue;

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const masked = applyMask(raw, mask ?? "phone-br");
    setInternalValue(masked);
    lastRaw.current = raw;
    onChange?.(masked);
  }, [mask, onChange]);

  return (
    <Input
      {...rest}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      autoComplete="off"
      spellCheck={false}
      inputMode={mask ? "numeric" : undefined}
    />
  );
}
