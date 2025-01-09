import styled from 'styled-components'
import { Input as AntInput, InputProps as AntInputProps } from 'antd'
import { Tooltip } from '../tooltip'
import { TbQuestionMark } from 'react-icons/tb'
import { Label } from '../label'

const Error = styled.div`
  padding: 4px 0 2px 0;
  font-size: 12px;
  color: #ff4d4f;
`

type InputProps = AntInputProps & {
  label?: string
  normalize?: (value: string) => void
  uppercase?: boolean
  helpText?: string
  errorMessage?: string
}

export const Input = (props: InputProps) => {
  const {
    label,
    normalize,
    uppercase,
    className,
    errorMessage,
    helpText,
    ...rest
  } = props

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (normalize) {
      return normalize(value)
    }
    return uppercase ? value.toUpperCase() : value
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
        className={className}
        {...rest}
      />
      {errorMessage && <Error>{errorMessage}</Error>}
    </>
  )
}
