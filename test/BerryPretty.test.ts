import { should } from "chai";
import { pretty } from "../src/BerryPretty";
import { expect, test } from "vitest";
should();

test("number", () => {
  verify("17.12");
  verify("4");
  verify("40000");
  verify("0.1");
});

test("simple array", () => {
  verify("[1, 2, 3]");
});

test("simple object", () => {
  verify(`{foo: 2, bar: "bar"}`);
});

test("long object", () => {
  const longObj = `
{ foo: 2,
  bar: "bar",
  then: "muchLongerString"
}`;

  verify(longObj);
});

test("nested object", () => {
  const nestedObj = `
{ foo: 2,
  bar: "bar",
  nested: {
    a: "alpha",
    b: "boy"
  }
}`;
  verify(nestedObj);
});

test("deeply nested object", () => {
  const nestedObj = `
{ a: {
    b: {
      c: {
        message: "fun fun fun, for everyone"
      }
    }
  }
}`;
  verify(nestedObj);
});

test("empty objects", () => {
  verify(`{foo: {}}`);
  verify(`{}`);
  const nested = `
{ longish: "longishString",
  bar: 12.2,
  foo: { }
}`;
  verify(nested);
});

test("circular reference", () => {
  const obj = {} as any;
  obj.self = obj;
  const resultStr = pretty(obj);
  resultStr.should.equal(`{self: <circular reference>}`);
});

test("function", () => {
  const obj = { fun };
  const resultStr = pretty(obj);
  resultStr.should.equal(`{fun: function fun()}`);

  function fun(): void {
    /**/
  }
});

test("symbol", () => {
  const sym = Symbol("symsym");
  const obj = { sym };
  const resultStr = pretty(obj);
  resultStr.should.equal("{sym: Symbol(symsym)}");
});

test("too deeply nested", () => {
  const obj = { a: { b: { c: { d: { e: { f: 1 } } } } } };
  const resultStr = pretty(obj, { maxDepth: 3 });
  resultStr.should.equal("{a: {b: {c: ...}}}");
});

// TODO
// test("small nested objects can still fit on a single line", () => {
//   const obj = `
// { a: "long message here forces multi-line",
//   but: { tiny: "ok" }
// }`;
//   verify(obj);
// });

test("Error", () => {
  const message = "hello";
  const e = new Error(message);
  const resultStr = pretty(e);
  resultStr.should.contain(`message: "${message}"`);
  resultStr.should.contain("BerryPretty.test.ts");
});

test("Map", () => {
  const map = new Map([
    ["a", 1],
    ["b", 2],
  ]);
  const obj = { map, foo: "bar" };
  const resultStr = pretty(obj);
  resultStr.should.equal(
    `{ map: {
    "a" -> 1,
    "b" -> 2
  },
  foo: "bar"
}`
  );
});

test("Set", () => {
  const set = new Set([1, 2]);
  const obj = { set };
  const resultStr = pretty(obj);
  resultStr.should.equal("{set: {1, 2}}");
});

test("iterable", () => {
  const map = new Map([
    ["a", 1],
    ["b", 2],
  ]);
  const keys = map.keys();
  const resultStr = pretty(keys);
  resultStr.should.equal(`["a", "b"]`);
});

test("long interable", () => {
  const map = new Map([
    ["alpha", 1],
    ["beta", 2],
    ["gamma", 3],
  ]);
  const keys = map.keys();
  const resultStr = pretty(keys, { wrapLength: 20 });
  const expected = `
[
  "alpha",
  "beta",
  "gamma"
]`;
  resultStr.should.equal(expected.trimStart());
});

test("undefined", () => {
  const resultStr = pretty(undefined);
  resultStr.should.equal(`undefined`);
});

/**
 * 1) convert the trimmed string to a javascript object,
 * 2) call debugString on the object
 * 3) assert that the string generated by debugString matches the original
 */
function verify(original: string): void {
  const expectStr = original.trim();
  // note can't use JSON here. the logged format is js but not json (we don't quote keys)
  const obj = new Function("return " + expectStr)();
  const resultStr = pretty(obj);
  if (resultStr !== expectStr) {
    console.log(expectStr);
    console.log(resultStr);
  }
  resultStr.should.equal(expectStr);
}
