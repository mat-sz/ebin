import { bit, struct } from '../../src/index.js';

const testStruct = struct({
  v1: bit(),
  v2: bit(),
  v3: bit(),
  v4: bit(),
  v5: bit(),
  v6: bit(),
  v7: bit(),
  v8: bit(),
});

describe('bit', () => {
  it('should serialize correctly', () => {
    expect(
      testStruct.toByteArray({
        v1: 0,
        v2: 1,
        v3: 0,
        v4: 1,
        v5: 0,
        v6: 1,
        v7: 0,
        v8: 1,
      }),
    ).toEqual(new Uint8Array([0b01010101]));
  });

  it('should parse correctly', () => {
    expect(testStruct.fromByteArray(new Uint8Array([0b01010101]))).toEqual({
      v1: 0,
      v2: 1,
      v3: 0,
      v4: 1,
      v5: 0,
      v6: 1,
      v7: 0,
      v8: 1,
    });
  });
});
