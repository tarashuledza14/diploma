const exactReasonTranslations: Record<string, string> = {
  "Issued for Repair Order": "Видано для ремонтного замовлення",
  "Initial stock setup": "Початкове оприбуткування",
  "Initial import (Batch 1)": "Початковий імпорт (Партія 1)",
  "Manual stock adjustment via edit form":
    "Ручне коригування залишку через форму редагування",
};

const patternReasonTranslations: Array<{
  pattern: RegExp;
  translate: (match: RegExpMatchArray) => string;
}> = [
  {
    pattern: /^Order stock delta \((.+)\)$/,
    translate: (match) => `Різниця складу замовлення (${match[1]})`,
  },
  {
    pattern: /^Initial import \((Batch\s+\d+)\)$/,
    translate: (match) =>
      `Початковий імпорт (${match[1].replace("Batch", "Партія")})`,
  },
  {
    pattern: /^Order became active \((.+)\)$/,
    translate: (match) => `Замовлення стало активним (${match[1]})`,
  },
  {
    pattern: /^Order completed from non-stock state \((.+)\)$/,
    translate: (match) =>
      `Замовлення завершено зі стану без складу (${match[1]})`,
  },
  {
    pattern: /^Order left active state \((.+)\)$/,
    translate: (match) => `Замовлення залишило активний стан (${match[1]})`,
  },
  {
    pattern: /^Order reopened\/cancelled after issue \((.+)\)$/,
    translate: (match) =>
      `Замовлення повторно відкрито/скасовано після видачі (${match[1]})`,
  },
  {
    pattern: /^Order completed \((.+)\)$/,
    translate: (match) => `Замовлення завершено (${match[1]})`,
  },
  {
    pattern: /^Unused reserved quantity returned \((.+)\)$/,
    translate: (match) =>
      `Невикористаний зарезервований залишок повернено (${match[1]})`,
  },
  {
    pattern: /^Order moved back to active state \((.+)\)$/,
    translate: (match) => `Замовлення повернено в активний стан (${match[1]})`,
  },
];

export function formatMovementReason(reason?: string | null) {
  if (!reason) {
    return "";
  }

  if (exactReasonTranslations[reason]) {
    return exactReasonTranslations[reason];
  }

  for (const entry of patternReasonTranslations) {
    const match = reason.match(entry.pattern);
    if (match) {
      return entry.translate(match);
    }
  }

  return reason;
}
