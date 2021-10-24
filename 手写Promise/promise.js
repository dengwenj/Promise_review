function DwjPromise(executor) {
  this.PromiseState = 'pending'
  this.PromiseResult = null

  // resolve 函数
  function resolve(data) {
    // 状态只能修改一次
    if (this.PromiseState !== 'pending') return
    // 修改对象的状态
    this.PromiseState = 'fulfilled'
    // 修改对象结果值
    this.PromiseResult = data
  }

  // reject 函数
  function reject(data) {
    // 状态只能修改一次
    if (this.PromiseState !== 'pending') return
    // 修改对象的状态
    this.PromiseState = 'rejected'
    // 修改对象结果值
    this.PromiseResult = data
  }

  try {
    // 同步调用 executor
    executor(resolve.bind(this), reject.bind(this)) // 这里 resolve 和 reject 是直接调用的，所以 this 的指向是 window 要改变 this 的指向
  } catch (error) {
    // throw 抛出异常改变状态
    reject.call(this, error)
  }
}

// 添加 then 方法
DwjPromise.prototype.then = function (onResolved, onRejected) {
  // 调用回调函数
  if (this.PromiseState === 'fulfilled') {
    onResolved(this.PromiseResult)
  }

  if (this.PromiseState === 'rejected') {
    onRejected(this.PromiseResult)
  }
}
