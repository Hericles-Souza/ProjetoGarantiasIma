import React, {useState} from 'react';
import {Button, HeaderContainer} from './Header.styles.ts';
import CreateGarantiaDrawer from '../drawerGarantia/CreateGarantiaDrawer.tsx';
import {Tabs} from 'antd';

interface HeaderProps {
  filterStatus: string;
  handleFilterChange: (key: string) => void;
}

const Header: React.FC<HeaderProps> = ({filterStatus, handleFilterChange}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleDrawerOpen = () => {
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  return (
    <HeaderContainer>
      <div
        style={{display: 'flex', alignItems: 'end', height: '100%'}}>
        <Tabs
          activeKey={filterStatus}
          onChange={handleFilterChange}
          style={{padding: '0px 20px'}}
          tabBarStyle={{
            display: 'flex',
            justifyContent: 'center',
            margin: "0"
          }}
          className="custom-tabs"
          items={[
            {label: <span>TODOS</span>, key: 'garantias'},
            {label: <span>REQUISIÇÕES DE GARANTIA (RGI)</span>, key: 'rgi'},
            {label: <span>ACORDOS COMERCIAIS (ACI)</span>, key: 'aci'},
          ]}
        />
      </div>

      <div
        style={{
          display: 'flex',
          padding: "1rem",
          alignItems: 'center',
        }}
      >
        <Button style={{margin: "0"}} onClick={handleDrawerOpen}>NOVA SOLICITAÇÃO</Button>
      </div>

      {/* Drawer separado em componente */}
      <CreateGarantiaDrawer
        isVisible={isDrawerOpen}
        onClose={handleDrawerClose}
      />
    </HeaderContainer>
  );
};

export default Header;
