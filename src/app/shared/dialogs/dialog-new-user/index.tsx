import { FormControl, InputAdornment, InputLabel, MenuItem, SelectChangeEvent, TextField, Checkbox } from '@mui/material';
import { Button, Form, Input, message, Modal, Select, Space, Table, TableColumnsType, TableProps, Typography, } from 'antd';
import { SearchProps } from 'antd/es/input';
import form from 'antd/lib/form';
import React, { useState } from 'react';
import './dialog.style.css'


const { Option } = Select;


const DialogUserRegistration: React.FC = ({ ...props }) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [value, setValue] = useState('');
    const [form] = Form.useForm();


    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleGeneratePassword = () => {
        const randomPassword = Math.random().toString(36).slice(-8);
        form.setFieldsValue({ password: randomPassword });
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

    const label = { inputProps: { 'aria-label': 'Checkbox demo' } };


    const currencies = [
        {
            value: 'Cliente',
            label: 'Cliente',
        },
        {
            value: 'Técnico',
            label: 'Técnico',
        },
        {
            value: 'Admin',
            label: 'Admin',
        },
    ];

    return (

        <div >
            <div
                style={{
                    justifyContent: 'space-between',
                    left: '32px',
                    borderBottom: '1px solid #ddd',
                    marginBottom: '25px',
                    width: '100%'
                }}>
                <Space >
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
                        }} >
                        CRIAR NOVO USUÁRIO
                    </Typography>
                </Space>
            </div>

            
                <Space direction="horizontal" style={{ width: "100%" }}>
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
                        style={{ width: '265px', }}


                    >
                        {currencies.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </TextField>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Checkbox
                            {...label}
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
                        <span style={{ marginTop: '-22px' }}>Usuário Ativo</span>
                    </div>
                </Space>
                <Space direction="horizontal" style={{ width: "100%" }}>
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
                        {...props}
                        style={{ width: '220px', }}
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
                        {...props}
                        style={{ width: '220px', }}
                    />

                </Space>
                <Space style={{ width: '100%' }}>
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
                        {...props}
                        style={{ width: '100%', }}
                    />
                </Space>

                <Space direction="horizontal" style={{ width: "100%", }}>
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
                        {...props}
                        style={{ width: '220px', }}
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
                        {...props}
                        style={{ width: '220px', }}
                    />
                </Space>

                <TextField
                    label="Senha Provisória"
                    variant="outlined"
                    value={form.getFieldValue("password")}
                    onChange={(e) => form.setFieldsValue({ password: e.target.value })}
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
                    style={{ width: "220px" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Button onClick={closeModal} style={{ backgroundColor: "white", color: "red" }}>
                        CANCELAR
                    </Button>
                    <Button type="primary" onClick={closeModal}  style={{ backgroundColor: "red" }}>
                        CRIAR
                    </Button>
                </div>
            


        </div >

    );
};

export default DialogUserRegistration;
