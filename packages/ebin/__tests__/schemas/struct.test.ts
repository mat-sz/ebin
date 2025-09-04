import * as e from '../../src/index.js';
import { runTestCases, TestCase } from '../testUtils.js';

const TEST_CASES: TestCase<any>[] = [
  {
    label: 'constant size',
    schema: e.struct({
      test1: e.uint16(),
      test2: e.uint16(),
      test3: e.uint32(),
    }),
    tests: [
      {
        decoded: { test1: 1, test2: 1, test3: 1 },
        encoded: [0, 1, 0, 1, 0, 0, 0, 1],
      },
    ],
  },
  {
    label: 'constant size (little endian)',
    schema: e
      .struct({
        test1: e.uint16(),
        test2: e.uint16(),
        test3: e.uint32(),
      })
      .littleEndian(),
    tests: [
      {
        decoded: { test1: 1, test2: 1, test3: 1 },
        encoded: [1, 0, 1, 0, 1, 0, 0, 0],
      },
    ],
  },
  {
    label: 'dynamic size',
    schema: e.struct({
      test1: e.uint16(),
      test2: e.uint16(),
      test3: e.array(e.uint16()).count(e.uint16()),
      test4: e.array(e.uint16()).count(e.uint16()),
    }),
    tests: [
      {
        decoded: { test1: 1, test2: 1, test3: [1, 1, 1], test4: [1, 1] },
        encoded: [0, 1, 0, 1, 0, 3, 0, 1, 0, 1, 0, 1, 0, 2, 0, 1, 0, 1],
      },
    ],
  },
];

describe('struct', () => runTestCases(TEST_CASES));
