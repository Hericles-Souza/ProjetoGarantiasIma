import React, {useEffect, useRef, useState} from 'react';
import {Button, Tag} from 'antd';
import Header from '@shared/components/header/header.tsx';
import CardCategorias from '@shared/components/card_garantia/card_garantias.tsx';
import SearchField from '@shared/components/input_search/input_search.tsx';
import styled from './screenGarantia.module.css';
import './carouselAnimations.css';
import './tabGarantia.css';
import {getAllGarantiasAsync} from "@shared/services/GarantiasService.ts";
import {GarantiasModel} from "@shared/models/GarantiasModel.ts";
import {
  converterStatusGarantiaInverso,
  converterStringParaStatusGarantia,
  GarantiasStatusEnum
} from "@shared/enums/GarantiasStatusEnum.ts";
import {useNavigate} from "react-router-dom";

const Garantias: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('garantias');
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState<string>('');
  const carouselRef = useRef<HTMLDivElement>(null);
  const [cardData, setCardData] = useState<GarantiasModel[]>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        const response = await getAllGarantiasAsync();
        const data = await response.data.data;
        setCardData(data);
      } catch (error) {
        console.error('Error fetching card data:', error);
      }
    };

    fetchCardData();
  }, []);

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

  const filteredItems = cardData?.flatMap((card) =>
    card.itens.filter((item) => {

      const matchesStatus = filterStatus === 'todos' || item.codigoStatus === converterStatusGarantiaInverso(converterStringParaStatusGarantia(filterStatus));
      const matchesSearch = searchTerm === '' ||
        item.rgi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.codigoItem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tipoDefeito.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    })
  ) || [];


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
                    onClick={() => setFilterStatus((prevStatus) => (prevStatus === status ? 'todos' : status))}
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
            {filteredItems.map((item) => {
              // Encontrar o cardData que corresponde a esse item
              const associatedCardData = cardData?.find(card => card.rgi === item.rgi);

              return (
                <CardCategorias
                  key={item.id}
                  data={new Date(associatedCardData.data)}
                  GarantiaItem={item}
                  onClick={() => navigate(`/garantias/rgi/${associatedCardData.id}`)}
                />
              );
            })}
          </div>


        </div>
      )}
    </>
  );
};

export default Garantias;
