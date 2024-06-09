export default (data) => {
  return new Date(data).toLocaleDateString('ru-RU').split('.').reverse().join('-')
}
