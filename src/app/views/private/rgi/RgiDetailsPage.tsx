import React, {useEffect, useState} from "react";
import {Button} from "antd";
import {FileDoneOutlined, LeftOutlined} from "@ant-design/icons";
import styles from "./GeneralInfo.module.css";
import {useNavigate, useParams} from "react-router-dom";
import OutlinedInputWithLabel from "@shared/components/input-outlined-with-label/OutlinedInputWithLabel.tsx";
import ColorCheckboxes from "@shared/components/checkBox/checkBox.tsx";
import {getGarantiaByIdAsync} from "@shared/services/GarantiasService.ts";
import {GarantiasModel} from "@shared/models/GarantiasModel.ts";
import dayjs from "dayjs";

const RgiDetailsPage: React.FC = () => {
  const [socialReason, setSocialReason] = useState("");
  const [phone, setPhone] = useState("");
  const [requestDate, setRequestDate] = useState("");
  const {id} = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cardData, setCardData] = useState<GarantiasModel>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getGarantiaByIdAsync(id);
        const data = await response.data.data as GarantiasModel;
        setSocialReason(data.razaoSocial);
        setPhone(data.telefone);
        setRequestDate(dayjs(data.data).format('DD/MM/YYYY'));
        setCardData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData().then();

  }, [id]);

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


  return (
    <div className={styles.appContainer}>
      <div className={styles.backButtonContainer}>
        <Button
          type="link"
          className={styles.backButton}
          onClick={() => navigate("/garantias")}
        >
          <LeftOutlined/> VOLTAR PARA O INÍCIO
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

      <hr className={styles.divider}/>

      <div className={styles.infoContainer}>
        <h3 className={styles.infoTitle}>Informações Gerais</h3>
        <div className={styles.inputsContainer}>
          <div className={styles.inputGroup} style={{flex: 15}}>
            {/* Usando o state para gerenciar o valor */}
            <OutlinedInputWithLabel
              InputProps={{
                readOnly: true,
              }}
              label="Razão social"
              value={socialReason}  // Usando value em vez de defaultValue
              onChange={handleSocialReasonChange}  // Atualizando o valor
              fullWidth
            />
          </div>
          <div className={styles.inputGroup} style={{flex: 5}}>
            <OutlinedInputWithLabel
              InputProps={{
                readOnly: true,
              }}
              label="Telefone"
              value={phone}  // Usando value em vez de defaultValue
              onChange={handlePhoneChange}  // Atualizando o valor
              fullWidth
            />
          </div>
          <div className={styles.inputGroup} style={{flex: 5}}>
            <OutlinedInputWithLabel
              InputProps={{
                readOnly: true,
              }}
              label="Data da solicitação"
              value={requestDate}  // Usando value em vez de defaultValue
              onChange={handleRequestDateChange}  // Atualizando o valor
              fullWidth
            />
          </div>
        </div>
        <div className={styles.checkboxContainer}>
          <ColorCheckboxes/> {/* Usando o novo checkbox */}
          <label className={styles.checkboxDanger}>Solicitar ressarcimento</label> {/* A frase do checkbox */}
        </div>
      </div>

      <div className={styles.nfsContainer}>
        <h3 className={styles.nfsTitle}>NFs associadas a esta garantia</h3>
        <div className={styles.nfsItem}> {/* Adicionando a key */}
          <FileDoneOutlined style={{marginRight: "8px"}}/>
          <span className={styles.nfsCode}>{cardData?.nf}</span>
          <span className={styles.nfsDivider}>|</span>
          <span className={styles.nfsQuantity}>{cardData?.itens.length} ITENS</span>
          <Button type="text" className={styles.nextButton} onClick={() => navigate(`/garantias/rgi/details-itens-nf/${id}`)}>
            &gt;
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RgiDetailsPage;
