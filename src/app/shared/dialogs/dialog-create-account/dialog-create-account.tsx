import React from 'react'
import {Button, Form, message, Modal} from 'antd'
import Input from 'antd/lib/input'

interface CreateAccountProps {
  isVisible: boolean
  onClose: () => void
}

const DialogCreateAccount: React.FC<CreateAccountProps> = ({isVisible, onClose}) => {
  const [form] = Form.useForm()

  const onFinish = async (values: any) => {
    try {
      const response = await fetch('/api/cadastro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
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
        style={{maxWidth: 600}}
        layout='vertical'
        autoComplete='off'
        onFinish={onFinish}
      >
        <Form.Item
          hasFeedback
          label='CNPJ'
          name='cnpj'
          rules={[{required: true, message: 'CNPJ é obrigatório!'}]}
        >
          <Input
            placeholder='Digite seu CNPJ'
            style={{
              height: '50px',
              fontSize: '18px',
              borderRadius: '10px',
              borderColor: 'red',
            }}
          />
        </Form.Item>
        <Form.Item
          hasFeedback
          label='Razão Social'
          name='razaoSocial'
          rules={[{required: true, message: 'Razão Social é obrigatória!'}]}
        >
          <Input
            placeholder='Digite seu Razão Social'
            style={{height: '50px', fontSize: '18px', borderRadius: '10px'}}
          />
        </Form.Item>
        <Form.Item
          hasFeedback
          label='Telefone'
          name='phone'
          rules={[{required: true, message: 'Telefone é obrigatório!'}]}
        >
          <Input
            placeholder='Digite seu Telefone'
            style={{height: '50px', fontSize: '18px', borderRadius: '10px'}}
          />
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
            style={{height: '50px', fontSize: '18px', borderRadius: '10px'}}
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
        >
          Enviar Solicitação de Cadastro
        </Button>
      </Form>
    </Modal>
  )
}

export default DialogCreateAccount
