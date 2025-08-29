import * as e from '../../src/index.js';

const test8 = e.bits({ a: 2, b: 1, c: 1, d: 2, e: 2 });
const test16 = e.bits({ a: 2, b: 1, c: 1, d: 2, e: 2, f: 2 });
const testCrossTwo32 = e.bits({ a: 30, x: 4, c: 30 });
const testCrossThree32 = e.bits({ a: 30, b: 36, c: 30 });

describe('bits', () => {
  describe('8 bit', () => {
    it('should parse correctly', () => {
      expect(test8.fromByteArray(new Uint8Array([0b11011100]))).toEqual({
        a: 0b11,
        b: 0b0,
        c: 0b1,
        d: 0b11,
        e: 0b00,
      });
    });

    it('should serialize correctly', () => {
      expect(
        test8.toByteArray({
          a: 0b11,
          b: 0b0,
          c: 0b1,
          d: 0b11,
          e: 0b00,
        }),
      ).toEqual(new Uint8Array([0b11011100]));
    });
  });

  describe('16 bit', () => {
    it('should parse correctly', () => {
      expect(
        test16.fromByteArray(new Uint8Array([0b11011100, 0b11000000])),
      ).toEqual({
        a: 0b11,
        b: 0b0,
        c: 0b1,
        d: 0b11,
        e: 0b00,
        f: 0b11,
      });
    });

    it('should serialize correctly', () => {
      expect(
        test16.toByteArray({
          a: 0b11,
          b: 0b0,
          c: 0b1,
          d: 0b11,
          e: 0b00,
          f: 0b11,
        }),
      ).toEqual(new Uint8Array([0b11011100, 0b11000000]));
    });
  });

  describe('across two 32bit uints', () => {
    it('should parse correctly', () => {
      expect(
        testCrossTwo32.fromByteArray(
          new Uint8Array([0xff, 0xff, 0xff, 0xfc, 0x3f, 0xff, 0xff, 0xff]),
        ),
      ).toEqual({
        a: 0x3fffffff,
        x: 0x0,
        c: 0x3fffffff,
      });
    });

    it('should serialize correctly', () => {
      expect(
        testCrossTwo32.toByteArray({
          a: 0x3fffffff,
          x: 0x0,
          c: 0x3fffffff,
        }),
      ).toEqual(
        new Uint8Array([0xff, 0xff, 0xff, 0xfc, 0x3f, 0xff, 0xff, 0xff]),
      );
    });
  });

  describe('across three 32bit uints', () => {
    it('should parse correctly', () => {
      expect(
        testCrossThree32.fromByteArray(
          new Uint8Array([
            0xff, 0xff, 0xff, 0xfc, 0x00, 0x00, 0x00, 0x00, 0x3f, 0xff, 0xff,
            0xff,
          ]),
        ),
      ).toEqual({
        a: 0x3fffffff,
        b: 0x0,
        c: 0x3fffffff,
      });
    });

    it('should serialize correctly', () => {
      expect(
        testCrossThree32.toByteArray({
          a: 0x3fffffff,
          b: 0x0,
          c: 0x3fffffff,
        }),
      ).toEqual(
        new Uint8Array([
          0xff, 0xff, 0xff, 0xfc, 0x00, 0x00, 0x00, 0x00, 0x3f, 0xff, 0xff,
          0xff,
        ]),
      );
    });
  });
});
