import React, { useState, useEffect, useContext } from "react";
import { Button, message, Spin } from "antd";
import { FileOutlined, DeleteOutlined } from "@ant-design/icons";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";
import environment from "@env/environment";
import {
  GarantiasModel,
  GarantiasStatusEnum2,
} from "@shared/models/GarantiasModel";
import { UserRoleEnum } from "@shared/enums/UserRoleEnum";

interface FileData {
  id: string;
  fileName: string;
}

interface FileAttachmentDevolucaoProps {
  label: string;
  backgroundColor: string;
  garantiaId: string;
  recGarantia: GarantiasModel;
  initialFileData?: FileData;
  onFileSelect?: (file: File) => void;
  onFileChange?: (
    fileData: { fileNameWithExtension: string; imagemUrl: string } | null
  ) => void;
}

const FileAttachmentDevolucao: React.FC<FileAttachmentDevolucaoProps> = ({
  label,
  backgroundColor,
  garantiaId,
  recGarantia,
  initialFileData,
  onFileSelect,
  onFileChange,
}) => {
  const [fileData, setFileData] = useState<FileData | null>(
    initialFileData || null
  );
  const [, setFileName] = useState<string | null>(
    initialFileData ? initialFileData.fileName : null
  );
  const [recFile, setRecFile] = useState<{
    fileNameWithExtension: string;
    imagemUrl: string;
  }>({
    fileNameWithExtension: "",
    imagemUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const urlGetFile = `${environment.apiUrl}/files/files/download-private-file-item/${garantiaId}/nfDev`;
        const response = await fetch(urlGetFile, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authContext.user.token}`,
          },
        });
        if (response.ok) {
          const blob = await response.blob();
          const fileNameWithExtension = `nfDev${getFileExtensionFromBlob(
            blob
          )}`;
          const imagemUrl = URL.createObjectURL(blob);
          const newFileData = { fileNameWithExtension, imagemUrl };
          console.log("newFileData: ", newFileData);
          
          setRecFile(newFileData);
          setFileData({ id: garantiaId, fileName: fileNameWithExtension });
          setFileName(fileNameWithExtension);
          onFileChange?.(newFileData);
        } else {
          setRecFile({ fileNameWithExtension: "", imagemUrl: "" });
          setFileData(null);
          setFileName(null);
          onFileChange?.(null);
        }
      } catch (error) {
        console.error("Error fetching file:", error);
        setRecFile({ fileNameWithExtension: "", imagemUrl: "" });
        setFileData(null);
        setFileName(null);
        onFileChange?.(null);
      }
    };
    if (garantiaId) fetchFile();
  }, [garantiaId, authContext.user.token]);

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
    try {
      setLoading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("itemId", garantiaId);
      formData.append("field", "nfDev");

      const response = await fetch(
        `${environment.apiUrl}/files/upload-private-file-item`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authContext.user.token}`,
            accept: "*/*",
          },
          body: formData,
        }
      );

      if (response.ok) {
        const blob = new Blob([file], { type: file.type });
        const fileNameWithExtension = file.name;
        const imagemUrl = URL.createObjectURL(blob);
        const newFileData = { fileNameWithExtension, imagemUrl };
        setRecFile(newFileData);
        setFileData({ id: garantiaId, fileName: file.name });
        setFileName(file.name);
        console.log("Calling onFileChange with:", newFileData);
        onFileChange?.(newFileData);
        message.success("Arquivo enviado com sucesso!");
      } else {
        message.error("Erro ao enviar o arquivo.");
      }
    } catch (error) {
      console.error("Erro no upload do arquivo:", error);
      message.error("Erro ao enviar o arquivo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = () => {
    if (recFile.imagemUrl) {
      const link = document.createElement("a");
      link.href = recFile.imagemUrl;
      link.download = recFile.fileNameWithExtension || "download";
      link.click();
    }
  };

  const handleRemoveFile = async () => {
    try {
        setFileData(null);
        setFileName(null);
        setRecFile({ fileNameWithExtension: "", imagemUrl: "" });
        onFileChange?.(null);
    } catch (error) {
      console.error("Erro ao remover o arquivo:", error);
      message.error("Erro ao remover o arquivo.");
    } finally {
      setLoading(false);
    }
  };

  console.log("recGarantia.codigoStatus:", recGarantia?.codigoStatus);
  const canUpload = [
    GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO,
    GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
    GarantiasStatusEnum2.NF_DEVOLUCAO_RECUSADA,
    GarantiasStatusEnum2.PECAS_AVALIADAS_PARCIAMENTE,
  ].includes(recGarantia?.codigoStatus);

  const canRemoveAttachment = canUpload && (fileData || recFile.imagemUrl);
  const canDownload =
    recFile.imagemUrl &&
    [
      GarantiasStatusEnum2.CONFIRMADO,
      GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
      GarantiasStatusEnum2.PECAS_AVALIADAS_PARCIAMENTE,
      GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO,
    ].includes(recGarantia?.codigoStatus);

  return (
    <div
      style={{
        backgroundColor,
        padding: "10px",
        marginTop: "15px",
        height: "65px",
        alignItems: "center",
        display: "flex",
        justifyContent: "space-between",
        borderRadius: "10px",
      }}
    >
      <span
        style={{
          fontSize: "17.5px",
          paddingLeft: "10px",
          color: "#555",
        }}
      >
        {label}
      </span>
      <div>
        {loading ? (
          <Spin />
        ) : (
          <>
            {recFile.fileNameWithExtension === "" &&
              recFile.imagemUrl === "" &&
              !canUpload && (
                <label style={{ cursor: "default", opacity: 0.6 }}>
                  Nenhum arquivo enviado
                </label>
              )}
            {( recGarantia.codigoStatus === GarantiasStatusEnum2.NF_DEVOLUCAO_RECUSADA && fileData ||
              (recFile.fileNameWithExtension && recFile.imagemUrl)) &&  recGarantia.codigoStatus === GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO  &&  (
              <span style={{backgroundColor: "white", padding: "9px 3px", borderRadius: "5PX", marginRight: "10px"}}>
                <FileOutlined style={{ color: "red", paddingLeft: "5px" }} />{" "}
                {recFile.fileNameWithExtension}
                {canRemoveAttachment && (
                  <Button
                    type="link"
                    onClick={handleRemoveFile}
                    icon={<DeleteOutlined style={{ color: "red" }} />}
                    title="Remover arquivo"
                  />
                )}
              </span>
            )}
            {recFile.fileNameWithExtension != "" && recFile.imagemUrl != ""  && canDownload && (
              <Button
                style={{
                  height: "45px",
                  borderRadius: "10px",
                  fontSize: "16px",
                }}
                onClick={handleDownloadFile}
              >
                Baixar Arquivo
              </Button>
            )}
            {recFile.fileNameWithExtension === "" &&
              recFile.imagemUrl === "" &&
              authContext.user.rule.name != UserRoleEnum.Supervisor &&
              authContext.user.rule.name != UserRoleEnum.Tecnico &&
              canUpload && (
                <label
                  style={{
                    cursor: "pointer",
                    color: "#1890ff !important",
                    padding: "10px 20px",
                    backgroundColor: "#fff",
                    border: "solid 0.5px #d9d9d9",
                    borderRadius: "10px",
                  }}
                >
                  <input
                    type="file"
                    style={{ display: "none", color: "#262626"  }}
                    onChange={(e) => {
                      handleFileChange(e);
                      handleFileUpload(e);
                    }}
                  />
                  Adicionar Anexo
                </label>
              )}
          </>
        )}
      </div>
    </div>
  );
};

export default FileAttachmentDevolucao;
