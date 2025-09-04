import * as e from '../../src/index.js';
import { runTestCases, TestCase } from '../testUtils.js';

const TEST_CASES: TestCase<any>[] = [
  {
    label: 'uint8',
    schema: e.uint8(),
    tests: [
      {
        decoded: 255,
        encoded: [0xff],
      },
    ],
  },
  {
    label: 'int8',
    schema: e.int8(),
    tests: [
      {
        decoded: -1,
        encoded: [0xff],
      },
    ],
  },
  {
    label: 'uint16 - default (BE)',
    schema: e.uint16(),
    tests: [
      {
        decoded: 61681,
        encoded: [0xf0, 0xf1],
      },
    ],
  },
  {
    label: 'int16 - default (BE)',
    schema: e.int16(),
    tests: [
      {
        decoded: -3855,
        encoded: [0xf0, 0xf1],
      },
    ],
  },
  {
    label: 'uint16 (BE)',
    schema: e.uint16().bigEndian(),
    tests: [
      {
        decoded: 61681,
        encoded: [0xf0, 0xf1],
      },
    ],
  },
  {
    label: 'int16 (BE)',
    schema: e.int16().bigEndian(),
    tests: [
      {
        decoded: -3855,
        encoded: [0xf0, 0xf1],
      },
    ],
  },
  {
    label: 'uint16 (LE)',
    schema: e.uint16().littleEndian(),
    tests: [
      {
        decoded: 61681,
        encoded: [0xf1, 0xf0],
      },
    ],
  },
  {
    label: 'int16 (LE)',
    schema: e.int16().littleEndian(),
    tests: [
      {
        decoded: -3855,
        encoded: [0xf1, 0xf0],
      },
    ],
  },
  {
    label: 'uint32 - default (BE)',
    schema: e.uint32(),
    tests: [
      {
        decoded: 4042388211,
        encoded: [0xf0, 0xf1, 0xf2, 0xf3],
      },
    ],
  },
  {
    label: 'int32 - default (BE)',
    schema: e.int32(),
    tests: [
      {
        decoded: -252579085,
        encoded: [0xf0, 0xf1, 0xf2, 0xf3],
      },
    ],
  },
  {
    label: 'uint32 (BE)',
    schema: e.uint32().bigEndian(),
    tests: [
      {
        decoded: 4042388211,
        encoded: [0xf0, 0xf1, 0xf2, 0xf3],
      },
    ],
  },
  {
    label: 'int32 (BE)',
    schema: e.int32().bigEndian(),
    tests: [
      {
        decoded: -252579085,
        encoded: [0xf0, 0xf1, 0xf2, 0xf3],
      },
    ],
  },
  {
    label: 'uint32 (LE)',
    schema: e.uint32().littleEndian(),
    tests: [
      {
        decoded: 4042388211,
        encoded: [0xf3, 0xf2, 0xf1, 0xf0],
      },
    ],
  },
  {
    label: 'int32 (LE)',
    schema: e.int32().littleEndian(),
    tests: [
      {
        decoded: -252579085,
        encoded: [0xf3, 0xf2, 0xf1, 0xf0],
      },
    ],
  },
  {
    label: 'uint64 - default (BE)',
    schema: e.biguint64(),
    tests: [
      {
        decoded: 17361925168090707703n,
        encoded: [0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7],
      },
    ],
  },
  {
    label: 'int64 - default (BE)',
    schema: e.bigint64(),
    tests: [
      {
        decoded: -1084818905618843913n,
        encoded: [0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7],
      },
    ],
  },
  {
    label: 'uint64 (BE)',
    schema: e.biguint64().bigEndian(),
    tests: [
      {
        decoded: 17361925168090707703n,
        encoded: [0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7],
      },
    ],
  },
  {
    label: 'int64 (BE)',
    schema: e.bigint64().bigEndian(),
    tests: [
      {
        decoded: -1084818905618843913n,
        encoded: [0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7],
      },
    ],
  },
  {
    label: 'uint64 (LE)',
    schema: e.biguint64().littleEndian(),
    tests: [
      {
        decoded: 17361925168090707703n,
        encoded: [0xf7, 0xf6, 0xf5, 0xf4, 0xf3, 0xf2, 0xf1, 0xf0],
      },
    ],
  },
  {
    label: 'int64 (LE)',
    schema: e.bigint64().littleEndian(),
    tests: [
      {
        decoded: -1084818905618843913n,
        encoded: [0xf7, 0xf6, 0xf5, 0xf4, 0xf3, 0xf2, 0xf1, 0xf0],
      },
    ],
  },
  {
    label: 'float16 - default (BE)',
    schema: e.float16(),
    tests: [
      {
        decoded: -10120,
        encoded: [0xf0, 0xf1],
      },
    ],
  },
  {
    label: 'float16 (BE)',
    schema: e.float16().bigEndian(),
    tests: [
      {
        decoded: -10120,
        encoded: [0xf0, 0xf1],
      },
    ],
  },
  {
    label: 'float16 (LE)',
    schema: e.float16().littleEndian(),
    tests: [
      {
        decoded: -10120,
        encoded: [0xf1, 0xf0],
      },
    ],
  },
  {
    label: 'float32 - default (BE)',
    schema: e.float32(),
    tests: [
      {
        decoded: -5.990367596027699e29,
        encoded: [0xf0, 0xf1, 0xf2, 0xf3],
      },
    ],
  },
  {
    label: 'float32 (BE)',
    schema: e.float32().bigEndian(),
    tests: [
      {
        decoded: -5.990367596027699e29,
        encoded: [0xf0, 0xf1, 0xf2, 0xf3],
      },
    ],
  },
  {
    label: 'float32 (LE)',
    schema: e.float32().littleEndian(),
    tests: [
      {
        decoded: -5.990367596027699e29,
        encoded: [0xf3, 0xf2, 0xf1, 0xf0],
      },
    ],
  },
  {
    label: 'float64 - default (BE)',
    schema: e.float64(),
    tests: [
      {
        decoded: -1.1413996157316056e236,
        encoded: [0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7],
      },
    ],
  },
  {
    label: 'float64 (BE)',
    schema: e.float64().bigEndian(),
    tests: [
      {
        decoded: -1.1413996157316056e236,
        encoded: [0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7],
      },
    ],
  },
  {
    label: 'float64 (LE)',
    schema: e.float64().littleEndian(),
    tests: [
      {
        decoded: -1.1413996157316056e236,
        encoded: [0xf7, 0xf6, 0xf5, 0xf4, 0xf3, 0xf2, 0xf1, 0xf0],
      },
    ],
  },
];

describe('number', () => runTestCases(TEST_CASES));
