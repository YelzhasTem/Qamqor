/**
 * Widens a source-language dictionary (declared `as const`) into the shape every
 * other language must match: same keys, same nesting and tuple lengths, any
 * string values. A missing or extra key in a translation fails typecheck.
 */
export type DictionaryShape<T> = T extends string
  ? string
  : { readonly [K in keyof T]: DictionaryShape<T[K]> };
