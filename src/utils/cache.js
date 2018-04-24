function defaultCacheKey(args) {
  return args.join(',');
}

function cachingDecorator(func, cacheKey = defaultCacheKey) {
  let cache = new Map();

  return function(...args) {
    const key = cacheKey(args);
    if (cache.has(key)) {
      console.log(`Cache Hit: ${key}`);
      return cache.get(key);
    }

    const result = func.call(this, ...args);
    if (result instanceof Promise) {
      return result.then(value => {
        cache.set(key, value);
        return value;
      });
    } else {
      cache.set(key, result);
      return result;
    }
  };
}

module.exports = {
  cachingDecorator,
};
