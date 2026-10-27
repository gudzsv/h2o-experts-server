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

// The first day of the 30-day window that ends today.
export const getMonthStart = (today) => shiftDate(today, 1 - MONTH_DAYS);

// Morning 05-11, afternoon 12-16, evening 17-21, night 22-04.
const getDayPart = (hour) => {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
};

/**
 * @param {{ hour: string, total: number }[]} hourlyTotals water per hour of
 * the day ('00'-'23'), in ml
 */
export const calculateTimeOfDay = (hourlyTotals) => {
  const timeOfDay = { morning: 0, afternoon: 0, evening: 0, night: 0 };

  hourlyTotals.forEach(({ hour, total }) => {
    timeOfDay[getDayPart(Number(hour))] += total;
  });

  return timeOfDay;
};

// Monday-Sunday weeks, up to today, with the goal met on every day.
const countPerfectWeeks = (goalDates, today) => {
  const goalSet = new Set(goalDates);
  const isMonday = (date) => new Date(toTime(date)).getUTCDay() === 1;

  return goalDates.filter((monday) => {
    const sunday = shiftDate(monday, WEEK_DAYS - 1);
    return (
      isMonday(monday) &&
      sunday <= today &&
      Array.from({ length: WEEK_DAYS }, (_, index) =>
        shiftDate(monday, index),
      ).every((date) => goalSet.has(date))
    );
  }).length;
};

/**
 * @param {{ date: string, total: number, early?: boolean }[]} dailyTotals
 * water per day, in ml; `early` is true when some of it was drunk before 9:00
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

  // All-time figures ignore records dated after today.
  const pastDays = dailyTotals.filter(({ date }) => date <= today);

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
    totalMl: sum(pastDays.map(({ total }) => total)),
    earlyDays: pastDays.filter(({ early }) => early).length,
    perfectWeeks: countPerfectWeeks(goalDates, today),
    days,
  };
};
