import {CalendarOutlined, RightOutlined} from '@ant-design/icons';
import React from 'react';
import styled from 'styled-components';
import {converterStatusGarantia, GarantiasStatusEnum2} from "@shared/enums/GarantiasStatusEnum.ts";
import {GarantiaItem} from "@shared/models/GarantiasModel.ts";
import dayjs from 'dayjs';

const CardContainer = styled.div<{ clickable: boolean }>`
  flex: 0 0 calc(25% - 12px); /* Isso vai garantir que cada item ocupe 25% da linha, considerando o espaço de gap */
  max-width: 100%; /* Impede que o item ocupe mais de 25% da largura da linha */
  box-sizing: border-box; /* Inclui o padding no cálculo do tamanho */
  max-height: 300px;
  background-color: #fff;
  border-radius: 15px;
  border: 1px solid #ddd;
  cursor: ${(props) => (props.clickable ? 'pointer' : 'default')};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:hover {
    transform: ${(props) => (props.clickable ? 'scale(1.01)' : 'none')};
    box-shadow: ${(props) =>
      props.clickable ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none'};
  }
`;

const Header = styled.div`
  display: flex;
  margin-right: 15px;
  color: #ddd;
  justify-content: space-between;
`;

const Status = styled.span`
  background-color: #f3f3f3;
  margin: 15px 15px;
  color: #333;
  font-size: 14px;
  padding: 7px 15px;
  border-radius: 5px;
`;

const Code = styled.h3`
  font-size: 18px;
  font-weight: bold;
  margin: 2px 0;
`;

const PieceCode = styled.p`
  font-size: 16px;
  color: #555;
  margin: 0;
`;

const Defect = styled.div`
  font-size: 14px;
  margin-left: 15px;
  color: #555;
  margin-top: 15px;
`;

const ValueDefect = styled.div`
  font-size: 16px;
  margin-top: 1px;
  font-weight: bold;
  color: #555;
`;


const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #ddd;
  height: 50px;
  margin-top: 15px;
  margin-left: 15px;
  margin-right: 15px;
`;

const Date = styled.p`
  font-size: 16px;
  color: #555;
  margin: 0;
`;

const RedContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  background-color: #fff8f8;
  border-left: 5px solid #ff4d4d;
`;

interface CardCategoriasProps {
  GarantiaItem: GarantiaItem;
  data: Date;
  onClick?: () => void;
}

const statusStyles = {
  [GarantiasStatusEnum2.NAO_ENVIADO]: { // ok
    backgroundColor: '#F9F9F9',
    color: '#5F5A56',
  },
  [GarantiasStatusEnum2.EM_ANALISE]: { // ok
    backgroundColor: '#B3E5FC',
    color: '#0277BD',
  },
  [GarantiasStatusEnum2.PECAS_AVALIADAS_PARCIAMENTE]: { // ok
    backgroundColor: '#9747FF1F',
    color: '#9747FF',
  },
  [GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO]: { // ok
    backgroundColor: '#FFE0B2',
    color: '#EF6C00',
  },
  [GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO]: { // ok
    backgroundColor: '#FFE0B2',
    color: '#EF6C00',
  },
  [GarantiasStatusEnum2.NF_DEVOLUCAO_RECUSADA]: { // ok
    backgroundColor: '#4A32163D',
    color: '#4A3216',
  },
  [GarantiasStatusEnum2.CONFIRMADO]: { // ok
    backgroundColor: '#C8E6C9',
    color: '#2E7D32',
  },
};


const CardCategorias: React.FC<CardCategoriasProps> = ({data, GarantiaItem, onClick}) => {
  console.log('Garantia', GarantiaItem);
  const statusStyle = statusStyles[GarantiaItem.codigoStatus];

  return (
    <CardContainer clickable={!!onClick} onClick={onClick}>
      <Header>
        <Status style={{backgroundColor: statusStyle.backgroundColor, color: statusStyle.color}}>
          {converterStatusGarantia(GarantiaItem.codigoStatus)}
        </Status>
        <RightOutlined/>
      </Header>
      <RedContainer>
        <Code>{GarantiaItem.rgi}</Code>
        <PieceCode>Código da Peça: {GarantiaItem.nfReferencia}</PieceCode>
      </RedContainer>
      <Defect>
        Possível Defeito:
        <ValueDefect>{GarantiaItem.tipoDefeito}</ValueDefect>
      </Defect>
      <Footer>
        <Date>
          <CalendarOutlined style={{marginRight: 5}}/> {dayjs(data).format('DD/MM/YYYY')}
        </Date>
      </Footer>
    </CardContainer>
  );
};

export default CardCategorias;
