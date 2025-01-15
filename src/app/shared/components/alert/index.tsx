import { Alert as AntAlert, AlertProps as AntAlertProps } from 'antd'

type AlertProps = AntAlertProps

export const Alert = (props: AlertProps) => {
  return <AntAlert {...props} />
}
