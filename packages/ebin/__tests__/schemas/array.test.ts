import * as e from '../../src/index.js';

describe('array', () => {
  describe('with size', () => {
    const testArraySize = e.struct({
      test: e.uint16(),
      array: e.array(e.uint16()).size('test'),
    });

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
    const testArrayCount = e.struct({
      test: e.uint16(),
      array: e.array(e.uint16()).count('test'),
    });

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

  describe('with size prefix', () => {
    const testArraySizePrefix = e.struct({
      array: e.array(e.uint16()).size(e.uint16()),
    });

    it('should serialize binary data', () => {
      expect(testArraySizePrefix.toByteArray({ array: [1, 2, 3] })).toEqual(
        new Uint8Array([0, 6, 0, 1, 0, 2, 0, 3]),
      );
    });

    it('should parse binary data', () => {
      expect(
        testArraySizePrefix.fromByteArray(
          new Uint8Array([0, 6, 0, 1, 0, 2, 0, 3]),
        ),
      ).toEqual({
        array: [1, 2, 3],
      });
    });
  });

  describe('with count prefix', () => {
    const testArrayCountPrefix = e.struct({
      array: e.array(e.uint16()).count(e.uint16()),
    });

    it('should serialize binary data', () => {
      expect(testArrayCountPrefix.toByteArray({ array: [1, 2, 3] })).toEqual(
        new Uint8Array([0, 3, 0, 1, 0, 2, 0, 3]),
      );
    });

    it('should parse binary data', () => {
      expect(
        testArrayCountPrefix.fromByteArray(
          new Uint8Array([0, 3, 0, 1, 0, 2, 0, 3]),
        ),
      ).toEqual({
        array: [1, 2, 3],
      });
    });
  });

  describe('with count prefix (little endian)', () => {
    const testArrayLittleEndian = e.struct({
      array: e.array(e.uint16()).count(e.uint16()).littleEndian(),
    });

    it('should serialize binary data', () => {
      expect(testArrayLittleEndian.toByteArray({ array: [1, 2, 3] })).toEqual(
        new Uint8Array([3, 0, 1, 0, 2, 0, 3, 0]),
      );
    });

    it('should parse binary data', () => {
      expect(
        testArrayLittleEndian.fromByteArray(
          new Uint8Array([3, 0, 1, 0, 2, 0, 3, 0]),
        ),
      ).toEqual({
        array: [1, 2, 3],
      });
    });
  });

  describe('greedy', () => {
    const testArrayGreedy = e.struct({
      array: e.array(e.uint16()),
    });

    it('should serialize binary data', () => {
      expect(testArrayGreedy.toByteArray({ array: [1, 2, 3] })).toEqual(
        new Uint8Array([0, 1, 0, 2, 0, 3]),
      );
    });

    it('should parse binary data', () => {
      expect(
        testArrayGreedy.fromByteArray(new Uint8Array([0, 1, 0, 2, 0, 3])),
      ).toEqual({
        array: [1, 2, 3],
      });
    });
  });
});
