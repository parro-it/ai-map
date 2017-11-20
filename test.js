import test from "tape-async";
import aiMap from ".";

test("exports a function", async t => {
  t.is(typeof aiMap, "function");
});
