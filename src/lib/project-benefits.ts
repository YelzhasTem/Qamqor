export const projectBenefitValues = [
  "thank_you_letter",
  "volunteer_hours",
  "meals",
  "transport",
  "merch",
  "recommendation_letter",
] as const;

export type ProjectBenefit = (typeof projectBenefitValues)[number];

export const projectBenefitLabels: Record<ProjectBenefit, string> = {
  thank_you_letter: "Благодарственное письмо",
  volunteer_hours: "Волонтёрские часы",
  meals: "Питание",
  transport: "Развозка",
  merch: "Мерч",
  recommendation_letter: "Рекомендательное письмо",
};

export const DEFAULT_PROJECT_COVER = "/illustrations/qamqor-project-default.jpg";

export function isProjectBenefit(value: string): value is ProjectBenefit {
  return projectBenefitValues.includes(value as ProjectBenefit);
}
