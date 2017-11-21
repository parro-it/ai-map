import test from "tape-async";
import map from ".";
import concat from "ai-concat";

const arr = [42, Promise.resolve(43)];

const double = item => item * 2;
const rejection = p => p.next().catch(err => err);
const fail = () => {
  throw new Error("test");
};

test("exports a function", async t => {
  t.is(typeof map, "function");
});

test("map to doubles", async t => {
  const results = await concat.obj(map(arr, double));
  t.deepEqual(results, [84, 86]);
});

test("can be partially applied", async t => {
  const mapDouble = map.with(double);
  const results = await concat.obj(mapDouble(arr));
  t.deepEqual(results, [84, 86]);
});

test("transform receive item, index, iterable", async t => {
  const results = await concat.obj(
    map(arr, (item, index, iterable) => {
      t.is(iterable, arr);
      return index;
    })
  );

  t.deepEqual(results, [0, 1]);
});

test("transform could return a promise", async t => {
  const results = await concat.obj(map(arr, v => Promise.resolve(v)));
  t.deepEqual(results, [42, 43]);
});

test("throw async if data is not an async iterable", async t => {
  const err = await rejection(map(0, () => 0));

  t.is(err.message, "data argument must be an iterable or async-iterable.");
});

test("throw async if transform is not a function", async t => {
  const err = await rejection(map([0], 0));
  t.is(err.message, "transform argument must be a function.");
});

test("throw async if transform throws", async t => {
  const err = await rejection(map(["ciao"], fail));
  t.is(err.message, "test");
});

test("throw async during iteration if transform return a rejected promise", async t => {
  const err = await rejection(map(["ciao"], async () => fail()));
  t.is(err.message, "test");
});

test("with throw sync if transform is not a function", async t => {
  t.throws(
    () => map.with(0),
    TypeError,
    "transform argument must be a function."
  );
});
