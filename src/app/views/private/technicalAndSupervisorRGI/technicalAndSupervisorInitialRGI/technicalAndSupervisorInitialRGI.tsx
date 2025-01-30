import { Button } from "antd";
import { FileOutlined, LeftOutlined } from "@ant-design/icons";
import styles from "./technicalAndSupervisorInitialRGI.module.css";
import { useNavigate, useParams } from "react-router-dom";
import OutlinedInputWithLabel from "@shared/components/input-outlined-with-label/OutlinedInputWithLabel.tsx";
import { getGarantiaByIdAsync } from "@shared/services/GarantiasService.ts";
import { GarantiasModel } from "@shared/models/GarantiasModel.ts";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const TechnicalAndSupervisorInitialRGI: React.FC = () => {
  // Informações gerais fictícias
  const [socialReason, setSocialReason] = useState("Empresa Fictícia LTDA");
  const [phone, setPhone] = useState("(11) 12345-6789");
  const [requestDate, setRequestDate] = useState(dayjs("2025-01-01").format("DD/MM/YYYY"));
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [setCardData] = useState<GarantiasModel>();

  // NF fictícia
  const [nfs, setNfs] = useState<{ nf: string; itens: number }[]>([
    { nf: "12345", itens: 3 }, // Exemplo de NF pré-cadastrada
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getGarantiaByIdAsync(id);
        const data = response.data.data as GarantiasModel;

        // Atualiza os dados básicos da garantia
        setSocialReason(data.razaoSocial || socialReason);
        setPhone(data.telefone || phone);
        setRequestDate(dayjs(data.data).format("DD/MM/YYYY") || requestDate);
        setCardData(data);

        // Se as NFs não tiverem sido definidas, definir a NF vinda da API
        if (nfs.length === 0 && data.nf) {
          setNfs([{ nf: data.nf, itens: data.itens.length }]);
        }

      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchData();
  }, [id]); // Executa a requisição apenas uma vez, quando o `id` mudar

  return (
    <div className={styles.appContainer} style={{ backgroundColor: "#fffff" }}>
      <div className={styles.ContainerButtonBack}>
        <Button type="link" className={styles.ButtonBack} onClick={() => navigate("/garantias")}>
          <LeftOutlined /> VOLTAR PARA O INÍCIO
        </Button>
        <span className={styles.RgiCode}>RGI N° 000666-0001</span>
      </div>

      <div className={styles.headerContainer}>
        <div className={styles.headerLeft}>
          <h1 className={styles.rgiTitle}>RGI 000666-0001</h1>
          <div className={styles.statusTag}>Aguardando avaliação</div>
        </div>
        <div className={styles.buttonsContainer}>
          {/* ---------------------------para o TÉCNICO aqui é oculto-------------------------------------- */}

          <Button type="default" danger className={styles.buttonSaveRgi} onClick={() => navigate("view-pre-invoice")}>
            Visualizar Pré-Nota
          </Button>
          <Button type="primary" danger style={{ backgroundColor: "red" }} className={styles.buttonSendRgi}>
            Autorizar envio de NFD
          </Button>

          {/* ------------------------------------------------------------------------------------------------ */}


          {/* ---------------------------para o SUPERVISOR aqui é oculto-------------------------------------- */}

          <Button type="default" danger className={styles.buttonSaveRgi}>
            Salvar
          </Button>
          <Button type="primary" danger style={{ backgroundColor: "red" }} className={styles.buttonSendRgi}>
            Enviar
          </Button>

          {/* ------------------------------------------------------------------------------------------------ */}
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={styles.infoContainer}>
        <h3 className={styles.infoTitle}>Informações Gerais</h3>
        <div className={styles.inputsContainer}>
          <div className={styles.inputGroup} style={{ flex: 15 }}>
            <OutlinedInputWithLabel InputProps={{ readOnly: true }} label="Razão social" value={socialReason} fullWidth disabled />
          </div>
          <div className={styles.inputGroup} style={{ flex: 5 }}>
            <OutlinedInputWithLabel InputProps={{ readOnly: true }} label="Telefone" value={phone} fullWidth disabled />
          </div>
          <div className={styles.inputGroup} style={{ flex: 5 }}>
            <OutlinedInputWithLabel InputProps={{ readOnly: true }} label="Data da solicitação" value={requestDate} fullWidth disabled />
          </div>
        </div>
      </div>

      <div className={styles.nfsContainer}>
        <div className={styles.nfcont}>
          <h3 className={styles.nfsTitle}>NFs associadas a esta garantia</h3>
        </div>

        {nfs.map((nf, index) => (
          <div key={index} className={styles.nfsItem}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <FileOutlined style={{ marginRight: "10px", marginLeft: "20px", fontSize: "20px", color: "red" }} />
              <span className={styles.nfsCode}>{nf.nf}</span>
              <span className={styles.nfsDivider}> | </span>
              <span className={styles.nfsQuantity}> {nf.itens} ITENS</span>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Button type="text" className={styles.nextButton} onClick={() => navigate(`/garantias/rgi/details-itens-nf/${id}`)}>
                &gt;
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechnicalAndSupervisorInitialRGI;
