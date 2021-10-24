function DwjPromise(executor) {
  this.PromiseState = 'pending'
  this.PromiseResult = null
  this.callback = [] // 这里不写也行

  // resolve 函数
  function resolve(data) {
    // 状态只能修改一次
    if (this.PromiseState !== 'pending') return
    // 修改对象的状态
    this.PromiseState = 'fulfilled'
    // 修改对象结果值
    this.PromiseResult = data
    // 调用成功的回调函数
    if (this.callback.length > 0) {
      this.callback.forEach((item) => {
        item.onResolved(data)
      })
    }
  }

  // reject 函数
  function reject(data) {
    // 状态只能修改一次
    if (this.PromiseState !== 'pending') return
    // 修改对象的状态
    this.PromiseState = 'rejected'
    // 修改对象结果值
    this.PromiseResult = data
    // 调用失败的回调函数
    if (this.callback.length > 0) {
      this.callback.forEach((item) => {
        item.onRejected(data)
      })
    }
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
  return new Promise((resolve, reject) => {
    // 调用回调函数 // 同步
    if (this.PromiseState === 'fulfilled') {
      try {
        // 获取回调函数的执行结果
        let result = onResolved(this.PromiseResult)
        if (result instanceof DwjPromise) {
          // 如果是 Promise 实例
          result.then(
            (value) => {
              resolve(value)
            },
            (reason) => {
              reject(reason)
            }
          )
        } else {
          // 结果的对象状态为成功
          resolve(result)
        }
      } catch (error) {
        reject(error)
      }
    }

    if (this.PromiseState === 'rejected') {
      onRejected(this.PromiseResult)
    }

    // 判断 pending 状态 // 异步
    if (this.PromiseState === 'pending') {
      // 保存回调函数到实例对象中
      this.callback.push({
        onResolved,
        onRejected,
      })
    }
  })
}
