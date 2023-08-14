import { struct, uint16, uint32 } from '../src';

const testStruct = struct({
  test1: uint16(),
  test2: uint16(),
  test3: uint32(),
});

describe('struct', () => {
  it('should serialize binary data', () => {
    expect(testStruct.serialize({ test1: 1, test2: 1, test3: 1 })).toEqual(
      new Uint8Array([0, 1, 0, 1, 0, 0, 0, 1]),
    );
  });

  it('should parse binary data', () => {
    expect(testStruct.parse(new Uint8Array([0, 1, 0, 1, 0, 0, 0, 1]))).toEqual({
      test1: 1,
      test2: 1,
      test3: 1,
    });
  });
});
