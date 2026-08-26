export const id = () => crypto.randomUUID();
export const now = () => new Date().toISOString();
export const dateKey = (date: Date) => date.toLocaleDateString("en-CA");
export const todayKey = () => dateKey(new Date());
export const getDeviceId = () => {
  const key = "samwise-device-id";
  let value = localStorage.getItem(key);
  if (!value) {
    value = id();
    localStorage.setItem(key, value);
  }
  return value;
};
