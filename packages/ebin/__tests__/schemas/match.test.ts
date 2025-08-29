import * as e from '../../src/index.js';

const testMatch = e.struct({
  type: e.uint16(),
  value: e.match('type', {
    0: e.string().size(e.uint16()),
    1: e.uint32(),
  }),
});

describe('match', () => {
  describe('toByteArray', () => {
    it('should serialize binary data', () => {
      expect(testMatch.toByteArray({ type: 0, value: 'TEST' })).toEqual(
        new Uint8Array([0x00, 0x00, 0x00, 0x04, 0x54, 0x45, 0x53, 0x54]),
      );
      expect(testMatch.toByteArray({ type: 1, value: 0xaa })).toEqual(
        new Uint8Array([0x00, 0x01, 0x00, 0x00, 0x00, 0xaa]),
      );
    });

    it('should parse binary data', () => {
      expect(
        testMatch.fromByteArray(
          new Uint8Array([0x00, 0x00, 0x00, 0x04, 0x54, 0x45, 0x53, 0x54]),
        ),
      ).toEqual({
        type: 0,
        value: 'TEST',
      });
      expect(
        testMatch.fromByteArray(
          new Uint8Array([0x00, 0x01, 0x00, 0x00, 0x00, 0xaa]),
        ),
      ).toEqual({
        type: 1,
        value: 0xaa,
      });
    });
  });
});
