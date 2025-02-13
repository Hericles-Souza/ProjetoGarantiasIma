import React, { useContext, useEffect, useState } from "react";
import { Button, message, Modal, Spin } from "antd";
import { DeleteOutlined, LeftOutlined, FileOutlined } from "@ant-design/icons";
import styles from "./RGIDetailsInitial.module.css";
import OutlinedInputWithLabel from "@shared/components/input-outlined-with-label/OutlinedInputWithLabel.tsx";
import { GarantiasModel } from "@shared/models/GarantiasModel.ts";
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

const RGIDetailsInitial: React.FC = () => {
  const [socialReason, setSocialReason] = useState("");
  const [phone, setPhone] = useState("");
  const { id } = useParams<{ id: string }>();
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

  // Função para gerar o sufixo do RGI
  const getRgiWithSuffix = (index: number) => {
    const base = rgi || cardData?.rgi || "RGI";
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return `${base}.${letters[index]}.${index + 1}`;
  };

  useEffect(() => {
    const fetchData = () => {
      let data: GarantiasModel = null;
      try {
        if (location.state) {
          data = location.state.garantia;
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
        rgiLetter: getRgiWithSuffix(nf.sequence - 1),
      },
    });
  };

  const handleAddNF = (nfNumber: string) => {
    setNfs((prevNfs) => [
      ...prevNfs,
      {
        nf: nfNumber,
        itens: 0,
        sequence: prevNfs.length + 1,
      },
    ]);
  };

  const handleDeleteNF = () => {
    setNfs((prevNfs) => prevNfs.filter((nf) => nf.nf !== nfToDelete));
    setModalDeleteOpen(false);
  };

  const showDeleteConfirm = (nfNumber: string) => {
    setNfToDelete(nfNumber);
    setModalDeleteOpen(true);
  };

  const save = () => {
    nfs.forEach((element) => {
      console.log("itens: " + element.itens);
      console.log("nf: " + element.nf);
    });
  };

  const send = async () => {
    if (!cardData?.id) {
      message.error("ID da garantia não encontrado");
      return;
    }
    const itemId = cardData.itens?.[0]?.id;
    if (!itemId) {
      message.error("ID do item não encontrado");
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

    const updatePayload = {
      codigoItem: cardData.itens?.[0].codigoItem || "",
      tipoDefeito: cardData.itens?.[0].tipoDefeito || "",
      modeloVeiculoAplicado: cardData.itens?.[0].modeloVeiculoAplicado || "",
      torqueAplicado: cardData.itens?.[0].torqueAplicado || 0,
      nfReferencia: cardData.nf || "",
      loteItemOficial: cardData.itens?.[0].loteItemOficial || "",
      loteItem: cardData.itens?.[0].loteItem || "",
      codigoStatus: GarantiasStatusEnum2.EM_ANALISE,
      solicitarRessarcimento:
        cardData.itens?.[0].solicitarRessarcimento || false,
    };

    const garantia: GarantiasModel = {
      razaoSocial: socialReason,
      telefone: phone,
      email: context.user.email,
      nf: cardData.nf,
      fornecedor: context.user.fullname,
      codigoStatus: cardData.codigoStatus,
      observacao: "teste",
      usuarioAtualizacao: context.user.fullname,
      status: cardData.status,
      dataAtualizacao: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`,
    };
    try {
      console.log("TESTE: " + id);
      const response = await api.put(
        `/garantias/garantiasItem/${itemId}/UpdateItem`,
        updatePayload
      );

      const responseHeader = await api.put(
        `/garantias/garantiasHeader/${id}/UpdateHeader`,
        garantia
      );

      if (response.status === 200 && responseHeader.status === 200) {
        setCardData({
          ...cardData,
          codigoStatus: GarantiasStatusEnum2.EM_ANALISE,
          status: GarantiasStatusEnum2.EM_ANALISE.toString(),
        });
        console.log(response);
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
            onClick={save}
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
              value={cardData.data}
              fullWidth
              disabled
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
              <span className={styles.nfsCode}>{getRgiWithSuffix(index)}</span>
              <span className={styles.nfsDivider}> | </span>
              <span className={styles.nfsQuantity}> {cardData.itens.length.toString()} ITENS</span>
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
                onClick={() => handleDetailsNavigation({
                  itens: cardData.itens.length,
                  nf: nf.codigoItem,
                  sequence: nfs[index].sequence
                })}
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
