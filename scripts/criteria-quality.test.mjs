import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criteriaQualityErrors } from './criteria-quality.mjs';

test('rejects a TEST2-38-style hidden side-effect check', () => {
  assert.match(criteriaQualityErrors('- [ ] During this flow, verify that no audit data is created or modified.')[0], /unobservable data-change/);
  assert.equal(criteriaQualityErrors('- [ ] Do not create or modify audit data during this test.').length, 1);
});

test('allows visible negative assertions and normal browser criteria', () => {
  assert.deepEqual(criteriaQualityErrors('- [ ] The empty-results table shows no records.\n- [ ] Opening GIS displays a map.'), []);
});
