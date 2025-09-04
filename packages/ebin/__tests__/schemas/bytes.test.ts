import * as e from '../../src/index.js';
import { runTestCases, TestCase } from '../testUtils.js';

const TEST_CASES: TestCase<any>[] = [
  {
    label: 'size field from parent',
    schema: e.struct({
      length: e.uint16(),
      data: e.arrayBuffer().size('length'),
    }),
    tests: [
      {
        decoded: { data: new Uint8Array([0xff, 0xee, 0xdd, 0xcc]).buffer },
        encoded: [0x00, 0x04, 0xff, 0xee, 0xdd, 0xcc],
      },
    ],
  },
  {
    label: 'size-prefixed',
    schema: e.arrayBuffer().size(e.uint16()),
    tests: [
      {
        decoded: new Uint8Array([0xff, 0xee, 0xdd, 0xcc]).buffer,
        encoded: [0x00, 0x04, 0xff, 0xee, 0xdd, 0xcc],
      },
    ],
  },
  {
    label: 'fixed size',
    schema: e.arrayBuffer().size(4),
    tests: [
      {
        decoded: new Uint8Array([0xff, 0xee, 0xdd, 0xcc]).buffer,
        encoded: [0xff, 0xee, 0xdd, 0xcc],
      },
    ],
  },
  {
    label: 'greedy',
    schema: e.arrayBuffer(),
    tests: [
      {
        decoded: new Uint8Array([0xff, 0xee, 0xdd, 0xcc]).buffer,
        encoded: [0xff, 0xee, 0xdd, 0xcc],
      },
    ],
  },
];

describe('arrayBuffer', () => runTestCases(TEST_CASES));
