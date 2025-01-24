import React, { useState } from "react";
import { Button } from "antd";
import { FileDoneOutlined, LeftOutlined } from "@ant-design/icons";
import OutlinedInputWithLabel from "../../../shared/components/input-outlined-with-label/OutlinedInputWithLabel";
import ColorCheckboxes from "../../../shared/components/checkBox/checkBox"; // Importando o novo componente
import styles from "./GeneralInfo.module.css";

const RgiDetailsPage: React.FC = () => {
  const [socialReason, setSocialReason] = useState("Magnetis Consultoria de Investimentos Ltda.");
  const [phone, setPhone] = useState("(31) 99847-5278");
  const [requestDate, setRequestDate] = useState("12/07/2008");

  // Funções para controlar as alterações de valor
  const handleSocialReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSocialReason(e.target.value);
  };
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
  };

  const handleRequestDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRequestDate(e.target.value);
  };

  console.log(socialReason, phone, requestDate);  // Verificar os dados no console

  return (
    <div className={styles.appContainer}>
      <div className={styles.backButtonContainer}>
        <Button
          type="link"
          className={styles.backButton}
          onClick={() => console.log("Voltar para o início")}
        >
          <LeftOutlined /> VOLTAR PARA O INÍCIO
        </Button>
        <span className={styles.headerRgi}>RGI N° 000666-0001</span>
      </div>

      <div className={styles.headerContainer}>
        <div className={styles.headerLeft}>
          <h1 className={styles.rgiTitle}>RGI 000666-0001</h1>
          <div className={styles.statusTag}>Aguardando avaliação</div>
        </div>
        <div className={styles.buttonsContainer}>
          <Button type="default" danger>
            Salvar
          </Button>
          <Button type="primary" danger>
            Enviar
          </Button>
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={styles.infoContainer}>
        <h3 className={styles.infoTitle}>Informações Gerais</h3>
        <div className={styles.inputsContainer}>
          <div className={styles.inputGroup} style={{ flex: 15 }}>
            {/* Usando o state para gerenciar o valor */}
            <OutlinedInputWithLabel
              label="Razão social"
              value={socialReason}  // Usando value em vez de defaultValue
              onChange={handleSocialReasonChange}  // Atualizando o valor
              fullWidth
            />
          </div>
          <div className={styles.inputGroup} style={{ flex: 5 }}>
            <OutlinedInputWithLabel
              label="Telefone"
              value={phone}  // Usando value em vez de defaultValue
              onChange={handlePhoneChange}  // Atualizando o valor
              fullWidth
            />
          </div>
          <div className={styles.inputGroup} style={{ flex: 5 }}>
            <OutlinedInputWithLabel
              label="Data da solicitação"
              value={requestDate}  // Usando value em vez de defaultValue
              onChange={handleRequestDateChange}  // Atualizando o valor
              fullWidth
            />
          </div>
        </div>
        <div className={styles.checkboxContainer}>
          <ColorCheckboxes /> {/* Usando o novo checkbox */}
          <label className={styles.checkboxDanger}>Solicitar ressarcimento</label> {/* A frase do checkbox */}
        </div>
      </div>

      <div className={styles.nfsContainer}>
        <h3 className={styles.nfsTitle}>NFs associadas a esta garantia</h3>
        <div className={styles.nfsItem}>
          <FileDoneOutlined style={{ marginRight: "8px" }} />
          <span className={styles.nfsCode}>000666-00147.A</span>
          <span className={styles.nfsDivider}>|</span>
          <span className={styles.nfsQuantity}>2 ITENS</span>
          <Button type="text" className={styles.nextButton}>
            &gt;
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RgiDetailsPage;
