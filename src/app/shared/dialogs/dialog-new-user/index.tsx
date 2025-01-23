import { FormControl, InputAdornment, InputLabel, MenuItem, SelectChangeEvent, TextField } from '@mui/material';
import { Button, Checkbox, Form, Input, message, Modal, Select, Space, Table, TableColumnsType, TableProps, Typography, } from 'antd';
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
            <div style={{ justifyContent: 'space-between', left: '32px', borderBottom: '1px solid #ddd', width: '100%' }}>
                <Space >
                    <Typography style={{ fontWeight: 'bold', fontSize: '16px', color: '#FF0000', height: '50px', width: '200px', marginLeft: '140px', }} >CRIAR NOVO USUÁRIO</Typography>
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
                <Space style={{ width: "100%", }}>
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

                    <Form.Item
                        className='button-user'
                        name="isActive"
                        valuePropName="checked"
                        style={{ marginBottom: 20, marginTop: "32px" }}
                    >
                        <Checkbox>Usuário Ativo</Checkbox>
                    </Form.Item>
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
                        className="outlined-input"
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
                        className="outlined-input"
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
                    <Button type="primary" onClick={handleSubmit} style={{ backgroundColor: "red" }}>
                        CRIAR
                    </Button>
                </div>
            </Form>


        </div >

    );
};

export default DialogUserRegistration;
