import DialogUserRegistration from '@shared/dialogs/dialog-new-user';
import {Button, Input, Modal, Space, Table, TableColumnsType, TableProps,} from 'antd';
import React, {useEffect, useState} from 'react';
import {getAllUsers, GetAllUsersResponse} from "@shared/services/UserService.ts";

type TableRowSelection<T extends object = object> =
  TableProps<T>["rowSelection"];

interface DataType {
  key: string;
  id: string;
  age: string;
  telefone: string;  
  status: boolean;
  email: string;
  user: string;
  create: string;
  lastAlteration: string;
}


const columns: TableColumnsType<DataType> = [
  {title: 'ID', dataIndex: 'id'},
  {title: 'Razão Social', dataIndex: 'age'},
  {title: 'Telefone', dataIndex: 'telefone'},
  {title: 'Status', dataIndex: 'status'},
  {title: 'E-mail', dataIndex: 'email'},
  {title: 'Perfil do Usuário', dataIndex: 'user'},
  {title: 'Criado', dataIndex: 'create'},
  {title: 'Última Alteração', dataIndex: 'lastAlteration'},
];


const {Search} = Input;


const UserRegistration: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); 

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const onSearch = () => {
    closeModal();
    fetchData().then();
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response: GetAllUsersResponse = await getAllUsers(page, limit);
      const usersData = response.data.data.data.map((user) => ({
        key: user.id,
        id: user.id,
        age: user.fullname,
        telefone: "(31) 99847-5278",
        status: user.isActive,
        email: user.email,
        user: user.rule?.name,
        create: user.createdAt,
        lastAlteration: user.updatedAt,
      }));
      setDataSource(usersData);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchData(); 
  }, [page, limit]); 

  const rowSelection: TableRowSelection<DataType> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <div style={{padding: '1rem', display: 'flex', flexDirection: 'column', gap: '2rem'}}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
        }}
      >
        <Space direction="horizontal">
          <Search
            placeholder="Pesquisar"
            onSearch={(value) => console.log(value)}
            style={{width: 200}}
          />
          <Button type="default">Editar</Button>
          <Button type="primary" danger onClick={openModal}>
            Criar Usuário
          </Button>
        </Space>
      </div>

      <Modal
        open={isModalOpen}
        footer={null}
        onCancel={closeModal}
        style={{ width: '601px', alignItems: 'center' }}
      >
        <div style={{ top: '20px' }}>
          <DialogUserRegistration closeModal={closeModal} onSearch={onSearch} />
        </div>
      </Modal>


      <div>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          pagination={{
            current: page,
            pageSize: limit,
            total: dataSource.length, 
            onChange: (newPage, newPageSize) => {
              setPage(newPage);
              setLimit(newPageSize);
            },
          }}
        />
      </div>
    </div>
  );
};

export default UserRegistration;
