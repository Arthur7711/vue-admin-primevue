const bytesConversion = (num: number, pow: number = 3, isWithUnits: boolean = false) => {
  if (num > 0) {
    const current = Math.round(num / Math.pow(1024, pow) * 100) / 100
    if (current >= 0.1) {
      const result = +(pow > 0 ? current.toFixed(2) : current)
      if (isWithUnits) return result + [' B', ' kB', ' MB', ' GB', ' TB'][pow]
      return result
    }
    else return bytesConversion(num, pow - 1, isWithUnits)
  }
  return 0
}

export default bytesConversion
