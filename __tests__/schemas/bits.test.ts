import { bits, struct } from '../../src/index.js';

const testStruct = struct({
  v1: bits(1),
  v2: bits(1),
  v3: bits(4),
  v4: bits(2),
});

describe('bit', () => {
  it('should serialize correctly', () => {
    expect(
      testStruct.toByteArray({
        v1: 0,
        v2: 1,
        v3: 0b0101,
        v4: 0b11,
      }),
    ).toEqual(new Uint8Array([0b01010111]));
  });

  it('should parse correctly', () => {
    expect(testStruct.fromByteArray(new Uint8Array([0b01010111]))).toEqual({
      v1: 0,
      v2: 1,
      v3: 0b0101,
      v4: 0b11,
    });
  });
});
