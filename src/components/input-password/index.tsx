import { useState } from 'react'
import { Input as AntInput, InputProps as AntInputProps } from 'antd'
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons'
import { Label } from '../label'
import { Tooltip } from '../tooltip'
import { TbQuestionMark } from 'react-icons/tb'
import { styled } from 'styled-components'

const Error = styled.div`
  padding: 4px 0 2px 0;
  font-size: 12px;
  color: #ff4d4f;
`

type InputPasswordProps = AntInputProps & {
  label?: string
  normalize?: (value: string) => string
  uppercase?: boolean
  helpText?: string
  errorMessage?: string
}

export const InputPassword = ({
  label,
  normalize,
  uppercase,
  className,
  helpText,
  errorMessage,
  ...rest
}: InputPasswordProps) => {
  const [visible, setVisible] = useState(false)
  const [value, setValue] = useState('')

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value
    if (normalize) {
      newValue = normalize(newValue)
    } else if (uppercase) {
      newValue = newValue.toUpperCase()
    }
    setValue(newValue)
  }

  return (
    <>
      {label && (
        <Label>
          {label}
          {helpText && (
            <Tooltip title={helpText} className='mb-0 ml-1'>
              <TbQuestionMark className='rounded-full bg-neutral-200 mb-0' />
            </Tooltip>
          )}
        </Label>
      )}

      <AntInput
        autoComplete='off'
        onChange={handleChange}
        value={value}
        type={visible ? 'text' : 'password'}
        className={className}
        style={{ fontSize: '22px !important' }}
        suffix={
          <span onClick={toggleVisibility} style={{ cursor: 'pointer', paddingRight: '15px' }}>
            {visible ? (
              <EyeInvisibleOutlined
                className='text-neutral-900'
                style={{ fontSize: '24px !important' }}
              />
            ) : (
              <EyeOutlined style={{ fontSize: '24px !important' }} />
            )}
          </span>
        }
        {...rest}
      />

      {errorMessage && <Error>{errorMessage}</Error>}
    </>
  )
}
