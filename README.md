<h1 align="center">ebin</h1>

<p align="center">
<b>E</b>pic <b>bin</b>ary parser/serializer
</p>

<p align="center">
<img alt="workflow" src="https://img.shields.io/github/actions/workflow/status/mat-sz/ebin/node.js.yml?branch=main">
<a href="https://npmjs.com/package/ebin">
<img alt="npm" src="https://img.shields.io/npm/v/ebin">
<img alt="npm" src="https://img.shields.io/npm/dw/ebin">
<img alt="npm" src="https://img.shields.io/npm/l/ebin">
</a>
</p>

Inspired by [superstruct](https://github.com/ianstormtaylor/superstruct) and [zod](github.com/colinhacks/zod).

This library can work thanks to the fact that JavaScript stores the definition order for `string` object property keys:

- https://262.ecma-international.org/6.0/#sec-ordinary-object-internal-methods-and-internal-slots-ownpropertykeys

The order is guaranteed since ES2015.

## Example

```ts
import * as e from 'ebin';

const testStruct = e.struct({
  test1: e.uint16(),
  test2: e.uint16(),
  test3: e.uint32(),
});

testStruct.toByteArray({ test1: 1, test2: 1, test3: 1 });
// => Uint8Array([0, 1, 0, 1, 0, 0, 0, 1])

testStruct.fromByteArray(new Uint8Array([0, 1, 0, 1, 0, 0, 0, 1]));
// => { test1: 1, test2: 1, test3: 1 }
```

## Project goals

- Isomorphism - using APIs available in node.js, bun, Deno and mainstream browsers
- Extensibility
- Ease of use
- Support for both parsing and serializing (most libraries only support parsing)
- Performance without sacrificing essential features

## Types

### codec

### bytes

### string

### int/uint/float

When using 16/32/64-bit values `.bigEndian()` and `.littleEndian()` functions are available to specify byte order.

Default byte order is big-endian (or inherited from parent `struct` if defined there).

## Performance

> [!NOTE]
> In very simple cases the serialization performance of ebin is bottlenecked by the performance of the `ArrayBuffer` constructor. Since other libraries rely on Node's `Buffer`, they will perform faster.
