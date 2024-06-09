export default (time) => {
  const seconds = (new Date() - new Date(time)) / 1000
  if (seconds < 60) {
    return seconds.toFixed() + ' sec'
  }

  const minutes = seconds / 60
  if (minutes < 60) {
    return minutes.toFixed() + ' min'
  }

  const hours = minutes / 60
  if (hours < 24) {
    const hoursStr = hours.toFixed() > 1 ? ' hours' : ' hour'
    return hours.toFixed() + hoursStr
  }

  const days = hours / 60
  const daysStr = hours.toFixed() > 1 ? ' days' : ' day'
  return days.toFixed() + daysStr
}
