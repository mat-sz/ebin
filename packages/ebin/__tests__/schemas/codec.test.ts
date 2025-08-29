import * as e from '../../src/index.js';

const testTimestampCodec = e.codec(e.uint32(), {
  decode: int => new Date(int * 1000),
  encode: date => date.getTime() / 1000,
});
const testDate = new Date('2004-04-04T00:00:00.000Z');

describe('codec', () => {
  describe('timestamp', () => {
    it('should encode the date correctly', () => {
      expect(testTimestampCodec.toByteArray(testDate)).toEqual(
        new Uint8Array([0x40, 0x6f, 0x50, 0x00]),
      );
    });

    it('should decode the date correctly', () => {
      expect(
        testTimestampCodec
          .fromByteArray(new Uint8Array([0x40, 0x6f, 0x50, 0x00]))
          .getTime(),
      ).toEqual(testDate.getTime());
    });
  });
});
