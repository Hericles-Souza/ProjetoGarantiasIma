import { Checkbox, InputAdornment, TextField } from '@mui/material';
import { Button, message, Typography } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import { getRules } from "@shared/services/RuleService.ts";
import { useFormik } from "formik";
import * as Yup from 'yup';
import { CopyOutlined, SyncOutlined } from '@ant-design/icons'; // Ícones do Ant Design
import InputMask from 'react-input-mask';
import { updateUser, UpdateUserRequest } from '@shared/services/UserService';
import { UserRoleEnum } from '@shared/enums/UserRoleEnum';
import { AuthContext } from '@shared/contexts/Auth/AuthContext';
import './dialog.style.css';
import style from "./style.module.css";
import { RuleModel } from '@shared/models/RuleModel';

interface DataType {
  cigamCode: string;
  companyName: string;
  phone: string;
  cnpj: string;
  key: string;
  id: string;
  age: string;
  status: boolean;
  email: string;
  user: string;
  create: string;
  lastAlteration: string;
}

interface DialogUserRegistrationProps {
  closeModal: () => void;
  onSearch: () => void;
  selectedUser: DataType | null;
}

const DialogUserRegistration: React.FC<DialogUserRegistrationProps> = ({ closeModal, onSearch, selectedUser }) => {
  const [rule, setRule] = useState<RuleModel[] | null>(null);
  const [selectedProfile, setSelectedProfile] = useState('');
  const typeRule = "Técnico";
  const generatePassword = () => Math.random().toString(36).slice(-8);
  const context = useContext(AuthContext);

  const formik = useFormik({
    initialValues: {
      profile: selectedUser ? selectedUser.user : '',
      cnpj: selectedUser ? selectedUser.cnpj : '',
      cigamCode: selectedUser ? selectedUser.cigamCode : '',
      companyName: selectedUser ? selectedUser.companyName : '',
      phone: selectedUser ? selectedUser.phone : '',
      email: selectedUser ? selectedUser.email : '',
      password: generatePassword(),
      isActive: selectedUser ? selectedUser.status : true,
    },
    validationSchema: Yup.object({
      cnpj: Yup.string().required('CNPJ obrigatório'),
      cigamCode: Yup.string().required('Código Cigam obrigatório'),
      companyName: Yup.string().required('Razão Social obrigatória'),
      phone: Yup.string().required('Telefone obrigatório'),
      email: Yup.string().email('E-mail inválido').required('E-mail obrigatório'),
    }),
    onSubmit: async () => {
      await createNewUser();
      onSearch();
      closeModal();
    },
  });

  useEffect(() => {
    getRules()
      .then((response) => {
        setRule(response.data.data);
        setSelectedProfile(response.data.data[0].id);
      })
      .catch((error) => {
        console.error('Error fetching rules', error);
      });
  }, []);

  useEffect(() => {
    formik.resetForm();
    formik.setFieldValue('password', generatePassword());
  }, [closeModal, formik]);

  const handleCopyPassword = () => {
    if (formik.values.password) {
      navigator.clipboard.writeText(formik.values.password)
        .then(() => message.success('Senha copiada para a área de transferência!'))
        .catch(() => message.error('Falha ao copiar a senha.'));
    } else {
      message.warning('Nenhuma senha para copiar.').then();
    }
  };

  const createNewUser = async () => {
    const userRequest: UpdateUserRequest = {
      id: selectedUser ? selectedUser.id : '',
      username: formik.values.cigamCode,
      email: formik.values.email,
      fullname: formik.values.companyName,
      shortname: formik.values.companyName.trim()[0],
      password: formik.values.password,
      CNPJ: formik.values.cnpj,
      codigoCigam: formik.values.cigamCode,
      ruleId: selectedProfile,
      isActive: formik.values.isActive,
      isAdmin: selectedProfile === rule?.find((value) => value.name === UserRoleEnum.Admin)?.id,
      phone: formik.values.phone,
    };
    console.log("userdata: " + JSON.stringify(userRequest));
    await updateUser(userRequest, context.user.token)
      .then((response) => {
        console.log(response);
        message.success('Usuário criado/atualizado com sucesso!');
      })
      .catch((error) => {
        console.error('Erro ao criar/atualizar usuário:', error);
        message.error('Erro ao criar/atualizar usuário.');
      });
  };

  const handleProfileChange = (e) => {
    const value = e.target.value;
    const selectedRule = rule?.find((r) => r.id === value);
    if (selectedRule) {
      setSelectedProfile(selectedRule.id);
      formik.setFieldValue('profile', selectedRule.name);
    }
  };

  // Componente personalizado para integrar InputMask com TextField
  const MaskedInput = (props) => (
    <InputMask
      mask={props.mask}
      value={props.value}
      onChange={props.onChange}
      onBlur={props.onBlur}
    >
      {(inputProps) => <TextField {...inputProps} {...props} />}
    </InputMask>
  );

  return (
    <form onSubmit={formik.handleSubmit}>
      <div style={{ justifyContent: 'space-between', borderBottom: '1px solid #ddd', marginBottom: '25px', width: '100%' }}>
        <Typography style={{ fontWeight: 'bold', fontSize: '16px', color: '#FF0000', textAlign: 'center' }}>
          {selectedUser ? 'EDITAR USUÁRIO' : 'CRIAR NOVO USUÁRIO'}
        </Typography>
      </div>

      <div className={style.row}>
        <TextField
          id="input-container-select"
          select
          label="Perfil"
          value={selectedProfile}
          onChange={handleProfileChange}
          fullWidth
          required
          sx={{ flex: 1 }}
        >
          {rule?.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </TextField>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <Checkbox
            checked={formik.values.isActive}
            onChange={(e) => formik.setFieldValue('isActive', e.target.checked)}
            sx={{ color: '#FF0000', '&.Mui-checked': { color: '#FF0000' }, marginTop: '-22px' }}
          />
          <span style={{ marginTop: '-22px' }}>Usuário Ativo</span>
        </div>
      </div>

      {!rule?.find(x => x.id === selectedProfile)?.name.includes(typeRule) && (
        <div className={style.row}>
          <MaskedInput
            mask="99.999.999/9999-99"
            label="CNPJ"
            variant="outlined"
            {...formik.getFieldProps('cnpj')}
            fullWidth
            focused
            required
            placeholder="00.000.000/0001-00"
            sx={{ flex: 1 }}
          />

          <TextField
            label="Código Cigam"
            variant="outlined"
            {...formik.getFieldProps('cigamCode')}
            fullWidth
            focused
            required
            placeholder="65465465465465"
            sx={{ flex: 1 }}
          />
        </div>
      )}

      <div className={style.row}>
        <TextField
          label={!rule?.find(x => x.id === selectedProfile)?.name.includes(typeRule) ? "Razão Social" : "Nome"}
          variant="outlined"
          {...formik.getFieldProps('companyName')}
          fullWidth
          required
          focused
          placeholder={!rule?.find(x => x.id === selectedProfile)?.name.includes(typeRule) ? "Razão Social" : "Nome"}
          sx={{ flex: 1 }}
        />
      </div>

      <div className={style.row}>
        {!rule?.find(x => x.id === selectedProfile)?.name.includes(typeRule) && (
          <MaskedInput
            mask="(99) 99999-9999"
            label="Telefone"
            variant="outlined"
            {...formik.getFieldProps('phone')}
            fullWidth
            focused
            required
            placeholder="(00) 00000-0000"
            sx={{ flex: 1 }}
          />
        )}

        <TextField
          label="E-mail"
          variant="outlined"
          {...formik.getFieldProps('email')}
          fullWidth
          focused
          required
          placeholder="E-mail"
          sx={{ flex: 1 }}
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
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <SyncOutlined
                  style={{ cursor: 'pointer', color: "#FF0000" }}
                  onClick={() => formik.setFieldValue('password', generatePassword())}
                />
                <CopyOutlined
                  style={{ cursor: 'pointer' }}
                  onClick={handleCopyPassword}
                />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1 }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "end", gap: "1rem" }}>
        <Button onClick={closeModal} style={{ backgroundColor: "white", color: "red" }}>
          CANCELAR
        </Button>
        <Button type="primary" htmlType="submit" style={{ backgroundColor: "red" }}>
          {selectedUser ? 'ATUALIZAR' : 'CRIAR'}
        </Button>
      </div>
    </form>
  );
};

export default DialogUserRegistration;