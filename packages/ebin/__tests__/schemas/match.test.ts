import * as e from '../../src/index.js';
import { runTestCases, TestCase } from '../testUtils.js';

const TEST_CASES: TestCase<any>[] = [
  {
    label: 'from parent',
    schema: e.struct({
      type: e.uint16(),
      value: e.match('type', {
        0: e.string().size(e.uint16()),
        1: e.uint32(),
      }),
    }),
    tests: [
      {
        decoded: { type: 0, value: 'TEST' },
        encoded: [0x00, 0x00, 0x00, 0x04, 0x54, 0x45, 0x53, 0x54],
      },
      {
        decoded: { type: 1, value: 0xaa },
        encoded: [0x00, 0x01, 0x00, 0x00, 0x00, 0xaa],
      },
    ],
  },
];

describe('match', () => runTestCases(TEST_CASES));
