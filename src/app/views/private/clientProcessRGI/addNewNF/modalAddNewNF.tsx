/* eslint-disable @typescript-eslint/no-unused-vars */
import { Modal, Button, Upload, message } from "antd";
import { useContext, useEffect, useState } from "react";
import OutlinedInputWithLabel from "@shared/components/input-outlined-with-label/OutlinedInputWithLabel";
import "./modalAddNewNF.style.css";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";
import { ModalModel } from "../RGIDetailsInitial/RGIDetailsInitial";
import environment from "@env/environment";
import { GarantiasModel } from "@shared/models/GarantiasModel";
import {
  GarantiasStatusEnum,
  GarantiasStatusEnum2,
} from "@shared/enums/GarantiasStatusEnum";
import api from "@shared/Interceptors";

interface NFModalProps {
  open: boolean;
  onOpenChange: (modalModel: ModalModel) => void;
  onAddNF: (nfNumber: string) => void;
  isSell: boolean;
  itemId: string;
  garantiaId: string;
}

const NFModal = ({
  open,
  onOpenChange,
  onAddNF,
  isSell,
  itemId,
  garantiaId,
}: NFModalProps) => {
  const [inputValue, setInputValue] = useState("");
  const [fileName, setFileName] = useState<string>("");
  const [, setFile] = useState(null);
  const [label, setLabel] = useState("");
  const [idGarantia, setIdGarantia] = useState(garantiaId);
  const context = useContext(AuthContext);

  useEffect(() => {
    const title = isSell ? "N° NF de origem *" : "N° NF de devolução *";
    setLabel(title);
    setIdGarantia(garantiaId);
  });

  const handleRemoveFile = () => {
    setFileName("");
  };

  const handleCancel = () => {
    setFileName(""); // Limpa o nome do arquivo
    onOpenChange({ isOpen: false, isSell: false }); // Fecha o modal
  };

  const handleCreateNF = async () => {
    if (isSell) {
      if (inputValue.trim()) {
        onAddNF(inputValue);
        setInputValue("");
        onOpenChange({ isOpen: false, isSell: false });
        //console.log(inputValue);
        //console.log(file);
      }
    } else if (!isSell) {
      
      //console.log("garantiaId: ", garantiaId);
      if(!garantiaId)
        message.error("Id da garantia vazio");


      setInputValue("");
      onOpenChange({ isOpen: false, isSell: false });
      //console.log(inputValue);
      //console.log(file);
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

      const garantia: GarantiasModel = {
        razaoSocial: context.user.fullname,
        telefone: context.user.phone,
        email: context.user.email,
        nf: inputValue,
        fornecedor: context.user.fullname,
        codigoStatus: GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
        observacao: "teste",
        usuarioAtualizacao: context.user.username,
        status: GarantiasStatusEnum.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
        dataAtualizacao: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`,
      };

      const responseHeader = await api.put(
        `/garantias/garantiasHeader/${idGarantia}/UpdateHeader`,
        garantia
      );

      if (responseHeader.status === 200) {
        message.success("Garantia atualizada com sucesso!");
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFileChange = async (info: any, label: string) => {
    if (info.file.status !== "uploading") {
      setFileName(info.file.name);
      setFile(info.file);
    }
    const endpoint = environment.apiUrl + "/files/upload-private-file-item";
    const match = label.match(/^\d+/);
    const fileData = new FormData();
    fileData.append("file", info.file);
    fileData.append("itemId", itemId);
    //console.log("match: " + match);

    if (label.includes("devolução")) fileData.append("field", "nfDev");
    else if (match) {
      if (label.includes("Devolução")) fileData.append("field", `nfDev`);
      else fileData.append("field", "nfOrig");
    }

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
      } else {
        message.error("Erro ao enviar arquivo.");
      }
    } catch (error) {
      console.error("Erro no upload do arquivo:", error);
      message.error("Erro ao enviar arquivo.");
    }
  };

  return (
    <Modal
      title="NOVA NF ASSOCIADA"
      open={open}
      onCancel={() => onOpenChange({ isOpen: false, isSell: false })}
      footer={null}
      className="nf-modal"
      width={600}
    >
      <div className="nf-content">
        <div className="nf-rgi">RGI N° {context.user.codigoCigam}</div>
        <div className="nf-field">
          <OutlinedInputWithLabel
            label={isSell ? "N° NF de origem *" : "N° NF de devolução *"}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            fullWidth
          />
        </div>
        {/* <div className="nf-field-anexo">
          <label>{label}</label>
          <div className="nf-upload-container">
            {fileName && (
              <span className="file-name">
                <FileOutlined
                  onChange={(info) => handleFileChange(info, label)}
                  style={{ color: "red", paddingLeft: "5px" }}
                />
                {fileName}
                <button
                  className="button-remove-upload"
                  onClick={handleRemoveFile}
                >
                  x
                </button>
              </span>
            )}
            <Upload
              showUploadList={false}
              beforeUpload={() => false}
              onChange={(info) => handleFileChange(info, label)}
            >
              <Button icon={<UploadOutlined />}>Anexar</Button>
            </Upload>
          </div>
        </div> */}

        <div className="nf-footer">
          <Button onClick={handleCancel} className="cancel-button">
            Cancelar
          </Button>
          <Button
            type="primary"
            danger
            className="creating-button"
            onClick={handleCreateNF}
          >
            Criar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default NFModal;
