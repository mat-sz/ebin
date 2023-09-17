import { ArrayBufferWriter } from '../../../src/io/arrayBuffer/writer';

describe('ArrayBufferWriter', () => {
  describe('float16', () => {
    it('should write float16 correctly', () => {
      const array = new Uint8Array([0x00, 0x00]);
      const writer = new ArrayBufferWriter(array.buffer);

      writer.writeFloat(2, 1);
      expect(array).toEqual(new Uint8Array([0x3c, 0x00]));

      writer.offset = 0;
      writer.writeFloat(2, -2);
      expect(array).toEqual(new Uint8Array([0xc0, 0x00]));

      // Max half precision
      writer.offset = 0;
      writer.writeFloat(2, 65504);
      expect(array).toEqual(new Uint8Array([0x7b, 0xff]));

      // Minimum positive normal
      writer.offset = 0;
      writer.writeFloat(2, Math.pow(2, -14));
      expect(array).toEqual(new Uint8Array([0x04, 0x00]));

      // Minimum strictly positive subnormal
      writer.offset = 0;
      writer.writeFloat(2, Math.pow(2, -24));
      expect(array).toEqual(new Uint8Array([0x00, 0x01]));

      writer.offset = 0;
      writer.writeFloat(2, 0);
      expect(array).toEqual(new Uint8Array([0x00, 0x00]));

      writer.offset = 0;
      writer.writeFloat(2, -0);
      expect(array).toEqual(new Uint8Array([0x80, 0x00]));

      writer.offset = 0;
      writer.writeFloat(2, Infinity);
      expect(array).toEqual(new Uint8Array([0x7c, 0x00]));

      writer.offset = 0;
      writer.writeFloat(2, -Infinity);
      expect(array).toEqual(new Uint8Array([0xfc, 0x00]));

      writer.offset = 0;
      writer.writeFloat(2, 1 / 3);
      expect(array).toEqual(new Uint8Array([0x35, 0x55]));

      writer.offset = 0;
      writer.writeFloat(2, NaN);
      expect(array).toEqual(new Uint8Array([0x7c, 0x01]));
    });
  });
});
