import React, { useContext, useEffect, useState } from "react";
import { Button, message, Modal, Spin } from "antd";
import { DeleteOutlined, LeftOutlined, FileOutlined } from "@ant-design/icons";
import styles from "./RGIDetailsInitial.module.css";
import OutlinedInputWithLabel from "@shared/components/input-outlined-with-label/OutlinedInputWithLabel.tsx";
import { GarantiaItem, GarantiasModel } from "@shared/models/GarantiasModel.ts";
import NFModal from "../addNewNF/modalAddNewNF";
import { GarantiasStatusEnum2 } from "@shared/enums/GarantiasStatusEnum";
import api from "@shared/Interceptors";
import { useLocation, useNavigate, useParams
  
} from "react-router-dom";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";
import { createGarantiaAsync } from "@shared/services/GarantiasService";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extractGarantiasArray = (data: any): GarantiasModel[] => {
  if (data && data.data) {
    return Array.isArray(data.data) ? data.data : [data.data];
  }
  return Array.isArray(data) ? data : [];
};

export const getRGIByUserAsync = async (userId: string) => {
  const response = await api.get("/garantias");
  const allGarantias = extractGarantiasArray(response.data);
  // Retorna a primeira garantia do usuário com status "NAO_ENVIADO"
  return allGarantias.find(
    (g: GarantiasModel) =>
      g.usuarioInsercao === userId &&
      g.codigoStatus === GarantiasStatusEnum2.NAO_ENVIADO
  );
};

const RGIDetailsInitial: React.FC = () => {
  const [socialReason, setSocialReason] = useState("");
  const [phone, setPhone] = useState("");
  const { id } = useParams<{ id?: string }>();
  const [date, setDate] = useState("");
  const navigate = useNavigate();
  const [cardData, setCardData] = useState<GarantiasModel>();
  const [modalOpen, setModalOpen] = useState(false);
  const [nfs, setNfs] = useState<
    { nf: string; itens: number; sequence: number }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true); // Para controlar o carregamento

  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [nfToDelete, setNfToDelete] = useState<string>("");
  const [rgi, setRgi] = useState("");
  const location = useLocation();
  const context = useContext(AuthContext);
  let newRgiCode;
  const [isNewRgi, setIsNewRgi] = useState(false);

  // Função para gerar o sufixo do RGI
  const getRgiWithSuffix = (RgiCode:string, indexLetters: number, index) => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return `${RgiCode}.${letters[indexLetters]}.${index + 1}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      if(!id){
        setIsNewRgi(true);
        newRgiCode = await generateNextRGI();
      }
      else
        setIsNewRgi(false);


      let data: GarantiasModel = null;
      console.log("locaton.state: " + JSON.stringify(location.state));

      try {
        if (location.state && !isNewRgi) {
          console.log("locaton.state: " + JSON.stringify(location.state));
          data = location.state.garantiaData;
          setSocialReason(data.razaoSocial);
          setPhone(data.telefone);
          setCardData(data);
          setRgi(data.rgi);
          setNfs([
            {
              nf: data.nf,
              itens: data.itens ? data.itens.length : 0,
              sequence: 1,
            },
          ]);
          // console.log("garantia: " + JSON.stringify(data));
        }
        else{
 console.log("mewgarantia");

          setCardData( {
            rgi: newRgiCode,
            razaoSocial: context.user.fullname,
            telefone: context.user.phone,
            email: context.user.email,
            nf: cardData.itens[0].nfReferencia,
            fornecedor: context.user.codigoCigam,
            codigoStatus: GarantiasStatusEnum2.NAO_ENVIADO,
            observacao: "Garantia válida por 12 meses",
            usuarioInsercao: context.user.username,
            itens: [],
            id: crypto.randomUUID()
          } as GarantiasModel);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        console.log("finalizou");
        if(cardData != null)
          setLoading(false);
      }
    };

    fetchData();
  }, [location.state]);

  // Função para excluir a garantia
  const handleDeleteGuarantee = async () => {
    if (!cardData?.id) {
      message.error("Garantia não encontrada.");
      return;
    }
    Modal.confirm({
      title: "Confirmar Exclusão",
      content: "Você tem certeza de que deseja excluir esta garantia?",
      okText: "Excluir",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          // Supondo que o endpoint para excluir seja DELETE /garantias/{id}
          const response = await api.delete(
            `/garantias/garantias/${cardData.id}`
          );
          if (response.status === 200) {
            message.success("Garantia excluída com sucesso!");
            navigate("/garantias");
          } else {
            message.error("Erro ao excluir a garantia.");
          }
        } catch (error) {
          console.error("Erro ao excluir a garantia:", error);
          message.error("Erro ao excluir a garantia.");
        }
      },
    });
  };

  const generateNextRGI = async () => {
    try {
      const response = await api.get("/garantias");
      const allGarantias = response.data.data || [];
      const existingRGIs = allGarantias
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((g: any) => g.rgi)
        .filter((rgi: string) => rgi?.startsWith(context.user.codigoCigam))
        .map((rgi: string) => parseInt(rgi.split("-")[1]));
      const lastNumber = Math.max(0, ...existingRGIs);
      const nextNumber = (lastNumber + 1).toString().padStart(4, "0");
      console.log("newrGi: " + `${allGarantias[0].rgi.split("-")[0]}-${nextNumber}`);
      return `${context.user.username}-${nextNumber}`;
    } catch (error) {
      console.error("Erro ao gerar RGI:", error);
    }
  };

  const handleDetailsNavigation = (nf: {
    nf: string;
    itens: number;
    sequence: number;
  }) => {
    if (!cardData?.id) {
      console.error("Dados da garantia ainda não carregados.");
      return;
    }
    navigate(`/garantias/rgi/details-itens-nf/${cardData.id}`, {
      state: {
        garantiaData: cardData,
        garantiaId: cardData.id,
        currentNf: nf,
        rgiLetter: getRgiWithSuffix(newRgiCode, cardData.itens.length + 1, cardData.itens.length + 1 ),
      },
    });
  };

  const handleAddNF = async () => {
    const newRgiCode = await generateNextRGI();
    const itemCode = getRgiWithSuffix(newRgiCode, cardData.itens.length + 1, cardData.itens.length + 1 ) ///// TODO parametro 2 precis ser qtde de nfs + 1
    cardData.itens.push({codigoItem: itemCode} as GarantiaItem)
    };

  const handleDeleteNF = () => {
    setNfs((prevNfs) => prevNfs.filter((nf) => nf.nf !== nfToDelete));
    setModalDeleteOpen(false);
  };

  const showDeleteConfirm = (nfNumber: string) => {
    setNfToDelete(nfNumber);
    setModalDeleteOpen(true);
  };

  const newSend = async () => {
    if (!isNewRgi)
      await send();
    else {
      const garantiaPayload: GarantiasModel = {
        rgi: newRgiCode,
        razaoSocial: context.user.fullname,
        telefone: context.user.phone,
        email: context.user.email,
        nf: cardData.itens[0].nfReferencia,
        fornecedor: context.user.codigoCigam,
        codigoStatus: GarantiasStatusEnum2.NAO_ENVIADO,
        observacao: "Garantia válida por 12 meses",
        usuarioInsercao: context.user.username,
        itens: cardData.itens,
        id: crypto.randomUUID()
      };
  
      console.log(
        "Enviando garantiaModel:",
        JSON.stringify(garantiaPayload, null, 2)
      );
  
      // 4. Cria a garantia via API
      const guaranteeResponse = await createGarantiaAsync(garantiaPayload);
      console.log("Garantia criada com sucesso:", guaranteeResponse.data);

    }

      // 3. Construa o objeto garantiaModel
  }

  const send = async () => {
    if (!cardData?.id) {
      message.error("ID da garantia não encontrado");
      return;
    }
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

    try {
      cardData.itens.forEach(async (item) => {
        const itemId = item.id;
        const updatePayload = {
          codigoItem: item.codigoItem || "",
          tipoDefeito: item.tipoDefeito || "",
          modeloVeiculoAplicado: item.modeloVeiculoAplicado || "",
          torqueAplicado: item.torqueAplicado || 0,
          nfReferencia: cardData.nf || "",
          loteItemOficial: item.loteItemOficial || "",
          loteItem: item.loteItem || "",
          codigoStatus: GarantiasStatusEnum2.EM_ANALISE,
          solicitarRessarcimento: item.solicitarRessarcimento || false,
        };

        const response = await api.put(
          `/garantias/garantiasItem/${itemId}/UpdateItem`,
          updatePayload
        );

        if (response.status === 200) {
          console.log("Garantia Item atualizada com sucesso!");
        }
      });
      const garantaId = crypto.randomUUID();

      const garantia: GarantiasModel = {
        razaoSocial: socialReason,
        telefone: phone,
        email: context.user.email,
        nf: cardData.nf,
        fornecedor: context.user.fullname,
        codigoStatus: GarantiasStatusEnum2.EM_ANALISE,
        observacao: "teste",
        usuarioAtualizacao: context.user.username,
        status: cardData.status,
        dataAtualizacao: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`,
      };

      const responseHeader = await api.put(
        `/garantias/garantiasHeader/${garantaId}/UpdateHeader`,
        garantia
      );

      if (responseHeader.status === 200) {
        setCardData({
          ...cardData,
          codigoStatus: GarantiasStatusEnum2.EM_ANALISE,
          status: GarantiasStatusEnum2.EM_ANALISE.toString(),
        });
        message.success("Garantia atualizada com sucesso!");
        navigate("/garantias");
      }
    } catch (error) {
      console.error("Erro ao atualizar a garantia:", error);
      message.error("Erro ao atualizar a garantia");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Spin
          size="large"
          style={{
            color: "red",
            filter: "hue-rotate(0deg) saturate(100%) brightness(0.5)",
          }}
        />
      </div>
    );
  }

  return (
    <div className={styles.appContainer} style={{ backgroundColor: "#ffffff" }}>
      <div className={styles.ContainerButtonBack}>
        <Button
          type="link"
          className={styles.ButtonBack}
          onClick={() => navigate("/garantias")}
        >
          <LeftOutlined /> VOLTAR PARA O INÍCIO
        </Button>
        <span className={styles.RgiCode}>RGI N° {rgi}</span>
      </div>

      <div className={styles.headerContainer}>
        <div className={styles.headerLeft}>
          <h1 className={styles.rgiTitle}>RGI {rgi}</h1>
          <div className={styles.statusTag}>{cardData?.status}</div>
        </div>
        <div className={styles.buttonsContainer}>
          {cardData?.codigoStatus !== 2 && (
            <Button
              type="default"
              danger
              className={styles.buttonDeleteRgi}
              onClick={handleDeleteGuarantee}
            >
              Excluir
            </Button>
          )}
          <Button
            onClick={newSend}
            type="default"
            danger
            className={styles.buttonSaveRgi}
          >
            Salvar
          </Button>
          <Button
            onClick={newSend}
            type="primary"
            danger
            style={{ backgroundColor: "red" }}
            className={styles.buttonSendRgi}
          >
            Enviar
          </Button>
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
              onChange={(value) => setSocialReason(value.currentTarget.value)}
            />
          </div>
          <div className={styles.inputGroup} style={{ flex: 5 }}>
            <OutlinedInputWithLabel
              InputProps={{ readOnly: true }}
              label="Telefone"
              value={phone}
              fullWidth
              disabled
              onChange={(value) => setPhone(value.currentTarget.value)}
            />
          </div>
          <div className={styles.inputGroup} style={{ flex: 5 }}>
            <OutlinedInputWithLabel
              InputProps={{ readOnly: true }}
              label="Data da solicitação"
              value={date}
              fullWidth
              disabled
              onChange={(value) => setDate(value.currentTarget.value)}
            />
          </div>
        </div>
      </div>

      <div className={styles.nfsContainer}>
        <div className={styles.nfcont}>
          <h3 className={styles.nfsTitle}>NFs associadas a esta garantia</h3>
          <Button
            type="primary"
            danger
            style={{
              height: "45px",
              borderRadius: "10px",
              backgroundColor: "red",
            }}
            onClick={() => setModalOpen(true)}
          >
            Adicionar NF de Origem
          </Button>
        </div>

        {!loading && cardData.itens.length > 0 && cardData!.itens.map((nf, index) => (
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
              <span className={styles.nfsCode}>{`${
                nf.codigoItem.split(".")[0]
              }.${nf.codigoItem.split(".")[1]}`}</span>
              <span className={styles.nfsDivider}> | </span>
              <span className={styles.nfsQuantity}>
                {" "}
                {cardData.itens.length.toString()} ITENS
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <DeleteOutlined
                style={{ color: "#555", fontSize: "22px" }}
                className={styles.DeleteOutlined}
                onClick={() => showDeleteConfirm(nf.codigoItem)}
              />
              <Button
                type="text"
                className={styles.nextButton}
                onClick={() =>
                  handleDetailsNavigation({
                    itens: cardData.itens.length,
                    nf: nf.codigoItem,
                    sequence: nfs[index].sequence,
                  })
                }
              >
                &gt;
              </Button>
            </div>
          </div>
        ))}
      </div>

      <NFModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onAddNF={handleAddNF}
      />

      <Modal
        title="Confirmar Exclusão"
        open={modalDeleteOpen}
        onOk={handleDeleteNF}
        onCancel={() => setModalDeleteOpen(false)}
        okText="Excluir"
        cancelText="Cancelar"
        okButtonProps={{
          style: { backgroundColor: "red", borderColor: "red", color: "white" },
        }}
        cancelButtonProps={{
          style: { borderColor: "#dadada", color: "#5F5A56" },
        }}
      >
        <p>Você tem certeza de que deseja excluir esta NF?</p>
      </Modal>
    </div>
  );
};

export default RGIDetailsInitial;
