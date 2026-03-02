/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from 'react';
import { Modal, Button, Space, Typography, Form } from 'antd';
import { Checkbox, TextField } from '@mui/material';
import './dialogEditUser.style.css';

interface DialogAttentionProps {
    isVisible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const [, setIsModalOpen] = useState(false);
const [value, setValue] = useState('');
const [form] = Form.useForm();

const closeModal = () => {
    setIsModalOpen(false);
};

const handleSubmit = () => {
    form.validateFields()
        .then(() => {
            //console.log("Form Values:", values);
            closeModal();
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DialogEditUser: React.FC<DialogAttentionProps> = ({ isVisible, onClose, onConfirm, ...props }) => {
    return (
        <Modal
            open={isVisible}
            onCancel={onClose}
            footer={null}
            centered
            style={{ textAlign: 'center' }}
        >
            <div >
                <div
                    style={{
                        justifyContent: 'space-between',
                        left: '32px',
                        borderBottom: '1px solid #ddd',
                        marginBottom: '25px',
                        width: '100%',
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
                                paddingBottom: '0px',
                            }} >
                            EDITAR USUÁRIO
                        </Typography>
                    </Space>
                </div>

                <Space direction="horizontal" style={{ width: '100%' }}>
                    <TextField
                        id="input-container-select"
                        select
                        label="Perfil"
                        defaultValue="Cliente"
                        focused
                        className="outlined-input-select"
                        required
                        slotProps={{
                            select: {
                                native: true,
                            },
                        }}
                        style={{ width: '265px' }}
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

                <Space direction="horizontal" style={{ width: '100%' }}>
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
                        style={{ width: '220px' }}
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
                        style={{ width: '220px' }}
                    />
                </Space>

                <Space style={{ width: '100%' }}>
                    <TextField
                        label="Razão Social"
                        variant="outlined"
                        value={value}
                        onChange={handleChange}
                        fullWidth
                        required
                        focused
                        placeholder="Razão Social"
                        className="outlined-input-razao"
                        {...props}
                        style={{ width: '100%' }}
                    />
                </Space>

                <Space direction="horizontal" style={{ width: '100%' }}>
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
                        style={{ width: '220px' }}
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
                        style={{ width: '220px' }}
                    />
                </Space>

                {/* Campo de Frete */}
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '15px' }}>
                    <Checkbox
                        {...label}
                        defaultChecked
                        sx={{
                            color: '#FF0000',
                            '&.Mui-checked': {
                                color: '#FF0000',
                            },
                        }}
                    />
                    <span>Frete por conta da IMA</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                    <Button onClick={onClose} style={{ backgroundColor: 'white', color: 'red' }}>
                        CANCELAR
                    </Button>
                    <Button type="primary" onClick={handleSubmit} style={{ backgroundColor: 'red' }}>
                        ATUALIZAR
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default DialogEditUser;
