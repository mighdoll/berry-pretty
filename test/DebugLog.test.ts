import { should } from "chai";
import { dlogMessagesTest } from "../src/DebugLog";
import { test } from "vitest";
should();

test("varargs", function varargsTest() {
  const messages = dlogMessagesTest({}, "foo");
  messages.join(" ").should.equal("varargsTest          | foo");
});

test("show function", function myFn() {
  const messages = dlogMessagesTest({ showFile: true }, "foo");
  const result = messages.join(" ");
  result.should.equal("DebugLog.test.myFn   | foo");
});

// LATER add test for dLog inside anonymous functions
