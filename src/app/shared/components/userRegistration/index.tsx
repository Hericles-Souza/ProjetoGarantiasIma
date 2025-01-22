import { Table, TableColumnsType, TableProps } from 'antd';
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

const UserRegistration: React.FC = () => {

    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        console.log("selectedRowKeys changed: ", newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
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
            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={dataSource}
            />
        </div>
        
    );
};

export default UserRegistration;
