/** Leaf-green status clock for the console top bar. */
export function clockText(now = new Date()): string {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  let hour = now.getHours();
  const suffix = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  const minute = String(now.getMinutes()).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${days[now.getDay()]} ${day} ${hour}:${minute}${suffix}`;
}
