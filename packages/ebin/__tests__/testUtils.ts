import { AnySchema } from '../src/core/any.js';

export interface TestCase<T> {
  label: string;
  schema: AnySchema<T>;
  tests: {
    decoded: T | (() => T);
    encoded: number[];
  }[];
}

function getValue(value: any | (() => any)) {
  if (typeof value === 'function') {
    return value();
  }

  return value;
}

export function runTestCases(testCases: TestCase<any>[]) {
  for (const testCase of testCases) {
    describe(testCase.label, () => {
      it('should serialize correctly', () => {
        for (const testData of testCase.tests) {
          expect(
            testCase.schema.toByteArray(getValue(testData.decoded)),
          ).toMatchObject(new Uint8Array(testData.encoded));
        }
      });

      it('should parse correctly', () => {
        for (const testData of testCase.tests) {
          expect(
            testCase.schema.fromByteArray(new Uint8Array(testData.encoded)),
          ).toMatchObject(getValue(testData.decoded));
        }
      });
    });
  }
}
