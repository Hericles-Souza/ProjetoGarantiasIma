import React, { useState } from 'react';
import { HeaderContainer, TabContainer, Tab, Button } from '../header/Header.styles';
import SearchField from '../../../../components/input_search/input_search';
import CreateGarantiaDrawer from '../drawerGarantia/CreateGarantiaDrawer'; 

interface HeaderProps {
  activeTab: string;
  onTabClick: (tab: string) => void;
  onSearchChange: (value: string) => void; // Adicionando a função de mudança de pesquisa
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabClick, onSearchChange }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleDrawerOpen = () => {
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  return (
    <HeaderContainer>
      <TabContainer>
        <Tab isActive={activeTab === 'garantias'} onClick={() => onTabClick('garantias')}>
          Garantias
        </Tab>
      </TabContainer>

      <div
        style={{
          display: 'flex',
          gap: '15px',
          height: '45px',
          alignItems: 'center',
        }}
      >
        <SearchField onSearchChange={onSearchChange} />
        <Button onClick={handleDrawerOpen}>Criar Garantia</Button>
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
