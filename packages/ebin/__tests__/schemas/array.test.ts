import * as e from '../../src/index.js';
import { runTestCases, type TestCase } from '../testUtils.js';

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
        encoded: [0x00, 0x06, 0x00, 0x01, 0x00, 0x02, 0x00, 0x03],
      },
    ],
  },
  {
    label: 'size-prefixed',
    schema: e.array(e.uint16()).size(e.uint16()),
    tests: [
      {
        decoded: [1, 2, 3],
        encoded: [0x00, 0x06, 0x00, 0x01, 0x00, 0x02, 0x00, 0x03],
      },
    ],
  },
  {
    label: 'size-prefixed (little-endian array)',
    schema: e.array(e.uint16()).size(e.uint16()).littleEndian(),
    tests: [
      {
        decoded: [1, 2, 3],
        encoded: [0x06, 0x00, 0x01, 0x00, 0x02, 0x00, 0x03, 0x00],
      },
    ],
  },
  {
    label: 'size-prefixed (little-endian parent)',
    schema: e
      .struct({
        data: e.array(e.uint16()).size(e.uint16()),
      })
      .littleEndian(),
    tests: [
      {
        decoded: { data: [1, 2, 3] },
        encoded: [0x06, 0x00, 0x01, 0x00, 0x02, 0x00, 0x03, 0x00],
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
        encoded: [0x00, 0x03, 0x00, 0x01, 0x00, 0x02, 0x00, 0x03],
      },
    ],
  },
  {
    label: 'count-prefixed',
    schema: e.array(e.uint16()).count(e.uint16()),
    tests: [
      {
        decoded: [1, 2, 3],
        encoded: [0x00, 0x03, 0x00, 0x01, 0x00, 0x02, 0x00, 0x03],
      },
    ],
  },
  {
    label: 'count-prefixed (little-endian array)',
    schema: e.array(e.uint16()).count(e.uint16()).littleEndian(),
    tests: [
      {
        decoded: [1, 2, 3],
        encoded: [0x03, 0x00, 0x01, 0x00, 0x02, 0x00, 0x03, 0x00],
      },
    ],
  },
  {
    label: 'count-prefixed (little-endian parent)',
    schema: e
      .struct({
        data: e.array(e.uint16()).count(e.uint16()),
      })
      .littleEndian(),
    tests: [
      {
        decoded: { data: [1, 2, 3] },
        encoded: [0x03, 0x00, 0x01, 0x00, 0x02, 0x00, 0x03, 0x00],
      },
    ],
  },
];

describe('array', () => runTestCases(TEST_CASES));
