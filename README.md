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

More examples: [./examples](./examples)

## Project goals

- Isomorphism - using APIs available in node.js, bun, Deno and mainstream browsers
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

Last updated on: 2023-09-21

Benchmarks are ran using vitest.

### Parsing

[benchmark/parse.bench.ts](./benchmark/parse.bench.ts)

```
 ✓ parse.bench.ts (6) 3667ms
     name                  hz     min     max    mean     p75     p99    p995    p999     rme  samples
   · hand-written   36,459.60  0.0233  1.9810  0.0274  0.0262  0.0538  0.1260  0.2006  ±1.10%    18230
   · ebin            7,286.30  0.1275  0.5070  0.1372  0.1375  0.1954  0.2930  0.3868  ±0.45%     3644
   · binparse       85,836.32  0.0090  0.3042  0.0117  0.0111  0.0188  0.0322  0.1735  ±0.88%    42919   fastest
   · binary-parser  83,666.60  0.0093  0.3056  0.0120  0.0114  0.0187  0.1277  0.1518  ±0.80%    41834
   · destruct-js       468.61  2.0824  2.3800  2.1340  2.1383  2.3589  2.3600  2.3800  ±0.36%      235   slowest
   · structron       4,906.39  0.1951  0.4470  0.2038  0.2026  0.3523  0.3699  0.4052  ±0.46%     2454
```

### Serialization

[benchmark/serialize.bench.ts](./benchmark/serialize.bench.ts)

```
 ✓ serialize.bench.ts (5) 3339ms
     name                          hz      min      max     mean      p75      p99     p995     p999     rme  samples
   · hand-written           31,502.19   0.0291   1.9691   0.0317   0.0323   0.0537   0.0640   0.0701  ±0.86%    15752   fastest
   · ebin                    8,993.78   0.1029   0.2588   0.1112   0.1121   0.1681   0.1901   0.2414  ±0.32%     4497
   · binary-parser-encoder   9,035.37   0.0993   2.6982   0.1107   0.1068   0.1525   0.1604   1.1980  ±1.96%     4518
   · destruct-js              21.4143  45.4065  53.4103  46.6978  46.4058  53.4103  53.4103  53.4103  ±3.27%       11   slowest
   · structron               4,053.49   0.2358   0.4834   0.2467   0.2445   0.4023   0.4195   0.4568  ±0.43%     2027
```
