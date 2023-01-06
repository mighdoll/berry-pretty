/** replace undefined fields with a default value */

export function replaceUndefined<T extends Partial<U>, U>(obj: T, defaults: U): T & U {
  const result = { ...defaults, ...removeUndefined(obj) };
  return result;
}


/** @return a copy, eliding fields with undefined values */
export function removeUndefined<T>(obj: T): T {
  const result = { ...obj };
  for (const key in result) {
    if (result[key] === undefined) {
      delete result[key];
    }
  }
  return result;
}
