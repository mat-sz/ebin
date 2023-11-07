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

Last updated on: 2023-11-07

Benchmarks are ran using vitest.

### Parsing

[benchmark/parse.bench.ts](./benchmark/parse.bench.ts)

```
 ✓ parse.bench.ts (7) 4289ms
     name                            hz     min     max    mean     p75     p99    p995    p999     rme  samples
   · hand-written - Buffer    38,073.37  0.0224  1.1365  0.0263  0.0256  0.0514  0.1000  0.1537  ±0.66%    19037
   · hand-written - DataView  83,900.11  0.0085  0.3170  0.0119  0.0113  0.0237  0.0350  0.1705  ±0.83%    41952
   · ebin                      9,045.28  0.1015  0.3712  0.1106  0.1112  0.1335  0.2404  0.3269  ±0.37%     4523
   · binparse                 89,955.43  0.0086  0.2916  0.0111  0.0107  0.0180  0.0257  0.1475  ±0.75%    44978   fastest
   · binary-parser            83,574.26  0.0092  0.2642  0.0120  0.0116  0.0187  0.0988  0.1394  ±0.67%    41788
   · destruct-js                 478.33  1.9740  2.9790  2.0906  2.0833  2.4716  2.9475  2.9790  ±0.65%      240   slowest
   · structron                 4,134.37  0.2169  1.7895  0.2419  0.2454  0.4206  0.4521  0.6487  ±0.86%     2068
```

### Serialization

[benchmark/serialize.bench.ts](./benchmark/serialize.bench.ts)

```
 ✓ serialize.bench.ts (6) 3986ms
     name                             hz      min      max     mean      p75      p99     p995     p999     rme  samples
   · hand-written - Buffer     30,164.39   0.0302   2.4920   0.0332   0.0335   0.0576   0.0617   0.0735  ±1.27%    15083
   · hand-written - DataView  117,527.08   0.0069   0.9560   0.0085   0.0083   0.0165   0.0188   0.0269  ±0.48%    58764   fastest
   · ebin                      13,667.18   0.0661   0.3482   0.0732   0.0699   0.1359   0.1464   0.2088  ±0.48%     6834
   · binary-parser-encoder     10,818.21   0.0814   2.5627   0.0924   0.0911   0.1276   0.1642   1.0452  ±1.87%     5410
   · destruct-js                 21.3463  45.4628  50.0825  46.8466  47.7370  50.0825  50.0825  50.0825  ±1.88%       11   slowest
   · structron                  3,792.20   0.2457   0.5219   0.2637   0.2617   0.4193   0.4495   0.5097  ±0.46%     1897
```
