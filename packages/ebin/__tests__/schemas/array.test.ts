import * as e from '../../src/index.js';

const testArraySize = e.struct({
  test: e.uint16(),
  array: e.array(e.uint16()).size('test'),
});

const testArrayCount = e.struct({
  test: e.uint16(),
  array: e.array(e.uint16()).count('test'),
});

describe('array', () => {
  describe('with size', () => {
    it('should serialize binary data', () => {
      expect(testArraySize.toByteArray({ array: [1, 2, 3] })).toEqual(
        new Uint8Array([0, 6, 0, 1, 0, 2, 0, 3]),
      );
    });

    it('should parse binary data', () => {
      expect(
        testArraySize.fromByteArray(new Uint8Array([0, 6, 0, 1, 0, 2, 0, 3])),
      ).toEqual({
        array: [1, 2, 3],
        test: 6,
      });
    });
  });

  describe('with count', () => {
    it('should serialize binary data', () => {
      expect(testArrayCount.toByteArray({ array: [1, 2, 3] })).toEqual(
        new Uint8Array([0, 3, 0, 1, 0, 2, 0, 3]),
      );
    });

    it('should parse binary data', () => {
      expect(
        testArrayCount.fromByteArray(new Uint8Array([0, 3, 0, 1, 0, 2, 0, 3])),
      ).toEqual({
        array: [1, 2, 3],
        test: 3,
      });
    });
  });
});
