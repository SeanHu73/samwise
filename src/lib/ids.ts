export const id = () => crypto.randomUUID();
export const now = () => new Date().toISOString();
export const todayKey = () => new Date().toLocaleDateString("en-CA");
export const getDeviceId = () => {
  const key = "samwise-device-id";
  let value = localStorage.getItem(key);
  if (!value) {
    value = id();
    localStorage.setItem(key, value);
  }
  return value;
};
