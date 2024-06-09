export default function formatTime(time: number) {
  if (time === 0) return 0;
  if (time) {
    const minutes = Math.floor(time / 60);
    if (minutes < 60) return minutes + " m";
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes - hours * 60}m`;
  }
}
