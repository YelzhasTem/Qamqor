import type { DictionaryShape } from "@/lib/i18n/types";

const ru = {
  application: {
    pending: "На рассмотрении",
    approved: "Одобрена",
    rejected: "Отклонена",
    attended: "Участие отмечено",
    completed: "Завершена",
  },
  hours: {
    pending: "Ждут подтверждения",
    confirmed: "Подтверждены",
    rejected: "Не подтверждены",
  },
  project: {
    draft: "Черновик",
    published: "Опубликован",
    completed: "Завершён",
    cancelled: "Отменён",
  },
} as const;

type Statuses = DictionaryShape<typeof ru>;

const kk: Statuses = {
  application: {
    pending: "Қаралуда",
    approved: "Мақұлданды",
    rejected: "Қабылданбады",
    attended: "Қатысуы белгіленді",
    completed: "Аяқталды",
  },
  hours: {
    pending: "Растауды күтуде",
    confirmed: "Расталды",
    rejected: "Расталмады",
  },
  project: {
    draft: "Жоба нұсқасы",
    published: "Жарияланды",
    completed: "Аяқталды",
    cancelled: "Тоқтатылды",
  },
};

const en: Statuses = {
  application: {
    pending: "Under review",
    approved: "Approved",
    rejected: "Declined",
    attended: "Attended",
    completed: "Completed",
  },
  hours: {
    pending: "Awaiting confirmation",
    confirmed: "Confirmed",
    rejected: "Not confirmed",
  },
  project: {
    draft: "Draft",
    published: "Published",
    completed: "Completed",
    cancelled: "Cancelled",
  },
};

export const statuses = { ru, kk, en };
