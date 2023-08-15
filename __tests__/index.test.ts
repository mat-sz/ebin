import { struct, uint16, uint32, string } from '../src';

const testStruct = struct({
  test1: uint16(),
  test2: uint16(),
  test3: uint32(),
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

const testStructStr = struct({
  test: uint16(),
  str: string(),
}).withLength('str', 'test');

describe('withLength', () => {
  it('should serialize binary data', () => {
    expect(testStructStr.toByteArray({ str: 'abc' })).toEqual(
      new Uint8Array([0, 3, 97, 98, 99]),
    );
  });

  it('should parse binary data', () => {
    expect(
      testStructStr.fromByteArray(new Uint8Array([0, 3, 97, 98, 99])),
    ).toEqual({
      str: 'abc',
    });
  });
});
