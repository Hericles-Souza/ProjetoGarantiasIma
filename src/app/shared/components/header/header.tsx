import React, { useContext } from "react";
import { Button, HeaderContainer } from "./Header.styles.ts";
import { Tabs, Modal } from "antd";
import NewRequestGarantiasDialog from "@shared/dialogs/new-request-garantias-dialog/index.tsx";
import { AuthContext } from "@shared/contexts/Auth/AuthContext.tsx";
import { UserRoleEnum } from "@shared/enums/UserRoleEnum.ts";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  filterStatus: string;
  handleFilterChange: (key: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  filterStatus,
  handleFilterChange,
}) => {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <HeaderContainer>
      <div style={{ display: "flex", alignItems: "end", height: "100%" }}>
        <Tabs
          activeKey={filterStatus}
          onChange={handleFilterChange}
          style={{ padding: "0px 20px" }}
          tabBarStyle={{
            display: "flex",
            justifyContent: "center",
            margin: "0",
          }}
          className="custom-tabs"
          items={[
            { label: <span>REQUISIÇÕES DE GARANTIA (RGI)</span>, key: "rgi" },
            {
              label: context.user.rule.name.includes(UserRoleEnum.Técnico) ? (
                <div> </div>
              ) : (
                <span>ACORDOS COMERCIAIS (ACI)</span>
              ),
              key: "aci",
            },
          ]}
        />
      </div>
      {!context.user.rule.name.includes(UserRoleEnum.Técnico) &&
        !context.user.rule.name.includes(UserRoleEnum.Supervisor) && (
          <div
            style={{ display: "flex", padding: "1rem", alignItems: "center" }}
          >
            <Button
              style={{ margin: "0" }}
              onClick={() => {
                navigate(`/garantias/rgi/:id?`);
              }}
            >
              NOVA SOLICITAÇÃO
            </Button>
          </div>
        )}

      <Modal footer={null} width={600} closeIcon={null}>
        <NewRequestGarantiasDialog onClose={() => {}} />
      </Modal>
    </HeaderContainer>
  );
};

export default Header;
