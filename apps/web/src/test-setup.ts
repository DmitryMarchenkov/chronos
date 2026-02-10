import { TextDecoder, TextEncoder } from 'util';

const globalsWithEncoding = globalThis as typeof globalThis & {
  TextEncoder?: typeof TextEncoder;
  TextDecoder?: typeof TextDecoder;
};

if (!globalsWithEncoding.TextEncoder) {
  globalsWithEncoding.TextEncoder = TextEncoder;
}

if (!globalsWithEncoding.TextDecoder) {
  globalsWithEncoding.TextDecoder = TextDecoder;
}
