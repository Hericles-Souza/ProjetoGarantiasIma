import React, {useState} from 'react';
import {ConfigProvider, Layout, Menu} from 'antd';
import {Link, Outlet} from 'react-router-dom';
import {ArrowLeftOutlined, ArrowRightOutlined} from '@ant-design/icons';
import styles from './styles.ts';
import LogoIma from '@assets/image/png/logo-ima.png';
import IconGarantia from '@assets/image/svg/icon_garantia.svg';
import {FaCog} from "react-icons/fa";
import {PiBuildingApartment} from "react-icons/pi";

const {Sider, Content, Header} = Layout;

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const menuData: MenuItem[] = [
  {
    key: '1',
    label: 'Garantias',
    icon: <img src={IconGarantia} alt="Garantias"/>,
    path: '/garantia',
  },
];

const LayoutPrivate: React.FC = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string>('1');
  const toggleSidebar = () => setCollapsed(prev => !prev);

  const menuItems = menuData.map(item => ({
    key: item.key,
    label: (
      <Link to={item.path} style={{color: 'inherit', display: 'flex', alignItems: 'center'}}>
        <img
          src={IconGarantia}
          alt="Garantias"
          style={{
            width: collapsed ? '27px' : '30px',
            height: collapsed ? '27px' : '30px',
            marginRight: collapsed ? '0px' : '10px',
            marginBottom: '5px',
          }}
        />
        {!collapsed && <span style={{fontSize: '16px'}}>{item.label}</span>}
      </Link>
    ),
    onClick: () => setSelectedKey(item.key),
    style: {
      ...styles.menuItem,
      height: '55px',
      borderRadius: '15px',
      display: 'flex',
      alignItems: 'center',
      paddingTop: collapsed ? '5px' : '0px',
      paddingLeft: collapsed ? '20px' : '15px',
      backgroundColor: item.key === selectedKey ? 'rgba(255, 0, 0, 0.14)' : 'transparent',
      color: item.key === selectedKey ? '#FF0000' : '',
      border: item.key === selectedKey ? '0.25px solid rgba(255, 0, 0, 0.35)' : 'none',
    },
  }));


  const selectedMenuItem = menuData.find(item => item.key === selectedKey);

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
            items={menuItems} 
          />
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

            {/* Título dinâmico baseado no menu selecionado */}
            <h2 className='titleHeader' style={styles.titleHeader}>
              {selectedMenuItem ? selectedMenuItem.label : 'Dashboard'}
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
                  <PiBuildingApartment style={{color: '#FF0000', fontSize: '1.2rem',}}/>
                  <span style={{fontWeight: "500"}}>00.623.904/0001-73</span>
                </div>
              </div>
              <FaCog style={{color: "#5f5a56"}}/>
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
