/* eslint-disable react-hooks/exhaustive-deps */
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
import { PedidoModel } from "@shared/models/PedidosModel";
import { Defect } from "@shared/models/DefectModel";
import { getDefect } from "@shared/services/defectService";
import MultilineTextFields from "@shared/components/multline/multLine";
import JSZip from "jszip";

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
  notaFiscal?: NotaFiscal;
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
  notaFiscal,
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
      else if (label.includes("XML")) fieldFile = "nfRef";
      else if (matchField) {
        if (isRessarcimento) fieldFile = `${matchField[0]}.res`;
        else fieldFile = `${matchField[0]}.img`;
      }

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
  const handleXMLFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    notaFiscalId: string,
    codigoNotaFiscal: string
  ) => {
    if (!event.target.files?.length) {
      message.error("Nenhum arquivo selecionado.");
      return;
    }
    const file = event.target.files[0];

    // Validação do tipo de arquivo
    if (!file.name.endsWith(".xml") || !file.type.includes("xml")) {
      message.error("Apenas arquivos XML são permitidos.");
      return;
    }

    // Validação do nota_fiscal_id
    if (!notaFiscalId) {
      message.error("ID da nota fiscal não fornecido.");
      return;
    }

    /* ---------- 1. Envia ao backend ---------- */
    const formDataUpload = new FormData();
    formDataUpload.append("file", file); // Campo para o arquivo XML
    formDataUpload.append("nota_fiscal_id", notaFiscalId); // Campo para o ID da nota fiscal
    formDataUpload.append("codigoNotaFiscal", codigoNotaFiscal); // Campo para o ID da nota fiscal

    try {
      const resp = await fetch(
        `${environment.apiUrl}/pedidos/pedidos/upload-xml-rgi`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authContext.user.token}`, // Usa authContext do escopo do componente
            Accept: "*/*",
          },
          body: formDataUpload,
        }
      );

      if (resp.ok) {
        const json = await resp.json(); // Ex.: { success: true, inserted: 15, message: "...", nfeInfo: {...} }
        message.success(`XML enviado: ${json.inserted} registros processados!`);
      } else {
        const errorJson = await resp.json();
        message.error(
          `Falha no upload do XML: ${errorJson.message || "Erro desconhecido"}`
        );
        return;
      }
    } catch (err) {
      console.error("Erro no upload:", err);
      message.error("Erro de rede ao enviar o XML.");
      return;
    }
  };

  const handleRemoveFile = () => {
    setFileData(null);
    setFileName(null);
    setRecFile({ fileNameWithExtension: "", imagemUrl: "" });
  };

  const canRemoveAttachment =
    (recGarantia.codigoStatus === GarantiasStatusEnum2.NAO_ENVIADO ||
      label === "Anexo da NF de devolução") &&
    (fileData || recSellFile.imagemUrl);

  return (
    <div className={styles.fileAttachmentContainer} style={{ backgroundColor }}>
      <span className={styles.labelAnexo}>{label}</span>
      <div className={styles.fileUpdateContent}>
        {recFile?.fileNameWithExtension === "" &&
          recFile?.imagemUrl === "" &&
          recGarantia.codigoStatus != GarantiasStatusEnum2.NAO_ENVIADO && (
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
              {
                <Button
                  type="link"
                  onClick={handleRemoveFile}
                  style={{ outline: "none" }}
                  icon={
                    <DeleteOutlined style={{ color: "red", border: "none" }} />
                  }
                  title="Remover arquivo"
                />
              }
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
                  if (label.includes("XML"))
                    handleXMLFileUpload(e, notaFiscal.id, notaFiscal.rgi);

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
  status,
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

  async function buildDataUrlsFromZip(
    itemId: string,
    token: string
  ): Promise<string[]> {
    const zipUrl = `${environment.apiUrl}/files/files/download-private-file-item-list/${itemId}/technicalAnalyse`;

    const res = await fetch(zipUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];

    const zipBlob = await res.blob();
    const zip = await JSZip.loadAsync(zipBlob);

    const entries = Object.values(zip.files).filter((f) => !f.dir);
    const dataUrls: string[] = [];

    for (const entry of entries) {
      const fileBlob = await entry.async("blob");

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(fileBlob); // data:image/png;base64,...
      });

      dataUrls.push(dataUrl);
    }

    // console.log("Qtde imagens no ZIP:", dataUrls.length); // deve logar 12
    return dataUrls;
  }

  function normalizeDataUrlAsImage(dataUrl: string): string {
    // se já for image/*, mantém
    if (dataUrl.startsWith("data:image/")) return dataUrl;

    // força PNG quando vier como application/octet-stream
    if (dataUrl.startsWith("data:application/octet-stream;base64,")) {
      return dataUrl.replace(
        "data:application/octet-stream;base64,",
        "data:image/png;base64,"
      );
    }

    // fallback genérico
    return dataUrl.replace("data:application/octet-stream", "data:image/png");
  }


  function replaceImgsWithDataUrls(html: string, rawDataUrls: string[]): string {
    if (!html || rawDataUrls.length === 0) return html;

    let idx = 0;

    return html.replace(
      /<img[^>]*src="([^"]+)"[^>]*>/g,
      (match, src) => {
        if (!src.includes("download-private-file-item-list")) return match;

        let dataUrl = rawDataUrls[idx] ?? rawDataUrls[rawDataUrls.length - 1];
        idx++;

        dataUrl = normalizeDataUrlAsImage(dataUrl);

        return `<img src="${dataUrl}" />`;
      }
    );
  }



  async function prepareItemForPdf(
    item: Item,
    token: string,
    itemId: string
  ): Promise<{ item: Item; dataUrls: string[] }> {
    if (!item.analiseTecnica) return { item, dataUrls: [] };

    const dataUrls = await buildDataUrlsFromZip(itemId, token);
    if (dataUrls.length === 0) return { item, dataUrls: [] };

    const analiseHtmlForPdf = replaceImgsWithDataUrls(
      item.analiseTecnica,
      dataUrls
    );

    return {
      item: { ...item, analiseTecnica: analiseHtmlForPdf },
      dataUrls,
    };
  }



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

    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
    );

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    let item: Item = {
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
      analiseTecnica: garantiaItem.analiseTecnica || "",
      dataEmissao: `${day}/${month}/${year}`,
    };


    let dataUrls: string[] = [];

    // ============ NOVO: preparar HTML com imagens do ZIP ============
    try {
      const result = await prepareItemForPdf(item, context.user.token, garantiaItem.id);
      item = result.item;
      dataUrls = result.dataUrls;
      // console.log('item: ', item);
      // console.log("Qtde imagens dataUrls:", dataUrls.length);

    } catch (error) {
      console.error("Erro ao carregar imagens do ZIP:", error);
      // continua mesmo assim, só sem as imagens
    }
    // ================================================================
    // console.log("HTML final para o PDF:", item.analiseTecnica);
    // console.log(
    //   "Primeiro src encontrado:",
    //   (item.analiseTecnica.match(/src="([^"]+)"/) || [])[1]
    // );



    const pdfBlob = await pdf(<ReportPDF item={item} images={dataUrls} />).toBlob();

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
      case GarantiasItemStatusEnum.ENVIO_AUTORIZADO:
        return { color: "#00CC00", backgroundColor: "#00CC0015" };
      case GarantiasItemStatusEnum.NAO_ANALISADO:
      case GarantiasItemStatusEnum.NAO_ENVIADO:
        return { color: "#808080", backgroundColor: "#80808015" };
      case GarantiasItemStatusEnum.NAO_AUTORIZADO:
      case GarantiasItemStatusEnum.ENVIO_NAO_AUTORIZADO:
      case GarantiasItemStatusEnum.ENVIO_NF_DEV_NAO_AUTORIZADO:
        return { color: "#FF0000", backgroundColor: "#FF000015" };
      default:
        return { color: "#000", backgroundColor: "#00000015" };
    }
  };
  // console.log("garantiaItem?.status: ", garantiaItem?.status);

  const itemStatus = converterStatusItemGarantia(
    status === GarantiasItemStatusEnum.NAO_ANALISADO ||
      status === GarantiasItemStatusEnum.NAO_ENVIADO
      ? GarantiasItemStatusEnum2.NAO_ANALISADO
      : status === GarantiasItemStatusEnum.NAO_AUTORIZADO
        ? GarantiasItemStatusEnum2.NAO_AUTORIZADO
        : status === GarantiasItemStatusEnum.ENVIO_NAO_AUTORIZADO
          ? GarantiasItemStatusEnum2.ENVIO_NAO_AUTORIZADO
          : status === GarantiasItemStatusEnum.ENVIO_NF_DEV_NAO_AUTORIZADO
            ? GarantiasItemStatusEnum2.ENVIO_NF_DEV_NAO_AUTORIZADO
            : status === GarantiasItemStatusEnum.AUTORIZADO
              ? GarantiasItemStatusEnum2.AUTORIZADO
              : GarantiasItemStatusEnum2.NAO_AUTORIZADO
  ) || "Status não disponível";


  const statusStyle = getStatusColor(garantiaItem?.status || "");
  // console.log("item: ", garantiaItem.codigoItem, "status: ", status);

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
  const [defects, setDefects] = useState<Defect[]>([]);

  useEffect(() => {
    // console.log("nfDevolucaoFile updated:", nfDevolucaoFile);
  }, [nfDevolucaoFile]);

  const handleInputChange = (itemId: string, field: string, value: any) => {
    setNotaFiscal((prevNotaFiscal) => {
      if (prevNotaFiscal) {
        return {
          ...prevNotaFiscal,
          itens: prevNotaFiscal.itens.map((item) =>
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
            // console.log("data: ", data);

          }

          if (
            location.state.nota &&
            JSON.stringify(location.state.nota) !== JSON.stringify(notaFiscal)
          ) {
            setNotaFiscal(location.state.nota);
            // console.log("nota: ", location.state.nota);

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

          const defects = await getDefect(1, 1000);
          const filteredDefects = defects.data.filter(
            (defect) => defect.tipoDefeito.tipoDefeito === "Cliente"
          );
          setDefects(filteredDefects);

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
    // console.log("payloadPostitem: ", payloadPost);

    if (responsePost.status !== 200 && responsePost.status !== 201) {
      message.error("Erro ao criar a garantia.");
    } else {
      message.success("Item criado com sucesso.");
      // console.log("responsePost: ", responsePost);

      const novoItem = {
        id: newItemId,
        codigoItem: newItemRgi,
        nfReferencia: location.state.nfNumber,
        codigoStatus: GarantiasItemStatusEnum2.NAO_ANALISADO,
        status: GarantiasItemStatusEnum.NAO_ANALISADO,
      };

      if (garantia) {
        // Atualiza o estado da nota fiscal atual
        setNotaFiscal((prevNotaFiscal) => {
          if (prevNotaFiscal) {
            return {
              ...prevNotaFiscal,
              itens: [...prevNotaFiscal.itens, novoItem],
            };
          }
          return prevNotaFiscal;
        });

        // Atualiza as listas `notas` e `notasFiscais` dentro de `garantia`
        setGarantia((prevGarantia) => ({
          ...prevGarantia,
          notas: prevGarantia.notas.map((nf) =>
            nf.id === notaFiscal.id
              ? {
                ...nf,
                itens: [...nf.itens, novoItem],
              }
              : nf
          ),
          notasFiscais: prevGarantia.notas.map((nf) =>
            nf.id === notaFiscal.id
              ? {
                ...nf,
                itens: [...nf.itens, novoItem],
              }
              : nf
          ),
        }));
      }
      setVisibleSectionId(newItemId);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const response = await api.delete(`/garantias/item/delete/${itemId}`);

    if (response.status === 200) {
      setNotaFiscal((prevNotaFiscal) => {
        if (prevNotaFiscal) {
          return {
            ...prevNotaFiscal,
            itens: prevNotaFiscal.itens.filter((item) => item.id !== itemId),
          };
        }
      });
      setModalDeleteOpen(false);
      message.success("Item excluído com sucesso!");
    }
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
    // console.log("nfDevolucaoFile before save:", nfDevolucaoFile);
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
        notas: garantia.notas,
        codigoStatus: garantia.codigoStatus,
        anexos: nfDevolucaoFile.fileNameWithExtension,
        rgi: garantia.rgi,
        codigoRGI: garantia.codigoRGI,
        frete: garantia.frete,
        duplicata: null,
        transportadora: garantia.transportadora,
      };
      message.success("NF de devolução salva com sucesso!");
      // console.log("garantiaUpdateHeader: ", garantiaModel);

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

    notaFiscal.itens.forEach(async (item) => {
      try {
        if (
          garantiaItensAPI.some(
            (apiItem) => apiItem.codigoItem === item.codigoItem
          )
        ) {
          const payloadPut = {
            codigoItem: item.codigoItem,
            tipoDefeito: item.tipoDefeito,
            torqueAplicado:
              item.torqueAplicado != null ? Number(item.torqueAplicado) : 0,
            modeloVeiculoAplicado: item.modeloVeiculoAplicado || "",
            nfReferencia: item.nfReferencia,
            codigoPeca: item.codigoPeca,
            loteItemOficial: item.loteItem || "",
            loteItem: item.loteItem || "",
            anoVeiculo: item.anoVeiculo || "",
            codigoStatus: GarantiasItemStatusEnum2.NAO_ANALISADO,
            solicitarRessarcimento: item.solicitarRessarcimento ? 1 : 0,
          };
          // console.log("payloadPut: ", payloadPut);
          const responsePut = await api.put(
            `/garantias/garantiasItem/${item.id}/UpdateItem`,
            payloadPut
          );
          // console.log("item.id: ", item.id);

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
            modeloVeiculoAplicado: item.modeloVeiculoAplicado || "",
            torqueAplicado:
              item.torqueAplicado != null ? Number(item.torqueAplicado) : null,
            nfReferencia: location.state.nfNumber,
            codigoPeca: item.codigoPeca,
            loteItemOficial: item.loteItem || "",
            anoVeiculo: item.anoVeiculo || "",
            loteItem: item.loteItem || "",
            codigoStatus: GarantiasItemStatusEnum2.NAO_ANALISADO,
            solicitarRessarcimento: item.solicitarRessarcimento ? 1 : 0,
            index: notaFiscal.itens.length + 1,
            id: item.id,
          };
          const responsePost = await api.post(
            environment.apiUrl + "/garantias/item/create",
            payloadPost
          );
          // console.log("payloadPost: ", payloadPost);

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
    });

    if (!isError && garantia) {
      message.success("Garantia atualizada com sucesso!");

      navigate(`/garantias/rgi/${garantia.id}`, {
        state: { garantiaData: garantia, item: garantia.nf },
      });
      // console.log("navigateGarantiaDetails:", garantia);
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
          RGI {garantia?.rgi || garantia?.codigoRGI || "N/A"}
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
          {garantia?.codigoStatus >= GarantiasStatusEnum2.EM_ANALISE && (
            <div className="ButtonHeader">
              <Button
                type="default"
                className="ButtonDelete"
                onClick={() =>
                  navigate("/view-pre-invoice", {
                    state: { garantia, notaFiscal },
                  })
                }
              >
                Visualizar Pré Nota
              </Button>
              {/* <Button
                  type="primary"
                  className="ButonToSend"
                  onClick={saveNfDevolcao}
                >
                  Enviar
                </Button> */}
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
        label="Anexar XML da NF de compra com IMA"
        garantiaItemId={notaFiscal?.id}
        isRessarcimento={false}
        backgroundColor="#f5f5f5"
        initialFileData={
          garantia?.anexos
            ? { id: garantia.anexos, fileName: garantia.anexos }
            : undefined
        }
        recGarantia={garantia}
        recSellFile={{ fileNameWithExtension: "", imagemUrl: "" }}
        notaFiscal={notaFiscal}
      />

      {/* <FileAttachment
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
      /> */}
      {(garantia?.codigoStatus ===
        GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO ||
        garantia?.codigoStatus == GarantiasStatusEnum2.CONFIRMADA ||
        garantia?.codigoStatus ===
        GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO ||
        garantia?.codigoStatus === GarantiasStatusEnum2.NF_DEVOLUCAO_RECUSADA ||
        garantia?.codigoStatus ===
        GarantiasStatusEnum2.PECAS_AVALIADAS_PARCIAMENTE) &&
        context.user.rule.name === UserRoleEnum.Cliente && (
          <div style={{ marginTop: "15px" }}>
            {garantia?.codigoStatus ===
              GarantiasStatusEnum2.PECAS_AVALIADAS_PARCIAMENTE && (
                <div className={styles.dialoginfo}>
                  <InfoCircleOutlined style={{ color: "#0277BD" }} />
                  <span style={{ color: "#0277BD" }}>
                    Anexe a NF de devolução dos itens aprovados, para prosseguir
                    com a avaliação parcial.
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
                // console.log("Arquivo selecionado:", file.name);
              }}
              onFileChange={(fileData) => {
                // console.log("File data received:", fileData);
                setNfDevolucaoFile(fileData);
                // console.log("Arquivo alterado:", fileData);
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

            <div
              style={{
                border: visibleSectionId === item.id ? "1px solid red" : "none",
                borderRadius: "15px",
                padding: visibleSectionId === item.id ? "20px" : "20px",
              }}
              className={styles.containerInformacoes}
              key={item.id}
            >
              <CollapsibleSection
                title={item.codigoItem || "Item sem código"}
                isVisible={visibleSectionId === item.id}
                toggleVisibility={() => toggleSectionVisibility(item.id)}
                showDeleteConfirm={() => showDeleteConfirm(item.id)}
                status={item?.status}
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
                        label="Referência / Lote da Peça"
                        fullWidth
                        value={item.loteItem || ""}
                        onChange={(e) => {
                          handleInputChange(
                            item.id,
                            "loteItem",
                            e.target.value
                          );
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
                        options={defects.map((defect) => ({
                          label: defect.defeito,
                          value: defect.defeito,
                        }))}
                        value={item.tipoDefeito || ""}
                        onChange={(e) => {
                          handleInputChange(
                            item.id,
                            "tipoDefeito",
                            e.target.value
                          );
                          item.tipoDefeito = e.target.value;
                        }}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 300, // altura máxima do dropdown
                              overflowY: 'auto', // ativa o scroll
                            },
                          },
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
                        onKeyDown={(e) => {
                          const forbidden = [",", "Decimal", "NumpadDecimal"];
                          if (forbidden.includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          let value = e.target.value;

                          value = value.replace(",", ".");
                          // Impede ter mais de um ponto
                          value = value.replace(/(\..*)\./g, "$1");

                          handleInputChange(
                            item.id,
                            "torqueAplicado",
                            Number(value)
                          );
                          item.torqueAplicado = Number(value);
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
                {/* {context.user.rule.name === UserRoleEnum.Cliente && (
                  <FileAttachment
                    label="Anexar NF de compra com IMA"
                    garantiaItemId={item.id}
                    isRessarcimento={false}
                    backgroundColor="white"
                    recGarantia={garantia}
                    recSellFile={{ fileNameWithExtension: "", imagemUrl: "" }}
                  />
                )} */}
                <FileAttachment
                  label="Anexo da NF de venda"
                  backgroundColor="white"
                  garantiaItemId={item.id}
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
              {
                (garantia?.codigoStatus == GarantiasStatusEnum2.PECAS_AVALIADAS ||
                  garantia?.codigoStatus == GarantiasStatusEnum2.PECAS_AVALIADAS_PARCIAMENTE) &&
                (
                  <>
                    <div className={styles.block}>
                      <OutlinedSelectWithLabel
                        disabled
                        label="Análise"
                        options={[
                          {
                            value: "Autorizado",
                            label: "Procedente",
                          },
                          { value: "Não autorizado", label: "Improcedente" },
                        ]}
                        value={item?.status}
                      />
                    </div>
                    {/* <div className={styles.block}>
                      <OutlinedInputWithLabel
                        label="Defeito"
                        value={item?.tipoDefeitoOficial || ""}
                        disabled
                        fullWidth
                      />
                    </div> */}
                    {item?.status == GarantiasItemStatusEnum.NAO_AUTORIZADO && (
                      <>
                        <h3 className={styles.tituloA}>Conclusão</h3>
                        <MultilineTextFields
                          disabled
                          value={item?.conclusao || ""}
                          onChange={null}
                          label="Conclusão"
                        />
                      </>
                    )}
                    {item?.status == GarantiasItemStatusEnum.AUTORIZADO && (
                      <>

                      </>
                    )}
                  </>
                )
              }

            </div>
          ))
      ) : (
        <p>Nenhum item disponível para esta NF.</p>
      )}
      {[
        GarantiasStatusEnum2.NAO_ENVIADO,
        GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO,
        GarantiasStatusEnum2.NF_DEVOLUCAO_RECUSADA,
      ].includes(garantia.codigoStatus) &&
        context.user.rule.name === UserRoleEnum.Cliente && (
          <div
            style={{ right: "10px", display: "flex", justifyContent: "right" }}
          >
            <Button
              type="primary"
              className={styles.ButonToSend}
              onClick={() => {
                // console.log("notaFiscal?.itens: ", notaFiscal?.itens);

                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                garantia.codigoStatus ===
                  GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO
                  ? saveNfDevolcao()
                  : save();
              }}
            >
              SALVAR
            </Button>
          </div>
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
