import { Button, Checkbox, Form, Input, message, Modal, Select, Space, Table, TableColumnsType, TableProps, } from 'antd';
import { SearchProps } from 'antd/es/input';
import form from 'antd/lib/form';
import React, { useState } from 'react';


const { Option } = Select;


const DialogUserRegistration: React.FC = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState("Cliente");
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

    return (

        <div>
            
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        profile: "Cliente",
                        isActive: true,
                        password: "Q1234icL3M4",
                    }}

                >
                    <Space style={{ width: "100%" }}>
                        <Form.Item
                            name="profile"
                            label="Perfil"
                            rules={[{ required: true, message: "Selecione o perfil" }]}
                            style={{ width: '265px', flexDirection: 'row' }}
                        >
                            <Select onChange={(value) => setSelectedProfile(value)} defaultValue="Cliente">
                                
                                <Option value="Cliente">Cliente</Option>
                                <Option value="Técnico">Técnico</Option>
                                <Option value="Admin">Admin</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="isActive"
                            valuePropName="checked"
                            style={{ marginBottom: 20, marginTop: "32px" }}
                        >
                            <Checkbox>Usuário Ativo</Checkbox>
                        </Form.Item>
                    </Space>

                    

                    <Space direction="horizontal" style={{ width: "100%" }}>
                        <Form.Item
                            name="cnpj"
                            label="CNPJ"
                            rules={[{ required: true, message: "Insira o CNPJ" }]}
                            style={{ flex: 1 }}
                        >
                            <Input placeholder="000.000.000/0001-00" />
                        </Form.Item>

                        <Form.Item
                            name="cigamCode"
                            label="Código Cigam"
                            rules={[{ required: true, message: "Insira o código Cigam" }]}
                            style={{ flex: 1 }}
                        >
                            <Input placeholder="65465465465465" />
                        </Form.Item>
                    </Space>

                    <Form.Item
                        name="companyName"
                        label="Razão Social"
                        rules={[{ required: true, message: "Insira a razão social" }]}
                    >
                        <Input placeholder="Razão Social" />
                    </Form.Item>

                    <Space direction="horizontal" style={{ width: "100%" }}>
                        <Form.Item
                            name="phone"
                            label="Telefone"
                            rules={[{ required: true, message: "Insira o telefone" }]}
                            style={{ flex: 1 }}
                        >
                            <Input placeholder="00 0000 0000" />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label="E-mail"
                            rules={[
                                { required: true, message: "Insira o e-mail" },
                                { type: "email", message: "E-mail inválido" },
                            ]}
                            style={{ flex: 1 }}
                        >
                            <Input placeholder="email@email.com" />
                        </Form.Item>
                    </Space>

                    <Form.Item
                        name="password"
                        label="Gerar Senha Provisória"
                        rules={[{ required: true, message: "Insira ou gere a senha" }]}
                    >
                        <Input
                            placeholder="Senha Provisória"
                            addonAfter={
                                <Space>
                                    <Button type="link" onClick={handleGeneratePassword}>
                                        🔄
                                    </Button>
                                    <Button type="link" onClick={handleCopyPassword}>
                                        📋
                                    </Button>
                                </Space>

                            }
                        />
                    </Form.Item>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Button onClick={closeModal} style={{ backgroundColor: "white", color: "red" }}>
                            CANCELAR
                        </Button>
                        <Button type="primary" onClick={handleSubmit} style={{ backgroundColor: "red" }}>
                            CRIAR
                        </Button>
                    </div>
                </Form>
           

        </div>

    );
};

export default DialogUserRegistration;
