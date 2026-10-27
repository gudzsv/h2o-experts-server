import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { calculateWaterStats } from './waterStats.js';

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
