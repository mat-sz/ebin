import * as e from '../../src/index.js';
import { runTestCases, TestCase } from '../testUtils.js';

const TEST_CASES: TestCase<any>[] = [
  {
    label: 'array buffer',
    schema: e.pad(e.arrayBuffer().size(e.uint8()), 8),
    tests: [
      {
        decoded: new Uint8Array([0xff, 0xee, 0xdd, 0xcc]).buffer,
        encoded: [0x04, 0xff, 0xee, 0xdd, 0xcc, 0x00, 0x00, 0x00],
      },
    ],
  },
];

describe('pad', () => runTestCases(TEST_CASES));
