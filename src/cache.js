const INVALID_TTL = -1;

export default class InternalCache {
  constructor() { }
  _memory = new Map();

  set = function (key, value, ttl) {
    let data;
    let oldData = this._memory.get(key);
    if (typeof oldData !== "undefined") {
      if (oldData.cancelTimeout) {
        clearTimeout(oldData.cancelTimeoutID);
      }
      this._memory.delete(key);
    }
    if ((typeof ttl !== "undefined") && (!Number.isNaN(ttl)) && (ttl > 0)) {
      data = {
        value,
        ___expires: (Date.now() + (ttl * 1000))
      };
    }
    else {
      data = value;
    }
    if (data.___expires) {
      data.cancelTimeoutID = setTimeout(() => {
        this._memory.delete(key);
      }, ttl * 1000);
    }
    this._memory.set(key, data);
    return true;
  }

  get = function (key) {
    const data = this._memory.get(key);
    if ((data) && (data.___expires)) {
      return data.value;
    }
    return data;
  }

  getTtl = function (key) {
    const data = this._memory.get(key);
    if ((data) && (data.___expires)) {
      return data.___expires;
    }
    return INVALID_TTL;
  }

}