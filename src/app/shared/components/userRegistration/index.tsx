import DialogUserRegistration from '@shared/dialogs/dialog-new-user';
import { Button, Checkbox, Form, Input, message, Modal, Select, Space, Table, TableColumnsType, TableProps, } from 'antd';
import { SearchProps } from 'antd/es/input';
import form from 'antd/lib/form';
import React, { useState } from 'react';

type TableRowSelection<T extends object = object> =
    TableProps<T>["rowSelection"];

interface DataType {
    key: React.Key;
    id: number;
    age: number;
    telefone: number;
    status: string;
    email: string;
    user: string;
    create: string;
    lastAlteration: string;
}

const columns: TableColumnsType<DataType> = [
    {
        title: "ID",
        dataIndex: "id",
    },
    {
        title: "Razão Social",
        dataIndex: "age",
    },
    {
        title: "Telefone",
        dataIndex: "telefone",
    },
    {
        title: "Status",
        dataIndex: "status",
    },
    {
        title: "E-mail",
        dataIndex: "email",
    },
    {
        title: "Perfil do Usuário",
        dataIndex: "user",
    },
    {
        title: "Criado",
        dataIndex: "create",
    },
    {
        title: "Ultima Alteração",
        dataIndex: "lastAlteration",
    },
];

const dataSource = Array.from({ length: 46 }).map<DataType>((_, i) => ({
    key: i,
    id: 1,
    age: 32,
    telefone: 88524226,
    status: "Ativo",
    email: "amanda@gmail.com",
    user: "Admin",
    create: "00/00/0000",
    lastAlteration: "00/00/0000",
}));

const { Search } = Input;

const { Option } = Select;


const UserRegistration: React.FC = () => {

    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        console.log("selectedRowKeys changed: ", newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

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


    const rowSelection: TableRowSelection<DataType> = {
        selectedRowKeys,
        onChange: onSelectChange,
        selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            Table.SELECTION_NONE,
            {
                key: "odd",
                text: "Select Odd Row",
                onSelect: (changeableRowKeys) => {
                    let newSelectedRowKeys = [];
                    newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
                        if (index % 2 !== 0) {
                            return false;
                        }
                        return true;
                    });
                    setSelectedRowKeys(newSelectedRowKeys);
                },
            },
            {
                key: "even",
                text: "Select Even Row",
                onSelect: (changeableRowKeys) => {
                    let newSelectedRowKeys = [];
                    newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
                        if (index % 2 !== 0) {
                            return true;
                        }
                        return false;
                    });
                    setSelectedRowKeys(newSelectedRowKeys);
                },
            },
        ],
    };
    return (

        <div>
            <div
                style={{
                    position: "fixed",
                    top: 80,
                    right: 0,
                    left: 0,
                    zIndex: 1000,
                    padding: "10px 20px",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    borderBottom: "1px #ddd",
                }}
            >
                <Space direction="horizontal">
                    <Search
                        placeholder="Pesquisar"
                        onSearch={(value) => console.log(value)}
                        style={{ width: 200,  }}
                    />
                    <Button type="default">Editar</Button>
                    <Button type="primary" danger onClick={openModal}>
                        Criar Usuário
                    </Button>
                </Space>
            </div>
            <Modal
                //title="CRIAR NOVO USUÁRIO" 
                open={isModalOpen}
                footer={null}
                
                style={{ width: '601px', alignItems: 'center',  }}
            >
                <div style={{top:'20px'}}>
                    <DialogUserRegistration 

                    />
                </div>
            </Modal>

            <div style={{ marginTop: "60px" }}>
                <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={dataSource}
                />
            </div>
        </div>

    );
};

export default UserRegistration;
