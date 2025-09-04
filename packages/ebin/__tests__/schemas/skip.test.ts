import * as e from '../../src/index.js';
import { runTestCases, TestCase } from '../testUtils.js';

const TEST_CASES: TestCase<any>[] = [
  {
    label: 'constant size',
    schema: e.struct({
      test1: e.uint16(),
      test2: e.skip(4),
      test3: e.uint16(),
    }),
    tests: [
      { decoded: { test1: 1, test3: 1 }, encoded: [0, 1, 0, 0, 0, 0, 0, 1] },
    ],
  },
];

describe('skip', () => runTestCases(TEST_CASES));
