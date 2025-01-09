import { CalendarOutlined, RightOutlined, UserOutlined } from '@ant-design/icons';
import React from 'react';
import styled from 'styled-components';

const CardContainer = styled.div<{ clickable: boolean }>`
  background-color: #fff;
  border-radius: 15px;
  width: 410px;
  height: 270px;
  margin: 10px auto;
  border: 1px solid #ddd;
  cursor: ${(props) => (props.clickable ? 'pointer' : 'default')};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

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

const Defect = styled.p`
  font-size: 14px;
  margin-left: 15px;
  color: #555;
  margin-top: 15px;
`;

const ValueDefect = styled.p`
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

const Person = styled.p`
  font-size: 16px;
  font-weight: bold;
  color: #555;
  margin: 0;
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
  status: string;
  code: string;
  pieceCode: string;
  defectValue: string;
  person: string;
  date: string;
  onClick?: () => void; 
}

const CardCategorias: React.FC<CardCategoriasProps> = ({
  status,
  code,
  pieceCode,
  defectValue,
  person,
  date,
  onClick,
}) => {
  return (
    <CardContainer clickable={!!onClick} onClick={onClick}>
      <Header>
        <Status>{status}</Status>
        <RightOutlined />
      </Header>
      <RedContainer>
        <Code>{code}</Code>
        <PieceCode>Código da Peça: {pieceCode}</PieceCode>
      </RedContainer>
      <Defect>
        Possível Defeito: <br />
        <ValueDefect>{defectValue}</ValueDefect>
      </Defect>
      <Footer>
        <Person>
          <UserOutlined style={{ marginRight: 5 }} /> {person}
        </Person>
        <Date>
          <CalendarOutlined style={{ marginRight: 5 }} /> {date}
        </Date>
      </Footer>
    </CardContainer>
  );
};

export default CardCategorias;
