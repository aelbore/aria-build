export function settle(promises) {
  return Promise.resolve(promises).then(_settle);
}

function _settle(promises) {
  if (!Array.isArray(promises)) throw new TypeError('Expected an array of Promises');

  return Promise.all(promises.map(_settlePromise));
}

function _settlePromise(promise) {
  return Promise
    .resolve(promise)
    .then(_promiseResolved, _promiseRejected);
}

function _promiseResolved(result) {
  return {
    isFulfilled: () => true,
    isRejected: () => false,
    value: () => result,
    reason: _isFulfilled
  }
}

function _promiseRejected(err) {
  return {
    isFulfilled: () => false,
    isRejected: () => true,
    reason: () => err,
    value: _isRejected
  }
}

function _isRejected() {
  throw new Error('Promise is rejected');
}

function _isFulfilled() {
  throw new Error('Promise is fulfilled');
}