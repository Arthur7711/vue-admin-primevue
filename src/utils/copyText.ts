import { notification } from 'ant-design-vue'

export default (text: string) => {
  if (!navigator.clipboard) return
  navigator.clipboard.writeText(text)
  notification.success({ message: 'copied to clipboard' })
}
