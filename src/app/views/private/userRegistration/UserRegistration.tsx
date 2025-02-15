import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  Modal,
  Space,
  Table,
  TableColumnsType,
  TableProps,
} from "antd";
import {
  getAllUsers,
  GetAllUsersResponse,
} from "@shared/services/UserService.ts";
import DialogUserRegistration from "@shared/dialogs/dialog-new-user";
import styles from "./UserRegistration.module.css";

type TableRowSelection<T extends object = object> =
  TableProps<T>["rowSelection"];

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
  create: string;
  lastAlteration: string;
  userRole: string;
}

const columns: TableColumnsType<DataType> = [
  { title: "Razão Social", dataIndex: "age" },
  { title: "Código Cigam", dataIndex: "cigamCode" },
  { title: "Telefone", dataIndex: "phone" },
  { title: "Status", dataIndex: "status" },
  { title: "E-mail", dataIndex: "email" },
  { title: "Perfil do Usuário", dataIndex: "userRole" },
  { title: "Criado", dataIndex: "create" },
  { title: "Última Alteração", dataIndex: "lastAlteration" },
];

const { Search } = Input;

const UserRegistration: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedUser, setSelectedUser] = useState<DataType | null>(null);
  const [selectedAction, setSelectedAction] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const onSelectChange = (
    newSelectedRowKeys: React.Key[],
    selectedRows: DataType[]
  ) => {
    setSelectedRowKeys(newSelectedRowKeys);
    if (selectedRows.length > 0) {
      setSelectedUser(selectedRows[0]);
    }
  };

  const openModal = (user: DataType) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const onSearch = () => {
    fetchData().then(() => closeModal());
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response: GetAllUsersResponse = await getAllUsers(page, limit);
      console.log("USERS: " + JSON.stringify(response.data.data.data));
      const usersData = response.data.data.data.map((user) => ({
        key: user.id,
        id: user.id,
        age: user.fullname,
        status: user.isActive,
        email: user.email,
        userRole: user.rule?.name,
        create: user.createdAt,
        lastAlteration: user.updatedAt,
        cigamCode: user.codigoCigam,
        companyName: user.fullname,
        phone: user.phone,
        cnpj: user.cnpj,
        isActive: user.isActive,
        isAdmin: user.isAdmin,
      }));

      const filteredData = usersData.filter((user) =>
        user.companyName.toLowerCase().includes(searchValue.toLowerCase()) ||
        user.email.toLowerCase().includes(searchValue.toLowerCase()) ||
        user.userRole.toLowerCase().includes(searchValue.toLowerCase())
      );

      setDataSource(filteredData);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, searchValue]);

  const rowSelection: TableRowSelection<DataType> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const onSearchValues = (value: string) => {
    setSearchValue(value);  
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Space direction="horizontal">
          <Search
            className={styles.inputSearch}
            placeholder="Pesquisar"
            onSearch={onSearchValues} 
          />
          <Button
            type="default"
            className={styles.buttonEdite}
            onClick={() => {
              setSelectedAction(false);
              openModal(selectedUser);
            }}
          >
            Editar
          </Button>
          <Button
            type="primary"
            className={styles.buttonCreate}
            danger
            onClick={() => {
              setSelectedAction(true);
              openModal(null);
            }}
          >
            Criar Usuário
          </Button>
        </Space>
      </div>

      <Modal open={isModalOpen} footer={null} onCancel={closeModal}>
        <div className={styles.modalContent}>
          <DialogUserRegistration
            closeModal={closeModal}
            onSearch={onSearch}
            selectedUser={selectedUser}
            selectedUserActionCreation={selectedAction}
          />
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
