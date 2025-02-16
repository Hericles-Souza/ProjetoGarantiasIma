import React, { useState } from 'react'
import { Button, Form, message, Modal } from 'antd'
import Input from 'antd/lib/input'
import InputMask from 'react-input-mask';
import environment from "@env/environment.ts";

interface CreateAccountProps {
  isVisible: boolean
  onClose: () => void
}

const DialogCreateAccount: React.FC<CreateAccountProps> = ({ isVisible, onClose }) => {
  const [form] = Form.useForm()
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleFocus = (field: string) => {
    setFocusedField(field);
  };
  

  const onFinish = async () => {
    try {
      const requestBody = form.getFieldsValue();
      requestBody.CNPJ = cleanLastCharacter(requestBody.CNPJ);
      requestBody.phone = cleanLastCharacter(requestBody.phone);
      console.log(JSON.stringify(requestBody));
      const response = await fetch(environment.apiUrl + '/user/send-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        message.success('Solicitação de cadastro enviada com sucesso!')
        form.resetFields()
        onClose()
      } else {
        message.error('Ocorreu um erro ao enviar a solicitação.')
      }
    } catch (error) {
      message.error('Erro ao enviar a solicitação.')
    }
  }

  const cleanLastCharacter = (value: string) => {
    // Remover o último caractere se for um espaço em branco ou qualquer outro caractere
    return value.trim().slice(0, -1);
  };

  return (
    <Modal
      title="Solicitar Cadastro"
      visible={isVisible}
      onCancel={onClose}
      footer={null}
      centered
      style={{ fontSize: '25px' }}
    >
      <p
        style={{
          height: '55px',
          fontSize: '18px',
          borderRadius: '10px',
          fontWeight: '300',
          color: 'grey',
        }}
      >
        Insira as informações de cadastro aqui.
      </p>
      <Form
        form={form}
        name='trigger'
        style={{ maxWidth: 600 }}
        layout='vertical'
        autoComplete='off'
      >
        <Form.Item
          hasFeedback
          label='CNPJ'
          name='CNPJ'
          rules={[{ required: true, message: 'CNPJ é obrigatório!' }]}
        >
          <InputMask
            mask="99.999.999/9999-99" // Máscara para CNPJ
            maskChar={null} // Não exibe o caractere de máscara (underscore)
            onFocus={() => handleFocus('CNPJ')}
          >
            {(inputProps: any) => (
              <Input
                {...inputProps} // Passa as props para o Input
                placeholder="00.000.000/0000-00"
                style={{
                  height: '50px',
                  fontSize: '18px',
                  borderRadius: '10px',
                  borderColor: focusedField === 'CNPJ' ? 'red' : '',
                }}
                
              />
            )}
          </InputMask>
        </Form.Item>
        <Form.Item
          hasFeedback
          label='Razão Social'
          name='corporateName'
          rules={[{ required: true, message: 'Razão Social é obrigatória!' }]}
        >
          <Input
            placeholder='Digite seu Razão Social'
            style={{
              height: '50px', fontSize: '18px', borderRadius: '10px', borderColor: focusedField === 'corporateName' ? 'red' : '',
            }}
            onFocus={() => handleFocus('corporateName')}

          />
        </Form.Item>
        <Form.Item
          hasFeedback
          label='Telefone'
          name='phone'
          rules={[{ required: true, message: 'Telefone é obrigatório!' }]}
        >
          <InputMask
            mask="+55 54 99999-9999" // Máscara para Telefone
            maskChar={null}
            onFocus={() => handleFocus('phone')}
          >
            {(inputProps: any) => (
              <Input
                {...inputProps}
                placeholder="+55 54 99999-9999"
                style={{
                  height: '50px',
                  fontSize: '18px',
                  borderRadius: '10px',
                  borderColor: focusedField === 'phone' ? 'red' : '',
                }}
              />
            )}
          </InputMask>
        </Form.Item>
        <Form.Item
          hasFeedback
          label='E-mail'
          name='email'
          rules={[
            {
              type: 'email',
              message: 'Por favor, insira um e-mail válido!',
            },
            {
              required: true,
              message: 'E-mail é obrigatório!',
            },
          ]}
        >
          <Input
            placeholder='Digite seu E-mail'
            style={{ height: '50px', fontSize: '18px', borderRadius: '10px' , borderColor: focusedField === 'email' ? 'red' : ''}}
            onFocus={() => handleFocus('email')}
          />
        </Form.Item>
        <Button
          size='large'
          type='primary'
          htmlType='submit'
          className='w-full mt-10'
          style={{
            height: '55px',
            textAlign: 'center',
            backgroundColor: 'red',
            borderRadius: 15,
            fontSize: 19,
          }}
          onClick={onFinish}
        >
          Enviar Solicitação de Cadastro
        </Button>
      </Form>
    </Modal>
  )
}

export default DialogCreateAccount
