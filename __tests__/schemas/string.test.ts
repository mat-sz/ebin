import { string, json, struct, uint16 } from '../../src/index.js';

describe('string', () => {
  const testStruct = struct({
    length: uint16(),
    data: string(),
  }).withByteLength('data', 'length');

  it('should serialize correctly', () => {
    expect(
      testStruct.toByteArray({
        data: 'TEST',
      }),
    ).toEqual(new Uint8Array([0x00, 0x04, 0x54, 0x45, 0x53, 0x54]));
  });

  it('should parse correctly', () => {
    expect(
      testStruct.fromByteArray(
        new Uint8Array([0x00, 0x04, 0x54, 0x45, 0x53, 0x54]),
      ),
    ).toEqual({
      data: 'TEST',
    });
  });
});

describe('json', () => {
  const testStruct = struct({
    length: uint16(),
    data: json(),
  }).withByteLength('data', 'length');

  it('should serialize correctly', () => {
    expect(
      testStruct.toByteArray({
        data: {},
      }),
    ).toEqual(new Uint8Array([0x00, 0x02, 0x7b, 0x7d]));
  });

  it('should parse correctly', () => {
    expect(
      testStruct.fromByteArray(new Uint8Array([0x00, 0x02, 0x7b, 0x7d])),
    ).toEqual({
      data: {},
    });
  });
});
