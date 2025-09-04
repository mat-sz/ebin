import * as e from '../../src/index.js';
import { runTestCases, TestCase } from '../testUtils.js';

const TEST_CASES: TestCase<any>[] = [
  {
    label: 'size field from parent',
    schema: e.struct({
      length: e.uint16(),
      data: e.string().size('length'),
    }),
    tests: [
      {
        decoded: { data: 'TEST' },
        encoded: [0x00, 0x04, 0x54, 0x45, 0x53, 0x54],
      },
    ],
  },
  {
    label: 'size-prefixed',
    schema: e.string().size(e.uint16()),
    tests: [{ decoded: 'TEST', encoded: [0x00, 0x04, 0x54, 0x45, 0x53, 0x54] }],
  },
];

describe('string', () => runTestCases(TEST_CASES));
