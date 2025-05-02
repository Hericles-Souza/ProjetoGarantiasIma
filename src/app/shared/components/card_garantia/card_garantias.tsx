import { CalendarOutlined, RightOutlined, UserOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { converterStatusGarantia, converterStatusGarantiaTecnicoAndSupervisor, GarantiasItemStatusEnum2, statusStylesRGI } from "@shared/enums/GarantiasStatusEnum.ts";
import { GarantiasModel } from "@shared/models/GarantiasModel.ts";
import dayjs from 'dayjs';
import { AuthContext } from '@shared/contexts/Auth/AuthContext';
import { UserRoleEnum } from '@shared/enums/UserRoleEnum';
import { converterStatusAcordo, statusStylesACI } from '@shared/enums/AcordoComercialStatusEnum';
import { AcordoComercialModel } from '@shared/models/AcordoComercialModel';
import { useContext } from 'react';

const CardContainer = styled.div<{ $clickable: boolean }>`
  flex: 0 0 calc(25% - 12px);
  max-width: 100%;
  box-sizing: border-box;
  max-height: 300px;
  background-color: #fff;
  border-radius: 15px;
  border: 1px solid #ddd;
  cursor: ${(props) => (props.$clickable ? 'pointer' : 'default')};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:hover {
    transform: ${(props) => (props.$clickable ? 'scale(1.01)' : 'none')};
    box-shadow: ${(props) =>
    props.$clickable ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none'};
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PieceCode = styled.p`
  font-size: 16px;
  color: #555;
  margin: 0;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  color: #555;
  margin: 0;
`;
const CreatorInfo = styled.p`
  font-size: 16px;
  color: #555;

  display: flex;
  align-items: center;
`;
const RedContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  background-color: #fff8f8;
  border-left: 5px solid #ff4d4d;
`;


interface CardCategoriasProps {
  GarantiaItem?: GarantiasModel;
  Acordo?: AcordoComercialModel;
  data: Date;
  codigoFormatado: string; // Código já formatado (ex: "RGI 1234567" ou "ACI 98765432")
  onClick?: () => void;
  tab: string;
}

const CardCategorias: React.FC<CardCategoriasProps> = ({ data, GarantiaItem, Acordo, codigoFormatado, onClick, tab }) => {

  const statusStyle = tab === "RGI" ? statusStylesRGI[GarantiaItem.codigoStatus] : statusStylesACI[Acordo.codigoStatus];
  const context = useContext(AuthContext);
  const isTechnicalUser = context.user?.rule?.name
    ? [UserRoleEnum.Tecnico, UserRoleEnum.Supervisor].includes(context.user.rule.name as UserRoleEnum)
    : false;
  return (
    <CardContainer key={tab === "ACI" ? Acordo.id : GarantiaItem.id} $clickable={!!onClick} onClick={onClick}>
      <Header>
        {tab === "RGI" && (
          <Status style={{ backgroundColor: statusStyle?.backgroundColor ? statusStyle?.backgroundColor : "#F9F9F9", color: statusStyle?.color ? statusStyle?.color : "#F9F9F9" }}>
            {context.user.rule.name === UserRoleEnum.Cliente || context.user.rule.name === UserRoleEnum.Admin
              ? converterStatusGarantia(GarantiaItem?.codigoStatus)
              : (GarantiaItem?.notas.some(nota => nota.itens.some(item => item.codigoStatus == GarantiasItemStatusEnum2.NAO_ANALISADO)))
                ? converterStatusGarantiaTecnicoAndSupervisor(GarantiaItem?.codigoStatus, true)
                : converterStatusGarantiaTecnicoAndSupervisor(GarantiaItem?.codigoStatus, false)}
          </Status>
        )}
        {tab === "ACI" && (
          <Status style={{ backgroundColor: statusStyle?.backgroundColor ? statusStyle?.backgroundColor : "#F9F9F9", color: statusStyle?.color ? statusStyle?.color : "#F9F9F9" }}>
            {converterStatusAcordo(Acordo.codigoStatus)}
          </Status>
        )}
        <RightOutlined />
      </Header>
      <RedContainer>
        <Code>{codigoFormatado}</Code>

      </RedContainer>
      <Footer>
        <Date>
          {isTechnicalUser && tab === 'RGI' && GarantiaItem.razaoSocial && (
            <CreatorInfo>
              <UserOutlined style={{ marginRight: 4 }} />
              {GarantiaItem.razaoSocial}
            </CreatorInfo>
          )}
          <div>
            <CalendarOutlined style={{ marginRight: 5 }} /> {dayjs(data).format('DD/MM/YYYY')}
          </div>
        </Date>
      </Footer>
    </CardContainer>
  );
};

export default CardCategorias;