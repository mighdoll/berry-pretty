import { dlogMessagesTest } from "../src/DebugLog";
import { test, expect } from "vitest";

test("varargs", function varargsTest() {
  const messages = dlogMessagesTest({}, "foo");
  expect(messages.join(" ")).equal("varargsTest          | foo");
});

test("show function", function myFn() {
  const messages = dlogMessagesTest({ showFile: true }, "foo");
  const result = messages.join(" ");
  expect(result).equal("DebugLog.test.myFn   | foo");
});

// LATER add test for dLog inside anonymous functions
