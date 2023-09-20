import { char, struct } from '../../src/index.js';

const testStruct = struct({
  char: char(),
});

describe('char', () => {
  it('should serialize correctly', () => {
    expect(testStruct.toByteArray({ char: 'A' })).toEqual(
      new Uint8Array([0x41]),
    );
  });

  it('should parse correctly', () => {
    expect(testStruct.fromByteArray(new Uint8Array([0x41]))).toEqual({
      char: 'A',
    });
  });

  it('should throw on invalid values', () => {
    expect(() => testStruct.toByteArray({ char: '😀' })).toThrow();
  });
});
