import { arrayBuffer, struct, uint16, uint8Array } from '../../src/index.js';

describe('uint8Array', () => {
  const testStruct = struct({
    length: uint16(),
    data: uint8Array(),
  }).withByteLength('data', 'length');

  it('should serialize correctly', () => {
    expect(
      testStruct.toByteArray({
        data: new Uint8Array([0xff, 0xee, 0xdd, 0xcc]),
      }),
    ).toEqual(new Uint8Array([0x00, 0x04, 0xff, 0xee, 0xdd, 0xcc]));
  });

  it('should parse correctly', () => {
    expect(
      testStruct.fromByteArray(
        new Uint8Array([0x00, 0x04, 0xff, 0xee, 0xdd, 0xcc]),
      ),
    ).toEqual({
      data: new Uint8Array([0xff, 0xee, 0xdd, 0xcc]),
      length: 4,
    });
  });
});

describe('arrayBuffer', () => {
  const testStruct = struct({
    length: uint16(),
    data: arrayBuffer(),
  }).withByteLength('data', 'length');

  it('should serialize correctly', () => {
    expect(
      testStruct.toByteArray({
        data: new Uint8Array([0xff, 0xee, 0xdd, 0xcc]).buffer,
      }),
    ).toEqual(new Uint8Array([0x00, 0x04, 0xff, 0xee, 0xdd, 0xcc]));
  });

  it('should parse correctly', () => {
    expect(
      testStruct.fromByteArray(
        new Uint8Array([0x00, 0x04, 0xff, 0xee, 0xdd, 0xcc]),
      ),
    ).toEqual({
      data: new Uint8Array([0xff, 0xee, 0xdd, 0xcc]).buffer,
      length: 4,
    });
  });
});
