# Defer Implementation in JavaScript

This is a simple Proof of Concept (POC) for implementing a `defer` function in JavaScript, inspired by the `defer` syntax in the Go programming language. The `defer` function allows you to schedule functions to be executed at the end of an asynchronous operation, making it easier to manage resource cleanup or other deferred tasks.

## Usage

To use the `defer` functionality, you need to import the `AsyncLocalStorage` module from 'node:async_hooks' and create an instance of it called `deferStorage`. (See [index.mts](src/index.mts))

Then, you can use the `defer` and `useDefer` functions in your code as demonstrated below:

```typescript
// Sample usage of defer and useDefer functions
async function deferTest() {
  defer(() => {
    const fns = deferStorage.getStore()?.map(e => e.toString());
    console.log("defer 1", fns);
  });
  console.log("not defer");
  return 1;
}

async function deferTest2() {
  defer(() => {
    const fns = deferStorage.getStore()?.map(e => e.toString());
    console.log("defer 2", fns);
  });
  console.log("not defer 2");
  return 1;
}

useDefer(deferTest);
useDefer(deferTest2);
```

In this code, the `defer` function is used to schedule functions to be executed later when the associated asynchronous operation is complete. The `useDefer` function is used to manage the execution of these deferred functions.

## Mechanism

The mechanism behind this `defer` implementation utilizes the `AsyncLocalStorage` from Node.js's 'node:async_hooks' module. Here's how it works:

1. Import and create an instance of `AsyncLocalStorage` named `deferStorage`. This instance is used to store arrays of deferred functions associated with different asynchronous contexts.

2. The `defer` function takes a function `fn` as an argument and pushes it into the array stored in the current asynchronous context. If `defer` is called outside of any asynchronous context, it will throw an error.

3. The `useDefer` function takes an async function `fn` as an argument. It sets up a new asynchronous context using `deferStorage.run`, initializing an empty array to store deferred functions.

4. Inside the `useDefer` function, the provided `fn` is executed asynchronously using `fn().finally(...)`. The `finally` block is used to ensure that the deferred functions are executed after the completion of `fn`.

5. In the `finally` block, it retrieves the array of deferred functions associated with the current context using `deferStorage.getStore()`. It then asynchronously executes all the deferred functions in the order they were added, using `Promise.all`.

6. The result of the `useDefer` function is a Promise that resolves with the result of `fn`. The deferred functions are executed before this Promise resolves.

This mechanism allows you to schedule and execute deferred functions in the order they were added within the context of an asynchronous operation. It is particularly useful for cleanup tasks or any other actions that should be performed after the completion of an asynchronous operation.