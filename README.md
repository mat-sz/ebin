<h1 align="center">ebin</h1>

<p align="center">
<b>E</b>pic <b>bin</b>ary parser/serializer
</p>

<p align="center">
<img alt="workflow" src="https://img.shields.io/github/actions/workflow/status/mat-sz/ebin/node.js.yml?branch=main">
<a href="https://npmjs.com/package/ebin">
<img alt="npm" src="https://img.shields.io/npm/v/ebin">
<img alt="npm" src="https://img.shields.io/npm/dw/ebin">
<img alt="NPM" src="https://img.shields.io/npm/l/ebin">
</a>
</p>

Inspired by [superstruct](https://github.com/ianstormtaylor/superstruct).

This library can work thanks to the fact that JavaScript stores the definition order for `string` object property keys:

- https://262.ecma-international.org/6.0/#sec-ordinary-object-internal-methods-and-internal-slots-ownpropertykeys

The order is guaranteed since ES2015.

## Example usage

```ts
import { struct, uint16, uint32 } from 'ebin';

const testStruct = struct({
  test1: uint16(),
  test2: uint16(),
  test3: uint32(),
});

testStruct.serialize({ test1: 1, test2: 1, test3: 1 });
// => Uint8Array([0, 1, 0, 1, 0, 0, 0, 1])

testStruct.parse(new Uint8Array([0, 1, 0, 1, 0, 0, 0, 1]));
// => { test1: 1, test2: 1, test3: 1 }
```

## Project goals

- Extensibility
- Ease of use
- Support for both parsing and serializing (most libraries only support parsing)
- Performance but without sacrificing features

## Supported types

- int
  - int8
  - int16
  - int32
  - int64
- uint
  - uint8
  - uint16
  - uint32
  - uint64
- float
  - float16
  - float32
  - float64
- string
- json
- array
- struct
- char
- bit
- bits

### int/uint/float

When using 16/32/64-bit values `.bigEndian()` and `.littleEndian()` functions are available to specify byte order.

Default byte order is big-endian (or inherited from parent `struct` if defined there).

## Performance

This section is updated manually and may not reflect the current performance.

Last updated on: 2023-09-19

Benchmarks are ran using vitest, and are defined in [benchmark/index.bench.ts](./benchmark/index.bench.ts).

### Parsing

```
 ✓ index.bench.ts (6) 3668ms
     name                  hz     min     max    mean     p75     p99    p995    p999     rme  samples
   · hand-written   34,193.47  0.0231  1.8689  0.0292  0.0260  0.1012  0.1385  0.2280  ±1.25%    17097
   · ebin            6,562.77  0.1455  0.4887  0.1524  0.1510  0.2231  0.3824  0.4337  ±0.49%     3282
   · binparse       83,492.02  0.0088  0.4232  0.0120  0.0112  0.0206  0.0441  0.1998  ±1.01%    41747   fastest
   · binary-parser  81,531.16  0.0091  0.3228  0.0123  0.0116  0.0196  0.1451  0.1773  ±0.89%    40766
   · destruct-js       444.80  2.1927  2.5115  2.2482  2.2405  2.4737  2.5067  2.5115  ±0.40%      223   slowest
   · structron       4,517.64  0.2120  0.4687  0.2214  0.2188  0.4015  0.4144  0.4368  ±0.53%     2259
```
