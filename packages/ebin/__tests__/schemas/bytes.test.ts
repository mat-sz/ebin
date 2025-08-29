import * as e from '../../src/index.js';

describe('arrayBuffer', () => {
  describe('size field from parent', () => {
    const testStruct = e.struct({
      length: e.uint16(),
      data: e.arrayBuffer().size('length'),
    });

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

  describe('size-prefixed', () => {
    const testStruct = e.arrayBuffer().size(e.uint16());

    it('should serialize correctly', () => {
      expect(
        testStruct.toByteArray(new Uint8Array([0xff, 0xee, 0xdd, 0xcc]).buffer),
      ).toEqual(new Uint8Array([0x00, 0x04, 0xff, 0xee, 0xdd, 0xcc]));
    });

    it('should parse correctly', () => {
      expect(
        testStruct.fromByteArray(
          new Uint8Array([0x00, 0x04, 0xff, 0xee, 0xdd, 0xcc]),
        ),
      ).toEqual(new Uint8Array([0xff, 0xee, 0xdd, 0xcc]).buffer);
    });
  });

  describe('fixed size', () => {
    const testStruct = e.arrayBuffer().size(4);

    it('should serialize correctly', () => {
      expect(
        testStruct.toByteArray(new Uint8Array([0xff, 0xee, 0xdd, 0xcc]).buffer),
      ).toEqual(new Uint8Array([0xff, 0xee, 0xdd, 0xcc]));
    });

    it('should parse correctly', () => {
      expect(
        testStruct.fromByteArray(new Uint8Array([0xff, 0xee, 0xdd, 0xcc])),
      ).toEqual(new Uint8Array([0xff, 0xee, 0xdd, 0xcc]).buffer);
    });
  });
});
