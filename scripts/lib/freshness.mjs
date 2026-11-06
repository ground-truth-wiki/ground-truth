// Rule 3 of the rulebook: when each chapter is due for review.
export const REVIEW_MONTHS = { volatile: 3, moving: 6, evergreen: 12 };

const monthIndex = (ym) => { const [y, m] = ym.split('-').map(Number); return y * 12 + (m - 1); };
export const ym = (i) => `${Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')}`;

// For each chapter: the month index it is due, and how many months overdue
// it is (negative while it is still within its schedule).
export function reviewSchedule(chapters, today = new Date()) {
  const now = today.getUTCFullYear() * 12 + today.getUTCMonth();
  return chapters.map((c) => {
    const due = monthIndex(c.meta.reviewed) + REVIEW_MONTHS[c.meta.stability];
    return { chapter: c, due, overdue: now - due };
  });
}
