// Fallback In-Memory Redis Mock for MVP without Docker
const store = new Map();

const connectRedis = async () => {
  console.log('Mock Redis (In-Memory) Connected (No installation required)');
};

const getRedisClient = () => {
  return {
    async get(key) {
      const item = store.get(key);
      if (!item) return null;
      if (item.expiresAt && Date.now() > item.expiresAt) {
        store.delete(key);
        return null;
      }
      return item.value;
    },
    async set(key, value, options = {}) {
      const expiresAt = options.EX ? Date.now() + options.EX * 1000 : null;
      store.set(key, { value, expiresAt });
      return 'OK';
    },
    async incr(key) {
      let item = store.get(key);
      let val = item && item.value ? parseInt(item.value, 10) : 0;
      val += 1;
      store.set(key, { value: val.toString(), expiresAt: item ? item.expiresAt : null });
      return val;
    },
    async expire(key, seconds) {
      const item = store.get(key);
      if (item) {
        item.expiresAt = Date.now() + seconds * 1000;
        store.set(key, item);
      }
    },
    async del(key) {
      store.delete(key);
    }
  };
};

module.exports = { connectRedis, getRedisClient };
