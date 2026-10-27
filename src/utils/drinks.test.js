import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { calculateHydration, DRINK_TYPES } from './drinks.js';

describe('calculateHydration', () => {
  it('counts water in full and other drinks by their share', () => {
    assert.equal(calculateHydration(250, 'water'), 250);
    assert.equal(calculateHydration(250, 'coffee'), 200);
    assert.equal(calculateHydration(330, 'soda'), 231);
  });

  it('treats a missing type as water', () => {
    assert.equal(calculateHydration(300), 300);
  });

  it('rounds to whole ml', () => {
    assert.equal(calculateHydration(155, 'tea'), 140);
  });

  it('lists the types', () => {
    assert.deepEqual(DRINK_TYPES, [
      'water',
      'tea',
      'milk',
      'coffee',
      'juice',
      'soda',
    ]);
  });
});
