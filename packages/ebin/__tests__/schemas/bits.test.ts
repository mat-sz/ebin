import * as e from '../../src/index.js';
import { runTestCases, TestCase } from '../testUtils.js';

const TEST_CASES: TestCase<any>[] = [
  {
    label: '8 bit',
    schema: e.bits({ a: 2, b: 1, c: 1, d: 2, e: 2 }),
    tests: [
      {
        decoded: {
          a: 0b11,
          b: 0b0,
          c: 0b1,
          d: 0b11,
          e: 0b00,
        },
        encoded: [0b11011100],
      },
    ],
  },
  {
    label: '16 bit',
    schema: e.bits({ a: 2, b: 1, c: 1, d: 2, e: 2, f: 2 }),
    tests: [
      {
        decoded: {
          a: 0b11,
          b: 0b0,
          c: 0b1,
          d: 0b11,
          e: 0b00,
          f: 0b11,
        },
        encoded: [0b11011100, 0b11000000],
      },
    ],
  },
  {
    label: 'across two 32bit uints',
    schema: e.bits({ a: 30, b: 4, c: 30 }),
    tests: [
      {
        decoded: {
          a: 0x3fffffff,
          b: 0x0,
          c: 0x3fffffff,
        },
        encoded: [0xff, 0xff, 0xff, 0xfc, 0x3f, 0xff, 0xff, 0xff],
      },
    ],
  },
  {
    label: 'across three 32bit uints',
    schema: e.bits({ a: 30, b: 36, c: 30 }),
    tests: [
      {
        decoded: {
          a: 0x3fffffff,
          b: 0x0,
          c: 0x3fffffff,
        },
        encoded: [
          0xff, 0xff, 0xff, 0xfc, 0x00, 0x00, 0x00, 0x00, 0x3f, 0xff, 0xff,
          0xff,
        ],
      },
    ],
  },
];

describe('bits', () => runTestCases(TEST_CASES));
