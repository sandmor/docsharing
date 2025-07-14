"use client";

import { Combobox } from "@/components/ui/combobox";
import { CODE_LANGUAGE_OPTIONS } from "./constants";

type LanguageSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <Combobox
      options={CODE_LANGUAGE_OPTIONS}
      value={value}
      onChange={onChange}
      placeholder="Select a language..."
      searchPlaceholder="Search language..."
      noResultsMessage="No language found."
    />
  );
}
