import * as e from '../../src/index.js';

const testStruct = e.struct({
  test1: e.uint16(),
  test2: e.uint16(),
  test3: e.uint32(),
});

const testStructLittleEndian = e
  .struct({
    test1: e.uint16(),
    test2: e.uint16(),
    test3: e.uint32(),
  })
  .littleEndian();

describe('struct', () => {
  describe('constant size', () => {
    it('should serialize binary data', () => {
      expect(testStruct.toByteArray({ test1: 1, test2: 1, test3: 1 })).toEqual(
        new Uint8Array([0, 1, 0, 1, 0, 0, 0, 1]),
      );
    });

    it('should parse binary data', () => {
      expect(
        testStruct.fromByteArray(new Uint8Array([0, 1, 0, 1, 0, 0, 0, 1])),
      ).toEqual({
        test1: 1,
        test2: 1,
        test3: 1,
      });
    });
  });

  describe('constant size (little endian)', () => {
    it('should serialize binary data', () => {
      expect(
        testStructLittleEndian.toByteArray({ test1: 1, test2: 1, test3: 1 }),
      ).toEqual(new Uint8Array([1, 0, 1, 0, 1, 0, 0, 0]));
    });

    it('should parse binary data', () => {
      expect(
        testStructLittleEndian.fromByteArray(
          new Uint8Array([1, 0, 1, 0, 1, 0, 0, 0]),
        ),
      ).toEqual({
        test1: 1,
        test2: 1,
        test3: 1,
      });
    });
  });
});
