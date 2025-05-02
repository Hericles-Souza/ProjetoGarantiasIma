import React, { useContext, useEffect, useState } from "react";
import {
  ConfigProvider,
  Dropdown,
  Layout,
  Menu,
  message,
  Spin,
  Avatar,
  // Badge,
  // Tooltip,
  DropdownProps,
  MenuProps,
} from "antd";
import { Link, Outlet, useLocation,  } from "react-router-dom";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined
} from "@ant-design/icons";
import styles from "./styles.ts";
import LogoIma from "@assets/image/png/logo-ima.png";
import IconGarantia from "@assets/image/svg/icon_garantia.svg";
import IconUser from "@assets/image/svg/user.svg";
import IconInitial from "@assets/image/svg/initial.svg";
import { AuthContext } from "@shared/contexts/Auth/AuthContext.tsx";
import { UserRoleEnum } from "@shared/enums/UserRoleEnum.ts";

const { Sider, Content, Header } = Layout;

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  allowedRoles?: UserRoleEnum[];
}

const menuData: MenuItem[] = [
  {
    key: "3",
    label: "Dashboard Inicial",
    icon: (
      <img
        src={IconInitial}
        alt="Dashboard"
        style={{ width: "25px", height: "25px" }}
      />
    ),
    path: "/dashboard",
    allowedRoles: [
      UserRoleEnum.Admin,
      UserRoleEnum.Tecnico,
      UserRoleEnum.Supervisor,
    ],
  },
  {
    key: "1",
    label: "Garantias",
    icon: (
      <img
        src={IconGarantia}
        alt="Garantias"
        style={{ width: "25px", height: "25px" }}
      />
    ),
    path: "/garantias",
    allowedRoles: [
      UserRoleEnum.Tecnico,
      UserRoleEnum.Supervisor,
      UserRoleEnum.Cliente,
    ],
  },
  {
    key: "2",
    label: "Cadastro de Usuários",
    icon: (
      <img
        src={IconUser}
        alt="Garantias"
        style={{ width: "25px", height: "25px" }}
      />
    ),
    path: "/users",
    allowedRoles: [UserRoleEnum.Admin],
  },
];

interface CustomDropdownProps extends DropdownProps {
  menu: MenuProps;
  children: React.ReactNode;
  placement?: 'bottom' | 'top' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  trigger?: ('click' | 'hover' | 'contextMenu')[];
}

const DropdownWithRef = React.forwardRef<HTMLDivElement, CustomDropdownProps>(
  ({ children, menu, placement = 'bottomRight', trigger = ['click'], ...restProps }, ref) => {
    const [open, setOpen] = useState(false);

    const handleOpenChange = (flag: boolean) => {
      setOpen(flag);
    };

    const handleMenuClick: MenuProps['onClick'] = (e) => {
      if (menu.onClick) {
        menu.onClick(e);
      }
      setOpen(false);
    };

    return (
      <div ref={ref} style={{ display: 'inline-block' }}>
        <Dropdown
          {...restProps}
          menu={{
            ...menu,
            onClick: handleMenuClick,
            style: {
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
            items: menu.items?.map(item => ({
              ...item,
              style: {
                padding: '8px 16px',
                margin: 0,
              },
            }))
          }}
          trigger={trigger}
          placement={placement}
          open={open}
          onOpenChange={handleOpenChange}
          overlayClassName="custom-dropdown-overlay"
        >
          {React.cloneElement(children as React.ReactElement, {
            onClick: (e: React.MouseEvent) => {
              e.preventDefault();
              setOpen(!open);
            },
            style: {
              cursor: 'pointer',
              transition: 'all 0.3s',
              ...(children as React.ReactElement).props.style,
              ...(open ? { color: '#FF0000', transform: 'rotate(45deg)' } : {})
            }
          })}
        </Dropdown>
      </div>
    );
  }
);

const LayoutPrivate: React.FC = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string | undefined>(undefined);
  const location = useLocation();
  // const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext) || {};
  const [loading, setLoading] = useState<boolean>(true);
  // const [setHasNotifications] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const currentItem = menuData.find((item) =>
        location.pathname.startsWith(item.path)
      );
      setSelectedKey(currentItem?.key);

      // Simulação de verificação de notificações
      // setHasNotifications(Math.random() > 0.5);
    } catch (error) {
      message.error(String(error));
    } finally {
      if (user && user.rule && user.rule.name) {
        setLoading(false);
      } else {
        setLoading(true);
      }
    }
  }, [location.pathname, user]);

  const toggleSidebar = () => setCollapsed((prev) => !prev);

  const handleLogout = () => {
    if (logout) {
      logout();
    }
  };

  if (loading || !user || !user.rule || !user.rule.name) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Spin
          size="large"
          style={{
            color: "red",
            filter: "hue-rotate(0deg) saturate(100%) brightness(0.5)",
          }}
        />
      </div>
    );
  }

  const filteredMenu = menuData.filter(
    (item) =>
      !item.allowedRoles ||
      item.allowedRoles.includes(user.rule.name as UserRoleEnum)
  );

  const menuItems = filteredMenu.map((item) => ({
    key: item.key,
    label: (
      <Link
        to={item.path}
        style={{ color: "inherit", display: "flex", alignItems: "center" }}
      >
        {item.icon}
        {!collapsed && (
          <span style={{ marginLeft: "15px", fontSize: "16px" }}>
            {item.label}
          </span>
        )}
      </Link>
    ),
    style: {
      ...styles.menuItem,
      height: "55px",
      borderRadius: "15px",
      display: "flex",
      alignItems: "center",
      justifyContent: collapsed ? "center" : "flex-start",
      backgroundColor:
        item.key === selectedKey ? "rgba(255, 0, 0, 0.14)" : "transparent",
      color: item.key === selectedKey ? "#FF0000" : "",
      border:
        item.key === selectedKey
          ? "0.25px solid rgba(255, 0, 0, 0.35)"
          : "none",
    },
  }));

  if (!Array.isArray(filteredMenu)) {
    console.error("filteredMenu não é um array:", filteredMenu);
    return <div>Erro ao carregar o menu</div>;
  }

  return (
    <ConfigProvider
      theme={{
        components: {
          Dropdown: {
            borderRadiusLG: 8,
            paddingBlock: 8,
          },
        },
      }}
    >
      <Layout style={styles.layout}>
        <Sider collapsed={collapsed} style={styles.sider} width={280}>
          <div style={styles.siderHeader(collapsed)}>
            <img
              src={LogoIma}
              alt="Logo"
              style={{
                height: collapsed ? "20px" : "40px",
                objectFit: "contain",
              }}
            />
          </div>
          <Menu
            style={{ backgroundColor: "#ffffff", overflowY: "auto" }}
            defaultSelectedKeys={["1"]}
            selectedKeys={selectedKey ? [selectedKey] : []}
            items={menuItems}
          />
        </Sider>
        <Layout>
          <Header style={styles.header}>
            <div
              style={styles.arrowButtonMenu(collapsed)}
              onClick={toggleSidebar}
            >
              {React.createElement(
                collapsed ? ArrowRightOutlined : ArrowLeftOutlined,
                {
                  style: { fontSize: 12, cursor: "pointer" },
                }
              )}
            </div>
            <h2 style={{ margin: 0, fontSize: "18px" }}>
              {menuData.find((item) => item.key === selectedKey)?.label ||
                "Dashboard"}
            </h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginLeft: "auto",
              }}
            >
              <div>
                <div
                  style={{
                    height: "2rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    backgroundColor: "#F9F9F9",
                    borderRadius: "1rem",
                    padding: "0.5rem 1rem",
                  }}
                >
                  {user.rule.name === UserRoleEnum.Cliente ||
                    user.rule.name === UserRoleEnum.Admin ? (
                    <Avatar
                      icon={<UserOutlined />}
                      style={{ backgroundColor: '#FF0000' }}
                    />
                  ) : (
                    <Avatar
                      icon={<UserOutlined />}
                      style={{ backgroundColor: '#FF0000' }}
                    />
                  )}
                  <span style={{ fontWeight: "500" }}>
                    {user.rule.name === UserRoleEnum.Cliente ||
                      user.rule.name === UserRoleEnum.Admin
                      ? user.cnpj
                      : user.username}
                  </span>
                </div>
              </div>

              <DropdownWithRef
                ref={dropdownRef}
                menu={{
                  items: [
                 
                    {
                      key: 'logout',
                      label: 'Sair',
                      icon: <LogoutOutlined />,
                      danger: true,
                      onClick: handleLogout
                    }
                  ]
                }}
                trigger={['click', 'hover']}
              >
                {/* <Badge dot={hasNotifications}> */}
                  {/* <Tooltip title="Configurações"> */}
                    <SettingOutlined
                      style={{
                        fontSize: '20px',
                        color: '#5f5a56',
                        padding: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#f0f0f0',
                        transition: 'all 0.3s',
                        cursor: 'pointer'
                      }}
                    />
                  {/* </Tooltip> */}
                {/* </Badge> */}
              </DropdownWithRef>
            </div>
          </Header>
          <Content style={styles.content}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default LayoutPrivate;