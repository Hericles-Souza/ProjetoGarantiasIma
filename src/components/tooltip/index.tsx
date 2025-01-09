import { Tooltip as AntTooltip, TooltipProps as AntTooltipProps } from 'antd'

type TooltipProps = AntTooltipProps

export const Tooltip = (props: TooltipProps) => {
  return <AntTooltip {...props} style={{ maxHeight: '10px' }} />
}
