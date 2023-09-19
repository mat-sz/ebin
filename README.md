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

Benchmarks are ran using vitest.

### Parsing

[benchmark/parse.bench.ts](./benchmark/parse.bench.ts)

```
 ✓ parse.bench.ts (6) 3677ms
     name                  hz     min     max    mean     p75     p99    p995    p999     rme  samples
   · hand-written   36,752.80  0.0230  1.9417  0.0272  0.0256  0.0536  0.1354  0.2044  ±1.13%    18377
   · ebin            7,125.39  0.1333  0.3925  0.1403  0.1405  0.1619  0.2977  0.3684  ±0.39%     3563
   · binparse       87,743.08  0.0088  0.5751  0.0114  0.0108  0.0243  0.0531  0.1513  ±0.83%    43872   fastest
   · binary-parser  85,437.69  0.0092  0.3183  0.0117  0.0113  0.0166  0.1247  0.1390  ±0.74%    42719
   · destruct-js       454.70  2.1401  2.4334  2.1993  2.1964  2.4094  2.4303  2.4334  ±0.33%      228   slowest
   · structron       4,473.35  0.2056  0.4716  0.2235  0.2210  0.3757  0.3896  0.4290  ±0.50%     2237
```

### Serialization

[benchmark/serialize.bench.ts](./benchmark/serialize.bench.ts)

```
 ✓ serialize.bench.ts (2) 1221ms
     name                 hz     min     max    mean     p75     p99    p995    p999     rme  samples
   · hand-written  31,129.66  0.0299  2.8017  0.0321  0.0332  0.0446  0.0500  0.0635  ±1.10%    15565   fastest
   · ebin           8,498.26  0.1090  0.2768  0.1177  0.1188  0.1649  0.1747  0.2375  ±0.25%     4250
```
