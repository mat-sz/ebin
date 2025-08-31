import * as e from '../../src/index.js';

describe('pad', () => {
  describe('array buffer', () => {
    const testStruct = e.pad(e.arrayBuffer().size(e.uint8()), 8);

    it('should serialize correctly', () => {
      expect(
        testStruct.toByteArray(new Uint8Array([0xff, 0xee, 0xdd, 0xcc]).buffer),
      ).toEqual(
        new Uint8Array([0x04, 0xff, 0xee, 0xdd, 0xcc, 0x00, 0x00, 0x00]),
      );
    });

    it('should parse correctly', () => {
      expect(
        testStruct.fromByteArray(
          new Uint8Array([0x04, 0xff, 0xee, 0xdd, 0xcc, 0x00, 0x00, 0x00]),
        ),
      ).toEqual(new Uint8Array([0xff, 0xee, 0xdd, 0xcc]).buffer);
    });
  });
});
