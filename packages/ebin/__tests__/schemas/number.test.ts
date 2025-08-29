import { AnySchema } from '../../src/core/any.js';
import * as e from '../../src/index.js';

const TEST_CASES: {
  name: string;
  type: AnySchema<any>;
  value: number | bigint;
  bytes: number[];
}[] = [
  { name: 'uint8', type: e.uint8(), value: 255, bytes: [0xff] },
  { name: 'int8', type: e.int8(), value: -1, bytes: [0xff] },
  {
    name: 'uint16 - default (BE)',
    type: e.uint16(),
    value: 61681,
    bytes: [0xf0, 0xf1],
  },
  {
    name: 'int16 - default (BE)',
    type: e.int16(),
    value: -3855,
    bytes: [0xf0, 0xf1],
  },
  {
    name: 'uint16 (BE)',
    type: e.uint16().bigEndian(),
    value: 61681,
    bytes: [0xf0, 0xf1],
  },
  {
    name: 'int16 (BE)',
    type: e.int16().bigEndian(),
    value: -3855,
    bytes: [0xf0, 0xf1],
  },
  {
    name: 'uint16 (LE)',
    type: e.uint16().littleEndian(),
    value: 61681,
    bytes: [0xf1, 0xf0],
  },
  {
    name: 'int16 (LE)',
    type: e.int16().littleEndian(),
    value: -3855,
    bytes: [0xf1, 0xf0],
  },
  {
    name: 'uint32 - default (BE)',
    type: e.uint32(),
    value: 4042388211,
    bytes: [0xf0, 0xf1, 0xf2, 0xf3],
  },
  {
    name: 'int32 - default (BE)',
    type: e.int32(),
    value: -252579085,
    bytes: [0xf0, 0xf1, 0xf2, 0xf3],
  },
  {
    name: 'uint32 (BE)',
    type: e.uint32().bigEndian(),
    value: 4042388211,
    bytes: [0xf0, 0xf1, 0xf2, 0xf3],
  },
  {
    name: 'int32 (BE)',
    type: e.int32().bigEndian(),
    value: -252579085,
    bytes: [0xf0, 0xf1, 0xf2, 0xf3],
  },
  {
    name: 'uint32 (LE)',
    type: e.uint32().littleEndian(),
    value: 4042388211,
    bytes: [0xf3, 0xf2, 0xf1, 0xf0],
  },
  {
    name: 'int32 (LE)',
    type: e.int32().littleEndian(),
    value: -252579085,
    bytes: [0xf3, 0xf2, 0xf1, 0xf0],
  },
  {
    name: 'uint64 - default (BE)',
    type: e.biguint64(),
    value: 17361925168090707703n,
    bytes: [0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7],
  },
  {
    name: 'int64 - default (BE)',
    type: e.bigint64(),
    value: -1084818905618843913n,
    bytes: [0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7],
  },
  {
    name: 'uint64 (BE)',
    type: e.biguint64().bigEndian(),
    value: 17361925168090707703n,
    bytes: [0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7],
  },
  {
    name: 'int64 (BE)',
    type: e.bigint64().bigEndian(),
    value: -1084818905618843913n,
    bytes: [0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7],
  },
  {
    name: 'uint64 (LE)',
    type: e.biguint64().littleEndian(),
    value: 17361925168090707703n,
    bytes: [0xf7, 0xf6, 0xf5, 0xf4, 0xf3, 0xf2, 0xf1, 0xf0],
  },
  {
    name: 'int64 (LE)',
    type: e.bigint64().littleEndian(),
    value: -1084818905618843913n,
    bytes: [0xf7, 0xf6, 0xf5, 0xf4, 0xf3, 0xf2, 0xf1, 0xf0],
  },
  {
    name: 'float16 - default (BE)',
    type: e.float16(),
    value: -10120,
    bytes: [0xf0, 0xf1],
  },
  {
    name: 'float16 (BE)',
    type: e.float16().bigEndian(),
    value: -10120,
    bytes: [0xf0, 0xf1],
  },
  {
    name: 'float16 (LE)',
    type: e.float16().littleEndian(),
    value: -10120,
    bytes: [0xf1, 0xf0],
  },
  {
    name: 'float32 - default (BE)',
    type: e.float32(),
    value: -5.990367596027699e29,
    bytes: [0xf0, 0xf1, 0xf2, 0xf3],
  },
  {
    name: 'float32 (BE)',
    type: e.float32().bigEndian(),
    value: -5.990367596027699e29,
    bytes: [0xf0, 0xf1, 0xf2, 0xf3],
  },
  {
    name: 'float32 (LE)',
    type: e.float32().littleEndian(),
    value: -5.990367596027699e29,
    bytes: [0xf3, 0xf2, 0xf1, 0xf0],
  },
  {
    name: 'float64 - default (BE)',
    type: e.float64(),
    value: -1.1413996157316056e236,
    bytes: [0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7],
  },
  {
    name: 'float64 (BE)',
    type: e.float64().bigEndian(),
    value: -1.1413996157316056e236,
    bytes: [0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7],
  },
  {
    name: 'float64 (LE)',
    type: e.float64().littleEndian(),
    value: -1.1413996157316056e236,
    bytes: [0xf7, 0xf6, 0xf5, 0xf4, 0xf3, 0xf2, 0xf1, 0xf0],
  },
];

for (const testCase of TEST_CASES) {
  describe(testCase.name, () => {
    it('should serialize correctly', () => {
      expect(testCase.type.toByteArray(testCase.value)).toEqual(
        new Uint8Array(testCase.bytes),
      );
    });

    it('should parse correctly', () => {
      expect(
        testCase.type.fromByteArray(new Uint8Array(testCase.bytes)),
      ).toEqual(testCase.value);
    });
  });
}
