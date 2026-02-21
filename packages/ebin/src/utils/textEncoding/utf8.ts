// From: https://github.com/msgpack/msgpack-javascript/blob/main/src/utils/utf8.ts

export function getSize(input: string): number {
  const strLength = input.length;

  let byteLength = 0;
  let pos = 0;
  while (pos < strLength) {
    let value = input.charCodeAt(pos++);

    if ((value & 0xffffff80) === 0) {
      // 1-byte
      byteLength++;
    } else if ((value & 0xfffff800) === 0) {
      // 2-bytes
      byteLength += 2;
    } else {
      // handle surrogate pair
      if (value >= 0xd800 && value <= 0xdbff) {
        // high surrogate
        if (pos < strLength) {
          const extra = input.charCodeAt(pos);
          if ((extra & 0xfc00) === 0xdc00) {
            ++pos;
            value = ((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000;
          }
        }
      }

      if ((value & 0xffff0000) === 0) {
        // 3-byte
        byteLength += 3;
      } else {
        // 4-byte
        byteLength += 4;
      }
    }
  }

  return byteLength;
}

const TEXT_DECODER_THRESHOLD = 200;
const decoder = new TextDecoder();

export function decode(input: Uint8Array): string {
  let offset = 0;
  const end = input.length;

  if (end > TEXT_DECODER_THRESHOLD) {
    return decoder.decode(input);
  }

  const out: Array<number> = [];
  while (offset < end) {
    const byte1 = input[offset++];
    if ((byte1 & 0x80) === 0) {
      // 1 byte
      out.push(byte1);
    } else if ((byte1 & 0xe0) === 0xc0) {
      // 2 bytes
      const byte2 = input[offset++] & 0x3f;
      out.push(((byte1 & 0x1f) << 6) | byte2);
    } else if ((byte1 & 0xf0) === 0xe0) {
      // 3 bytes
      const byte2 = input[offset++] & 0x3f;
      const byte3 = input[offset++] & 0x3f;
      out.push(((byte1 & 0x1f) << 12) | (byte2 << 6) | byte3);
    } else if ((byte1 & 0xf8) === 0xf0) {
      // 4 bytes
      const byte2 = input[offset++] & 0x3f;
      const byte3 = input[offset++] & 0x3f;
      const byte4 = input[offset++] & 0x3f;
      let unit =
        ((byte1 & 0x07) << 0x12) | (byte2 << 0x0c) | (byte3 << 0x06) | byte4;
      if (unit > 0xffff) {
        unit -= 0x10000;
        out.push(((unit >>> 10) & 0x3ff) | 0xd800);
        unit = 0xdc00 | (unit & 0x3ff);
      }
      out.push(unit);
    } else {
      out.push(byte1);
    }
  }

  return String.fromCharCode.apply(String, out as any);
}

const TEXT_ENCODER_THRESHOLD = 50;
const encoder = new TextEncoder();

export function encode(input: string, output: Uint8Array): void {
  if (input.length > TEXT_ENCODER_THRESHOLD) {
    encoder.encodeInto(input, output);
  }

  const strLength = input.length;
  let offset = 0;
  let pos = 0;
  while (pos < strLength) {
    let value = input.charCodeAt(pos++);

    if ((value & 0xffffff80) === 0) {
      // 1-byte
      output[offset++] = value;
      continue;
    } else if ((value & 0xfffff800) === 0) {
      // 2-bytes
      output[offset++] = ((value >> 6) & 0x1f) | 0xc0;
    } else {
      // handle surrogate pair
      if (value >= 0xd800 && value <= 0xdbff) {
        // high surrogate
        if (pos < strLength) {
          const extra = input.charCodeAt(pos);
          if ((extra & 0xfc00) === 0xdc00) {
            ++pos;
            value = ((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000;
          }
        }
      }

      if ((value & 0xffff0000) === 0) {
        // 3-byte
        output[offset++] = ((value >> 12) & 0x0f) | 0xe0;
        output[offset++] = ((value >> 6) & 0x3f) | 0x80;
      } else {
        // 4-byte
        output[offset++] = ((value >> 18) & 0x07) | 0xf0;
        output[offset++] = ((value >> 12) & 0x3f) | 0x80;
        output[offset++] = ((value >> 6) & 0x3f) | 0x80;
      }
    }

    output[offset++] = (value & 0x3f) | 0x80;
  }
}
