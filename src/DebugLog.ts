import _ from "lodash";
import { BerryPrettyOptions, pretty } from "./BerryPretty";
import { callerName } from "./BerryStack";
import { indentMultiLine, padTrimCaller } from "./BerryStringUtil";
import { replaceUndefined } from "./ReplaceUndefined";

/** options for dlog and friends */
export type DebugLogOptions = BerryPrettyOptions & LogOptions;

/** alternate spellings for intercap fans */
export const dLog = dlog;
export const dErr = derr;
export const dWarn = dwarn;

/** options for debugLog not used by BerryPretty */
interface LogOptions {
  stackLevel?: number; // show file/function from higher up the stack then normal (for debug utilities)
  showFile?: boolean; // show caller file as well as function name
  nameSize?: number; // number of characters for the first column for function and file name
}

const defaultOptions: Required<DebugLogOptions> = {
  stackLevel: 0,
  showFile: false,
  nameSize: 20,
  compact: true,
  wrapLength: 40,
  maxDepth: 6,
  maxArray: 24,
  prototypes: false,
  precision: 4,
};

/** concise debug logging */
export function dlog(...items: any[]): void {
  console.log(...dLogMessages({}, ...items));
}

/** concise debug logging, with options */
export function dlogOpt(
  options: DebugLogOptions,
  ...items: [any, ...any]
): void {
  // TODO this needs to be multiline aware, the second item doesn't know where it's beginning
  console.log(...dLogMessages(options, ...items));
}

/** concise assertion logging */
export function dsert(test: boolean, ...items: any[]): void {
  if (!test) {
    const messages = dLogMessages({}, ...items);
    console.assert(test, messages);
  }
}

/** concise error logging */
export function derr(...items: any[]): void {
  console.error(...dLogMessages({}, ...items));
}

/** concise warning logging */
export function dwarn(...items: any[]): void {
  console.warn(...dLogMessages({}, ...items));
}

/** set default options for all subsequent logging */
export function dLogDefaultOptions(options: DebugLogOptions): void {
  Object.assign(defaultOptions, options);
}

/** exported for testing */
export function dlogMessagesTest(
  options: DebugLogOptions,
  ...items: any[]
): any[] {
  return dLogMessages(options, ...items);
}

function dLogMessages(options: DebugLogOptions, ...items: any[]): any[] {
  const opts = replaceUndefined(options, defaultOptions);
  const level = opts.stackLevel + 2;
  const messages: any[] = items.map((item) => {
    if (_.isPlainObject(item)) {
      return debugVars(item, opts);
    } else {
      return item;
    }
  });

  const caller = callerName(new Error().stack || "", level, opts.showFile);
  const fixedWidthCaller = padTrimCaller(caller, opts.nameSize);
  messages.unshift(`${fixedWidthCaller} |`);
  return indentMultiLine(messages);
}

/** @return a string for convenient debug logging some variables. */
function debugVars(
  vars: Record<string, unknown>,
  options?: BerryPrettyOptions
): string {
  const strings = Object.entries(vars).map(
    ([key, value]) => `${key}: ${pretty(value, options)}`
  );

  const multiline = strings.find((s) => s.includes("\n"));
  if (multiline) {
    return strings.join("\n");
  } else {
    return strings.join("  ");
  }
}
