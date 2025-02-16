import React, { useContext, useState } from "react";
import { Button, HeaderContainer } from "./Header.styles.ts";
import { Tabs, Modal } from "antd";
import NewRequestGarantiasDialog from "@shared/dialogs/new-request-garantias-dialog/index.tsx";
import { AuthContext } from "@shared/contexts/Auth/AuthContext.tsx";
import { UserRoleEnum } from "@shared/enums/UserRoleEnum.ts";

interface HeaderProps {
  filterStatus: string;
  handleFilterChange: (key: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  filterStatus,
  handleFilterChange,
}) => {
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const context = useContext(AuthContext);

  const handleDialogOpen = () => {
    setIsDialogVisible(true);
  };

  const handleDialogClose = () => {
    setIsDialogVisible(false);
  };
  

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
            { label: context.user.rule.name.includes(UserRoleEnum.Técnico) ? <div> </div> : <span>ACORDOS COMERCIAIS (ACI)</span>, key: "aci" },
          ]}
        />
      </div>
      {!context.user.rule.name.includes(UserRoleEnum.Técnico) &&
        !context.user.rule.name.includes(UserRoleEnum.Supervisor) && (
          <div
            style={{ display: "flex", padding: "1rem", alignItems: "center" }}
          >
            <Button style={{ margin: "0" }} onClick={handleDialogOpen}>
              NOVA SOLICITAÇÃO
            </Button>
          </div>
        )}

      <Modal
        visible={isDialogVisible}
        onCancel={handleDialogClose}
        footer={null}
        width={600}
        closeIcon={null}
      >
        <NewRequestGarantiasDialog onClose={handleDialogClose} />
      </Modal>
    </HeaderContainer>
  );
};

export default Header;
