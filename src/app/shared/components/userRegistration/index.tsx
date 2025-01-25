import DialogUserRegistration from '@shared/dialogs/dialog-new-user';
import {Button, Form, Input, Modal, Space, Table, TableColumnsType, TableProps,} from 'antd';
import React, {useState} from 'react';

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

const dataSource = Array.from({length: 46}).map<DataType>((_, i) => ({
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

const {Search} = Input;


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

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleOpen = () => setIsModalVisible(true);
  const handleClose = () => setIsModalVisible(false);
  const handleConfirm = () => {
    setIsModalVisible(false);
    console.log('Dados enviados!');
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
            style={{width: 200,}}
          />
          <Button type="default" onClick={handleOpen}>Editar</Button>
          <Button type="primary" danger onClick={openModal}>
            Criar Usuário
          </Button>
        </Space>
      </div>
      {/*<DialogEditUser
                    isVisible={isModalVisible}
                    onClose={handleClose}
                    onConfirm={handleConfirm}
                />*/}

      <Modal
        //title="CRIAR NOVO USUÁRIO"
        open={isModalOpen}
        footer={null}
        onCancel={closeModal}

        style={{width: '601px', alignItems: 'center',}}
      >
        <div style={{top: '20px'}}>
          <DialogUserRegistration

          />
        </div>
      </Modal>

      <div style={{marginTop: "60px"}}>
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
