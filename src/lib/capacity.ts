export function usableCapacity(workMinutes: number, reservePercent: number) {
  return Math.max(0, Math.round(workMinutes * (1 - reservePercent / 100)));
}
export function capacityState(planned: number, usable: number) {
  if (planned <= usable) return "comfortable";
  if (planned <= usable * 1.2) return "tight";
  return "over";
}
export function constrainedCapacity(
  workMinutes: number,
  reservePercent: number,
  busyMinutes: number,
  transitionMinutes = 0,
) {
  return Math.max(
    0,
    usableCapacity(workMinutes, reservePercent) -
      busyMinutes -
      transitionMinutes,
  );
}
