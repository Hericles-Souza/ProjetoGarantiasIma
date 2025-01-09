import React, { useState } from 'react';
import Header from './components/header/header';
import { Content } from 'antd/es/layout/layout';
import CardCategorias from '../../components/card_garantia/card_garantias';
import { Drawer, Button, Space, Tabs } from 'antd';
import styles from './screenGarantia.style';
import '../garantias/tabGarantia.css'; 

const Garantias: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('garantias');
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [selectedCard, setSelectedCard] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>(''); // Estado para armazenar o termo de busca

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const handleCardClick = (card: unknown) => {
    setSelectedCard(card);
    setDrawerVisible(true);
  };

  const handleDrawerClose = () => {
    setDrawerVisible(false);
    setSelectedCard(null);
  };

  const handleFilterChange = (key: string) => {
    setFilterStatus(key);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value); // Atualiza o termo de pesquisa
  };

  const cardData = [
    {
      id: 1,
      status: 'Enviado para análise',
      code: '000666-00001.A.01',
      pieceCode: '00012200250',
      defectValue: 'Falta de Torque',
      person: 'Felipe Lopes',
      date: '27/00/2025',
    },
    {
      id: 2,
      status: 'Em andamento',
      code: '000777-00002.B.02',
      pieceCode: '00012200300',
      defectValue: 'Quebra de peça',
      person: 'Lucas Silva',
      date: '28/00/2025',
    },
    {
      id: 3,
      status: 'Concluído',
      code: '000888-00003.C.03',
      pieceCode: '00012200400',
      defectValue: 'Arranhão',
      person: 'João Alves',
      date: '29/00/2025',
    },
    {
      id: 4,
      status: 'Recusado',
      code: '000999-00004.D.04',
      pieceCode: '00012200500',
      defectValue: 'Peça Incorreta',
      person: 'Ana Santos',
      date: '30/00/2025',
    },
  ];

  const filteredCards = cardData
    .filter((card) => {
      const searchText = `${card.status} ${card.code} ${card.pieceCode} ${card.defectValue} ${card.person} ${card.date}`;
      return searchText.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .filter((card) => filterStatus === 'todos' || card.status === filterStatus);

  return (
    <div>
      <Header
        activeTab={activeTab}
        onTabClick={handleTabClick}
        onSearchChange={handleSearchChange} // Passando a função de busca para o Header
      />
      <Content style={{ width: '100%', height: '100%', position: 'relative' }}>
        {activeTab === 'garantias' && (
          <>
            <Tabs
              activeKey={filterStatus}
              onChange={handleFilterChange}
              style={{ marginBottom: 20, padding: '0px 20px' }}
              tabBarStyle={{
                display: 'flex',
                justifyContent: 'center',
                backgroundColor: 'white',
              }}
              className="custom-tabs"
              items={[
                { label: <span>Todos</span>, key: 'todos' },
                { label: <span>Concluído</span>, key: 'Concluído' },
                { label: <span>Em andamento</span>, key: 'Em andamento' },
                { label: <span>Recusado</span>, key: 'Recusado' },
                { label: <span>Enviado para análise</span>, key: 'Enviado para análise' },
              ]}
            />
            <div
              className={filteredCards.length === 1 ? 'singleCardGrid' : ''}
              style={{ ...styles.gridContainer }}
            >
              {filteredCards.map((card) => (
                <CardCategorias
                  key={card.id}
                  status={card.status}
                  code={card.code}
                  pieceCode={card.pieceCode}
                  defectValue={card.defectValue}
                  person={card.person}
                  date={card.date}
                  onClick={() => handleCardClick(card)}
                />
              ))}
            </div>
          </>
        )}
        <Drawer
          title="Detalhes da Garantia"
          placement="right"
          size="large"
          onClose={handleDrawerClose}
          open={drawerVisible}
          extra={
            <Space>
              <Button onClick={handleDrawerClose}>Fechar</Button>
            </Space>
          }
        >
          {selectedCard && (
            <>
              <p><strong>Status:</strong> {selectedCard.status}</p>
              <p><strong>Código:</strong> {selectedCard.code}</p>
              <p><strong>Código da Peça:</strong> {selectedCard.pieceCode}</p>
              <p><strong>Defeito:</strong> {selectedCard.defectValue}</p>
              <p><strong>Responsável:</strong> {selectedCard.person}</p>
              <p><strong>Data:</strong> {selectedCard.date}</p>
            </>
          )}
        </Drawer>
      </Content>
    </div>
  );
};

export default Garantias;
