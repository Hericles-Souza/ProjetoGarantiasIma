import { Modal, Button, Upload } from "antd";
import { FileOutlined, UploadOutlined } from "@ant-design/icons";
import { useContext, useState } from "react";
import OutlinedInputWithLabel from "@shared/components/input-outlined-with-label/OutlinedInputWithLabel";
import "./modalAddNewNF.style.css";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";

interface NFModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNF: (nfNumber: string) => void;
}

const NFModal = ({ open, onOpenChange, onAddNF }: NFModalProps) => {
  const [inputValue, setInputValue] = useState("");
  const [fileName, setFileName] = useState<string>("");
  const [file, setFile] = useState(null);
  const context = useContext(AuthContext);

  var numNota :String = '';


  const handleFileChange = (info: any) => {
    if (info.file.status !== "uploading") {
      setFileName(info.file.name);
      setFile(info.file);
    }
    console.log(file);
  };

  const handleRemoveFile = () => {
    setFileName("");
  };
  const handleCancel = () => {
    setFileName(""); // Limpa o nome do arquivo
    onOpenChange(false); // Fecha o modal
  };
  const handleCreateNF = () => {
    if (inputValue.trim()) {
      onAddNF(inputValue);
      setInputValue("");
      onOpenChange(false);
      console.log(inputValue);
      console.log(file);
    }
  };

  return (
    <Modal title="NOVA NF ASSOCIADA" open={open} onCancel={() => onOpenChange(false)} footer={null} className="nf-modal" width={600}>
      <div className="nf-content">
      <div className="nf-rgi">RGI N° {context.user.codigoCigam}</div>
        <div className="nf-field">
          <OutlinedInputWithLabel label="N° NF de origem *" value={inputValue} onChange={(e) => setInputValue(e.target.value)} fullWidth />
        </div>
        <div className="nf-field-anexo">
          <label>Anexo da NF de venda</label>
          <div className="nf-upload-container">
            {fileName && (
              <span className="file-name">
                <FileOutlined onChange={handleFileChange} style={{ color: "red", paddingLeft: "5px" }} />
                {fileName}
                <button className="button-remove-upload" onClick={handleRemoveFile}>
                  x
                </button>
              </span>
            )}
            <Upload showUploadList={false} beforeUpload={() => false} onChange={handleFileChange}>
              <Button icon={<UploadOutlined />}>Anexar</Button>
            </Upload>
          </div>
        </div>

        <div className="nf-footer">
          <Button onClick={handleCancel} className="cancel-button">Cancelar</Button>
          <Button type="primary" danger className="creating-button" onClick={handleCreateNF}>
            Criar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default NFModal;
