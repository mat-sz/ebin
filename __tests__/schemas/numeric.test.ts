import {
  struct,
  int8,
  uint8,
  int16,
  uint16,
  int32,
  uint32,
  int64,
  uint64,
  float16,
  float32,
  float64,
} from '../../src/index.js';

const TEST_CASES = [
  { name: 'uint8', type: uint8(), value: 255, bytes: [0xff] },
  { name: 'int8', type: int8(), value: -1, bytes: [0xff] },
  {
    name: 'uint16 - default (BE)',
    type: uint16(),
    value: 61681,
    bytes: [0xf0, 0xf1],
  },
  {
    name: 'int16 - default (BE)',
    type: int16(),
    value: -3855,
    bytes: [0xf0, 0xf1],
  },
  {
    name: 'uint16 (BE)',
    type: uint16().bigEndian(),
    value: 61681,
    bytes: [0xf0, 0xf1],
  },
  {
    name: 'int16 (BE)',
    type: int16().bigEndian(),
    value: -3855,
    bytes: [0xf0, 0xf1],
  },
  {
    name: 'uint16 (LE)',
    type: uint16().littleEndian(),
    value: 61681,
    bytes: [0xf1, 0xf0],
  },
  {
    name: 'int16 (LE)',
    type: int16().littleEndian(),
    value: -3855,
    bytes: [0xf1, 0xf0],
  },
  {
    name: 'uint32 - default (BE)',
    type: uint32(),
    value: 4042388211,
    bytes: [0xf0, 0xf1, 0xf2, 0xf3],
  },
  {
    name: 'int32 - default (BE)',
    type: int32(),
    value: -252579085,
    bytes: [0xf0, 0xf1, 0xf2, 0xf3],
  },
  {
    name: 'uint32 (BE)',
    type: uint32().bigEndian(),
    value: 4042388211,
    bytes: [0xf0, 0xf1, 0xf2, 0xf3],
  },
  {
    name: 'int32 (BE)',
    type: int32().bigEndian(),
    value: -252579085,
    bytes: [0xf0, 0xf1, 0xf2, 0xf3],
  },
  {
    name: 'uint32 (LE)',
    type: uint32().littleEndian(),
    value: 4042388211,
    bytes: [0xf3, 0xf2, 0xf1, 0xf0],
  },
  {
    name: 'int32 (LE)',
    type: int32().littleEndian(),
    value: -252579085,
    bytes: [0xf3, 0xf2, 0xf1, 0xf0],
  },
  {
    name: 'uint64 - default (BE)',
    type: uint64(),
    value: 17361925168090707703n,
    bytes: [0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7],
  },
  {
    name: 'int64 - default (BE)',
    type: int64(),
    value: -1084818905618843913n,
    bytes: [0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7],
  },
  {
    name: 'uint64 (BE)',
    type: uint64().bigEndian(),
    value: 17361925168090707703n,
    bytes: [0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7],
  },
  {
    name: 'int64 (BE)',
    type: int64().bigEndian(),
    value: -1084818905618843913n,
    bytes: [0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7],
  },
  {
    name: 'uint64 (LE)',
    type: uint64().littleEndian(),
    value: 17361925168090707703n,
    bytes: [0xf7, 0xf6, 0xf5, 0xf4, 0xf3, 0xf2, 0xf1, 0xf0],
  },
  {
    name: 'int64 (LE)',
    type: int64().littleEndian(),
    value: -1084818905618843913n,
    bytes: [0xf7, 0xf6, 0xf5, 0xf4, 0xf3, 0xf2, 0xf1, 0xf0],
  },
  {
    name: 'float16 - default (BE)',
    type: float16(),
    value: -10120,
    bytes: [0xf0, 0xf1],
  },
  {
    name: 'float16 (BE)',
    type: float16().bigEndian(),
    value: -10120,
    bytes: [0xf0, 0xf1],
  },
  {
    name: 'float16 (LE)',
    type: float16().littleEndian(),
    value: -10120,
    bytes: [0xf1, 0xf0],
  },
  {
    name: 'float32 - default (BE)',
    type: float32(),
    value: -5.990367596027699e29,
    bytes: [0xf0, 0xf1, 0xf2, 0xf3],
  },
  {
    name: 'float32 (BE)',
    type: float32().bigEndian(),
    value: -5.990367596027699e29,
    bytes: [0xf0, 0xf1, 0xf2, 0xf3],
  },
  {
    name: 'float32 (LE)',
    type: float32().littleEndian(),
    value: -5.990367596027699e29,
    bytes: [0xf3, 0xf2, 0xf1, 0xf0],
  },
  {
    name: 'float64 - default (BE)',
    type: float64(),
    value: -1.1413996157316056e236,
    bytes: [0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7],
  },
  {
    name: 'float64 (BE)',
    type: float64().bigEndian(),
    value: -1.1413996157316056e236,
    bytes: [0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7],
  },
  {
    name: 'float64 (LE)',
    type: float64().littleEndian(),
    value: -1.1413996157316056e236,
    bytes: [0xf7, 0xf6, 0xf5, 0xf4, 0xf3, 0xf2, 0xf1, 0xf0],
  },
];

for (const testCase of TEST_CASES) {
  describe(testCase.name, () => {
    it('should serialize correctly', () => {
      const schema = struct({
        val: testCase.type,
      });

      expect(schema.toByteArray({ val: testCase.value })).toEqual(
        new Uint8Array(testCase.bytes),
      );
    });

    it('should parse correctly', () => {
      const schema = struct({
        val: testCase.type,
      });

      expect(schema.fromByteArray(new Uint8Array(testCase.bytes))).toEqual({
        val: testCase.value,
      });
    });
  });
}
