import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  message,
  Modal,
  Space,
  Table,
  TableColumnsType,
} from "antd";
import {
  getAllUsers,
  GetAllUsersResponse,
} from "@shared/services/UserService.ts";
import DialogUserRegistration from "@shared/dialogs/dialog-new-user";
import styles from "./UserRegistration.module.css";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedUser, setSelectedUser] = useState<DataType | null>(null);
  const [selectedAction, setSelectedAction] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  
  

  const openModal = (user: DataType) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
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

  const rowSelection = {
    type: 'radio' as const,  // Garantindo que 'radio' seja reconhecido como o tipo fixo
    selectedRowKeys: selectedUser ? [selectedUser.key] : [],  // Controla qual linha está selecionada
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
      if (selectedRowKeys.length > 1) {
        message.error("Você pode selecionar apenas uma linha!");
      } else {
        setSelectedUser(selectedRows[0]);
      }
    },
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
              if (!selectedUser)
                message.error("Deve ser selecionado um usário!");
              else {
                setSelectedAction(false);
                openModal(selectedUser);
                console.log("update " + JSON.stringify( selectedUser));
              }
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
