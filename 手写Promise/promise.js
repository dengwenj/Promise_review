function DwjPromise(executor) {
  // resolve 函数
  function resolve(data) {}

  // reject 函数
  function reject(data) {}

  // 同步调用 executor
  executor(resolve, reject)
}

// 添加 then 方法
DwjPromise.prototype.then = function (onResolved, onRejected) {}
