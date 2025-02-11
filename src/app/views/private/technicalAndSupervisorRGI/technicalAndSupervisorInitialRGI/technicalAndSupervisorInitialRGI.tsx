import { Button } from "antd";
import { FileOutlined, LeftOutlined } from "@ant-design/icons";
import styles from "./technicalAndSupervisorInitialRGI.module.css";
import { useNavigate, useParams } from "react-router-dom";
import OutlinedInputWithLabel from "@shared/components/input-outlined-with-label/OutlinedInputWithLabel.tsx";
import { getGarantiaByIdAsync } from "@shared/services/GarantiasService.ts";
import { GarantiasModel } from "@shared/models/GarantiasModel.ts";
import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";
import { UserRoleEnum } from "@shared/enums/UserRoleEnum";
import { isNull } from "util";

const TechnicalAndSupervisorInitialRGI: React.FC = () => {
  // Informações gerais fictícias
  const [socialReason, setSocialReason] = useState("Empresa Fictícia LTDA");
  const [phone, setPhone] = useState("(11) 12345-6789");
  const [requestDate, setRequestDate] = useState(
    dayjs("2025-01-01").format("DD/MM/YYYY")
  );
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [, setCardData] = useState<GarantiasModel>();
  const context = useContext(AuthContext);
  const [nfs, setNfs] = useState<
    { itemId: string; nf: string; itens: number; sequence: number }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true); // Para controlar o carregamento

  useEffect(() => {
    console.log("id existe: " + id);
    const fetchData = async () => {
      let data: GarantiasModel = null;
      try {
        if (!id) {
          await getGarantiaByIdAsync(location.pathname.split("/")[3]).then(
            (dataReturned) => {
              data = dataReturned.data;
            }
          );
          // Se os dados vieram via location.state (por navegação interna)
          console.log(location.pathname.split("/")[3]);
          if (!isNull(data)) {
            setSocialReason(data.razaoSocial);
            setPhone(data.telefone);
            setRequestDate(dayjs(data.data).format("DD/MM/YYYY"));
            setCardData(data);
            setNfs([
              {
                itemId: data.id,
                nf: data.nf,
                itens: data.itens ? data.itens.length : 0,
                sequence: 1,
              },
            ]);
            return;
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }

      try {
        console.log("id existe: " + id);

        // Se houver um ID na URL, busca os dados da garantia pela API
        if (id) {
          const response = await getGarantiaByIdAsync(id);
          console.log("aqui: " + JSON.stringify(response));
          const data = response.data.data;
          setSocialReason(data.razaoSocial);
          setPhone(data.telefone);
          setRequestDate(dayjs(data.data).format("DD/MM/YYYY"));
          setCardData(data);
          setNfs([
            {
              itemId: data.id,
              nf: data.nf,
              itens: data.itens ? data.itens.length : 0,
              sequence: 1,
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        console.log("finalizou");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]); // Executa a requisição apenas uma vez, quando o `id` mudar

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className={styles.appContainer} style={{ backgroundColor: "#fffff" }}>
      <div className={styles.ContainerButtonBack}>
        <Button
          type="link"
          className={styles.ButtonBack}
          onClick={() => navigate("/garantias")}
        >
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
          {context.user.rule.name != UserRoleEnum.Técnico && (
            <>
              <Button
                type="default"
                danger
                className={styles.buttonSaveRgi}
                onClick={() => navigate("view-pre-invoice")}
              >
                Visualizar Pré-Nota
              </Button>
              <Button
                type="primary"
                danger
                style={{ backgroundColor: "red" }}
                className={styles.buttonSendRgi}
              >
                Autorizar envio de NFD
              </Button>
            </>
          )}

          {/* ------------------------------------------------------------------------------------------------ */}

          {/* ---------------------------para o SUPERVISOR aqui é oculto-------------------------------------- */}
          {context.user.rule.name != UserRoleEnum.Supervisor && (
            <>
              <Button type="default" danger className={styles.buttonSaveRgi}>
                Salvar
              </Button>
              <Button
                type="primary"
                danger
                style={{ backgroundColor: "red" }}
                className={styles.buttonSendRgi}
              >
                Enviar
              </Button>
            </>
          )}

          {/* ------------------------------------------------------------------------------------------------ */}
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={styles.infoContainer}>
        <h3 className={styles.infoTitle}>Informações Gerais</h3>
        <div className={styles.inputsContainer}>
          <div className={styles.inputGroup} style={{ flex: 15 }}>
            <OutlinedInputWithLabel
              InputProps={{ readOnly: true }}
              label="Razão social"
              value={socialReason}
              fullWidth
              disabled
            />
          </div>
          <div className={styles.inputGroup} style={{ flex: 5 }}>
            <OutlinedInputWithLabel
              InputProps={{ readOnly: true }}
              label="Telefone"
              value={phone}
              fullWidth
              disabled
            />
          </div>
          <div className={styles.inputGroup} style={{ flex: 5 }}>
            <OutlinedInputWithLabel
              InputProps={{ readOnly: true }}
              label="Data da solicitação"
              value={requestDate}
              fullWidth
              disabled
            />
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
              <FileOutlined
                style={{
                  marginRight: "10px",
                  marginLeft: "20px",
                  fontSize: "20px",
                  color: "red",
                }}
              />
              <span className={styles.nfsCode}>{nf.nf}</span>
              <span className={styles.nfsDivider}> | </span>
              <span className={styles.nfsQuantity}> {nf.itens} ITENS</span>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Button
                type="text"
                className={styles.nextButton}
                onClick={() => {
                  console.log("teste");
                  const itemId: string = nf.itemId;
                  console.log("itemID: " + itemId);
                  navigate(
                    `/garantias/technical-and-supervisor/visor-item-details/${id}/${itemId}`
                  );
                }}
              >
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
