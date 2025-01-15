import React, {useState} from 'react';
import {Avatar, ConfigProvider, Layout, Menu} from 'antd';
import {Link, Outlet} from 'react-router-dom';
import {ArrowLeftOutlined, ArrowRightOutlined, UserOutlined} from '@ant-design/icons';
import styles from './styles';
import LogoIma from '@assets/image/png/logo-ima.png';
import IconGarantia from '@assets/image/svg/icon_garantia.svg';

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
    path: '/home/garantias',
  },
];

const MainInitial: React.FC = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string>('1');
  const toggleSidebar = () => setCollapsed(prev => !prev);
  const renderMenuItems = (menuItems: MenuItem[]) =>
    menuItems.map(item => (
      <Menu.Item
        key={item.key}
        style={{
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
        }}
        onClick={() => setSelectedKey(item.key)}
      >
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
          {!collapsed && <span style={{fontSize: '16px',}}>{item.label}</span>}
        </Link>
      </Menu.Item>
    ));

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
            {renderMenuItems(menuData)}
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

            <h2 className='titleHeader' style={styles.titleHeader}> Dashboard </h2>
            <div>
              <Avatar size={40} icon={<UserOutlined/>} style={styles.avatar}/>
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

export default MainInitial;
