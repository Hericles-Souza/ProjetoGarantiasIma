import React, {useRef, useState} from 'react';
import {Button, Tag} from 'antd';
import Header from '@shared/components/header/header.tsx';
import CardCategorias from '@shared/components/card_garantia/card_garantias.tsx';
import SearchField from '@shared/components/input_search/input_search.tsx';
import {GarantiasStatusEnum} from '@shared/enums/GarantiasStatusEnum';
import {cardData} from "@app/views/private/garantias/mock/cardData.ts";
import styled from './screenGarantia.module.css';
import './carouselAnimations.css';
import './tabGarantia.css';

const Garantias: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('garantias');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const carouselRef = useRef<HTMLDivElement>(null);

  const statuses = Object.values(GarantiasStatusEnum);

  const handleNext = () => {
    if (carouselRef.current) {
      const container = carouselRef.current;
      container.scrollBy({left: 150, behavior: 'smooth'});
    }
  };

  const handlePrevious = () => {
    if (carouselRef.current) {
      const container = carouselRef.current;
      container.scrollBy({left: -150, behavior: 'smooth'});
    }
  };

  const filteredCards = cardData
    .filter((card) => {
      const searchText = `${card.status} ${card.code} ${card.pieceCode} ${card.defectValue} ${card.person} ${card.date}`;
      return searchText.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .filter((card) => filterStatus === 'todos' || card.status === filterStatus);

  return (
    <>
      <Header filterStatus={activeTab} handleFilterChange={setActiveTab}/>
      {activeTab === 'garantias' && (
        <div className={styled.container}>
          <div className={styled.content}>
            <div ref={carouselRef} className="carousel-container">
              <div className="carousel-content">
                {statuses.map((status) => (
                  <Tag
                    key={status}
                    className={`carousel-tag ${styled.tab}`}
                    color={filterStatus === status ? 'red' : 'default'}
                    onClick={() => setFilterStatus(status)}
                  >
                    {status}
                  </Tag>
                ))}
              </div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: "1rem", padding: "1rem", paddingLeft: "0"}}>
              <Button className={styled.button} type="default" onClick={handlePrevious}>
                &lt;
              </Button>
              <Button className={styled.button} type="default" onClick={handleNext}>
                &gt;
              </Button>
              <SearchField onSearchChange={setSearchTerm}/>
            </div>
          </div>
          <div className={styled.containerGrid}>
            {filteredCards.map((card) => (
              <CardCategorias
                key={card.id}
                {...card}
                onClick={() => console.log('Card clicked!')}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Garantias;
