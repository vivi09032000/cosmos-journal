import { useMemo } from "react";

/**
 * Cross-collection checkin streak calculation.
 *
 * A day counts as "checked in" if ANY of:
 * - dailyLogs/{date}.mood has a value
 * - dailyLogs/{date}.questionAnswer has a value
 * - gratitude/{date} document exists
 * - any order's journal array has a recordedAt on that date
 *
 * The streak is the number of consecutive days (from today backwards)
 * that have at least one check-in.
 */
function getDateKey(date) {
  return date.toLocaleDateString("sv-SE");
}

function timestampToDateKey(ts) {
  if (!ts) return null;
  if (ts.toDate) return getDateKey(ts.toDate());
  if (ts.seconds) return getDateKey(new Date(ts.seconds * 1000));
  if (typeof ts === "string") return ts.slice(0, 10);
  return null;
}

export function useCheckinStreak(allDailyLogs, gratitudeEntries, orders) {
  return useMemo(() => {
    const checkedDates = new Set();

    // dailyLogs: mood or questionAnswer
    for (const log of allDailyLogs) {
      if (log.mood || log.questionAnswer) {
        if (log.date) checkedDates.add(log.date);
      }
    }

    // gratitude entries
    for (const entry of gratitudeEntries) {
      if (entry.date) checkedDates.add(entry.date);
    }

    // orders: journal entries by date
    for (const order of orders) {
      if (!Array.isArray(order.journal)) continue;
      for (const journalEntry of order.journal) {
        const key = timestampToDateKey(journalEntry.recordedAt);
        if (key) checkedDates.add(key);
      }
    }

    // Count consecutive days from today backwards
    let count = 0;
    const cursor = new Date();

    while (checkedDates.has(getDateKey(cursor))) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return count;
  }, [allDailyLogs, gratitudeEntries, orders]);
}
