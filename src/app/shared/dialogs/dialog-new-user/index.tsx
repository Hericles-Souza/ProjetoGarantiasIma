import {Checkbox, InputAdornment, TextField} from '@mui/material';
import {Button, message, Typography,} from 'antd';
import React, {useEffect, useState} from 'react';
import './dialog.style.css'
import style from "./style.module.css";
import {RuleModel} from "@shared/models/RuleModel.ts";
import {getRules} from "@shared/services/RuleService.ts";
import {useFormik} from "formik";
import * as Yup from 'yup';
import {PiCopySimpleLight} from "react-icons/pi";
import {TfiReload} from "react-icons/tfi";
import InputMask from 'react-input-mask';

interface DialogUserRegistrationProps {
  closeModal: () => void;
  onSearch: () => void;
}

const DialogUserRegistration: React.FC<DialogUserRegistrationProps> = ({closeModal, onSearch}) => {
  const [rule, setRule] = useState<RuleModel[] | null>(null);
  const [selectedProfile, setSelectedProfile] = useState('');
  const typeRule = "Técnico";
  const generatePassword = () => Math.random().toString(36).slice(-8);

  const formik = useFormik({
    initialValues: {
      profile: '',
      cnpj: '',
      cigamCode: '',
      companyName: '',
      phone: '',
      email: '',
      password: generatePassword(),
      isActive: true,
    },
    validationSchema: Yup.object({
      cnpj: Yup.string().required('CNPJ obrigatório'),
      cigamCode: Yup.string().required('Código Cigam obrigatório'),
      companyName: Yup.string().required('Razão Social obrigatória'),
      phone: Yup.string().required('Telefone obrigatório'),
      email: Yup.string().email('E-mail inválido').required('E-mail obrigatório'),
    }),
    onSubmit: (values) => {
      console.log('Form Values:', values);
      onSearch();
    },
  });

  useEffect(() => {
    getRules()
      .then((response) => {
        setRule(response.data.data);
      })
      .catch((error) => {
        console.error('Error fetching rules', error);
      });
  }, []);

  useEffect(() => {
    formik.resetForm();
    formik.setFieldValue('password', generatePassword());
  }, [closeModal]);

  const handleCopyPassword = () => {
    if (formik.values.password) {
      navigator.clipboard.writeText(formik.values.password)
        .then(() => message.success('Senha copiada para a área de transferência!'))
        .catch(() => message.error('Falha ao copiar a senha.'));
    } else {
      message.warning('Nenhuma senha para copiar.').then();
    }
  };

  return (
    <form>
      <div
        style={{
          justifyContent: 'div-between',
          left: '32px',
          borderBottom: '1px solid #ddd',
          marginBottom: '25px',
          width: '100%'
        }}>
        <div>
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
        </div>
      </div>
      <div className={style.row}>
        <TextField
          id="input-container-select"
          select
          label="Perfil"
          onChange={(e) => setSelectedProfile(e.target.value)}
          defaultValue="EUR"
          focused
          className="outlined-input-select"
          required
          slotProps={{
            select: {
              native: true,
            },
          }}
          sx={{
            flex: 1,
            '& fieldset': {
              width: '100%',
            },
          }}
        >
          {rule && rule?.map((option) => (
            <option style={{}} key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </TextField>
        <div style={{display: 'flex', alignItems: 'center', flex: 1}}>
          <Checkbox
            defaultChecked
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
      </div>
      {!rule?.find(x => x.id === selectedProfile)?.name.includes(typeRule) && (
        <div className={style.row}>
          <InputMask
            mask="99.999.999/9999-99"
            value={formik.values.cnpj}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            {() => (
              <TextField
                label="CNPJ"
                variant="outlined"
                {...formik.getFieldProps('cnpj')}
                fullWidth
                focused
                required
                className="outlined-input-cnpj"
                placeholder="000.000.000/0001-00"
                sx={{
                  '& fieldset': {
                    width: '100%',
                  },
                }}
              />
            )}
          </InputMask>

          <TextField
            label="Código Cigam"
            variant="outlined"
            {...formik.getFieldProps('cigamCode')}
            fullWidth
            focused
            required
            className="outlined-input-cnpj"
            placeholder="65465465465465"
            sx={{
              '& fieldset': {
                width: '100%',
              },
            }}
          />

        </div>
      )}
      <div className={style.row}>
        <TextField
          label={!rule?.find(x => x.id === selectedProfile)?.name.includes(typeRule) && "Razão Social" || "Nome"}
          variant="outlined"
          {...formik.getFieldProps('companyName')}
          fullWidth
          required
          focused
          placeholder={!rule?.find(x => x.id === selectedProfile)?.name.includes(typeRule) && "Razão Social" || "Nome"}
          className="outlined-input-contact"
          sx={{
            '& fieldset': {
              width: '100%',
            },
          }}
        />
      </div>
      <div className={style.row}>

        {!rule?.find(x => x.id === selectedProfile)?.name.includes(typeRule) && (
          <InputMask
            mask="(99) 99999-9999"
            value={formik.values.phone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            {() => (
              <TextField
                label="Telefone"
                variant="outlined"
                {...formik.getFieldProps('phone')}
                fullWidth
                focused
                required
                placeholder="00 0000 0000"
                className="outlined-input-contact"
                sx={{
                  '& fieldset': {
                    width: '100%',
                  },
                }}
              />
            )}
          </InputMask>
        )}

        <TextField
          label="E-mail"
          variant="outlined"
          {...formik.getFieldProps('email')}
          fullWidth
          focused
          required
          placeholder="E-mail"
          className="outlined-input-contact"
          sx={{
            '& fieldset': {
              width: '100%',
            },
          }}
        />
      </div>
      <div className={style.row}>
        <TextField
          label="Senha Provisória"
          variant="outlined"
          {...formik.getFieldProps('password')}
          fullWidth
          focused
          required
          placeholder="Senha Provisória"
          className="outlined-input-contact"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end"
                              style={{display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem'}}>
                <TfiReload style={{cursor: 'pointer', color: "#FF0000"}}
                           onClick={() => formik.setFieldValue('password', generatePassword())}/>
                <PiCopySimpleLight style={{cursor: 'pointer'}} onClick={handleCopyPassword}/>
              </InputAdornment>
            ),
          }}
          sx={{
            '& fieldset': {
              width: '100%',
            },
          }}
        />
      </div>
      <div style={{display: "flex", justifyContent: "end", gap: "1rem"}}>
        <Button onClick={closeModal} style={{backgroundColor: "white", color: "red"}}>
          CANCELAR
        </Button>
        <Button type="primary" htmlType="submit" style={{backgroundColor: "red"}}>
          CRIAR
        </Button>
      </div>
    </form>

  );
};

export default DialogUserRegistration;
