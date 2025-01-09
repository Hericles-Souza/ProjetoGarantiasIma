import { Button as AntButton, ButtonProps as AntButtonProps } from 'antd'

type ButtonProps = Omit<AntButtonProps, 'type'> & {
  type?: 'dashed' | 'default' | 'link' | 'primary' | 'text' | undefined | 'new' | 'ghost' | 'danger'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  childrenClassName?: string
}

export const Button = (props: ButtonProps) => {
  const {
    type,
    disabled,
    className,
    children,
    leftIcon,
    rightIcon,
    loading,
    childrenClassName,
    ...rest
  } = props

  const isNew = type === 'new'
  const isDanger = type === 'danger'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _type: any = isNew ? 'primary' : type

  let backgroundColor = ''

  if (isNew && !disabled) {
    backgroundColor = 'bg-green-600 hover:bg-green-800'
  } else if (isDanger && !disabled) {
    backgroundColor = 'bg-red-600 hover:bg-red-800 text-white'
  }

  return (
    <AntButton
      {...rest}
      type={_type}
      style={{
        fontWeight: 500,
        ...props.style,
      }}
      loading={loading}
      className={`${backgroundColor} flex items-center justify-center ${className}`}
      disabled={disabled}
    >
      {leftIcon && <div className='flex items-center mr-2'>{leftIcon}</div>}
      <div className={`${childrenClassName} flex items-center justify-center flex-1 truncate`}>
        {children}
      </div>
      {rightIcon && <div className='flex items-center ml-2'>{rightIcon}</div>}
    </AntButton>
  )
}
