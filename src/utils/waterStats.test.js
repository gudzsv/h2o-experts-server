import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  calculateTimeOfDay,
  calculateWaterStats,
  getMonthStart,
} from './waterStats.js';

const options = { today: '2024-03-10', dailyRequirement: 2000 };

describe('calculateWaterStats', () => {
  it('returns zeros when there are no records', () => {
    const stats = calculateWaterStats([], options);

    assert.equal(stats.currentStreak, 0);
    assert.equal(stats.bestStreak, 0);
    assert.equal(stats.weekAverage, 0);
    assert.equal(stats.completionRate, 0);
    assert.equal(stats.days.length, 30);
    assert.equal(stats.days.at(-1).date, '2024-03-10');
  });

  it('counts the streak up to yesterday while today is not finished', () => {
    const stats = calculateWaterStats(
      [
        { date: '2024-03-09', total: 2000 },
        { date: '2024-03-08', total: 2500 },
        { date: '2024-03-07', total: 1000 },
        { date: '2024-03-10', total: 300 },
      ],
      options,
    );

    assert.equal(stats.currentStreak, 2);
  });

  it('adds today to the streak once the goal is met', () => {
    const stats = calculateWaterStats(
      [
        { date: '2024-03-09', total: 2000 },
        { date: '2024-03-10', total: 2100 },
      ],
      options,
    );

    assert.equal(stats.currentStreak, 2);
  });

  it('breaks the streak after a missed day', () => {
    const stats = calculateWaterStats(
      [
        { date: '2024-03-08', total: 2000 },
        { date: '2024-03-06', total: 2000 },
      ],
      options,
    );

    assert.equal(stats.currentStreak, 0);
  });

  it('finds the best streak across month and year borders', () => {
    const stats = calculateWaterStats(
      [
        { date: '2023-12-30', total: 2000 },
        { date: '2023-12-31', total: 2000 },
        { date: '2024-01-01', total: 2000 },
        { date: '2024-01-03', total: 2000 },
        { date: '2024-02-28', total: 2000 },
        { date: '2024-02-29', total: 2000 },
      ],
      options,
    );

    assert.equal(stats.bestStreak, 3);
    assert.equal(stats.totalGoalDays, 6);
  });

  it('ignores days after today', () => {
    const stats = calculateWaterStats(
      [
        { date: '2024-03-11', total: 2000 },
        { date: '2024-03-12', total: 2000 },
      ],
      options,
    );

    assert.equal(stats.bestStreak, 0);
    assert.equal(stats.totalGoalDays, 0);
  });

  it('averages over the whole window, including empty days', () => {
    const stats = calculateWaterStats(
      [
        { date: '2024-03-10', total: 700 },
        { date: '2024-03-04', total: 1400 },
        { date: '2024-03-03', total: 9999 },
      ],
      options,
    );

    assert.equal(stats.weekAverage, 300);
    assert.equal(stats.monthAverage, Math.round((700 + 1400 + 9999) / 30));
  });

  it('counts the completion rate from the first recorded day', () => {
    const stats = calculateWaterStats(
      [
        { date: '2024-03-08', total: 2000 },
        { date: '2024-03-09', total: 500 },
      ],
      options,
    );

    // 8th, 9th and 10th are counted: one of three met the goal.
    assert.equal(stats.completionRate, 33);
  });
});

describe('all-time achievements data', () => {
  it('sums the water and counts early days up to today', () => {
    const stats = calculateWaterStats(
      [
        { date: '2024-03-01', total: 1500, early: true },
        { date: '2024-03-09', total: 2500, early: false },
        { date: '2024-03-10', total: 500, early: true },
        { date: '2024-03-11', total: 9000, early: true },
      ],
      options,
    );

    assert.equal(stats.totalMl, 4500);
    assert.equal(stats.earlyDays, 2);
  });

  it('counts only full Monday-Sunday weeks with the goal met', () => {
    // 2024-02-26 and 2024-03-04 are Mondays; today is Sunday 2024-03-10.
    const week = (monday) =>
      Array.from({ length: 7 }, (_, index) => ({
        date: `2024-${monday[0]}-${String(monday[1] + index).padStart(2, '0')}`,
        total: 2000,
      }));
    const stats = calculateWaterStats(
      [
        // 27 Feb to 4 Mar: 7 days in a row, but not Monday to Sunday.
        ...week(['02', 27]).slice(0, 3),
        { date: '2024-03-01', total: 2000 },
        { date: '2024-03-02', total: 2000 },
        { date: '2024-03-03', total: 2000 },
        ...week(['03', 4]),
      ],
      options,
    );

    assert.equal(stats.perfectWeeks, 1);
    assert.equal(stats.bestStreak, 13);
  });

  it('does not count the current week before Sunday is over', () => {
    const stats = calculateWaterStats(
      Array.from({ length: 6 }, (_, index) => ({
        date: `2024-03-0${4 + index}`,
        total: 2000,
      })),
      { today: '2024-03-09', dailyRequirement: 2000 },
    );

    assert.equal(stats.perfectWeeks, 0);
  });
});

describe('getMonthStart', () => {
  it('starts the window 29 days before today', () => {
    assert.equal(getMonthStart('2024-03-10'), '2024-02-10');
  });
});

describe('calculateTimeOfDay', () => {
  it('returns zeros when there are no records', () => {
    assert.deepEqual(calculateTimeOfDay([]), {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0,
    });
  });

  it('sums the hours into parts of the day at their edges', () => {
    const timeOfDay = calculateTimeOfDay([
      { hour: '04', total: 100 },
      { hour: '05', total: 200 },
      { hour: '11', total: 300 },
      { hour: '12', total: 400 },
      { hour: '16', total: 500 },
      { hour: '17', total: 600 },
      { hour: '21', total: 700 },
      { hour: '22', total: 800 },
      { hour: '00', total: 900 },
    ]);

    assert.deepEqual(timeOfDay, {
      morning: 500,
      afternoon: 900,
      evening: 1300,
      night: 1800,
    });
  });
});
