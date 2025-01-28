import {Checkbox, InputAdornment, TextField} from '@mui/material';
import {Button, Form, message, Space, Typography,} from 'antd';
import React, {useEffect, useState} from 'react';
import './dialog.style.css'
import {RuleModel} from "@shared/models/RuleModel.ts";
import {getRules} from "@shared/services/RuleService.ts";

interface DialogUserRegistrationProps {
  closeModal: () => void;
  onSearch: () => void;
}

const DialogUserRegistration: React.FC<DialogUserRegistrationProps> = ({closeModal, onSearch}) => {
  const [value, setValue] = useState('');
  const [form] = Form.useForm();
  const [rule, setRule] = useState<RuleModel[] | null>(null);

  const handleGeneratePassword = () => {
    const randomPassword = Math.random().toString(36).slice(-8);
    form.setFieldsValue({password: randomPassword});
  };

  useEffect(() => {
    getRules().then((response) => {
      console.log('Fetched rules:', response.data.data);  // Log to verify the structure
      setRule(response.data.data);
    }).catch((error) => {
      console.error("Error fetching rules", error);
    });
  }, []);



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
        onSearch();
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
      <div
        style={{
          justifyContent: 'space-between',
          left: '32px',
          borderBottom: '1px solid #ddd',
          marginBottom: '25px',
          width: '100%'
        }}>
        <Space>
          <Typography
            style={{
              fontWeight: 'bold',
              fontSize: '16px',
              color: '#FF0000',
              height: '40px',
              width: '200px',
              marginLeft: '140px',
              marginBottom: '0px',
              paddingBottom: '0px'
            }}>
            CRIAR NOVO USUÁRIO
          </Typography>
        </Space>
      </div>


      <Space direction="horizontal" style={{width: "100%"}}>
        <TextField
          id="input-container-select"
          select
          label="Perfil"
          defaultValue="EUR"
          focused
          className="outlined-input-select"
          required
          slotProps={{
            select: {
              native: true,
            },
          }}
          style={{width: '265px',}}
        >
          {rule && rule?.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </TextField>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <Checkbox
            defaultChecked
            //className='outlined-input-select'
            sx={{
              color: '#FF0000',
              '&.Mui-checked': {
                color: '#FF0000',
              },
              marginTop: '-22px',
            }}
          />
          <span style={{marginTop: '-22px'}}>Usuário Ativo</span>
        </div>
      </Space>
      <Space direction="horizontal" style={{width: "100%"}}>
        <TextField
          label="CNPJ"
          variant="outlined"
          value={value}
          onChange={handleChange}
          fullWidth
          focused
          required
          className="outlined-input-cnpj"
          placeholder="000.000.000/0001-00"
          style={{width: '220px',}}
        />


        <TextField
          label="Código Cigam"
          variant="outlined"
          value={value}
          onChange={handleChange}
          fullWidth
          focused
          required
          className="outlined-input-cnpj"
          placeholder="65465465465465"
          style={{width: '220px',}}
        />

      </Space>
      <Space style={{width: '100%'}}>
        <TextField
          label="Razão social"
          variant="outlined"
          value={value}
          onChange={handleChange}
          fullWidth
          required
          focused
          placeholder="Razão Social"
          className="outlined-input-razao"
          style={{width: '100%',}}
        />
      </Space>

      <Space direction="horizontal" style={{width: "100%",}}>
        <TextField
          label="Telefone"
          variant="outlined"
          value={value}
          onChange={handleChange}
          fullWidth
          focused
          required
          placeholder="00 0000 0000"
          className="outlined-input-contact"
          style={{width: '220px',}}
        />


        <TextField
          label="E-mail"
          variant="outlined"
          value={value}
          onChange={handleChange}
          fullWidth
          focused
          required
          placeholder="00 0000 0000"
          className="outlined-input-contact"
          style={{width: '220px',}}
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
    </div>

  );
};

export default DialogUserRegistration;
