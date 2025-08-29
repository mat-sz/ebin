import * as e from '../../src/index.js';

describe('string', () => {
  describe('size field from parent', () => {
    const testStruct = e.struct({
      length: e.uint16(),
      data: e.string().size('length'),
    });

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
        length: 4,
      });
    });
  });

  describe('size-prefixed', () => {
    const testStruct = e.string().size(e.uint16());

    it('should serialize correctly', () => {
      expect(testStruct.toByteArray('TEST')).toEqual(
        new Uint8Array([0x00, 0x04, 0x54, 0x45, 0x53, 0x54]),
      );
    });

    it('should parse correctly', () => {
      expect(
        testStruct.fromByteArray(
          new Uint8Array([0x00, 0x04, 0x54, 0x45, 0x53, 0x54]),
        ),
      ).toEqual('TEST');
    });
  });
});
