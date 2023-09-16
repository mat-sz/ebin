import { struct, uint16, uint32, string, array } from '../src';

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
}).withByteLength('str', 'test');

describe('withByteLength', () => {
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

const testStructSwitch = struct({
  test: uint16(),
}).switch('test', {
  0x01: struct({
    hello: uint16(),
  }),
  0x02: struct({
    world: uint32(),
  }),
});

describe('switch', () => {
  it('should serialize binary data', () => {
    expect(testStructSwitch.toByteArray({ test: 1, hello: 2 })).toEqual(
      new Uint8Array([0x00, 0x01, 0x00, 0x02]),
    );
    expect(testStructSwitch.toByteArray({ test: 2, world: 1 })).toEqual(
      new Uint8Array([0x00, 0x02, 0x00, 0x00, 0x00, 0x01]),
    );
  });

  it('should parse binary data', () => {
    expect(
      testStructSwitch.fromByteArray(new Uint8Array([0x00, 0x01, 0x00, 0x02])),
    ).toEqual({
      test: 1,
      hello: 2,
    });
    expect(
      testStructSwitch.fromByteArray(
        new Uint8Array([0x00, 0x02, 0x00, 0x00, 0x00, 0x01]),
      ),
    ).toEqual({
      test: 2,
      world: 1,
    });
  });
});

const testStructArray = struct({
  test: uint16(),
  array: array(uint16()),
}).withByteLength('array', 'test');

describe('array', () => {
  it('should serialize binary data', () => {
    expect(testStructArray.toByteArray({ array: [1, 2, 3] })).toEqual(
      new Uint8Array([0, 6, 0, 1, 0, 2, 0, 3]),
    );
  });

  it('should parse binary data', () => {
    expect(
      testStructArray.fromByteArray(new Uint8Array([0, 6, 0, 1, 0, 2, 0, 3])),
    ).toEqual({
      array: [1, 2, 3],
    });
  });
});
