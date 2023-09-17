const floatView = new Float32Array(1);
const int32View = new Int32Array(floatView.buffer);

/* From: https://stackoverflow.com/questions/32633585/how-do-you-convert-to-half-floats-in-javascript */
export function toFloat16(val: number) {
  if (isNaN(val)) {
    // For some reason the original implementation returns 0x7c00 (+Infinity) for NaN
    return 0x7c01;
  }

  floatView[0] = val;
  const x = int32View[0];

  let bits = (x >> 16) & 0x8000; /* Get the sign */
  let m = (x >> 12) & 0x07ff; /* Keep one extra bit for rounding */
  const e = (x >> 23) & 0xff; /* Using int is faster here */

  /* If zero, or denormal, or exponent underflows too much for a denormal
   * half, return signed zero. */
  if (e < 103) {
    return bits;
  }

  /* If NaN, return NaN. If Inf or exponent overflow, return Inf. */
  if (e > 142) {
    bits |= 0x7c00;
    /* If exponent was 0xff and one mantissa bit was set, it means NaN,
     * not Inf, so make sure we set one mantissa bit too. */
    bits |= (e == 255 ? 0 : 1) && x & 0x007fffff;
    return bits;
  }

  /* If exponent underflows but not too much, return a denormal */
  if (e < 113) {
    m |= 0x0800;
    /* Extra rounding may overflow and set mantissa to 0 and exponent
     * to 1, which is OK. */
    bits |= (m >> (114 - e)) + ((m >> (113 - e)) & 1);
    return bits;
  }

  bits |= ((e - 112) << 10) | (m >> 1);
  /* Extra rounding. An overflow will set mantissa to 0 and increment
   * the exponent, which is OK. */
  bits += m & 1;
  return bits;
}

export function fromFloat16(binary: number) {
  const exponent = (binary & 0x7c00) >> 10;
  const fraction = binary & 0x03ff;
  return (
    (binary >> 15 ? -1 : 1) *
    (exponent
      ? exponent === 0x1f
        ? fraction
          ? NaN
          : Infinity
        : Math.pow(2, exponent - 15) * (1 + fraction / 0x400)
      : 6.103515625e-5 * (fraction / 0x400))
  );
}
