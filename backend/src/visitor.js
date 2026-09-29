// Turns a request's client IP into a daily, salted, one-way fingerprint.
const crypto = require('node:crypto');

// x-forwarded-for looks like "203.0.113.7:51234" or "203.0.113.7, 10.0.0.1".
// The first entry is the real client. Strip the port if there is one.
function clientIp(forwardedFor) {
  if (!forwardedFor) return null;
  let ip = forwardedFor.split(',')[0].trim();
  if (ip.startsWith('[')) return ip.slice(1, ip.indexOf(']'));  // [IPv6]:port
  if (ip.split(':').length === 2) ip = ip.split(':')[0];          // IPv4:port
  return ip || null;
}

// Same IP + same UTC day + same salt => same id. Different day => new id.
function visitorId(ip, salt, date = new Date()) {
  if (!salt) throw new Error('VISITOR_HASH_SALT is not set');
  const day = date.toISOString().slice(0, 10); // e.g. 2026-09-29
  return crypto.createHmac('sha256', salt).update(`${ip}|${day}`).digest('hex');
}

module.exports = { clientIp, visitorId };