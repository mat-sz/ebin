import type { TextEncoding } from '../../types.js';
import * as utf8 from './utf8.js';

export const textEncodings: Record<string, TextEncoding> = {
  utf8,
};
