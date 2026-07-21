"use client";

import {
  BusFront,
  Clock3,
  FileBadge2,
  HandHeart,
  Shirt,
  Utensils,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/marketing/language-provider";
import {
  isProjectBenefit,
  type ProjectBenefit,
} from "@/lib/project-benefits";
import { cn } from "@/lib/utils";

const icons = {
  thank_you_letter: HandHeart,
  volunteer_hours: Clock3,
  meals: Utensils,
  transport: BusFront,
  merch: Shirt,
  recommendation_letter: FileBadge2,
} satisfies Record<ProjectBenefit, typeof Clock3>;

export function ProjectBenefits({
  benefits,
  hours,
  className,
}: {
  benefits: string[];
  hours: number;
  className?: string;
}) {
  const { copy } = useLanguage();
  const knownBenefits = benefits.filter(isProjectBenefit);
  if (!knownBenefits.length) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {knownBenefits.map((benefit) => {
        const Icon = icons[benefit];
        const label = benefit === "volunteer_hours"
          ? `${hours} ${copy.common.hoursShort}`
          : copy.benefits[benefit];

        return (
          <Badge key={benefit} variant="muted" className="gap-1.5 py-1.5">
            <Icon className="size-3.5 text-primary" />
            {label}
          </Badge>
        );
      })}
    </div>
  );
}
