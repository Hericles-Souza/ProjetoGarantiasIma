/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, message, Modal, Spin } from "antd";
import {
  DownOutlined,
  DeleteOutlined,
  LeftOutlined,
  InfoCircleOutlined,
  FileOutlined,
  RightOutlined,
} from "@ant-design/icons";
import styles from "./DetailsItensNF.module.css";
import OutlinedInputWithLabel from "@shared/components/input-outlined-with-label/OutlinedInputWithLabel";
import OutlinedSelectWithLabel from "@shared/components/select/OutlinedSelectWithLabel";
import ColorCheckboxes from "@shared/components/checkBox/checkBox";
import {
  converterStatusGarantia,
  converterStatusItemGarantia,
  GarantiasItemStatusEnum,
  GarantiasItemStatusEnum2,
  GarantiasStatusEnum,
  GarantiasStatusEnum2,
  StatusColors,
} from "@shared/enums/GarantiasStatusEnum";
import { GarantiaItem, GarantiasModel } from "@shared/models/GarantiasModel";
import api from "@shared/Interceptors";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";
import environment from "@env/environment";
import { updateGarantiasHeaderByIdAsync } from "@shared/services/GarantiasService";
import ReportPDF, { Item } from "../GeneratePDF";
import { pdf } from "@react-pdf/renderer";
import { UserRoleEnum } from "@shared/enums/UserRoleEnum";
import { NotaFiscal } from "@shared/models/NotaFiscalModel";
import FileAttachmentDevolucao from "@shared/components/FileAttachmentDevolucao/FileAttachmentDevolucao";

const formatItemRgi = (letter: string, sequence: number) => {
  const letterWithoutDot = letter.split(".");
  const newItemRgiFormatted = `${letterWithoutDot[0]}.${letterWithoutDot[1]}.${sequence}`;
  return newItemRgiFormatted;
};

interface FileData {
  id: string;
  fileName: string;
}

interface FileAttachmentProps {
  label: string;
  backgroundColor: string;
  garantiaItemId: string;
  initialFileData?: FileData;
  isRessarcimento: boolean;
  onFileSelect?: (file: File) => void;
  recGarantia: GarantiasModel;
  recSellFile: { fileNameWithExtension: string; imagemUrl: string };
  item?: GarantiaItem;
}

const FileAttachment: React.FC<FileAttachmentProps> = ({
  label,
  backgroundColor,
  garantiaItemId,
  initialFileData,
  isRessarcimento,
  onFileSelect,
  recGarantia,
  recSellFile = { fileNameWithExtension: "", imagemUrl: "" },
}) => {
  const [fileData, setFileData] = useState<FileData | null>(
    initialFileData || null
  );
  const [, setFileName] = useState<string | null>(
    initialFileData ? initialFileData.fileName : null
  );
  const authContext = useContext(AuthContext);
  const [recFile, setRecFile] = useState<{
    fileNameWithExtension: string;
    imagemUrl: string;
  }>();
  useEffect(() => {
    if (garantiaItemId) {
      let fieldFile: string = "";
      const matchField = label.match(/^\d+/);

      if (label.includes("venda")) fieldFile = "nfVenda";
      else if (label.includes("devolução")) fieldFile = "nfDev";
      else if (matchField) {
        if (isRessarcimento) fieldFile = `${matchField[0]}.res`;
        else fieldFile = `${matchField[0]}.img`;
      } else fieldFile = "nfRef";

      if (fieldFile == "nfVenda") console.log("nota fiscal id: ", garantiaItemId);
      getFieldFile(garantiaItemId, fieldFile);
    }

    setFileData(initialFileData || null);
    setFileName(initialFileData ? initialFileData.fileName : null);
  }, [initialFileData]);

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
    const extension = getExtensionFromMimeType(mimeType);
    return extension;
  }

  const getFieldFile = async (itemId: string, field: string) => {
    try {
      const urlGetFile =
        environment.apiUrl +
        `/files/files/download-private-file-item/${itemId}/${field}`;

      const response = await fetch(urlGetFile, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authContext.user.token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const fileExtension = getFileExtensionFromBlob(blob);
        const fileNameWithExtension = field + fileExtension;
        const imagemUrl = URL.createObjectURL(blob);

        setRecFile({ fileNameWithExtension, imagemUrl });
      } else {
        setRecFile({ fileNameWithExtension: "", imagemUrl: "" });
      }
    } catch (error) {
      //console.log("erro: ", error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setFileName(file.name);
      if (onFileSelect) {
        onFileSelect(file);
      }
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setFileData({ id: "", fileName: file.name });

      const endpoint = environment.apiUrl + "/files/upload-private-file-item";
      const match = label.match(/^\d+/);
      const fileData = new FormData();
      fileData.append("file", file);
      fileData.append("itemId", garantiaItemId);

      if (label.includes("venda")) fileData.append("field", "nfVenda");
      else if (label.includes("devolução")) fileData.append("field", "nfDev");
      else if (match) {
        if (isRessarcimento) fileData.append("field", `${match[0]}.res`);
        else fileData.append("field", `${match[0]}.img`);
      } else fileData.append("field", "nfRef");

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authContext.user.token}`,
            accept: "*/*",
          },
          body: fileData,
        });
        if (response.status === 201) {
          const uploadedFileData: FileData = {
            id: garantiaItemId,
            fileName: file.name,
          };
          const blob = new Blob([file]);
          const imagemUrl = URL.createObjectURL(blob);
          setFileData(uploadedFileData);
          setRecFile({
            fileNameWithExtension: uploadedFileData.fileName,
            imagemUrl: imagemUrl,
          });
          setFileName(uploadedFileData.fileName);
          message.success("Arquivo enviado com sucesso!");
        } else {
          message.error("Erro ao enviar arquivo.");
        }
      } catch (error) {
        console.error("Erro no upload do arquivo:", error);
        message.error("Erro ao enviar arquivo.");
      }
    }
  };

  const handleDownloadFile = () => {
    if (recFile) {
      const link = document.createElement("a");
      link.href = recFile.imagemUrl || "#";
      link.download = recFile.fileNameWithExtension || "download";
      link.click();
    } else {
      const link = document.createElement("a");
      link.href = recSellFile.imagemUrl || "#";
      link.download = recSellFile.fileNameWithExtension || "download";
      link.click();
    }
  };

  const handleRemoveFile = () => {
    setFileData(null);
    setFileName(null);
  };

  const canRemoveAttachment =
    (recGarantia.codigoStatus === GarantiasStatusEnum2.NAO_ENVIADO ||
      label === "Anexo da NF de devolução") &&
    (fileData || recSellFile.imagemUrl);

  return (
    <div className={styles.fileAttachmentContainer} style={{ backgroundColor }}>
      <span className={styles.labelAnexo}>{label}</span>
      <div className={styles.fileUpdateContent}>
        {recFile?.fileNameWithExtension === "" && recFile?.imagemUrl === "" && recGarantia.codigoStatus != GarantiasStatusEnum2.NAO_ENVIADO && (
          <label
            className={styles.buttonUpdateNfSale}
            style={{ cursor: "default", opacity: 0.6 }}
          >
            Nenhum arquivo enviado
          </label>
        )}

        {(fileData ||
          (recFile?.fileNameWithExtension != "" && recFile?.imagemUrl != "")) &&
          recGarantia?.codigoStatus <= 1 && (
            <span className={styles.fileName}>
              <FileOutlined style={{ color: "red", paddingLeft: "5px" }} />{" "}
              {recFile?.fileNameWithExtension}
              {canRemoveAttachment && (
                <Button
                  type="link"
                  onClick={handleRemoveFile}
                  style={{ outline: "none" }}
                  icon={
                    <DeleteOutlined style={{ color: "red", border: "none" }} />
                  }
                  title="Remover arquivo"
                />
              )}
            </span>
          )}
        {recFile?.fileNameWithExtension != "" &&
          recFile?.imagemUrl != "" &&
          recGarantia?.codigoStatus >= 1 && (
            <label className={styles.buttonUpdateNfSale}>
              <button
                style={{ display: "none" }}
                onClick={handleDownloadFile}
              />
              Baixar Arquivo
            </label>
          )}
        {recFile?.fileNameWithExtension === "" &&
          recFile?.imagemUrl === "" &&
          recGarantia?.codigoStatus == 1 && (
            <label className={styles.buttonUpdateNfSale}>
              <input
                type="file"
                style={{ display: "none" }}
                onChange={(e) => {
                  handleFileChange(e);
                  handleFileUpload(e);
                }}
              />
              Adicionar Anexo
            </label>
          )}
      </div>
    </div>
  );
};

const CollapsibleSection = ({
  title,
  isVisible,
  toggleVisibility,
  showDeleteConfirm,
  children,
  garantia,
  garantiaItem,
}: {
  title: string;
  isVisible: boolean;
  toggleVisibility: () => void;
  showDeleteConfirm: () => void;
  children: React.ReactNode;
  status: string;
  rgi: string;
  isEvaluated: boolean;
  garantia: GarantiasModel;
  garantiaItem: GarantiaItem;
}) => {
  const authContext = useContext(AuthContext);
  const [, setRecFile] = useState<Blob[]>([]);
  const context = useContext(AuthContext);

  const getFieldFile = async (
    itemId: string,
    field: string,
    tempRecFiles: Blob[]
  ) => {
    try {
      const urlGetFile =
        environment.apiUrl +
        `/files/files/download-private-file-item/${itemId}/${field}`;

      const response = await fetch(urlGetFile, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authContext.user.token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        tempRecFiles.push(blob);
      }
    } catch (error) {
      //console.log("erro: ", error);
    }
  };

  const handleDownloadPDF = async () => {
    let fieldFile: string = "";
    const isImageAttachment: string[] = [
      "1. Foto do lado onde está a gravação IMA:",
      "2. Foto da parte danificada/amassada-quebrada:",
      "3. Foto marcações suspeitas na peça:",
      "4. Foto da peça completa:",
      "5. Outras fotos pertinentes:",
    ];

    const tempRecFiles: Blob[] = [];

    const promises = isImageAttachment.map(async (value) => {
      const matchField = value.match(/^\d+/);

      if (value.includes("devolução")) fieldFile = "nfDev";
      else if (matchField) {
        if (garantiaItem.solicitarRessarcimento)
          fieldFile = `${matchField[0]}.res`;
        else fieldFile = `${matchField[0]}.img`;
      } else fieldFile = "nfRef";

      await getFieldFile(garantiaItem.id, fieldFile, tempRecFiles);
    });

    await Promise.all(promises);

    setRecFile(tempRecFiles);

    const item: Item = {
      codigo: garantiaItem.codigoItem,
      lote: garantiaItem.loteItemOficial,
      modelo: garantiaItem.modeloVeiculoAplicado,
      ano: garantiaItem.anoVeiculo || "",
      status: garantiaItem.status,
      conclusao: garantiaItem.conclusao,
      torque: garantiaItem.torqueAplicado.toString(),
      images: tempRecFiles,
      razaoSocial: context.user.fullname || "",
      cnpj: context.user.cnpj || "",
      telefone: context.user.phone || "",
      email: context.user.email || "",
      defeito: garantiaItem.tipoDefeito,
      aroVeiculo: garantiaItem.anoVeiculo || "",
      analiseTecnica: garantiaItem.conclusao || "",
      dataEmissao: garantia.data,
    };

    const pdfBlob = await pdf(<ReportPDF item={item} />).toBlob();

    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `laudo_tecnico_${item.codigo || "sem_codigo"}.pdf`;
    link.click();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case GarantiasItemStatusEnum.AUTORIZADO:
        return { color: "#00CC00", backgroundColor: "#00CC0015" };
      case GarantiasItemStatusEnum.NAO_ANALISADO:
      case GarantiasItemStatusEnum.NAO_ENVIADO:
        return { color: "#808080", backgroundColor: "#80808015" };
      case GarantiasItemStatusEnum.NAO_AUTORIZADO:
        return { color: "#FF0000", backgroundColor: "#FF000015" };
      default:
        return { color: "#000", backgroundColor: "#00000015" };
    }
  };

  const itemStatus =
    converterStatusItemGarantia(
      garantiaItem?.status === GarantiasItemStatusEnum.NAO_ANALISADO ||
        garantiaItem?.status === GarantiasItemStatusEnum.NAO_ENVIADO
        ? GarantiasItemStatusEnum2.NAO_ANALISADO
        : garantiaItem?.status === GarantiasItemStatusEnum.NAO_AUTORIZADO
          ? GarantiasItemStatusEnum2.NAO_AUTORIZADO
          : GarantiasItemStatusEnum2.AUTORIZADO
    ) || "Status não disponível";

  const statusStyle = getStatusColor(garantiaItem?.status || "");

  return (
    <div>
      <div className={styles.tituloSecaoContainer}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <h3 className={styles.tituloSecaoVermelho}>{title}</h3>
          <div
            style={{
              ...statusStyle,
              marginLeft: "10px",
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "14px",
            }}
            className={styles.statusTag}
          >
            {itemStatus}
          </div>
        </div>
        <div className={styles.iconAndArrow}>
          {garantiaItem?.status === GarantiasItemStatusEnum.NAO_AUTORIZADO &&
            garantia?.status != GarantiasStatusEnum.NAO_ENVIADO && (
              <label className={styles.buttonUpdateNfSale}>
                <button
                  style={{ display: "none" }}
                  onClick={handleDownloadPDF}
                />
                Baixar Laudo
              </label>
            )}
          {garantia?.codigoStatus === GarantiasStatusEnum2.NAO_ENVIADO && (
            <DeleteOutlined
              className={styles.DeleteOutlined}
              style={{
                color: "#555",
                fontSize: "22px",
                cursor: "pointer",
                marginRight: "15px",
              }}
              onClick={showDeleteConfirm}
            />
          )}
          <Button
            type="text"
            icon={isVisible ? <DownOutlined /> : <RightOutlined />}
            onClick={toggleVisibility}
            className={styles.toggleButton}
          />
        </div>
      </div>
      {isVisible && <div className={styles.hiddenContent}>{children}</div>}
    </div>
  );
};

const DetailsItensNF: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [visibleSectionId, setVisibleSectionId] = useState<string | null>(null);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [recRgiLetter, setRecRgiLetter] = useState("A");
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [garantia, setGarantia] = useState<GarantiasModel | null>(null);
  const [notaFiscal, setNotaFiscal] = useState<NotaFiscal>();
  const [loading, setLoading] = useState<boolean>(true);
  const [nfDevolucaoFile, setNfDevolucaoFile] = useState<{
    fileNameWithExtension: string;
    imagemUrl: string;
  } | null>(null);
  const [recSellFile, setRecSellFile] = useState<{
    fileNameWithExtension: string;
    imagemUrl: string;
  }>({ fileNameWithExtension: "", imagemUrl: "" });
  const context = useContext(AuthContext);

  useEffect(() => {
    console.log("nfDevolucaoFile updated:", nfDevolucaoFile);
  }, [nfDevolucaoFile]);

  const handleInputChange = (itemId: string, field: string, value: any) => {
    setNotaFiscal((prevNotaFiscal) => {
      if (prevNotaFiscal) {
        return {
          ...prevNotaFiscal,
          itens: prevNotaFiscal.itens.map(
            (item) =>
              item.id === itemId
                ? field === "solicitarRessarcimento"
                  ? { ...item, solicitarRessarcimento: value }
                  : { ...item, [field]: value }
                : item
          ),
        };
      }
    });
  };

  const handleDeleteGuarantee = async () => {
    Modal.confirm({
      title: "Confirmar Exclusão",
      content: "Você tem certeza de que deseja excluir esta garantia?",
      okText: "Excluir",
      cancelText: "Cancelar",
      okButtonProps: {
        style: { backgroundColor: "red", borderColor: "red", outline: "none" },
      },
      cancelButtonProps: { className: "custom-cancel-button" },
      onOk: async () => {
        try {
          const response = await api.delete(
            `/garantias/garantias/${garantia?.id}`
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

  useEffect(() => {
    const loadGarantiaData = async () => {
      try {
        let data: GarantiasModel | null = null;
        if (location.state && "garantiaData" in location.state) {
          data = (location.state as { garantiaData: GarantiasModel })
            .garantiaData;
          const actualNf = location.state.nfNumber || "N/A";
          setRecRgiLetter(actualNf.split(".")[1] || "A");
        }
        if (data) {
          if (data && JSON.stringify(data) !== JSON.stringify(garantia)) {
            setGarantia(data);
          }

          if (
            location.state.nota &&
            JSON.stringify(location.state.nota) !== JSON.stringify(notaFiscal)
          ) {
            setNotaFiscal(location.state.nota);
          }

          const transformedItems = await getItemsByNotaId(
            location.state.notaId
          );
          setRecSellFile(
            location.state?.sellFile || {
              fileNameWithExtension: "",
              imagemUrl: "",
            }
          );
          if (
            transformedItems?.length > 0 &&
            transformedItems[0].id !== visibleSectionId
          ) {
            setVisibleSectionId(transformedItems[0].id);
          }
        } else {
          setGarantia({
            id: "",
            codigoStatus: GarantiasStatusEnum2.NAO_ENVIADO,
          });
          setRecSellFile({ fileNameWithExtension: "", imagemUrl: "" });
        }
      } catch (error) {
        console.error("Error loading garantia data:", error);
        setGarantia({ id: "", codigoStatus: GarantiasStatusEnum2.NAO_ENVIADO });
        setRecSellFile({ fileNameWithExtension: "", imagemUrl: "" });
      } finally {
        setLoading(false);
      }
    };

    loadGarantiaData();
  }, [location.state.nota]);

  const addNewItem = async () => {
    const newItemId = crypto.randomUUID();
    const sequence = (location.state.countItems =
      location.state.countItems + 1);
    const newItemRgi = garantia
      ? formatItemRgi(
        location.state.nota.codigoRGI || location.state.nota.rgi,
        sequence
      )
      : "";

    const payloadPost = {
      id: newItemId,
      codigoItem: newItemRgi,
      codigoRGI: newItemRgi,
      nfReferencia: notaFiscal.codigo,
      codigoStatus: GarantiasItemStatusEnum2.NAO_ANALISADO,
      nota_fiscal_id: notaFiscal.id,
    };
    const responsePost = await api.post(
      environment.apiUrl + "/garantias/item/create",
      payloadPost
    );
    if (responsePost.status !== 200 && responsePost.status !== 201) {
      message.error("Erro ao criar a garantia.");
    } else {
      message.success("Item criado com sucesso.");
      console.log("responsePost: ", responsePost);

      if (garantia) {
        setNotaFiscal((prevNotaFiscal) => {
          if (prevNotaFiscal) {
            return {
              ...prevNotaFiscal,
              itens: [
                ...prevNotaFiscal.itens,
                {
                  id: newItemId,
                  codigoItem: newItemRgi,
                  nfReferencia: location.state.nfNumber,
                  codigoStatus: GarantiasItemStatusEnum2.NAO_ANALISADO,
                  status: GarantiasItemStatusEnum.NAO_ANALISADO,
                },
              ],
            };
          }
        });
      }
      setVisibleSectionId(newItemId);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    setNotaFiscal((prevNotaFiscal) => {
      if (prevNotaFiscal) {
        return {
          ...prevNotaFiscal,
          itens: prevNotaFiscal.itens.filter((item) => item.id !== itemId),
        };
      }
    });
    setModalDeleteOpen(false);
  };

  const showDeleteConfirm = (itemId: string) => {
    setItemToDelete(itemId);
    setModalDeleteOpen(true);
  };

  const handleDeleteNF = () => {
    if (itemToDelete !== null) {
      handleDeleteItem(itemToDelete);
    }
  };

  const toggleSectionVisibility = (id: string) => {
    setVisibleSectionId(visibleSectionId === id ? null : id);
  };

  const saveNfDevolcao = async () => {
    if (!garantia?.id) {
      message.error("ID da garantia não encontrado");
      return;
    }
    console.log("nfDevolucaoFile before save:", nfDevolucaoFile);
    if (!nfDevolucaoFile) {
      message.error("Por favor, anexe a NF de devolução antes de salvar.");
      return;
    }

    const now = new Date();
    const currentDate = now.toLocaleDateString();
    try {
      const garantiaModel: GarantiasModel = {
        id: garantia.id,
        email: context.user.email,
        razaoSocial: garantia.razaoSocial,
        createdAt: context.user.createdAt,
        dataAtualizacao: currentDate,
        data: currentDate,
        updatedAt: context.user.updatedAt || currentDate,
        usuarioAtualizacao: context.user.fullname,
        usuarioInsercao: context.user.fullname,
        telefone: context.user.phone,
        codigoStatus: GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
        anexos: nfDevolucaoFile.fileNameWithExtension,
      };
      await updateGarantiasHeaderByIdAsync(garantiaModel);
      message.success("NF de devolução salva com sucesso!");
      setGarantia(garantiaModel);
      navigate(`/garantias/rgi/${garantia.id}`, {
        state: { garantiaData: garantiaModel, item: garantia?.nf },
      });
    } catch (error) {
      console.error("Erro ao atualizar a garantia:", error);
      message.error("Erro ao atualizar a garantia.");
    }
  };

  const getItemsByNotaId = async (
    idGarantia: string
  ): Promise<GarantiaItem[]> => {
    const responseGetItens = await api.get(
      `/garantias/item/by-garantia/${idGarantia}`
    );
    return responseGetItens.data.data as GarantiaItem[];
  };

  const save = async () => {
    if (!garantia?.id) {
      message.error("ID da garantia não encontrado");
      return;
    }

    let isError: boolean = false;

    const responseGetItens = await api.get(
      `/nota-fiscal/by-garantia/${garantia.id}`
    );
    const notasFiscaisAPI = responseGetItens.data.data as NotaFiscal[];

    const garantiaItensAPI = await getItemsByNotaId(
      notasFiscaisAPI.find((nota) => nota.codigo == notaFiscal.codigo).id
    );

    for (const item of notaFiscal.itens.filter(
      (value) => value.codigoItem?.split(".")[1] === recRgiLetter
    )) {
      try {
        if (
          garantiaItensAPI.some(
            (apiItem) => apiItem.codigoItem === item.codigoItem
          )
        ) {
          const payloadPut = {
            codigoItem: item.codigoItem,
            tipoDefeito: item.tipoDefeito,
            modeloVeiculoAplicado: item.modeloVeiculoAplicado,
            torqueAplicado: Number(item.torqueAplicado) || 0,
            nfReferencia: item.nfReferencia,
            codigoPeca: item.codigoPeca,
            loteItemOficial: item.loteItem,
            loteItem: item.loteItem,
            anoVeiculo: item.anoVeiculo,
            codigoStatus: GarantiasItemStatusEnum2.NAO_ANALISADO,
            solicitarRessarcimento: item.solicitarRessarcimento ? 1 : 0,
          };
          const responsePut = await api.put(
            `/garantias/garantiasItem/${item.id}/UpdateItem`,
            payloadPut
          );
          console.log("payloadPut: ", payloadPut);

          if (responsePut.status !== 200 && responsePut.status !== 201) {
            message.error("Erro ao atualizar o item.");
            isError = true;
          }
        } else {
          item.id = crypto.randomUUID();
          const payloadPost = {
            nota_fiscal_id: notaFiscal.id,
            codigoRGI: notaFiscal.codigoRGI,
            codigoItem: item.codigoItem,
            tipoDefeito: item.tipoDefeito,
            modeloVeiculoAplicado: item.modeloVeiculoAplicado,
            torqueAplicado: item.torqueAplicado,
            nfReferencia: location.state.nfNumber,
            codigoPeca: item.codigoPeca,
            loteItemOficial: item.loteItem,
            anoVeiculo: item.anoVeiculo,
            loteItem: item.loteItem,
            codigoStatus: GarantiasItemStatusEnum2.NAO_ANALISADO,
            solicitarRessarcimento: item.solicitarRessarcimento ? 1 : 0,
            index: notaFiscal.itens.length + 1,
            id: item.id,
          };
          const responsePost = await api.post(
            environment.apiUrl + "/garantias/item/create",
            payloadPost
          );
          console.log("payloadPost: ", payloadPost);

          if (responsePost.status !== 200 && responsePost.status !== 201) {
            message.error("Erro ao criar a garantia.");
            isError = true;
          }
        }
      } catch (error) {
        console.error("Erro ao atualizar a garantia:", error);
        message.error("Erro ao atualizar a garantia.");
        isError = true;
      }
    }

    if (!isError && garantia) {
      message.success("Garantia atualizada com sucesso!");
      console.log("navigateGarantiaDetails:", garantia);

      navigate(`/garantias/rgi/${garantia.id}`, {
        state: { garantiaData: garantia, item: garantia?.nf },
      });
    }
  };

  if (loading || !garantia || !recSellFile) {
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
    <div className={styles.containerApp} style={{ backgroundColor: "#ffffff" }}>
      <div className={styles.ContainerButtonBack}>
        <Button
          type="link"
          className={styles.ButtonBack}
          onClick={() =>
            navigate(`/garantias/rgi/${garantia.id}`, {
              state: { garantiaData: garantia, item: garantia.nf },
            })
          }
        >
          <LeftOutlined /> VOLTAR PARA INFORMAÇÕES DO RGI
        </Button>
        <span className={styles.RgiCode}>
          RGI {garantia?.codigoRGI || "N/A"}
        </span>
      </div>
      <div className={styles.ContainerHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.tituloRgi}>
            NF{" "}
            {notaFiscal?.codigoRGI ||
              notaFiscal?.rgi ||
              "Código da NF não disponível"}
          </h1>
          <div
            style={{
              color: StatusColors[garantia?.codigoStatus] || "#000",
              backgroundColor: `${StatusColors[garantia?.codigoStatus] || "#000"
                }15`,
            }}
            className={styles.statusTag}
          >
            {converterStatusGarantia(garantia?.codigoStatus) ||
              "Status não disponível"}
          </div>
        </div>
        <div className={styles.botoesCabecalho}>
        
          {[
            GarantiasStatusEnum2.NAO_ENVIADO,
            GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO,
            GarantiasStatusEnum2.NF_DEVOLUCAO_RECUSADA,
          ].includes(garantia.codigoStatus) &&
            context.user.rule.name === UserRoleEnum.Cliente && (
              <Button
                type="primary"
                className={styles.ButonToSend}
                onClick={
                  garantia.codigoStatus ===
                    GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO
                    ? saveNfDevolcao
                    : save
                }
              >
                SALVAR
              </Button>
            )}
          {garantia.codigoStatus ===
            GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO &&
            context.user.rule.name !== UserRoleEnum.Cliente && (
              <div className="ButtonHeader">
                <Button type="default" className="ButtonDelete">
                  Visualizar Pré Nota
                </Button>
                <Button
                  type="primary"
                  className="ButonToSend"
                  onClick={saveNfDevolcao}
                >
                  Enviar
                </Button>
              </div>
            )}
          {garantia.codigoStatus === GarantiasStatusEnum2.EM_ANALISE && (
            <p>
              Esta garantia está em análise. Nenhuma ação disponível no momento.
            </p>
          )}
        </div>
      </div>
      <hr className={styles.divisor} />
      <FileAttachment
        label="Anexo da NF de venda"
        backgroundColor="#f5f5f5"
        garantiaItemId={notaFiscal?.id}
        isRessarcimento={false}
        initialFileData={
          garantia?.anexos
            ? { id: garantia.anexos, fileName: garantia.anexos }
            : undefined
        }
        recGarantia={garantia}
        recSellFile={{
          fileNameWithExtension: "",
          imagemUrl: "",
        }}
      />
      {(garantia?.codigoStatus === GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO ||
        garantia?.codigoStatus == GarantiasStatusEnum2.CONFIRMADO ||
        garantia?.codigoStatus ===
        GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO ||
        garantia?.codigoStatus === GarantiasStatusEnum2.NF_DEVOLUCAO_RECUSADA ||
        garantia?.codigoStatus === GarantiasStatusEnum2.PECAS_AVALIADAS_PARCIAMENTE) &&
        context.user.rule.name === UserRoleEnum.Cliente && (
          <div style={{ marginTop: "15px" }}>
            {garantia?.codigoStatus ===
              GarantiasStatusEnum2.PECAS_AVALIADAS_PARCIAMENTE && (
                <div className={styles.dialoginfo}>
                  <InfoCircleOutlined style={{ color: "#0277BD" }} />
                  <span style={{ color: "#0277BD" }}>
                    Anexe a NF de devolução dos itens aprovados, para prosseguir com a avaliação parcial.
                  </span>
                </div>
              )}
            <FileAttachmentDevolucao
              label="Anexo da NF de devolução"
              backgroundColor="#f5f5f5"
              garantiaId={notaFiscal?.id || ""}
              recGarantia={garantia}
              initialFileData={
                garantia?.anexos
                  ? { id: garantia.anexos, fileName: garantia.anexos }
                  : undefined
              }
              onFileSelect={(file) => {
                console.log("Arquivo selecionado:", file.name);
              }}
              onFileChange={(fileData) => {
                console.log("File data received:", fileData);
                setNfDevolucaoFile(fileData);
                console.log("Arquivo alterado:", fileData);
              }}
            />
          </div>
        )}
      <div className={styles.TitleItens}>
        <h3 className={styles.nfsTitle}>
          Itens desta NF associados a esta garantia
        </h3>
        {garantia.codigoStatus === GarantiasStatusEnum2.NAO_ENVIADO &&
          context.user.rule.name === UserRoleEnum.Cliente && (
            <Button
              className={styles.buttonRed}
              style={{
                backgroundColor: "red",
                borderRadius: "10px",
                height: "45px",
                padding: "0px 25px",
                outline: "none",
              }}
              type="primary"
              onClick={addNewItem}
            >
              ADICIONAR PEÇA
            </Button>
          )}
      </div>
      <div className={styles.dialoginfo}>
        <InfoCircleOutlined style={{ color: "#0277BD" }} />
        <span style={{ color: "#0277BD" }}>
          Caso a peça não possua um lote, o campo Lote da peça deve ser
          preenchido com “Não contém”
        </span>
      </div>
      {notaFiscal?.itens?.length > 0 && recRgiLetter ? (
        notaFiscal?.itens
          ?.sort((a, b) => {
            const getNumeroFinal = (codigo: string): number => {
              const partes = codigo.split(".");
              return parseInt(partes[partes.length - 1], 10);
            };

            return getNumeroFinal(a.codigoItem) - getNumeroFinal(b.codigoItem);
          })
          .map((item) => (
            <div className={styles.containerInformacoes} key={item.id}>
              <CollapsibleSection
                title={item.codigoItem || "Item sem código"}
                isVisible={visibleSectionId === item.id}
                toggleVisibility={() => toggleSectionVisibility(item.id)}
                showDeleteConfirm={() => showDeleteConfirm(item.id)}
                status={item.status}
                rgi={item.codigoRGI || ""}
                isEvaluated={
                  garantia?.codigoStatus === GarantiasStatusEnum2.NAO_ENVIADO &&
                    context.user.rule.name === UserRoleEnum.Cliente
                    ? false
                    : true
                }
                garantia={garantia}
                garantiaItem={item}
              >
                <h3 className={styles.tituloSecao}>Informações Gerais</h3>
                <div className={styles.inputsContainer}>
                  <div className={styles.inputsConjun}>
                    <div className={styles.inputGroup} style={{ flex: 0.5 }}>
                      <OutlinedInputWithLabel
                        disabled={
                          garantia?.codigoStatus !==
                          GarantiasStatusEnum2.NAO_ENVIADO
                        }
                        label="Código da peça"
                        fullWidth
                        value={item.codigoPeca || ""}
                        onChange={(e) => {
                          handleInputChange(
                            item.id,
                            "codigoPeca",
                            e.target.value
                          );
                          item.codigoPeca = e.target.value;
                        }}
                      />
                    </div>
                    <div className={styles.inputGroup} style={{ flex: 0.5 }}>
                      <OutlinedInputWithLabel
                        disabled={
                          garantia?.codigoStatus !==
                          GarantiasStatusEnum2.NAO_ENVIADO
                        }
                        label="Lote da peça"
                        fullWidth
                        value={item.loteItem || ""}
                        onChange={(e) => {
                          handleInputChange(item.id, "loteItem", e.target.value);
                          item.loteItem = e.target.value;
                        }}
                      />
                    </div>
                  </div>
                  <div className={styles.inputsConjun}>
                    <div className={styles.inputGroup} style={{ flex: 0.4 }}>
                      <OutlinedSelectWithLabel
                        disabled={
                          garantia?.codigoStatus !==
                          GarantiasStatusEnum2.NAO_ENVIADO
                        }
                        label="Defeito"
                        fullWidth
                        options={[
                          {
                            value: "BARULHO",
                            label: "BARULHO",
                          },
                          {
                            value: "FALTA_DE_LUBRIFICACAO",
                            label: "FALTA DE LUBRIFICAÇÃO",
                          },
                          {
                            value: "SEM_LEITURA",
                            label: "SEM LEITURA",
                          },
                          {
                            value: "ESTRIA",
                            label: "ESTRIA",
                          },
                          {
                            value: "TRAVANDO",
                            label: "TRAVANDO",
                          },
                          {
                            value: "FOLGA",
                            label: "FOLGA",
                          },
                          {
                            value: "FALTA_DE_COMPONENTE",
                            label: "FALTA DE COMPONENTE",
                          },
                          {
                            value: "FORA_DE_MEDIDA",
                            label: "FORA DE MEDIDA",
                          },
                        ]}
                        value={item.tipoDefeito || ""}
                        onChange={(e) => {
                          handleInputChange(
                            item.id,
                            "tipoDefeito",
                            e.target.value
                          );
                          item.tipoDefeito = e.target.value;
                        }}
                      />
                    </div>
                    <div className={styles.inputGroup} style={{ flex: 1 }}>
                      <OutlinedInputWithLabel
                        disabled={
                          garantia?.codigoStatus !==
                          GarantiasStatusEnum2.NAO_ENVIADO
                        }
                        label="Modelo do veículo que aplicou"
                        fullWidth
                        value={item.modeloVeiculoAplicado || ""}
                        onChange={(e) => {
                          handleInputChange(
                            item.id,
                            "modeloVeiculoAplicado",
                            e.target.value
                          );
                          item.modeloVeiculoAplicado = e.target.value;
                        }}
                      />
                    </div>
                    <div className={styles.inputGroup} style={{ flex: 0.3 }}>
                      <OutlinedInputWithLabel
                        disabled={
                          garantia?.codigoStatus !==
                          GarantiasStatusEnum2.NAO_ENVIADO
                        }
                        label="Ano do veículo"
                        fullWidth
                        value={item.anoVeiculo || ""}
                        onChange={(e) => {
                          handleInputChange(
                            item.id,
                            "anoVeiculo",
                            e.target.value
                          );
                          item.anoVeiculo = e.target.value;
                        }}
                      />
                    </div>
                  </div>
                  <div className={styles.inputsConjun}>
                    <div className={styles.inputGroup} style={{ flex: 1 }}>
                      <OutlinedInputWithLabel
                        disabled={
                          garantia?.codigoStatus !==
                          GarantiasStatusEnum2.NAO_ENVIADO
                        }
                        type="number"
                        label="Torque aplicado à peça"
                        fullWidth
                        value={item.torqueAplicado?.toString() || ""}
                        onChange={(e) => {
                          handleInputChange(
                            item.id,
                            "torqueAplicado",
                            Number(e.target.value)
                          );
                          item.torqueAplicado = Number(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                  {garantia?.codigoStatus ===
                    GarantiasStatusEnum2.NAO_ENVIADO && (
                      <div className={styles.checkboxContainer}>
                        <ColorCheckboxes
                          checked={item.solicitarRessarcimento || false}
                          onChange={(e) => {
                            item.solicitarRessarcimento = e.target.checked;
                            handleInputChange(
                              item.id,
                              "solicitarRessarcimento",
                              e.target.checked
                            );
                          }}
                          disabled={
                            garantia?.codigoStatus !==
                            GarantiasStatusEnum2.NAO_ENVIADO
                          }
                        />
                        <label className={styles.checkboxDanger}>
                          Solicitar ressarcimento
                        </label>
                      </div>
                    )}
                </div>
                {item.solicitarRessarcimento && (
                  <div className={styles.contentReimbursement}>
                    <h3 className={styles.tituloA}>
                      Anexo de dados adicionais para ressarcimento
                    </h3>
                    {[
                      "1. Documento de identificação (RG ou CNH):",
                      "2. Documentação do veículo:",
                      "3. NFs de serviço:",
                      "4. NF de outras despesa/produtos pertinentes:",
                    ].map((itemInside, idx) => (
                      <FileAttachment
                        key={idx}
                        label={itemInside}
                        garantiaItemId={item.id}
                        isRessarcimento={true}
                        backgroundColor="#f5f5f5"
                        recGarantia={garantia}
                        recSellFile={{
                          fileNameWithExtension: "",
                          imagemUrl: "",
                        }}
                        item={item}
                      />
                    ))}
                  </div>
                )}
                {item.solicitarRessarcimento === false &&
                  garantia?.codigoStatus !==
                  GarantiasStatusEnum2.NAO_ENVIADO && (
                    <div className={styles.dialoginfoRessarcimento}>
                      <InfoCircleOutlined style={{ color: "#bd0502" }} />
                      <span style={{ color: "#bd0502" }}>
                        Item Não Possui Ressarcimento.
                      </span>
                    </div>
                  )}
                {context.user.rule.name === UserRoleEnum.Cliente && (
                  <FileAttachment
                    label="Anexar NF de compra com IMA"
                    garantiaItemId={item.id}
                    isRessarcimento={false}
                    backgroundColor="white"
                    recGarantia={garantia}
                    recSellFile={{ fileNameWithExtension: "", imagemUrl: "" }}
                  />
                )}
                {context.user.rule.name === UserRoleEnum.Cliente && (
                  <h3 className={styles.tituloA}>Anexos de Imagens</h3>
                )}
                {context.user.rule.name === UserRoleEnum.Cliente &&
                  [
                    "1. Foto do lado onde está a gravação IMA:",
                    "2. Foto da parte danificada/amassada-quebrada:",
                    "3. Foto marcações suspeitas na peça:",
                    "4. Foto da peça completa:",
                    "5. Outras fotos pertinentes:",
                  ].map((label, idx) => (
                    <FileAttachment
                      key={idx}
                      garantiaItemId={item.id}
                      label={label}
                      isRessarcimento={false}
                      backgroundColor="white"
                      recGarantia={garantia}
                      recSellFile={{ fileNameWithExtension: "", imagemUrl: "" }}
                      item={item}
                    />
                  ))}
              </CollapsibleSection>
            </div>
          ))
      ) : (
        <p>Nenhum item disponível para esta NF.</p>
      )}
      <Modal
        title="Confirmar Exclusão"
        open={modalDeleteOpen}
        onOk={handleDeleteNF}
        onCancel={() => setModalDeleteOpen(false)}
        okText="Excluir"
        cancelText="Cancelar"
        okButtonProps={{
          style: {
            backgroundColor: "red",
            borderColor: "red",
            color: "white",
            outline: "none",
          },
        }}
        cancelButtonProps={{
          style: { borderColor: "#dadada", color: "#5F5A56", outline: "none" },
        }}
      >
        <p>Você tem certeza de que deseja excluir este Item?</p>
      </Modal>
    </div>
  );
};

export default DetailsItensNF;