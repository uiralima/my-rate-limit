//import NodeCache from "node-cache";
import InternalCache from "./cache.js";
//const cache = new NodeCache();
const cache = new InternalCache();

const getId = (req) => req.headers['x-forwarded-for'] || req.socket.remoteAddress;

export default function rateLimit ({
  time = 1000, 
  limit = 5,
  getIdHandler = getId
}) {

  const putHeaders = (res, limit, remaining, reset, id) => {
    res.header("RateLimit-Limit", limit);
    res.header("RateLimit-Remaining", remaining);
    res.header("RateLimit-Reset", reset);
  }

  return async function (req, res, next) {
    const id = getIdHandler(req); 

    const current = cache.get(id);

    if (!current) {
      putHeaders(res, limit, limit-1, time, id);
      cache.set(id, 1, time);
    }
    else {
      const newTTL = (cache.getTtl(id) - new Date()) / 1000;
      putHeaders(res, limit, limit - Math.min(limit, current+1), newTTL, id);
      if (current >= limit) {
        res.header("Retry-After", time);
        return res.status(429).send("Limit error");
      }
      cache.set(id, current+1, newTTL);
    }

    req.rateLimitData = {
      time: time,
      limit: limit,
      id
    };
    next();
  }
}