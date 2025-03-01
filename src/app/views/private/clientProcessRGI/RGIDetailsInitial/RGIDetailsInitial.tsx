import React, { useContext, useEffect, useState } from "react";
import { Button, message, Modal, Spin } from "antd";
import { DeleteOutlined, LeftOutlined, FileOutlined } from "@ant-design/icons";
import styles from "./RGIDetailsInitial.module.css";
import OutlinedInputWithLabel from "@shared/components/input-outlined-with-label/OutlinedInputWithLabel.tsx";
import { GarantiaItem, GarantiasModel } from "@shared/models/GarantiasModel.ts";
import NFModal from "../addNewNF/modalAddNewNF";
import { GarantiasStatusEnum2 } from "@shared/enums/GarantiasStatusEnum";
import api from "@shared/Interceptors";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";

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

export interface ModalModel {
  isOpen: boolean,
  isSell: boolean
}

const RGIDetailsInitial: React.FC = () => {
  const [socialReason, setSocialReason] = useState("");
  const [phone, setPhone] = useState("");
  const { id } = useParams<{ id: string }>();
  const [date, setDate] = useState("");
  const navigate = useNavigate();
  const [cardData, setCardData] = useState<GarantiasModel>();
  const [modalOpen, setModalOpen] = useState<ModalModel>({isOpen: false, isSell: false});
  const [nfs, setNfs] = useState<{ nf: string; itens: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Para controlar o carregamento

  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [nfToDelete, setNfToDelete] = useState<string>("");
  const [rgi, setRgi] = useState("");
  const location = useLocation();
  const context = useContext(AuthContext);
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

  const getRgiWithSuffix = (RgiCode: string, indexLetters: number, index) => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return `${RgiCode}.${letters[indexLetters]}.${index}`;
  };

  useEffect(() => {
    const fetchData = () => {
      let data: GarantiasModel = null;
      console.log("locaton.state: " + JSON.stringify(location.state));

      try {
        if (location.state) {
          console.log("locaton.state: " + JSON.stringify(location.state));
          data = location.state.garantiaData;
          setSocialReason(data.razaoSocial);
          setPhone(data.telefone);
          setDate(
            `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`
          );
          setCardData(data);
          setRgi(data.rgi);
          setNfs([
            {
              nf: data.nf,
              itens: data.itens ? data.itens.length : 0,
            },
          ]);
          // console.log("garantia: " + JSON.stringify(data));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        console.log("finalizou");

        console.log("razaoSocial: " + data.razaoSocial);
        console.log("telefone: " + data.telefone);
        console.log("data: " + data.data);
        console.log("cardData: " + JSON.stringify(data));
        console.log("rgi: " + data.rgi);
        console.log("rgi: " + data.itens);
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
      console.log(
        "newrGi: " + `${allGarantias[0].rgi.split("-")[0]}-${nextNumber}`
      );
      return `${context.user.username}-${nextNumber}`;
    } catch (error) {
      console.error("Erro ao gerar RGI:", error);
    }
  };

  const handleDetailsNavigation = (nf: { nf: string; itens: number }) => {
    if (!cardData?.id) {
      console.error("Dados da garantia ainda não carregados.");
      return;
    }
    navigate(`/garantias/rgi/details-itens-nf/${cardData.id}`, {
      state: {
        garantiaData: cardData,
        garantiaId: cardData.id,
        currentNf: nf,
      },
    });
  };

  const handleAddNF = async (nfNumber: string) => {
    const newRgiCode = await generateNextRGI();
    const itemCode = getRgiWithSuffix(newRgiCode, nfs.length, 1); ///// TODO parametro 2 precis ser qtde de nfs + 1

    console.log("itemCode" + itemCode);
    setNfs((prevNfs) => [...prevNfs, { nf: nfNumber, itens: 1 }]);
    cardData.itens.push({
      codigoItem: itemCode,
      nfReferencia: nfNumber,
    } as GarantiaItem);

    setCardData(cardData);

    console.log("nfadicionada: " + JSON.stringify(cardData.itens));

    setCardData(cardData);
  };

  const handleDeleteNF = () => {
    setNfs((prevNfs) => prevNfs.filter((nf) => nf.nf !== nfToDelete));
    setModalDeleteOpen(false);
  };

  const showDeleteConfirm = (nfNumber: string) => {
    setNfToDelete(nfNumber);
    setModalDeleteOpen(true);
  };

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
        `/garantias/garantiasHeader/${id}/UpdateHeader`,
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
          {cardData?.codigoStatus !== 2 &&
            cardData?.codigoStatus ==
              GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO &&
            context.user.rule.name == "cliente" && (
              <Button
                type="default"
                danger
                className={styles.buttonDeleteRgi}
                onClick={handleDeleteGuarantee}
              >
                Excluir
              </Button>
            )}
          {cardData?.codigoStatus ==
            GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO &&
            context.user.rule.name == "cliente" && (
              <>
                <Button
                  onClick={send}
                  type="default"
                  danger
                  className={styles.buttonSaveRgi}
                >
                  Salvar
                </Button>
                <Button
                  onClick={send}
                  type="primary"
                  danger
                  style={{ backgroundColor: "red" }}
                  className={styles.buttonSendRgi}
                >
                  Enviar
                </Button>
              </>
            )}
        </div>
      </div>

      <hr className={styles.divider} />
      {cardData?.codigoStatus != GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO &&
        context.user.rule.name == "cliente" && (
          <div className={styles.infoContainer}>
            <h3 className={styles.infoTitle}>Informações Gerais</h3>
            <div className={styles.inputsContainer}>
              <div className={styles.inputGroup} style={{ flex: 15 }}>
                <OutlinedInputWithLabel
                  InputProps={{ readOnly: true }}
                  label="Razão social"
                  value={cardData.razaoSocial}
                  fullWidth
                  disabled
                />
              </div>
              <div className={styles.inputGroup} style={{ flex: 5 }}>
                <OutlinedInputWithLabel
                  InputProps={{ readOnly: true }}
                  label="Telefone"
                  value={cardData.telefone}
                  fullWidth
                  disabled
                />
              </div>
              <div className={styles.inputGroup} style={{ flex: 5 }}>
                <OutlinedInputWithLabel
                  InputProps={{ readOnly: true }}
                  label="Data da solicitação"
                  value={date}
                  fullWidth
                  disabled
                />
              </div>
            </div>
          </div>
        )}
      <div className={styles.nfsContainer}>
        <div className={styles.nfcont}>
          <h3 className={styles.nfsTitle}>NFs associadas a esta garantia</h3>
          {cardData?.codigoStatus ==
            GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO &&
            context.user.rule.name == "cliente" && (
              <Button
                type="primary"
                danger
                style={{
                  height: "45px",
                  borderRadius: "10px",
                  backgroundColor: "red",
                }}
                onClick={() => setModalOpen({
                  isOpen: true,
                  isSell: true,
                },)}
              >
                Adicionar NF de Origem
              </Button>
            )}
        </div>

        {cardData.itens.map((nf, index) => (
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
              {cardData?.codigoStatus ==
                GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO &&
                context.user.rule.name == "cliente" && (
                  <DeleteOutlined
                    style={{ color: "#555", fontSize: "22px" }}
                    className={styles.DeleteOutlined}
                    onClick={() => showDeleteConfirm(nf.codigoItem)}
                  />
                )}
              {cardData?.codigoStatus !=
                GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO &&
                context.user.rule.name == "cliente" && (
                  <Button
                    type="primary"
                    danger
                    style={{
                      height: "45px",
                      borderRadius: "10px",
                      backgroundColor: "red",
                    }}
                    onClick={() => setModalOpen({
                      isOpen: true,
                      isSell: false,
                    },)}
                  >
                    Adicionar NF de Devolução
                  </Button>
                )}

              <Button
                type="text"
                className={styles.nextButton}
                onClick={() =>
                  handleDetailsNavigation({
                    itens: cardData.itens.length,
                    nf: nf.codigoItem,
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
        open={modalOpen.isOpen}
        onOpenChange={setModalOpen}
        onAddNF={handleAddNF}
        itemId={cardData.itens[0].id}
        isSell={false}
        garantiaId={cardData?.id}
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
