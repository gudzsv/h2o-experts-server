const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_DAYS = 7;
const MONTH_DAYS = 30;

const toTime = (dateKey) => Date.parse(`${dateKey}T00:00:00Z`);

const shiftDate = (dateKey, days) =>
  new Date(toTime(dateKey) + days * DAY_MS).toISOString().slice(0, 10);

// Days are string keys (YYYY-MM-DD), because drinkingTime is a local time
// without a time zone. UTC is only used here to step between calendar days.
const getLastDays = (today, count) =>
  Array.from({ length: count }, (_, index) =>
    shiftDate(today, index - count + 1),
  );

const sum = (values) => values.reduce((acc, value) => acc + value, 0);

/**
 * @param {{ date: string, total: number }[]} dailyTotals water per day, in ml
 * @param {{ today: string, dailyRequirement: number }} options
 *
 * The goal is the current dailyRequirement for every day, so changes of the
 * goal in the past are not reflected (an approximation).
 */
export const calculateWaterStats = (
  dailyTotals,
  { today, dailyRequirement },
) => {
  const totals = new Map(dailyTotals.map(({ date, total }) => [date, total]));
  const getTotal = (date) => totals.get(date) ?? 0;
  const isGoalMet = (date) => getTotal(date) >= dailyRequirement;

  const goalDates = [...totals.keys()]
    .filter((date) => date <= today && isGoalMet(date))
    .sort();

  let bestStreak = 0;
  let run = 0;
  goalDates.forEach((date, index) => {
    const isNextDay = index > 0 && shiftDate(goalDates[index - 1], 1) === date;
    run = isNextDay ? run + 1 : 1;
    bestStreak = Math.max(bestStreak, run);
  });

  // Today does not break a streak until it is over, so it is counted only
  // when the goal is already met.
  let currentStreak = 0;
  let cursor = isGoalMet(today) ? today : shiftDate(today, -1);
  while (isGoalMet(cursor)) {
    currentStreak += 1;
    cursor = shiftDate(cursor, -1);
  }

  const days = getLastDays(today, MONTH_DAYS).map((date) => ({
    date,
    total: getTotal(date),
    goalMet: isGoalMet(date),
  }));

  const average = (lastDays) =>
    Math.round(sum(lastDays.map(({ total }) => total)) / lastDays.length);

  // The rate is counted from the first day with records, so a new user is not
  // penalised for the days before they started.
  const firstDate = [...totals.keys()].sort()[0];
  const rateDays = days.filter(({ date }) => firstDate && date >= firstDate);
  const completionRate = rateDays.length
    ? Math.round(
        (rateDays.filter(({ goalMet }) => goalMet).length / rateDays.length) *
          100,
      )
    : 0;

  return {
    dailyRequirement,
    currentStreak,
    bestStreak,
    weekAverage: average(days.slice(-WEEK_DAYS)),
    monthAverage: average(days),
    completionRate,
    totalGoalDays: goalDates.length,
    days,
  };
};
