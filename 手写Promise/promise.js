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
  if (typeof onRejected !== 'function') {
    onRejected = (reason) => {
      throw reason
    }
  }
  if (typeof onResolved !== 'function') {
    onResolved = (value) => value
  }

  return new Promise((resolve, reject) => {
    // 封装函数
    function encapsulation(type, data) {
      try {
        // 获取回调函数的执行结果
        let result = type(data)
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

    // 调用回调函数 // 同步
    if (this.PromiseState === 'fulfilled') {
      encapsulation(onResolved, this.PromiseResult)
    }

    if (this.PromiseState === 'rejected') {
      encapsulation(onRejected, this.PromiseResult)
    }

    // 判断 pending 状态 // 异步
    if (this.PromiseState === 'pending') {
      // 保存回调函数到实例对象中
      this.callback.push({
        // 执行成功回调函数
        onResolved(data) {
          encapsulation(onResolved, data)
        },
        // 执行失败回调函数
        onRejected(data) {
          encapsulation(onRejected, data)
        },
      })
    }
  })
}

// 添加 catch 方法
DwjPromise.prototype.catch = function (onRejected) {
  return this.then(undefined, onRejected)
}

// 添加 resolve 方法
DwjPromise.resolve = function (value) {
  // 返回 Promise 对象
  return new DwjPromise((resolve, reject) => {
    if (value instanceof DwjPromise) {
      value.then(
        (value) => {
          resolve(value)
        },
        (reason) => {
          reject(reason)
        }
      )
    } else {
      resolve(value)
    }
  })
}

// 添加 reject 方法
DwjPromise.reject = function (reason) {
  // 返回 Promise 对象 永远都是失败的，失败的值就是传入的值
  return new DwjPromise((resolve, reject) => {
    reject(reason)
  })
}

// 添加 all 方法
DwjPromise.all = function (arr) {
  return new DwjPromise((resolve, reject) => {
    let arr1 = []
    arr.forEach((item, index) => {
      item.then(
        (value) => {
          // arr1.push(value) // 这样写 异步的话顺序就不一样
          arr1[index] = value
          if (arr1.length === arr.length) resolve(arr1)
        },
        (reason) => {
          reject(reason)
        }
      )
    })
  })
}

// 添加 race 方法  谁快用谁
DwjPromise.race = function (arr) {
  return new Promise((resolve, reject) => {
    arr.forEach((item) => {
      item.then(
        (value) => {
          resolve(value)
        },
        (reason) => {
          reject(reason)
        }
      )
    })
  })
}
