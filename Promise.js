const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'
class Promise{
  constructor(func){
    this.PromiseState = PENDING
    this.PromiseResult = null
    this.onResolvedCallbacks = []
    this.onRejectedCallbacks = []
    const resolve = (value) =>{
      if(this.PromiseState === PENDING){
        setTimeout(() => {
          this.PromiseState = FULFILLED
          this.PromiseResult = value
          this.onResolvedCallbacks.forEach(callback => {
            callback(value)
          })
        });
      }
    }
    const reject = (reason) =>{
      if(this.PromiseState === PENDING){
        setTimeout(() => {
          this.PromiseState = REJECTED
          this.PromiseResult = reason
          this.onRejectedCallbacks.forEach(callback => {
            callback(reason)
          })
        });
      }
    }
    try {
      func(resolve,reject)
    } catch (error) {
      reject(error)
    }
  }
  then(onResolved,onRejected){
    onResolved = typeof onResolved === 'function' ? onResolved : value => value
    onRejected = typeof onRejected === 'function' ? onRejected : reason => {
      throw reason
    }
    let promise2 = new Promise((resolve,reject) => {
      if(this.PromiseState === PENDING){
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onResolved(this.PromiseResult)
              resolvePromise(promise2,x,resolve,reject)
            } catch (error) {
              reject(error)
            } 
          });
        })
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.PromiseResult)
              resolvePromise(promise2,x,resolve,reject)
            } catch (error) {
              reject(error)
            } 
          });
        })
      }else if(this.PromiseState === FULFILLED){
        setTimeout(() => {
          try {
            let x = onResolved(this.PromiseResult)
            resolvePromise(promise2,x,resolve,reject)
          } catch (error) {
            reject(error)
          } 
        });
      }else if(this.PromiseState === REJECTED){
        setTimeout(() => {
          try {
            let x = onRejected(this.PromiseResult)
            resolvePromise(promise2,x,resolve,reject)
          } catch (error) {
            reject(error)
          } 
        });
      }
    })
    return promise2
  }
  catch(onRejected){
    return this.then(undefined,onRejected)
  }
}
function resolvePromise(promise2,x,resolve,reject){
  if(x === promise2){
    return reject(new TypeError('chaining cycle dected for promise'))
  }
  if(x instanceof Promise){
    if(x.PromiseState === PENDING){
      x.then(y => {
        resolvePromise(promise2,y,resolve,reject)
      },reject)
    }else if (x.PromiseState === FULFILLED){
      resolve(x.PromiseResult)
    }else if (x.PromiseState === REJECTED){
      reject(x.PromiseResult)
    }
  }else if(x !== null && (typeof x === 'function' || typeof x === 'object')){
    try {
      var then = x.then
    } catch (error) {
      return reject(error)
    }
    if(typeof then === 'function'){
      let called = false
      try {
        then.call(x,y => {
          if(called) return 
          called = true
          resolvePromise(promise2,y,resolve,reject)
        },r => {
          if(called) return
          called = true
          reject(r)
        })
      } catch (error) {
        if(called) return 
        called = true
        reject(error)
      }
    }else{
      resolve(x)
    }
  }else{
    return resolve(x)
  }
}
Promise.resolve = (value) => {
  if(value instanceof Promise){
    return value
  }else if(value instanceof Object && 'then' in value && typeof value.then === 'function'){
    return new Promise((resolve,reject) => {
      data.then(resolve,reject)
    })
  }else{
    return new Promise((reslove,reject) => {
      this.resolve(value)
    })
  }
}
Promise.reject = (reason) => {
  return new Promise((resolve,reject) => {
    reject(reason)
  })
}
Promise.all = (promises) => {
  return new Promise((resolve,reject)=>{
    if(Array.isArray(promises)){
      if(promises.length === 0){
        return this.resolve(data)
      }
      let count = 0
      let result = []
      promises.forEach((promise,index) => {
        Promise.resolve(promise).then(s => {
          count++
          result[index] = s
          if(count === promises.length){
            resolve(result)
          }
        },e => {
          reject(e)
        })
      })
    }else{
      return reject(new TypeError('Argument is not inerable'))
    }
  })
}
Promise.race = (promises) => {
  return new Promise((resolve,reject) => {
    if(Array.isArray(promises)){
      data.forEach(promise =>{
        Promise.resolve(promise).then(s => {
          resolve(s)
        },e => {
          reject(e)
        })
      })
    }else{
      return reject(new TypeError('Argument is not iterable'))
    }
  })
}
Promise.deferred = function () {
  let result = {};
  result.promise = new Promise((resolve, reject) => {
      result.resolve = resolve;
      result.reject = reject;
  });
  return result;
}
module.exports = Promise;
