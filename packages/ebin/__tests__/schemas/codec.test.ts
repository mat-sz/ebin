import * as e from '../../src/index.js';
import { runTestCases, TestCase } from '../testUtils.js';

const TEST_CASES: TestCase<any>[] = [
  {
    label: 'timestamp',
    schema: e.codec(e.uint32(), {
      decode: int => new Date(int * 1000),
      encode: date => date.getTime() / 1000,
    }),
    tests: [
      {
        decoded: new Date('2004-04-04T00:00:00.000Z'),
        encoded: [0x40, 0x6f, 0x50, 0x00],
      },
    ],
  },
  {
    label: 'json',
    schema: e.codec(e.string().size(e.uint16()), {
      decode: str => JSON.parse(str),
      encode: json => JSON.stringify(json),
    }),
    tests: [
      {
        decoded: {},
        encoded: [0x00, 0x02, 0x7b, 0x7d],
      },
    ],
  },
];

describe('codec', () => runTestCases(TEST_CASES));
