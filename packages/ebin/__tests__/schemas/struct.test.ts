import * as e from '../../src/index.js';

const testStruct = e.struct({
  test1: e.uint16(),
  test2: e.uint16(),
  test3: e.uint32(),
});

describe('struct', () => {
  it('should serialize binary data', () => {
    expect(testStruct.toByteArray({ test1: 1, test2: 1, test3: 1 })).toEqual(
      new Uint8Array([0, 1, 0, 1, 0, 0, 0, 1]),
    );
  });

  it('should parse binary data', () => {
    expect(
      testStruct.fromByteArray(new Uint8Array([0, 1, 0, 1, 0, 0, 0, 1])),
    ).toEqual({
      test1: 1,
      test2: 1,
      test3: 1,
    });
  });
});
