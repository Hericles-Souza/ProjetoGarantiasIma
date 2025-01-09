import { Card as AntCard, CardProps as AntCardProps } from 'antd'

type CardProps = AntCardProps

export const Card = (props: CardProps) => {
  return <AntCard {...props} headStyle={{ fontSize: 14 }} />
}
