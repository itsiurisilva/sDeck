// Pure, side-effect-free validation helpers shared by server.js and tests.

export function generatePin() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function isValidPin(pin, expectedPin) {
  return typeof pin === 'string' && pin.length > 0 && pin === expectedPin;
}

export function isLocalRequest(req) {
  const ip = req.socket?.remoteAddress || '';
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
}

export function isValidProfile(profile) {
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) return false;
  if (!Number.isInteger(profile.rows) || profile.rows < 1 || profile.rows > 20) return false;
  if (!Number.isInteger(profile.cols) || profile.cols < 1 || profile.cols > 20) return false;
  if (typeof profile.buttons !== 'object' || profile.buttons === null || Array.isArray(profile.buttons)) return false;
  return true;
}

export function isValidProfilesPayload(profiles) {
  if (!profiles || typeof profiles !== 'object' || Array.isArray(profiles)) return false;
  const entries = Object.values(profiles);
  if (entries.length === 0) return false;
  return entries.every(isValidProfile);
}
