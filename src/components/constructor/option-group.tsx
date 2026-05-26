"use client";

import type { TemplateOptionGroup } from "@/types/constructor";

import { cn } from "@/lib/utils";

type OptionGroupProps = {
  group: TemplateOptionGroup;
  onSelect: (groupId: string, value: string) => void;
  selectedValue?: string;
};

export function OptionGroup({
  group,
  onSelect,
  selectedValue,
}: OptionGroupProps) {
  return (
    <section className="space-y-3 rounded-[24px] border border-black/5 bg-white p-5 shadow-panel">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-black/35">
          параметр
        </div>
        <h3 className="mt-2 text-lg font-semibold text-ink">{group.name}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {group.values.map((value) => {
          const isActive = value.value === selectedValue;
          return (
            <button
              key={`${group.id}-${value.value}`}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition",
                isActive
                  ? "border-gold-500 bg-gold-500 text-white"
                  : "border-black/8 bg-sand text-black/70 hover:border-gold-400 hover:bg-gold-300/15",
              )}
              onClick={() => onSelect(group.id, value.value)}
              type="button"
            >
              {value.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
