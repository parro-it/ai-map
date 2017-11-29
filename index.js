import isAsyncIterable from "is-async-iterable";
import AsyncIterable from "asynciterable";
import isPromise from "is-promise";

function checkTransformArgument(transform) {
  if (typeof transform !== "function") {
    throw new TypeError("transform argument must be a function.");
  }
}

/**
 * Creates a new async iterable with the results of calling a
 * provided function on every element in the async iterable.
 *
 * @param  {AsyncIterable} data The async iterable to map over
 * @param {Function} transform Function to apply to each element in the async iterable, taking 3 arguments:
 *     .
 *     ```
 *     __currentValue__ - The current element being processed in the async iterable.
 *
 *     __currentIndex__ - The index of the current element being processed in the async
 *     iterable. Starts at index 0
 *
 *     __data__ - The async iterable map was called upon.
 *     ```
 *
 * @return {AyncIterable} An iterable that iterates over the `transform` calls results.
 */
export default function map(data, transform) {
  return new AsyncIterable(async (write, end) => {
    checkTransformArgument(transform);

    if (isPromise(data)) {
      data = await data;
    }

    if (!isAsyncIterable(data)) {
      throw new TypeError(
        "data argument must be an iterable or async-iterable."
      );
    }

    const generator = data[Symbol.asyncIterator] || data[Symbol.iterator];
    const iterator = generator.call(data);
    let index = 0;
    let item = await iterator.next();
    while (!item.done) {
      write(await transform(await item.value, index, data));
      index++;
      item = await iterator.next();
    }
    end();
  });
}

/**
 * Higher order function that partially apply `transform` to the
 * map function.
 * @param  {Function} transform     The transform argument to partially apply to map
 * @return {Function}           A `map` unary function that take a data argument
 * and return a new async iterable.
 */
map.with = transform => {
  checkTransformArgument(transform);

  return data => map(data, transform);
};
