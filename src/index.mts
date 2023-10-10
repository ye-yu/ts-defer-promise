import {AsyncLocalStorage} from 'node:async_hooks';

const deferStorage = new AsyncLocalStorage<Function[]>()

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
    promiseValue = fn().finally(() => {
      const functions = deferStorage.getStore();
      if (!functions) return;
      return Promise.all(functions.map(e => e())).then(e => e?.find(e => e) ?? void 0);
    })
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
