import * as e from '../../src/index.js';

describe('codec', () => {
  describe('timestamp', () => {
    const testTimestampCodec = e.codec(e.uint32(), {
      decode: int => new Date(int * 1000),
      encode: date => date.getTime() / 1000,
    });
    const testDate = new Date('2004-04-04T00:00:00.000Z');
    const testBytes = new Uint8Array([0x40, 0x6f, 0x50, 0x00]);

    it('should encode the date correctly', () => {
      expect(testTimestampCodec.toByteArray(testDate)).toEqual(testBytes);
    });

    it('should decode the date correctly', () => {
      expect(testTimestampCodec.fromByteArray(testBytes).getTime()).toEqual(
        testDate.getTime(),
      );
    });
  });

  describe('string', () => {
    const testStringCodec = e.codec(e.string().size(e.uint16()), {
      decode: str => JSON.parse(str),
      encode: json => JSON.stringify(json),
    });
    const testJson = {};
    const testBytes = new Uint8Array([0x00, 0x02, 0x7b, 0x7d]);

    it('should encode the date correctly', () => {
      expect(testStringCodec.toByteArray(testJson)).toEqual(testBytes);
    });

    it('should decode the date correctly', () => {
      expect(testStringCodec.fromByteArray(testBytes)).toEqual(testJson);
    });
  });
});
