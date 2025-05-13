/* eslint-disable @typescript-eslint/no-explicit-any */
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
  GarantiasItemStatusEnum,
  GarantiasItemStatusEnum2,
  GarantiasStatusEnum,
  GarantiasStatusEnum2,
  StatusColors,
} from "@shared/enums/GarantiasStatusEnum";
import api from "@shared/Interceptors";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";
import environment from "@env/environment";
import { UserRoleEnum } from "@shared/enums/UserRoleEnum";
import { NotaFiscal } from "@shared/models/NotaFiscalModel";
import { isUndefined } from "lodash";
import Item from "antd/es/list/Item";

// Função para extrair array de garantias (inalterada)
const extractGarantiasArray = (data: any): GarantiasModel[] => {
  if (data && data.data) {
    return Array.isArray(data.data) ? data.data : [data.data];
  }
  return Array.isArray(data) ? data : [];
};

// Interface para o modelo do modal (inalterada)
export interface ModalModel {
  isOpen: boolean;
  isSell: boolean;
}

const RGIDetailsInitial: React.FC = () => {
  const [socialReason, setSocialReason] = useState("");
  const [phone, setPhone] = useState("");
  const [sellFile, setSellFile] = useState<{
    fileNameWithExtension: string;
    imagemUrl: string;
  }>();
  const { id } = useParams<{ id: string }>();
  const [date, setDate] = useState("");
  const navigate = useNavigate();
  const [cardData, setCardData] = useState<GarantiasModel>();
  const [modalOpen, setModalOpen] = useState<ModalModel>({
    isOpen: false,
    isSell: false,
  });
  const [groupedItems, setGroupedItems] =
    useState<{ codigoItem?: string; nfReferencia?: string }[]>();
  const [associatedNfsWithItens, setAssociatedNfsWithItens] = useState<
    { nf: string; countItems: number }[]
  >([]);
  const [garantiaNfsWithItens, setGarantiaNfsWithItens] = useState<
    NotaFiscal[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
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
    };
    return mimeTypes[mimeType] || "";
  }

  function getFileExtensionFromBlob(blob: Blob): string {
    const mimeType = blob.type;
    return getExtensionFromMimeType(mimeType);
  }

  const ordenarItens = () => {
    setGroupedItems((prevItems) => {
      if (!prevItems) return prevItems;
      return [...prevItems].sort((a, b) => {
        if (a.codigoItem && b.codigoItem) {
          return a.codigoItem.localeCompare(b.codigoItem);
        }
        return 0;
      });
    });
  };

  const getSellFile = async (itemId: string, field: string) => {
    const urlGetFile =
      environment.apiUrl +
      `/files/files/download-private-file-item/${itemId}/${field}`;
    const response = await fetch(urlGetFile, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${context.user.token}`,
      },
    });
    const blob = await response.blob();
    const fileExtension = getFileExtensionFromBlob(blob);
    const fileNameWithExtension = field + fileExtension;
    const imagemUrl = URL.createObjectURL(blob);
    return { fileNameWithExtension, imagemUrl };
  };

  const getRgiWithSuffix = (RgiCode: string, letter: string, index: number) => {
    return `${RgiCode}.${letter}.${index}`;
  };

  const getAssciatedNfs = async (garantiaId: string, statusGarantia: number) => {
    try {
      const garantiaItemResponse = await fetch(
        `${environment.apiUrl}/nota-fiscal/by-garantia/${garantiaId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${context.user.token}`,
          },
        }
      );
      const associatedNfsByGarantia = await garantiaItemResponse.json();
      const newAssociatedNfsByGarantia: NotaFiscal[] = [];
      for (const [index, nfAssociated] of associatedNfsByGarantia.data.entries()) {
        newAssociatedNfsByGarantia[index] = nfAssociated;
        if (statusGarantia > GarantiasStatusEnum2.PECAS_AVALIADAS_PARCIAMENTE) {
          const returnedSellFile = await getSellFile(nfAssociated.id, "nfDev");
          newAssociatedNfsByGarantia[index].recSellFile = returnedSellFile;
        } else {
          newAssociatedNfsByGarantia[index].recSellFile = null;
        }
      }
      setGarantiaNfsWithItens(newAssociatedNfsByGarantia);
    } catch (error) {
      console.error("Erro ao buscar NFs associadas:", error);
      message.error("Erro ao carregar NFs associadas.");
    }
  };

  const groupByNfReferencia = (
    itens: GarantiaItem[]
  ): { codigoItem?: string; nfReferencia?: string }[] => {
    const grouped: { [key: string]: { codigoItem?: string; nfReferencia?: string } } = {};
    itens?.forEach((item) => {
      if (!grouped[item.nfReferencia]) {
        const formatCodigoItem =
          item.codigoItem.split(".")[0] + "." + item.codigoItem.split(".")[1];
        grouped[item.nfReferencia] = {
          nfReferencia: item.nfReferencia,
          codigoItem: formatCodigoItem,
        };
      }
    });
    return Object.values(grouped);
  };

  useEffect(() => {
    const fetchData = async () => {
      let data: GarantiasModel | null = null;
      try {
        if (location.state) {
          data = location.state.garantiaData;
          await getAssciatedNfs(data.id, data.codigoStatus);
          setSocialReason(data.razaoSocial);
          setPhone(data.telefone);
          setDate(
            `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`
          );
          setCardData(data);
          setRgi(data.codigoRGI || data.rgi);
          if (data?.notas?.length > 0) {
            const itensAgrupados = groupByNfReferencia(data.itens);
            setGroupedItems(
              data.notas.map((nota) => ({
                codigoItem: nota.codigo,
                nfReferencia: nota.id_referencia,
              }))
            );
            ordenarItens();
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Erro ao carregar dados da garantia.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location.state]);

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
    payloadPost: NotaFiscal,
    nfCodeCompare: string,
    nfReference: string,
    notaId: string
  ) => {
    if (!cardData?.id) {
      message.error("ID da garantia não encontrado");
      return;
    }
    if (!notaId) {
      message.error("ID da nota não encontrado");
      return;
    }
    try {
      const responseGetItens = await api.get(
        `/nota-fiscal/by-garantia/${cardData.id}`
      );
      const notasFiscaisAPI = responseGetItens.data.data as NotaFiscal[];
      console.log("notasFiscaisAPI: ", notasFiscaisAPI);
      
      if (
        notasFiscaisAPI.filter((value) => value.codigo === nfCodeCompare).length <= 0
      ) {
        const endpoint = environment.apiUrl + "/nota-fiscal/create";
        const responsePost = await api.post(endpoint, payloadPost);
        console.log("payloadPost: ", payloadPost);
        console.log("responsePost: ", responsePost);
        
        if (responsePost.status === 200 || responsePost.status === 201) {
          message.success("Nota fiscal adicionada com sucesso!");
          setGarantiaNfsWithItens((prevGarantiaNfsWithItens) => [
            ...prevGarantiaNfsWithItens,
            payloadPost,
          ]);
          const updatedCardData = {
            ...cardData,
            notas: [...(cardData.notas || []), payloadPost],
          };
          setCardData(updatedCardData);
        } else {
          message.error("Erro ao adicionar a nota fiscal.");
        }
      }
    } catch (error) {
      console.error("Erro ao adicionar nota fiscal:", error);
      message.error("Erro ao adicionar nota fiscal.");
    }
  };

  const [modalRecusaOpen, setModalRecusaOpen] = useState(false);
  const [motivoRecusa, setMotivoRecusa] = useState<string>("");

  const showMotivoRecusa = (motivo: string) => {
    setMotivoRecusa(motivo || "Motivo não especificado.");
    setModalRecusaOpen(true);
  };

  const handleDetailsNavigation = async (
    nf: { nf: string; itens: number },
    countItems: number,
    nfNumber: string,
    nota: NotaFiscal
  ) => {
    if (!cardData?.id) {
      console.error("Dados da garantia ainda não carregados.");
      return;
    }
    const itemId = nota.itens?.find((item) => item.rgi === nota.rgi)?.id;
    navigate(`/garantias/rgi/details-itens-nf/${cardData.id}`, {
      state: {
        garantiaData: cardData,
        notaId: nota.id,
        currentNf: nf,
        countItems: countItems,
        nfNumber: nfNumber,
        sellFile: sellFile,
        nota: nota,
      },
    });
  };

  const handleAddNF = async (nfNumber: string) => {
    let proximaLetra = "A";
    if (garantiaNfsWithItens.length > 0) {
      const ultimoItem = garantiaNfsWithItens[garantiaNfsWithItens.length - 1];
      console.log("ultimoItem ", ultimoItem, "garantiaNfsWithItens: ",garantiaNfsWithItens);
      
      const [letra] = ultimoItem.rgi != null ? ultimoItem.rgi.split(".")[1] : ultimoItem.codigoRGI.split(".")[1];
      proximaLetra = String.fromCharCode(letra.charCodeAt(0) + 1);
    }
    const itemCode = getRgiWithSuffix(rgi, proximaLetra, 1);
    const notaId = crypto.randomUUID();
    const itemId = crypto.randomUUID();
    const garantiasItem: GarantiaItem[] = [
      {
        id: itemId,
        nota_fiscal_id: notaId,
        codigoItem: rgi + "." + proximaLetra + ".1",
        codigoRGI: rgi + "." + proximaLetra,
        nfReferencia: nfNumber,
        codigoStatus: GarantiasItemStatusEnum2.NAO_ANALISADO,
        status: GarantiasItemStatusEnum.NAO_ANALISADO,
      },
    ];
    const newNotaFiscal = {
      id: notaId,
      codigoRGI: rgi + "." + proximaLetra,
      codigo: nfNumber,
      garantiaId: cardData?.id,
      id_referencia: cardData?.id,
      observacao: "",
      tipo_nota: "nota fiscal de origem",
      data_atualizacao: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`,
      data_emissao: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`,
      itens: garantiasItem,
    } as NotaFiscal;
    await postOrPutGarantiaItemAsync(newNotaFiscal, itemCode, nfNumber, notaId);
  };

  const handleDeleteNF = async () => {
    try {
      const itensToDelete = cardData?.itens.filter(
        (item) =>
          item.codigoItem.split(".")[0] +
          "." +
          item.codigoItem.split(".")[1] ===
          nfToDelete
      );
      if (!itensToDelete || itensToDelete.length === 0) {
        message.error("Nenhum item encontrado para exclusão.");
        return;
      }
      for (const itemToDelete of itensToDelete) {
        const response = await api.delete(
          `/garantias/item/delete/${itemToDelete.id}`
        );
        if (response.status === 200) {
          setGroupedItems((prevGroupedItems) =>
            prevGroupedItems?.filter(
              (item) =>
                item.codigoItem !==
                itemToDelete.codigoItem.split(".")[0] +
                "." +
                itemToDelete.codigoItem.split(".")[1]
            )
          );
          ordenarItens();
          setAssociatedNfsWithItens((prevAssociatedNfs) =>
            prevAssociatedNfs.filter(
              (nf) => nf.nf !== itemToDelete.nfReferencia
            )
          );
          setCardData((prevCardData) => ({
            ...prevCardData,
            itens: prevCardData.itens.filter(
              (item) => item.codigoItem !== itemToDelete.codigoItem
            ),
          }));
        } else {
          message.error("Erro ao excluir a NF.");
        }
      }
      setModalDeleteOpen(false);
      message.success("NF excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir a NF:", error);
      message.error("Erro ao excluir a NF.");
    }
  };

  const showDeleteConfirm = (nfNumber: string) => {
    setNfToDelete(nfNumber);
    setModalDeleteOpen(true);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    nfId: string,
    notaFiscal: NotaFiscal
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const blob = new Blob([file], { type: file.type });
      const endpoint = environment.apiUrl + "/files/upload-private-file-item";
      const fileData = new FormData();
      fileData.append("file", file);
      fileData.append("itemId", nfId);
      fileData.append("field", "nfVenda");
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${context.user.token}`,
            accept: "*/*",
          },
          body: fileData,
        });
        if (response.status === 201) {
          message.success("Arquivo enviado com sucesso!");
          const fileExtension = getFileExtensionFromBlob(blob);
          const fileNameWithExtension = "nfVenda" + fileExtension;
          const imagemUrl = URL.createObjectURL(blob);
          notaFiscal.recSellFile = { fileNameWithExtension, imagemUrl };
          setGarantiaNfsWithItens((prevGarantiaNfsWithItens) => {
            const updatedNfs = prevGarantiaNfsWithItens.map((item) =>
              item.id === notaFiscal.id ? { ...item, recSellFile: notaFiscal.recSellFile } : item
            );
            console.log("Estado atualizado de garantiaNfsWithItens:", updatedNfs);
            return updatedNfs;
          });
        } else {
          message.error("Erro ao enviar arquivo.");
        }
      } catch (error) {
        console.error("Erro no upload do arquivo:", error);
        message.error("Erro ao enviar arquivo.");
      }
    }
  };

  const handleDownloadFile = (recNota: NotaFiscal) => {
    if (!recNota.recSellFile) return;
    const link = document.createElement("a");
    link.href = recNota.recSellFile.imagemUrl || "#";
    link.download = recNota.recSellFile.fileNameWithExtension || "download";
    link.click();
  };

  const save = async () => {
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

    const garantia: GarantiasModel = {
      razaoSocial: socialReason || cardData.razaoSocial,
      telefone: phone || cardData.telefone,
      email: context.user.email || cardData.email,
      nf: cardData.notas?.[0]?.codigo,
      fornecedor: context.user.fullname || cardData.fornecedor,
      observacao: cardData.observacao || "teste",
      usuarioAtualizacao: context.user.username,
      dataAtualizacao: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`,
      codigoStatus: GarantiasStatusEnum2.NAO_ENVIADO,
      status: GarantiasStatusEnum.NAO_ENVIADO,
    };

    try {
      console.log("garantiaSaveHeader: ", garantia);
      const responseHeader = await api.put(
        `/garantias/garantiasHeader/${id}/UpdateHeader`,
        garantia
      );
      if (responseHeader.status === 200) {
        setCardData({
          ...cardData,
          razaoSocial: garantia.razaoSocial,
          telefone: garantia.telefone,
          email: garantia.email,
          nf: garantia.nf,
          fornecedor: garantia.fornecedor,
          observacao: garantia.observacao,
          usuarioAtualizacao: garantia.usuarioAtualizacao,
          dataAtualizacao: garantia.dataAtualizacao,
          codigoStatus: garantia.codigoStatus,
          status: garantia.status,
        });
        message.success("Garantia salva com sucesso!");
        navigate("/garantias");
      }
    } catch (error) {
      console.error("Erro ao salvar a garantia:", error);
      message.error("Erro ao salvar a garantia");
    }
  };

  const send = async () => {
    if (!cardData?.id) {
      message.error("ID da garantia não encontrado");
      return;
    }

    // Validação dos campos obrigatórios
    let isValid = true;
    let errorMessage = "";

    // Verificar se há pelo menos uma NF associada
    if (!garantiaNfsWithItens || garantiaNfsWithItens.length === 0) {
      isValid = false;
      errorMessage = "É necessário associar pelo menos uma NF.";
    }

    console.log("garantiaNfsWithItens antes da validação:", garantiaNfsWithItens);

    // Validar cada NF e seus itens
    for (const nota of garantiaNfsWithItens) {
      // Verificar anexo da NF de venda usando a API
      // Validar cada item da NF
      for (const item of nota.itens) {
        // Campos obrigatórios do item
        if (
          !item.codigoPeca ||
          !item.loteItem ||
          !item.tipoDefeito ||
          !item.modeloVeiculoAplicado ||
          !item.anoVeiculo ||
          item.torqueAplicado === undefined ||
          item.torqueAplicado === null
        ) {
          isValid = false;
          errorMessage = `O item ${item.codigoItem} está com campos obrigatórios não preenchidos.`;
          break;
        }

        // Validar anexos de imagens obrigatórios
        const requiredImages = [
          "1.img", // Foto do lado onde está a gravação IMA
          "2.img", // Foto da parte danificada/amassada-quebrada
          "4.img", // Foto da peça completa
        ];

        const imageLabels = {
          "1.img": "Foto do lado onde está a gravação IMA",
          "2.img": "Foto da parte danificada/amassada-quebrada",
          "4.img": "Foto da peça completa",
        };

        for (const field of requiredImages) {
          try {
            const response = await fetch(
              `${environment.apiUrl}/files/files/download-private-file-item/${item.id}/${field}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${context.user.token}`,
                },
              }
            );
            if (!response.ok) {
              isValid = false;
              errorMessage = `O item ${item.codigoItem} não possui o anexo obrigatório: ${imageLabels[field]}.`;
              break;
            }
          } catch (error) {
            isValid = false;
            errorMessage = `Erro ao verificar anexo ${imageLabels[field]} do item ${item.codigoItem}.`;
            break;
          }
        }

        if (!isValid) break;
      }

      if (!isValid) break;
    }

    // Se a validação falhar, exibir mensagem de erro
    if (!isValid) {
      message.error(errorMessage || "Preencha todos os campos obrigatórios antes de enviar.");
      return;
    }

    // Salvar os statuses atuais dos itens antes da atualização
    const originalItemStatuses = garantiaNfsWithItens.map((nota) => ({
      notaId: nota.id,
      itens: nota.itens.map((item) => ({
        id: item.id,
        codigoStatus: item.codigoStatus,
        status: item.status,
      })),
    }));

    // Continuar com a lógica de envio
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
      if (cardData.codigoStatus === GarantiasStatusEnum2.NF_DEVOLUCAO_RECUSADA || cardData.codigoStatus === GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO) {
        garantia = {
          razaoSocial: cardData.razaoSocial,
          telefone: cardData.telefone,
          email: cardData.email,
          nf: cardData.notas[0].codigo,
          fornecedor: cardData.fornecedor,
          codigoStatus: GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
          observacao: cardData.observacao,
          usuarioAtualizacao: context.user.username,
          dataAtualizacao: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`,
        };
      } else {
        garantia = {
          razaoSocial: socialReason || cardData.razaoSocial,
          telefone: phone || cardData.telefone,
          email: context.user.email || cardData.email,
          nf: cardData.notas?.[0]?.codigo,
          fornecedor: context.user.fullname || cardData.fornecedor,
          codigoStatus:
            cardData.codigoStatus === GarantiasStatusEnum2.NAO_ENVIADO
              ? GarantiasStatusEnum2.EM_ANALISE
              : GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
          observacao: cardData.observacao || "teste",
          usuarioAtualizacao: context.user.username,
          status:
            cardData.codigoStatus === GarantiasStatusEnum2.NAO_ENVIADO
              ? GarantiasStatusEnum.EM_ANALISE
              : GarantiasStatusEnum.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
          dataAtualizacao: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`,
        };
      }

      console.log("garantiaUpdateHeader: ", garantia);

      const responseHeader = await api.put(
        `/garantias/garantiasHeader/${id}/UpdateHeader`,
        garantia
      );

      if (responseHeader.status === 200) {
        // Restaurar os statuses dos itens após a atualização
        setGarantiaNfsWithItens((prevGarantiaNfsWithItens) =>
          prevGarantiaNfsWithItens.map((nota) => {
            const originalNota = originalItemStatuses.find(
              (orig) => orig.notaId === nota.id
            );
            if (originalNota) {
              return {
                ...nota,
                itens: nota.itens.map((item) => {
                  const originalItem = originalNota.itens.find(
                    (origItem) => origItem.id === item.id
                  );
                  return originalItem
                    ? {
                      ...item,
                      codigoStatus: originalItem.codigoStatus,
                      status: originalItem.status,
                    }
                    : item;
                }),
              };
            }
            return nota;
          })
        );

        setCardData({
          ...cardData,
          razaoSocial: garantia.razaoSocial,
          telefone: garantia.telefone,
          email: garantia.email,
          nf: garantia.nf,
          fornecedor: garantia.fornecedor,
          observacao: garantia.observacao,
          usuarioAtualizacao: garantia.usuarioAtualizacao,
          dataAtualizacao: garantia.dataAtualizacao,
          codigoStatus: garantia.codigoStatus,
          status: garantia.status,
        });
        message.success("Garantia enviada com sucesso!");
        navigate("/garantias");
      }
    } catch (error) {
      console.error("Erro ao enviar a garantia:", error);
      message.error("Erro ao enviar a garantia");
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
        <span className={styles.RgiCode}>RGI N° {cardData?.rgi}</span>
      </div>

      <div className={styles.headerContainer}>
        <div className={styles.headerLeft}>
          <h1 className={styles.rgiTitle}>RGI {cardData?.rgi}</h1>
          <div
            style={{
              color: StatusColors[cardData?.codigoStatus],
              backgroundColor: `${StatusColors[cardData?.codigoStatus]}26`,
            }}
            className={styles.statusTag}
          >
            {converterStatusGarantia(cardData?.codigoStatus) ||
              "Status não disponível"}
          </div>
        </div>
        <div className={styles.buttonsContainer}>
          {cardData?.codigoStatus === GarantiasStatusEnum2.NAO_ENVIADO &&
            context.user.rule.name === UserRoleEnum.Cliente && (
              <Button
                type="default"
                danger
                className={styles.buttonDeleteRgi}
                onClick={handleDeleteGuarantee}
              >
                Excluir
              </Button>
            )}
          {(cardData?.codigoStatus ===
            GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO ||
            cardData?.codigoStatus === GarantiasStatusEnum2.NAO_ENVIADO ||
            cardData?.codigoStatus ===
            GarantiasStatusEnum2.NF_DEVOLUCAO_RECUSADA || cardData?.codigoStatus ===
            GarantiasStatusEnum2.PECAS_AVALIADAS_PARCIAMENTE) &&
            context.user.rule.name === UserRoleEnum.Cliente && (
              <>
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
      {
        context.user.rule.name === UserRoleEnum.Cliente && (
          <div className={styles.infoContainer}>
            <h3 className={styles.infoTitle}>Informações Gerais</h3>
            <div className={styles.inputsContainer}>
              <div className={styles.inputGroup} style={{ flex: 15 }}>
                <OutlinedInputWithLabel
                  InputProps={{ readOnly: true }}
                  label="Razão social"
                  value={cardData?.razaoSocial}
                  fullWidth
                  disabled
                />
              </div>
              <div className={styles.inputGroup} style={{ flex: 5 }}>
                <OutlinedInputWithLabel
                  InputProps={{ readOnly: true }}
                  label="Telefone"
                  value={cardData?.telefone}
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
          {cardData?.codigoStatus === GarantiasStatusEnum2.NAO_ENVIADO &&
            context.user.rule.name === UserRoleEnum.Cliente && (
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

        {garantiaNfsWithItens?.map((nota) => (
          <div className={styles.nfsItem} key={nota.id}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <FileOutlined
                style={{
                  marginRight: "10px",
                  marginLeft: "20px",
                  fontSize: "20px",
                  color: "red",
                }}
              />
              <span className={styles.nfsCode}>
                {nota.codigoRGI || nota.rgi}
              </span>
              <span className={styles.nfsDivider}> | </span>
              <span className={styles.nfsQuantity}>
                {nota.itens.length} ITENS
              </span>
              <div
                style={{
                  marginLeft: "15px",
                  color:
                    StatusColors[
                    nota.tipo_nota == "Recusada"
                      ? GarantiasStatusEnum2.NF_DEVOLUCAO_RECUSADA
                      : nota.tipo_nota == "Aprovada"
                        ? GarantiasStatusEnum2.CONFIRMADO
                        : "#8C8C8C"
                    ],
                  backgroundColor: `${StatusColors[
                    nota.tipo_nota == "Recusada"
                      ? GarantiasStatusEnum2.NF_DEVOLUCAO_RECUSADA
                      : nota.tipo_nota == "Aprovada"
                        ? GarantiasStatusEnum2.CONFIRMADO
                        : "#8C8C8C"
                  ]
                    }15`,
                }}
                className={styles.statusTag}
              >{nota.tipo_nota.toLocaleLowerCase() == "nota fiscal de origem" ? "" : nota.tipo_nota}
              </div>
              {nota.tipo_nota === "Aprovada" && (
                <div
                  style={{
                    marginLeft: "10px",
                    color: StatusColors[GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO],
                    backgroundColor: `${StatusColors[GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO]}15`,
                  }}
                  className={styles.statusTag}
                >
                  Aguardando NF de Devolução
                </div>
              )}

            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
              {nota.tipo_nota == "Recusada" && (
                <label className={styles.buttonUpdateNfSale}>
                  <button
                    style={{ display: "none" }}
                    onClick={() => showMotivoRecusa(nota?.observacao || "Motivo não especificado.")} //adiciomnar a conclusão do supervisor correta
                  />
                  Motivo da Recusa
                </label>
              )}
              {cardData?.codigoStatus === GarantiasStatusEnum2.NAO_ENVIADO &&
                context.user.rule.name === UserRoleEnum.Cliente && (
                  <DeleteOutlined
                    style={{ color: "#555", fontSize: "22px" }}
                    className={styles.DeleteOutlined}
                    onClick={() => showDeleteConfirm(nota.codigo)}
                  />
                )}
              <Button
                type="text"
                className={styles.nextButton}
                onClick={() =>
                  handleDetailsNavigation(
                    {
                      itens: nota.itens.length,
                      nf: nota.codigo,
                    },
                    nota.itens.length,
                    nota.codigo,
                    nota
                  )
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
        itemId={cardData?.notas?.[0]?.itens?.[0]?.id}
        isSell={modalOpen.isSell}
        garantiaId={cardData?.id}
      />
      <Modal
        title="Motivo da Recusa"
        open={modalRecusaOpen}
        onCancel={() => setModalRecusaOpen(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setModalRecusaOpen(false)}
            style={{ borderColor: "#dadada", color: "#5F5A56" }}
          >
            Fechar
          </Button>,
        ]}
      >
        <p>{motivoRecusa}</p>
      </Modal>
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