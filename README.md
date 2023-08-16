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
