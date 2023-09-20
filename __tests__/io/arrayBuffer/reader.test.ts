import { ArrayBufferReader } from '../../../src/io/arrayBuffer/reader.js';

describe('ArrayBufferReader', () => {
  describe('float16', () => {
    it('should read float16 correctly', () => {
      expect(
        new ArrayBufferReader(new Uint8Array([0x3c, 0x00]).buffer).readFloat(2),
      ).toEqual(1);

      expect(
        new ArrayBufferReader(new Uint8Array([0xc0, 0x00]).buffer).readFloat(2),
      ).toEqual(-2);

      // Max half precision
      expect(
        new ArrayBufferReader(new Uint8Array([0x7b, 0xff]).buffer).readFloat(2),
      ).toEqual(65504);

      // Minimum positive normal
      expect(
        new ArrayBufferReader(new Uint8Array([0x04, 0x00]).buffer).readFloat(2),
      ).toEqual(Math.pow(2, -14));

      // Minimum strictly positive subnormal
      expect(
        new ArrayBufferReader(new Uint8Array([0x00, 0x01]).buffer).readFloat(2),
      ).toEqual(Math.pow(2, -24));

      expect(
        new ArrayBufferReader(new Uint8Array([0x00, 0x00]).buffer).readFloat(2),
      ).toEqual(0);

      expect(
        new ArrayBufferReader(new Uint8Array([0x80, 0x00]).buffer).readFloat(2),
      ).toEqual(-0);

      expect(
        new ArrayBufferReader(new Uint8Array([0x7c, 0x00]).buffer).readFloat(2),
      ).toEqual(Infinity);

      expect(
        new ArrayBufferReader(new Uint8Array([0xfc, 0x00]).buffer).readFloat(2),
      ).toEqual(-Infinity);

      expect(
        new ArrayBufferReader(new Uint8Array([0x35, 0x55]).buffer).readFloat(2),
      ).toBeCloseTo(1 / 3);

      expect(
        new ArrayBufferReader(new Uint8Array([0x7c, 0x01]).buffer).readFloat(2),
      ).toEqual(NaN);
    });
  });
});
