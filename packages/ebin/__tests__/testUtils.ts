import { AnySchema } from '../src/core/any.js';

export interface TestCase<T> {
  label: string;
  schema: AnySchema<T>;
  tests: {
    decoded: T;
    encoded: number[];
  }[];
}

export function runTestCases(testCases: TestCase<any>[]) {
  for (const testCase of testCases) {
    describe(testCase.label, () => {
      it('should serialize correctly', () => {
        for (const testData of testCase.tests) {
          expect(testCase.schema.toByteArray(testData.decoded)).toEqual(
            new Uint8Array(testData.encoded),
          );
        }
      });

      it('should parse correctly', () => {
        for (const testData of testCase.tests) {
          expect(
            testCase.schema.fromByteArray(new Uint8Array(testData.encoded)),
          ).toEqual(testData.decoded);
        }
      });
    });
  }
}
