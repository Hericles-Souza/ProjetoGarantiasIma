/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import { Button, message, Modal, Spin } from "antd";
import { DeleteOutlined, LeftOutlined, FileOutlined } from "@ant-design/icons";
import styles from "./RGIDetailsInitial.module.css";
import OutlinedInputWithLabel from "@shared/components/input-outlined-with-label/OutlinedInputWithLabel.tsx";
import { GarantiaItem, GarantiasModel } from "@shared/models/GarantiasModel.ts";
import NFModal from "../addNewNF/modalAddNewNF";
import {
  converterStatusGarantia,
  GarantiasItemStatusEnum2,
  GarantiasStatusEnum,
  GarantiasStatusEnum2,
  StatusColors
} from "@shared/enums/GarantiasStatusEnum";
import api from "@shared/Interceptors";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";
import environment from "@env/environment";

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
  isOpen: boolean;
  isSell: boolean;
}

const RGIDetailsInitial: React.FC = () => {
  const [socialReason, setSocialReason] = useState("");
  const [phone, setPhone] = useState("");
  const [sellFile, setSellFile] = useState<{ fileNameWithExtension: string; imagemUrl: string }>();
  const { id } = useParams<{ id: string }>();
  const [date, setDate] = useState("");
  const navigate = useNavigate();
  const [cardData, setCardData] = useState<GarantiasModel>();
  const [modalOpen, setModalOpen] = useState<ModalModel>({
    isOpen: false,
    isSell: false,
  });
  const [nfs, setNfs] = useState<
    { itemCode: string; nfRef: string; itens: number }[]
  >([]);
  const [groupedItems, setGroupedItems] = useState<{ codigoItem?: string; nfReferencia?: string }[]>();
  const [associatedNfsWithItens, setAssociatedNfsWithItens] = useState<
    { nf: string; countItems: number }[]
  >([]);
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

  function getExtensionFromMimeType(mimeType: string): string {
    const mimeTypes: { [key: string]: string } = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "application/pdf": ".pdf",
      "application/msword": ".doc",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        ".docx",
      "application/zip": ".zip",
      "audio/mpeg": ".mp3",
      "video/mp4": ".mp4",
      // Adicione outros tipos MIME conforme necessário
    };

    return mimeTypes[mimeType] || ""; // Retorna a extensão ou uma string vazia se não encontrado
  }

  function getFileExtensionFromBlob(blob: Blob): string {
    const mimeType = blob.type; // Pega o tipo MIME do Blob
    const extension = getExtensionFromMimeType(mimeType);
    return extension;
  }

  const ordenarItens = () => {
    setGroupedItems((prevItems) => {
      return [...prevItems].sort((a, b) => {
        if (a.codigoItem && b.codigoItem) {
          return a.codigoItem.localeCompare(b.codigoItem); // Ordena alfabeticamente
        }
        return 0;
      });
    });
  };


  const getSellFile = async (itemId: string, field: string) => {
    const urlGetFile =
      environment.apiUrl +
      `/files/files/download-private-file-item/${itemId}/${field}`;
    console.log(urlGetFile);

    const response = await fetch(urlGetFile, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${context.user.token}`, // Token de autenticação
      },
    });

    const blob = await response.blob();
    const fileExtension = getFileExtensionFromBlob(blob);
    const fileNameWithExtension = field + fileExtension;
    const imagemUrl = URL.createObjectURL(blob);
    console.log(fileNameWithExtension);

    // handleDownload(fileNameWithExtension);
    // handleDownload(fileNameWithExtension, imagemUrl);

    return { fileNameWithExtension, imagemUrl }
  };




  const getRgiWithSuffix = (RgiCode: string, letter: string, index) => {
    return `${RgiCode}.${letter}.${index}`;
  };

  const getAssciatedNfs = async (garantiaId: string) => {
    const garantiaItemResponse = await fetch(
      `${environment.apiUrl}/garantias/item/associated-nf/${garantiaId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${context.user.token}`,
        },
      }
    );
    const associatedNfs = await garantiaItemResponse.json();
    setAssociatedNfsWithItens(associatedNfs.data);
    console.log("nfs associadas: ", associatedNfs.data);
  };

  // Função para agrupar itens por nfReferencia e pegar somente 1 item de cada grupo
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groupByNfReferencia = (itens: GarantiaItem[]): { codigoItem?: string; nfReferencia?: string }[] => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const grouped: { codigoItem?: string; nfReferencia?: string }[] = [];

    itens?.forEach((item) => {
      if (!grouped[item.nfReferencia]) {
        const formatCodigoItem = item.codigoItem.split(".")[0] + "." + item.codigoItem.split(".")[1];

        grouped[item.nfReferencia] = {
          nfReferencia: item.nfReferencia,
          codigoItem: formatCodigoItem
        };

      }
    });

    // Retorna um array com os itens agrupados
    return Object.values(grouped);
  };

  useEffect(() => {
    const fetchData = async () => {
      let data: GarantiasModel = null;
      try {
        if (location.state) {
          console.log("locaton.state: " + JSON.stringify(location.state));
          data = location.state.garantiaData;
          await getAssciatedNfs(data.id);
          setSocialReason(data.razaoSocial);
          setPhone(data.telefone);
          setDate(
            `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`
          );
          setCardData(data);
          setRgi(data.rgi);
          const sellFile = await getSellFile(data.itens[0].id, "nfVenda") as { fileNameWithExtension: string; imagemUrl: string };
          setSellFile(sellFile);
          console.log("sellFile: " + JSON.stringify(sellFile));
          setNfs([
            {
              itemCode: data.nf,
              nfRef: data.nf,
              itens: data.itens ? data.itens.length : 0,
            },
          ]);
          if (cardData?.itens?.length > 0) {
            const itensAgrupados = groupByNfReferencia(cardData?.itens);
            console.log("itensAgrupados: ", itensAgrupados);
            setGroupedItems(itensAgrupados);
            ordenarItens();
          }
          // console.log("garantia: " + JSON.stringify(data));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        console.log("finalizou");
        setLoading(false);
      }
    };

    fetchData();
  }, [location.state, cardData]);

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
      okButtonProps: {
        style: { backgroundColor: "red", borderColor: "red" },
      },
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

  const postOrPutGarantiaItemAsync = async (
    itemCodeCompare: string,
    nfReference: string,
    itemId: string,
  ) => {
    console.log("salvamento: " + cardData);
    if (!cardData?.id) {
      message.error("ID da garantia não encontrado");
      return;
    }
    if (!itemId) {
      message.error("ID do item não encontrado");
      return;
    }

    const responseGetItens = await api.get(
      `/garantias/item/by-garantia/${cardData.id}`
    );
    const garantiaItensAPI = responseGetItens.data.data as GarantiaItem[];

    if (
      garantiaItensAPI.filter((value) => value.codigoItem == itemCodeCompare)
        .length <= 0
    ) {
      const paylaodPost = {
        id: itemId,
        garantiaId: cardData.id,
        codigoItem: itemCodeCompare,
        nfReferencia: nfReference,
        codigoStatus: GarantiasItemStatusEnum2.NAO_ANALISADO,
        index: cardData.itens.length.toString(),
      };
      console.log("paylaodPost: ", JSON.stringify(paylaodPost));
      const endpoint = environment.apiUrl + "/garantias/item/create";

      const responsePost = await api.post(endpoint, paylaodPost);
      if (responsePost.status === 200 || responsePost.status === 201) {
        message.success("Garantia atualizada com sucesso!");
      } else {
        message.error("Erro ao atualizar a garantia.");
      }
      console.log("response: ", responsePost.data);
    }
  };

  const handleDetailsNavigation = async (
    nf: { nf: string; itens: number },
    countItems: number,
    nfNumber: string
  ) => {
    if (!cardData?.id) {
      console.error("Dados da garantia ainda não carregados.");
      return;
    }

    console.log("codigoitem: ", nf.nf);
    console.log("cardData.itens: ", cardData.itens);


    const itemId = cardData.itens?.find((item) => item.codigoItem.split(".")[0] + "." + item.codigoItem.split(".")[1] === nf.nf).id;

    const sellFile = await getSellFile(itemId, "nfVenda") as { fileNameWithExtension: string; imagemUrl: string };
    setSellFile(sellFile);

    if (sellFile)
      navigate(`/garantias/rgi/details-itens-nf/${cardData.id}`, {
        state: {
          garantiaData: cardData,
          garantiaId: cardData.id,
          currentNf: nf,
          countItems: countItems,
          nfNumber: nfNumber,
          sellFile: sellFile
        },
      });
  };

  const handleAddNF = async (nfNumber: string) => {
    const ultimoItem = groupedItems[groupedItems.length - 1];

    // Extrai a parte numérica e a letra do último item
    const [numero, letra] = ultimoItem.codigoItem.split('.');
    console.log(numero, letra)
    
    // Calcula a próxima letra do alfabeto
    const proximaLetra = String.fromCharCode(letra.charCodeAt(0) + 1);
    const itemCode = getRgiWithSuffix(rgi, proximaLetra, 1);
    const itemId = crypto.randomUUID()
    console.log("nfNumber" + nfNumber);
    setNfs((prevNfs) => [
      ...prevNfs,
      { itemCode: itemCode, nfRef: nfNumber, itens: 1 },
    ]);
    setAssociatedNfsWithItens((prevassociatedNfsWithItens) => [
      ...prevassociatedNfsWithItens,
      { nf: nfNumber, countItems: 1 },
    ]);
    cardData.itens.push({
      id: itemId,
      codigoItem: itemCode,
      nfReferencia: nfNumber,
    } as GarantiaItem);

    setCardData(cardData);
    const itensAgrupados = groupByNfReferencia(cardData?.itens);
    setGroupedItems(itensAgrupados);
    ordenarItens();

    console.log("nfadicionada: " + JSON.stringify(cardData.itens));

    await postOrPutGarantiaItemAsync(itemCode, nfNumber, itemId);
  };

  const handleDeleteNF = async () => {
    try {
      console.log(nfToDelete);
      // Chamada à API para deletar a NF
      const itensToDelete = cardData?.itens.filter((item) => item.codigoItem.split(".")[0] + "."+ item.codigoItem.split(".")[1] === nfToDelete)
      

      itensToDelete?.forEach(async (itemToDelete) => {
        const response = await api.delete(`/garantias/item/delete/${itemToDelete.id}`);
      if (response.status === 200) {
        // Atualiza os estados locais
        setNfs((prevNfs) => prevNfs.filter((nf) => nf.itemCode !== itemToDelete.codigoItem));
        const groupedItemToDelete = groupedItems.find((groupedItem) => groupedItem.codigoItem === itemToDelete.codigoItem);
      console.log("asdasdasdas", groupedItems.filter((item) => item.codigoItem !== itemToDelete.codigoItem.split(".")[0] + "." + itemToDelete.codigoItem.split(".")[1]));
        setGroupedItems((prevGroupedItems) =>
          prevGroupedItems?.filter((item) => item.codigoItem !== itemToDelete.codigoItem.split(".")[0] + "." + itemToDelete.codigoItem.split(".")[1])
        );
        ordenarItens();
        console.log("55165153", associatedNfsWithItens.filter((nf) => nf.nf !== itemToDelete.nfReferencia));
        
        setAssociatedNfsWithItens((prevAssociatedNfs) =>
          prevAssociatedNfs.filter((nf) => nf.nf !== itemToDelete.nfReferencia)
        );  
        setCardData((prevCardData) => ({
          ...prevCardData,
          itens: prevCardData.itens.filter((item) => item.codigoItem !== itemToDelete.codigoItem),
        }));
        setModalDeleteOpen(false);
        message.success("NF excluída com sucesso!");
      } else {
        message.error("Erro ao excluir a NF.");
      }
      });
      
    } catch (error) {
      console.error("Erro ao excluir a NF:", error);
      message.error("Erro ao excluir a NF.");
    }
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
    let garantia: GarantiasModel = {};

    try {
      if (cardData.codigoStatus === GarantiasStatusEnum2.NF_DEVOLUCAO_RECUSADA) {
        garantia = {
          razaoSocial: cardData?.razaoSocial,
          telefone: cardData?.telefone,
          email: cardData?.email,
          nf: cardData?.nf,
          fornecedor: cardData?.fornecedor,
          codigoStatus: GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
          observacao: cardData?.observacao,
          usuarioAtualizacao: context.user.username,
          status: GarantiasStatusEnum.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
          dataAtualizacao: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`,
        };
      }
      else {
        garantia = {
          razaoSocial: socialReason,
          telefone: phone,
          email: context.user.email,
          nf: cardData.nf,
          fornecedor: context.user.fullname,
          codigoStatus:
            cardData.codigoStatus == GarantiasStatusEnum2.NAO_ENVIADO
              ? GarantiasStatusEnum2.EM_ANALISE
              : GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
          observacao: "teste",
          usuarioAtualizacao: context.user.username,
          status: cardData.status,
          dataAtualizacao: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`,
        };

      }

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
          <div style={{
            color: StatusColors[cardData?.codigoStatus],
            backgroundColor: `${StatusColors[cardData?.codigoStatus]}26`,
          }} className={styles.statusTag}>{ converterStatusGarantia(cardData?.codigoStatus) || "Status não disponível"}</div>
        </div>
        <div className={styles.buttonsContainer}>
          {cardData?.codigoStatus === GarantiasStatusEnum2.NAO_ENVIADO &&
            context.user.rule.name === "cliente" && (
              <Button
                type="default"
                danger
                className={styles.buttonDeleteRgi}
                onClick={handleDeleteGuarantee}
              >
                Excluir
              </Button>
            )}
          {(cardData?.codigoStatus ==
            GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO ||
            cardData?.codigoStatus == GarantiasStatusEnum2.NAO_ENVIADO ||
            cardData?.codigoStatus == GarantiasStatusEnum2.NF_DEVOLUCAO_RECUSADA) &&
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
          {(cardData?.codigoStatus == GarantiasStatusEnum2.NAO_ENVIADO) &&
            context.user.rule.name == "cliente" && (
              <Button
                type="primary"
                danger
                style={{
                  height: "45px",
                  borderRadius: "10px",
                  backgroundColor: "red",
                }}
                onClick={() =>
                  setModalOpen({
                    isOpen: true,
                    isSell: true,
                  })
                }
              >
                Adicionar NF de Origem
              </Button>
            )}
        </div>

        {groupedItems?.sort().map(({ codigoItem, nfReferencia }, index) => {
          codigoItem = rgi + "." + codigoItem.split(".")[1];
          return <div className={styles.nfsItem}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <FileOutlined
                style={{
                  marginRight: "10px",
                  marginLeft: "20px",
                  fontSize: "20px",
                  color: "red",
                }}
              />
              <span className={styles.nfsCode}>{codigoItem}</span>
              <span className={styles.nfsDivider}> | </span>
              <span className={styles.nfsQuantity}>
                {" "}
                {associatedNfsWithItens?.find((value) => value.nf === nfReferencia)?.countItems}  ITENS
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              {cardData?.codigoStatus ==
                GarantiasStatusEnum2.NAO_ENVIADO &&
                context.user.rule.name == "cliente" && (
                  <DeleteOutlined
                    style={{ color: "#555", fontSize: "22px" }}
                    className={styles.DeleteOutlined}
                    onClick={() => showDeleteConfirm(codigoItem)}
                  />
                )}
              {cardData?.codigoStatus ===
                GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO &&

                context.user.rule.name == "cliente" && (
                  <label className={styles.buttonUpdateNfSale}>
                    <input
                      type="file"
                      style={{ display: "none" }}
                      onChange={(e) => {
                  
                      }}
                    />
                    Adicionar Anexo
                  </label>
                )}

              <Button
                type="text"
                className={styles.nextButton}
                onClick={() =>
                  handleDetailsNavigation(
                    {
                      itens: cardData.itens.length,
                      nf: codigoItem,
                    },
                    associatedNfsWithItens[index]?.countItems,
                    associatedNfsWithItens[index]?.nf
                  )
                }
              >
                &gt;
              </Button>
            </div>
          </div>
        })}
      </div>

      <NFModal
        open={modalOpen.isOpen}
        onOpenChange={setModalOpen}
        onAddNF={handleAddNF}
        itemId={cardData.itens[0].id}
        isSell={modalOpen.isSell}
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
