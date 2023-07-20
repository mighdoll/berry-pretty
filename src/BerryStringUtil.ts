export const spaces = memoize((nesting: number): string => {
  return " ".repeat(nesting);
});

const defaultCallerSize = 20;
const multiLinePad = "\n" + spaces(defaultCallerSize + 3);

// TODO should respect name size
export function indentMultiLine(messages: any[]): any[] {
  return messages.map(indentString);
}

export function padTrimCaller(
  caller: string,
  callerSize = defaultCallerSize
): string {
  return (caller + spaces(callerSize)).slice(0, callerSize);
}

function indentString(m: any): any {
  if (typeof m === "string") {
    return m.replace(/\n/g, multiLinePad);
  } else {
    return m;
  }
}

type MemoFn<T> = (...args: any) => T;

function memoize<T>(fn: MemoFn<T>): MemoFn<T> {
  const cache = new Map<string, T>();

  return function (...args: any): T {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key)!;
    } else {
      const value = fn(...args);
      cache.set(key, value);
      return value;
    }
  };
}
