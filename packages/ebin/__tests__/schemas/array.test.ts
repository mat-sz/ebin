import * as e from '../../src/index.js';
import { runTestCases, TestCase } from '../testUtils.js';

const TEST_CASES: TestCase<any>[] = [
  {
    label: 'size from parent',
    schema: e.struct({
      test: e.uint16(),
      array: e.array(e.uint16()).size('test'),
    }),
    tests: [
      {
        decoded: { array: [1, 2, 3] },
        encoded: [0, 6, 0, 1, 0, 2, 0, 3],
      },
    ],
  },
  {
    label: 'size-prefiexd',
    schema: e.array(e.uint16()).size(e.uint16()),
    tests: [
      {
        decoded: [1, 2, 3],
        encoded: [0, 6, 0, 1, 0, 2, 0, 3],
      },
    ],
  },
  {
    label: 'count from parent',
    schema: e.struct({
      test: e.uint16(),
      array: e.array(e.uint16()).count('test'),
    }),
    tests: [
      {
        decoded: { array: [1, 2, 3] },
        encoded: [0, 3, 0, 1, 0, 2, 0, 3],
      },
    ],
  },
  {
    label: 'count-prefiexd',
    schema: e.array(e.uint16()).count(e.uint16()),
    tests: [
      {
        decoded: [1, 2, 3],
        encoded: [0, 3, 0, 1, 0, 2, 0, 3],
      },
    ],
  },
];

describe('array', () => runTestCases(TEST_CASES));
