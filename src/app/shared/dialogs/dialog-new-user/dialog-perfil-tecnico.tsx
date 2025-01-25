import {InputAdornment, TextField} from '@mui/material';
import {Button, Form, message, Space, Typography,} from 'antd';
import React, {useState} from 'react';
import './dialog.style.css'


const DialogUserRegistrationTecnic: React.FC = ({...props}) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [value, setValue] = useState('');
  const [form] = Form.useForm();


  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleGeneratePassword = () => {
    const randomPassword = Math.random().toString(36).slice(-8);
    form.setFieldsValue({password: randomPassword});
  };

  const handleCopyPassword = () => {
    const password = form.getFieldValue('password');
    if (password) {
      navigator.clipboard.writeText(password)
        .then(() => message.success('Senha copiada para a área de transferência!'))
        .catch(() => message.error('Falha ao copiar a senha.'));
    } else {
      message.warning('Nenhuma senha para copiar.');
    }
  };

  const handleSubmit = () => {
    form.validateFields()
      .then((values) => {
        console.log("Form Values:", values);
        closeModal();
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  return (

    <div>
      <div style={{justifyContent: 'space-between', left: '32px', borderBottom: '1px solid #ddd', width: '100%'}}>
        <Space>
          <Typography style={{
            fontWeight: 'bold',
            fontSize: '16px',
            color: '#FF0000',
            height: '50px',
            width: '200px',
            marginLeft: '140px',
          }}>CRIAR NOVO USUÁRIO</Typography>
        </Space>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          profile: "Cliente",
          isActive: true,
          password: "Q1234icL3M4",
        }}


      >

        <Space direction="horizontal" style={{width: "100%"}}>
          <TextField
            label="Nome"
            variant="outlined"
            value={value}
            onChange={handleChange}
            fullWidth
            focused
            required
            className="outlined-input-name"
            placeholder="Aaaaaaaaa"
            {...props}
            style={{width: '100%',}}
          />
        </Space>

        <Space direction="horizontal" style={{width: "100%",}}>
          <TextField
            label="E-mail"
            variant="outlined"
            value={value}
            onChange={handleChange}
            fullWidth
            focused
            required
            placeholder="bbbbb@bb.com"
            className="outlined-input-contact"
            {...props}
            style={{width: '100%',}}
          />
        </Space>

        <TextField
          label="Senha Provisória"
          variant="outlined"
          value={form.getFieldValue("password")}
          onChange={(e) => form.setFieldsValue({password: e.target.value})}
          fullWidth
          focused
          required
          placeholder="Senha Provisória"
          className="outlined-input-password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  type="link"
                  onClick={handleGeneratePassword}
                  style={{
                    minWidth: "auto",
                    padding: 0,
                    left: '235px',
                  }}
                >
                  🔄
                </Button>
                <Button
                  type="link"
                  onClick={handleCopyPassword}
                  style={{
                    minWidth: "auto",
                    padding: 0,
                    left: '240px'
                  }}
                >
                  📋
                </Button>
              </InputAdornment>
            ),
          }}
          style={{width: "220px"}}
        />
        <div style={{display: "flex", justifyContent: "space-between"}}>
          <Button onClick={closeModal} style={{backgroundColor: "white", color: "red"}}>
            CANCELAR
          </Button>
          <Button type="primary" onClick={handleSubmit} style={{backgroundColor: "red"}}>
            CRIAR
          </Button>
        </div>
      </Form>


    </div>

  );
};

export default DialogUserRegistrationTecnic;
