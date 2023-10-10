import {AsyncLocalStorage} from 'node:async_hooks';

const deferStorage = new AsyncLocalStorage<Function[]>()

Promise.prototype.defer = function (this) {
  const functions = deferStorage.getStore();
  if (!functions) return this;
  return this.finally(() => Promise.all(functions.map(e => e())));
}

function defer(fn: Function) {
  const functions = deferStorage.getStore();
  if (!functions) {
    throw new Error("Defer is not initialized")
  }
  functions.push(fn)
}

function useDefer<T>(fn: () => Promise<T>): Promise<T> {
  let promiseValue: Promise<T> | null = null;
  deferStorage.run([], () => {
    promiseValue = fn().defer()
  })

  return promiseValue!
}

async function deferTest() {
  defer(() => {
    const fns = deferStorage.getStore()?.map(e => e.toString())
    console.log("defer 1", fns);
  })
  console.log("not defer")
  return 1
}

async function deferTest2() {
  defer(() => {
    const fns = deferStorage.getStore()?.map(e => e.toString())
    console.log("defer 2", fns);
  })
  console.log("not defer 2")
  return 1
}

useDefer(deferTest)
useDefer(deferTest2)

