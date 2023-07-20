import head from "lodash/head";
import tail from "lodash/tail";
import { spaces } from "./BerryStringUtil";
import { replaceUndefined } from "./ReplaceUndefined";

export interface BerryPrettyOptions {
  compact?: boolean; // show multiple items on one line if possible
  wrapLength?: number; // width of display
  maxDepth?: number; // show only this many levels of children
  maxArray?: number; // show only this many array elements
  prototypes?: boolean;
  precision?: number;
}

type Options = Required<BerryPrettyOptions>;

const defaultOptions: Options = {
  compact: true,
  wrapLength: 40,
  maxDepth: 6,
  maxArray: 24,
  prototypes: false,
  precision: 4,
};

interface State {
  nesting: number; // current indent
  depth: number; // recursive depth (to control )
  seen: Set<unknown>; // values already seen (used for circularity checks)
  iterated: ExpandedIterables; // store results of iterables after iterations
  // enables printing again w/o re-iterating (for multiline)
}

type ExpandedIterables = Map<Iterable<unknown>, Array<unknown>>;

const circularRef = {
  iAmCircular: true,
};

if (typeof DOMRect === "undefined") {
  // TODO we oughtn't modify globalThis
  (globalThis as any).DOMRect = function () {
    /**/
  };
}

export function pretty(
  value: unknown,
  options: BerryPrettyOptions = {}
): string {
  const opts = replaceUndefined(options, defaultOptions);
  const { wrapLength, compact } = opts;

  const iterated = new Map(); // save map of iterated values so we don't try to re-iterate them

  let result = prettyToString(value, opts, iterated);
  if (compact && result.length > wrapLength) {
    // compact mode didn't work, so redo pretty print in multiline mode
    result = prettyToString(value, { ...opts, compact: false }, iterated);

    // TODO rework wrapping to allow compact elements inside a multiline
  }
  return result;
}

function prettyToString(
  value: any,
  opts: Options,
  iterated: ExpandedIterables = new Map()
): string {
  const state = { nesting: 0, depth: 0, seen: new Set(), iterated };
  if (isObject(value)) {
    state.seen.add(value);
  }
  return prettyRecursive(value, opts, state);
}

// TODO break up into plugins

function prettyRecursive(value: any, options: Options, state: State): string {
  let result: string;
  if (state.depth++ >= options.maxDepth) {
    result = "...";
  } else if (isInteger(value)) {
    result = value.toFixed();
  } else if (typeof value === "number") {
    result = prettyFloat(value, options.precision);
  } else if (typeof value === "string") {
    result = `"${replaceSpecials(value)}"`;
  } else if (arrayIsh(value)) {
    result = arrayToString(value, options, state);
  } else if (value instanceof Date) {
    result = value.toLocaleString();
  } else if (value instanceof Function) {
    result = "function " + value.name + "()";
  } else if (isDomElement(value)) {
    result = value;
  } else if (value === circularRef) {
    result = "<circular reference>"; // TODO can we let console logger put an expandable reference here?
  } else if (value instanceof DOMRect) {
    const { top, left, height, width } = value;
    result = prettyRecursive({ top, left, height, width }, options, state);
  } else if (typeof value === "symbol") {
    result = value.toString();
  } else if (value instanceof Error) {
    result = errorToString(value, options, state);
  } else if (value instanceof Map || (value && value.constructor === Map)) {
    result = mapToString(value, options, state);
  } else if (value instanceof Set || (value && value.constructor === Set)) {
    result = setToString(value, options, state);
  } else if (value && value[Symbol.iterator]) {
    result = iterableToString(value, options, state);
  } else if (isObject(value)) {
    result = objectToString(value as Record<string, unknown>, options, state);
  } else if (value === true) {
    result = "true";
  } else if (value === false) {
    result = "false";
  } else if (value === null) {
    result = "null";
  } else if (value === undefined) {
    result = "undefined";
  } else {
    result = value;
  }
  state.depth--;
  return result;
}

const specials = new Map([
  ["\t", "\\t"],
  ["\r", "\\r"],
  ["\n", "\\n"],
  ['"', '\\"'],
]);

function replaceSpecials(s: string): string {
  return [...s].map((c) => specials.get(c) || c).join("");
}

function replaceCircular(
  keyValues: KeyValue[],
  seen: Set<unknown>
): KeyValue[] {
  return keyValues.map(([key, value]) => {
    if (testCircular(value, seen)) {
      return [key, circularRef];
    } else {
      return [key, value];
    }
  });
}

function testCircular(value: any, seen: Set<unknown>): boolean {
  if (isObject(value)) {
    if (seen.has(value)) {
      return true;
    } else {
      seen.add(value);
    }
  }

  return false;
}

function isObject(value: any): value is Record<string, unknown> {
  const valueType = typeof value;
  return value != null && (valueType === "object" || valueType === "function");
}

function arrayIsh(value: any): value is any[] {
  return Array.isArray(value) || ArrayBuffer.isView(value);
}

function arrayToString(values: any[], options: Options, state: State): string {
  if (options.compact || values.length <= 1) {
    return oneLineArray(values, options, state);
  } else {
    return multiLineArray(values, options, state);
  }
}

function oneLineArray(value: any[], options: Options, state: State): string {
  const expanded = [...value];
  const values = expanded
    .slice(0, options.maxArray)
    .map((v) => prettyRecursive(v, options, state));
  if (expanded.length > options.maxArray) {
    values.push("...");
  }
  return "[" + values.join(", ") + "]";
}

function multiLineArray(value: any[], options: Options, state: State): string {
  const bracketIndent = spaces(state.nesting);
  state.nesting++;
  const values = [...value]
    .slice(0, options.maxArray)
    .map((v) => prettyRecursive(v, options, state));

  if (value.length > options.maxArray) {
    values.push("...");
  }
  const indent = spaces(state.nesting * 2);
  state.nesting--;

  const lastDex = values.length - 1;
  const indentedLines = values.map((v, i) => {
    const comma = i === lastDex ? "" : ",";
    return indent + v + comma + "\n";
  });
  const linesTogether = indentedLines.join("");
  const open = bracketIndent + "[\n";
  const close = bracketIndent + "]";

  return open + linesTogether + close;
}

function objectToString(
  value: Record<string, unknown>,
  options: Options,
  state: State
): string {
  const { compact, prototypes } = options;
  const rawKeyValues = prototypes ? allEntries(value) : Object.entries(value);
  const keyValues = replaceCircular(rawKeyValues, state.seen);

  if (compact) {
    return oneLineObj(keyValues, options, state);
  } else {
    return multiLineKV(keyValues, options, state);
  }
}
function oneLineObj(
  keyValues: KeyValue[],
  options: Options,
  state: State
): string {
  const kvStrings = keyValues.map(
    ([k, v]) => k + ": " + prettyRecursive(v, options, state)
  );
  return "{" + kvStrings.join(", ") + "}";
}

function multiLineKV(
  keyValues: KeyValue[],
  opts: Options,
  state: State,
  separator = ": "
): string {
  if (keyValues.length === 0) {
    return "{ }";
  }
  const braceNesting = state.nesting,
    braceIndent = spaces(braceNesting * 2),
    indent = braceIndent + "  ";

  state.nesting++;
  const kvStrings = keyValues.map(
    ([k, v]) => k + separator + prettyRecursive(v, opts, state)
  );
  state.nesting--;

  return formatKVs(kvStrings, braceIndent, indent);
}

function formatKVs(
  kvStrings: string[],
  braceIndent: string,
  indent: string
): string {
  let indentedStrings: string[];
  let firstLine: string;

  if (braceIndent === "") {
    firstLine = "{ ";
    const first = head(kvStrings)!;
    indentedStrings = tail(kvStrings).map((kv) => indent + kv) || [];
    indentedStrings.unshift(first);
  } else {
    firstLine = "{\n";
    indentedStrings = kvStrings.map((kv) => indent + kv);
  }

  return firstLine + indentedStrings.join(",\n") + "\n" + braceIndent + "}";
}

type KeyValue = [string, unknown];

function allEntries(obj: Record<string, unknown>): KeyValue[] {
  const keyValues: KeyValue[] = [];
  for (const key in obj) {
    const value = (obj as any)[key];
    keyValues.push([key, value]);
  }
  return keyValues;
}

/** @return a number as a string to the specified precision, trailing zeros after the decimal point are dropped */
export function prettyFloat(value: number, precision = 4): string {
  const str = value.toPrecision(precision);
  if (str.indexOf(".") === -1) {
    return str;
  }

  let last = str.length - 1;
  while (str[last] === "0") {
    last -= 1;
  }
  if (str[last] === ".") {
    last -= 1;
  }

  return str.slice(0, last + 1);
}

function isInteger(value: any): boolean {
  if (typeof value !== "number") {
    return false;
  }
  if (Number.isInteger(value)) {
    return true;
  }
  return isFinite(value) && Math.floor(value) === value;
}

function errorToString(err: Error, options: Options, state: State): string {
  const stack = head(err.stack?.split("\n").slice(1, 2));
  return prettyRecursive(
    { err: err.name, message: err.message, stack },
    options,
    state
  );
}

function mapToString(
  map: Map<unknown, unknown>,
  options: Options,
  state: State
): string {
  const rawKeyValues: KeyValue[] = [...map.entries()].map(([key, value]) => {
    const keyString = prettyRecursive(key, options, state);
    return [keyString, value];
  });
  const keyValues = replaceCircular(rawKeyValues, state.seen);
  return multiLineKV(keyValues, options, state, " -> ");
}

function setToString(
  set: Set<unknown>,
  options: Options,
  state: State
): string {
  const values = [...set.values()].map((value) => {
    return prettyRecursive(value, options, state);
  });
  // for now only single line
  return "{" + values.join(", ") + "}";
}

function iterableToString(
  iterable: Iterable<unknown>,
  options: Options,
  state: State
): string {
  let expanded = state.iterated.get(iterable);
  if (!expanded) {
    expanded = [...iterable];
    state.iterated.set(iterable, expanded);
  }
  return arrayToString(expanded, options, state);
}

function isDomElement(value: any): boolean {
  if (typeof Element === "undefined") {
    return false;
  } else {
    return value instanceof Element || value instanceof Text;
  }
}
