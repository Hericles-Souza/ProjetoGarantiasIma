import React, { useContext, useEffect, useState } from "react";
import {
  ConfigProvider,
  Dropdown,
  Layout,
  Spin,
  Avatar,
  DropdownProps,
  MenuProps,
} from "antd";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { ChartColumn, ChartPie, ChevronDown, FileChartColumn, OctagonX, UserRoundPlus } from "lucide-react";
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
  children?: MenuItem[];
}

const menuData: MenuItem[] = [
  {
    key: "3",
    label: "Dashboard Inicial",
    icon: 
      <ChartPie style={{ color: "red", height: "22px" }}/>
    ,
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
        style={{ width: "22px", height: "22px" }}
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
    icon: <UserRoundPlus style={{ color: "red", height: "22px" }}/>,
    path: "/users",
    allowedRoles: [UserRoleEnum.Admin],
  },
  {
    key: "5",
    label: "Cadastro de Defeitos",
    icon: <OctagonX style={{ color: "red", height: "22px" }} />,
    path: "/defect",
    allowedRoles: [UserRoleEnum.Admin],
  },
  {
    key: "4",
    label: "Relatórios",
    icon: <ChartColumn style={{ color: "red", height: "22px" }} />,
    path: "",
    allowedRoles: [
      UserRoleEnum.Admin,
      UserRoleEnum.Supervisor,
      UserRoleEnum.Tecnico,
    ],
    children: [
      {
        key: "4-1",
        label: "Relatório RGI",
        icon: <FileChartColumn style={{ color: "red", height: "22px" }} />,
        path: "/relatorio/rgi",
        allowedRoles: [
          UserRoleEnum.Admin,
          UserRoleEnum.Supervisor,
          UserRoleEnum.Tecnico,
        ],
      },
    ],
  },
];

interface CustomDropdownProps extends DropdownProps {
  menu: MenuProps;
  children: React.ReactNode;
  placement?: "bottom" | "top" | "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  trigger?: ("click" | "hover" | "contextMenu")[];
}

const DropdownWithRef = React.forwardRef<HTMLDivElement, CustomDropdownProps>(
  (
    {
      children,
      menu,
      placement = "bottomRight",
      trigger = ["click"],
      ...restProps
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);

    const handleOpenChange = (flag: boolean) => {
      setOpen(flag);
    };

    const handleMenuClick: MenuProps["onClick"] = (e) => {
      if (menu.onClick) {
        menu.onClick(e);
      }
      setOpen(false);
    };

    return (
      <div ref={ref} style={{ display: "inline-block" }}>
        <Dropdown
          {...restProps}
          menu={{
            ...menu,
            onClick: handleMenuClick,
            style: {
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            },
            items: menu.items?.map((item) => ({
              ...item,
              style: {
                padding: "8px 16px",
                margin: 0,
              },
            })),
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
              cursor: "pointer",
              transition: "all 0.3s",
              ...(children as React.ReactElement).props.style,
              ...(open ? { color: "#FF0000", transform: "rotate(45deg)" } : {}),
            },
          })}
        </Dropdown>
      </div>
    );
  }
);

const LayoutPrivate: React.FC = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string | undefined>(undefined);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { user, logout } = useContext(AuthContext) || {};
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log(
      "useEffect triggered - user:",
      JSON.stringify(user),
      "location.pathname:",
      location.pathname
    );
    let currentItem: MenuItem | undefined;
    let currentChild: MenuItem | undefined;

    // Procurar item ou subitem correspondente
    for (const item of menuData) {
      if (location.pathname && item.path && location.pathname.startsWith(item.path)) {
        currentItem = item;
      }
      if (item.children) {
        const child = item.children.find((child) =>
          location.pathname.startsWith(child.path)
        );
        if (child) {
          currentItem = item;
          currentChild = child;
        }
      }
    }

    // Definir selectedKey
    setSelectedKey(currentChild ? currentChild.key : currentItem?.key);

    // Definir expandedKeys para expandir o menu pai, se houver subitem
    if (
      currentItem?.children &&
      (currentChild ||
        (currentItem.path && location.pathname.startsWith(currentItem.path)))
    ) {
      setExpandedKeys([currentItem.key]);
      console.log("Expanding:", currentItem.key);
    } else {
      setExpandedKeys([]);
      console.log("Collapsing all");
    }

    // Verificar se os dados do usuário são válidos para parar o carregamento
    if (user && user.rule && user.rule.name) {
      console.log("User data valid, setting loading to false");
      setLoading(false);
    } else {
      console.log("User data invalid or missing:", JSON.stringify(user));
    }
  }, [location.pathname, user]);

  const toggleSidebar = () => setCollapsed((prev) => !prev);

  const handleLogout = () => {
    if (logout) {
      logout();
    }
  };

  const toggleExpand = (key: string) => {
    console.log(
      "Toggling expand for key:",
      key,
      "Current expandedKeys:",
      expandedKeys
    );
    setExpandedKeys((prev) => (prev.includes(key) ? [] : [key]));
  };

  // Função para encontrar o label do item ou subitem com base no selectedKey
  const getHeaderTitle = () => {
    for (const item of menuData) {
      if (item.key === selectedKey) {
        return item.label;
      }
      if (item.children) {
        const child = item.children.find((child) => child.key === selectedKey);
        if (child) {
          return child.label;
        }
      }
    }
    return "Dashboard";
  };

  if (loading || !user || !user.rule || !user.rule.name) {
    console.log(
      "Loading state active - user:",
      JSON.stringify(user),
      "loading:",
      loading
    );
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
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
        <Sider collapsed={collapsed} style={styles.sider} width={330}>
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
          <div style={{ backgroundColor: "#ffffff", padding: "0px 10px" }}>
            {filteredMenu.map((item) => (
              <div key={item.key}>
                {item.children ? (
                  <div>
                    <div
                      style={{
                        ...styles.menuItem,
                        height: "55px",
                        borderRadius: "15px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: collapsed ? "center" : "flex-start",
                        backgroundColor:
                          item.key === selectedKey
                            ? "rgba(255, 0, 0, 0.14)"
                            : "transparent",
                        color:
                          item.key === selectedKey ? "#FF0000" : "#808080",
                        border:
                          item.key === selectedKey
                            ? "0.25px solid rgba(255, 0, 0, 0.35)"
                            : "0.25px solid rgb(230, 230, 230)",
                        cursor: "pointer",
                        paddingLeft: collapsed ? "0px" : "14px",
                        paddingRight: collapsed ? "0px" : "15px",
                        marginBottom: "10px",
                      }}
                      onClick={() => {
                        toggleExpand(item.key);
                        if (item.path) setSelectedKey(item.key);
                      }}
                    >
                      {item.icon}
                      {!collapsed && (
                        <span
                          style={{
                            marginLeft: "15px",
                            fontSize: "16px",
                            flex: 1,
                          }}
                        >
                          {item.label}
                        </span>
                      )}
                      {!collapsed && (
                        <ChevronDown
                          className={`h-5 w-5 transition-transform duration-300 ${
                            expandedKeys.includes(item.key)
                              ? "text-[#E56425]"
                              : "text-foreground"
                          }`}
                          style={{
                            marginLeft: "10px",
                            transition: "transform 0.3s",
                            transform: expandedKeys.includes(item.key)
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                          }}
                        />
                      )}
                    </div>
                    {!collapsed &&
                      expandedKeys.includes(item.key) &&
                      item.children.map((child) => (
                        child.allowedRoles?.includes(
                          user.rule.name as UserRoleEnum
                        ) && (
                          <Link
                            key={child.key}
                            to={child.path}
                            style={{
                              ...styles.menuItem,
                              height: "55px",
                              borderRadius: "15px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-start",
                              backgroundColor:
                                child.key === selectedKey
                                  ? "rgba(255, 0, 0, 0.14)"
                                  : "transparent",
                              color:
                                child.key === selectedKey
                                  ? "#FF0000"
                                  : "#808080",
                              border:
                                child.key === selectedKey
                                  ? "0.25px solid rgba(255, 0, 0, 0.35)"
                                  : "0.25px solid rgb(230, 230, 230)",
                              paddingLeft: collapsed ? "0px" : "14px",
                              textDecoration: "none",
                              marginLeft: "15px",
                            }}
                            onClick={() => setSelectedKey(child.key)}
                          >
                            {child.icon}
                            <span
                              style={{
                                marginLeft: "15px",
                                fontSize: "16px",
                              }}
                            >
                              {child.label}
                            </span>
                          </Link>
                        )
                      ))}
                  </div>
                ) : (
                  <Link
                    key={item.key}
                    to={item.path}
                    style={{
                      ...styles.menuItem,
                      height: "55px",
                      borderRadius: "15px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: collapsed ? "center" : "flex-start",
                      backgroundColor:
                        item.key === selectedKey
                          ? "rgba(255, 0, 0, 0.14)"
                          : "transparent",
                      color: item.key === selectedKey ? "#FF0000" : "#808080",
                      border:
                        item.key === selectedKey
                          ? "0.25px solid rgba(255, 0, 0, 0.35)"
                          : "0.25px solid rgb(230, 230, 230)",
                      textDecoration: "none",
                      paddingLeft: collapsed ? "0px" : "14px",
                      marginBottom: "10px",
                    }}
                    onClick={() => {
                      setSelectedKey(item.key);
                      if (!item.children) {
                        setExpandedKeys([]);
                      }
                    }}
                  >
                    {item.icon}
                    {!collapsed && (
                      <span
                        style={{
                          marginLeft: "15px",
                          fontSize: "16px",
                        }}
                      >
                        {item.label}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </div>
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
              {getHeaderTitle()}
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
                  <Avatar
                    icon={<UserOutlined />}
                    style={{ backgroundColor: "#FF0000" }}
                  />
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
                      key: "logout",
                      label: "Sair",
                      icon: <LogoutOutlined />,
                      danger: true,
                      onClick: handleLogout,
                    },
                  ],
                }}
                trigger={["click", "hover"]}
              >
                <SettingOutlined
                  style={{
                    fontSize: "20px",
                    color: "#5f5a56",
                    padding: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#f0f0f0",
                    transition: "all 0.3s",
                    cursor: "pointer",
                  }}
                />
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