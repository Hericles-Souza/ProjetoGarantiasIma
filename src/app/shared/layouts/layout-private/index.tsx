import React, {useContext, useEffect, useState} from 'react';
import {ConfigProvider, Dropdown, Layout, Menu} from 'antd';
import {Link, Outlet, useLocation} from 'react-router-dom';
import {ArrowLeftOutlined, ArrowRightOutlined} from '@ant-design/icons';
import styles from './styles.ts';
import LogoIma from '@assets/image/png/logo-ima.png';
import IconGarantia from '@assets/image/svg/icon_garantia.svg';
import IconUser from '@assets/image/svg/user.svg';
import {FaCog, FaUser} from "react-icons/fa";
import {PiBuildingApartment} from "react-icons/pi";
import {AuthContext} from "@shared/contexts/Auth/AuthContext.tsx";
import {UserRoleEnum} from "@shared/enums/UserRoleEnum.ts";

const {Sider, Content, Header} = Layout;

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  allowedRoles?: UserRoleEnum[]
}

const menuData: MenuItem[] = [
  {
    key: '1',
    label: 'Garantias',
    icon: <img src={IconGarantia} alt="Garantias" style={{width: "25px", height: "25px"}}/>,
    path: '/garantias',
  },
  {
    key: '2',
    label: 'Cadastro de Usuários',
    icon: <img src={IconUser} alt="Garantias" style={{width: "25px", height: "25px"}}/>,
    path: '/users',
    allowedRoles: [UserRoleEnum.Admin]
  },
  {
    key: '3',
    label: 'Dashboard',
    icon: <img src={IconUser} alt="Garantias" style={{width: "25px", height: "25px"}}/>,
    path: '/dashboard',
    allowedRoles: [UserRoleEnum.Admin]
  },
];

const LayoutPrivate: React.FC = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string>();
  const location = useLocation();
  const {user, logout} = useContext(AuthContext); 

  useEffect(() => {
    const currentItem = menuData.find(item => location.pathname.startsWith(item.path));
    if (currentItem) {
      setSelectedKey(currentItem.key);
    }
  }, [location.pathname]);

  const toggleSidebar = () => setCollapsed(prev => !prev);

  const handleLogout = () => {
    if (logout) {
      logout();
    }
  };

  const menu = (
    <Menu>
      <Menu.Item onClick={handleLogout}>Logout</Menu.Item>
    </Menu>
  );

  return (
    <ConfigProvider>
      <Layout style={styles.layout}>
        <Sider collapsed={collapsed} style={styles.sider} width={280}>
          <div style={styles.siderHeader(collapsed)}>
            <img
              src={LogoIma}
              alt="Logo"
              style={{height: collapsed ? '20px' : '40px', objectFit: 'contain'}}
            />
          </div>
          <Menu
            style={{
              backgroundColor: '#ffffff',
              overflowY: 'auto',
            }}
            defaultSelectedKeys={['1']}
            selectedKeys={[selectedKey]}
          >
            
            {menuData.filter(item =>
              !item.allowedRoles || item.allowedRoles.includes(user?.rule?.name)).map(item => {
                console.log("allowedRoles: " + JSON.stringify(item));
                return (
                  <Menu.Item
                    key={item.key}
                    style={{
                      ...styles.menuItem,
                      height: '55px',
                      borderRadius: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: collapsed ? "center" : "flex-start",
                      backgroundColor: item.key === selectedKey ? "rgba(255, 0, 0, 0.14)" : "transparent",
                      color: item.key === selectedKey ? '#FF0000' : '',
                      border: item.key === selectedKey ? '0.25px solid rgba(255, 0, 0, 0.35)' : 'none',
                    }}
                  >
                    <Link to={item.path} style={{color: "inherit", display: "flex", alignItems: "center"}}>
                      {item.icon}
                      {!collapsed && <span style={{marginLeft: "15px", fontSize: "16px"}}>{item.label}</span>}
                    </Link>
                  </Menu.Item>
                )})
              } 
          </Menu>
        </Sider>
        <Layout>
          <Header style={styles.header}>
            <div
              style={styles.arrowButtonMenu(collapsed)}
              onClick={toggleSidebar}
            >
              {React.createElement(collapsed ? ArrowRightOutlined : ArrowLeftOutlined, {
                style: {fontSize: 12, cursor: 'pointer'},
              })}
            </div>
            <h2 style={{margin: 0, fontSize: "18px"}}>
              {menuData.find(item => item.key === selectedKey)?.label || "Dashboard"}
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginLeft: 'auto',
              fontSize: '1rem'
            }}>
              <div>
                <div style={{
                  height: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: "#F9F9F9",
                  borderRadius: '1rem',
                  padding: '0.5rem 1rem',
                }}>
                  {user && (
                    user?.rule?.name === UserRoleEnum.Cliente || user?.rule?.name === UserRoleEnum.Admin ?
                      <FaUser style={{color: '#FF0000', fontSize: '1.2rem',}}/> :
                      <PiBuildingApartment style={{color: '#FF0000', fontSize: '1.2rem',}}/>
                  )}
                  <span style={{fontWeight: "500"}}>
                    {user && (
                      user?.rule?.name === UserRoleEnum.Cliente || user?.rule?.name === UserRoleEnum.Admin ? user.username : user.cnpj
                    )}
                  </span>
                </div>
              </div>
              <Dropdown overlay={menu} trigger={['click']}>
                <FaCog style={{color: "#5f5a56", fontSize: "18px", cursor: "pointer"}}/>
              </Dropdown>
            </div>
          </Header>
          <Content style={styles.content}>
            <Outlet/>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default LayoutPrivate;
