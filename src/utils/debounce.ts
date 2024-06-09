export default (func: Function, delay: number, immediate: boolean) => {
  let timeout: any

  return function () {
    const context = this
    const args = arguments
    const callNow = immediate && !timeout

    clearTimeout(timeout)

    timeout = setTimeout(() => {
      timeout = null
      if (!immediate) func.apply(context, args)
    }, delay)

    if (callNow) func.apply(context, args)
  }
}