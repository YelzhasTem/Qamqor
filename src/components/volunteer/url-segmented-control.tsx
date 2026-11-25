"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { SegmentedControl } from "@/components/shared/segmented-control";

/** SegmentedControl whose value lives in the URL, so a reload keeps the choice. */
export function UrlSegmentedControl<T extends string>({
  label,
  value,
  options,
  className,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; href: string }[];
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <div aria-busy={pending}>
      <SegmentedControl
        label={label}
        value={value}
        onChange={(next) => {
          const option = options.find((item) => item.value === next);
          if (option) startTransition(() => router.replace(option.href, { scroll: false }));
        }}
        options={options.map(({ value: optionValue, label: optionLabel }) => ({ value: optionValue, label: optionLabel }))}
        className={className}
      />
    </div>
  );
}
