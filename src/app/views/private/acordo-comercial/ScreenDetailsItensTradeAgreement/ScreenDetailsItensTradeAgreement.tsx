import { useState } from "react";
import { Button, Modal } from "antd";
import { DownOutlined, DeleteOutlined, LeftOutlined, FileOutlined, RightOutlined } from "@ant-design/icons";
import styles from "./ScreenDetailsItensTradeAgreement.module.css";
import OutlinedInputWithLabel from "@shared/components/input-outlined-with-label/OutlinedInputWithLabel";
import { useNavigate, useParams } from "react-router-dom";

const FileAttachment = ({ label, backgroundColor }: { label: string; backgroundColor?: string }) => {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFileName(event.target.files[0].name);
    }
  };

  return (
    <div className={styles.fileAttachmentContainer} style={{ backgroundColor }}>
      <span className={styles.labelAnexo}>{label}</span>
      <div className={styles.fileUpdateContent}>
        {fileName && (
          <span className={styles.fileName}>
            <FileOutlined style={{ color: "red", paddingLeft: "5px" }} /> {fileName}
            <button className={styles.buttonRemoveUpload} onClick={() => setFileName(null)}>
              x
            </button>
          </span>
        )}
        <label className={styles.buttonUpdateNfSale}>
          <input type="file" style={{ display: "none" }} onChange={handleFileChange} />
          Adicionar Anexo
        </label>
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
}: {
  title: string;
  isVisible: boolean;
  toggleVisibility: () => void;
  showDeleteConfirm: () => void;
  children: React.ReactNode;
  status: "Autorizado" | "Recusado";
}) => (
  <div>
    <div className={styles.tituloSecaoContainer}>
      <h3 className={styles.tituloSecaoVermelho}>
        {title}{" "}
        <span className={status === "Autorizado" ? styles.statusAuthorized  : styles.statusRejected }>
          {status}
        </span>
      </h3>
      <div className={styles.iconAndArrow}>
        <DeleteOutlined
          className={styles.DeleteOutlined}
          style={{ color: "#555", fontSize: "22px", cursor: "pointer", marginRight: "15px" }}
          onClick={showDeleteConfirm}
        />
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

const ScreenDetailsItensTradeAgreement: React.FC = () => {
  const [items, setItems] = useState<{ id: number; title: string; status: "Autorizado" | "Recusado" }[]>([
    { id: 1, title: "000666-00147.A.01", status: "Autorizado" },
  ]);
  const [visibleSectionId, setVisibleSectionId] = useState<number | null>(1); 
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null); 
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const addNewItem = () => {
    const newItemId = items.length + 1;
    const newItemTitle = `000666-00147.A.${newItemId.toString().padStart(2, "0")}`;
    setItems([...items, { id: newItemId, title: newItemTitle, status: "Autorizado" }]);
    setVisibleSectionId(newItemId); 
  };

  const handleDeleteItem = (itemId: number) => {
    setItems(items.filter((item) => item.id !== itemId)); 
    setModalDeleteOpen(false); 
  };

  const showDeleteConfirm = (itemId: number) => {
    setItemToDelete(itemId); 
    setModalDeleteOpen(true); 
  };

  const handleDeleteNF = () => {
    if (itemToDelete !== null) {
      handleDeleteItem(itemToDelete); 
    }
  };



  const toggleSectionVisibility = (id: number) => {
    if (visibleSectionId === id) {
      setVisibleSectionId(null);
    } else {
      setVisibleSectionId(id);
    }
  };

  return (
    <div className={styles.containerApp} style={{ backgroundColor: "#ffffff" }}>
      <div className={styles.ContainerButtonBack}>
        <Button
          type="link"
          className={styles.ButtonBack}
          onClick={() => navigate(`/garantias/rgi/${id}`)}
        >
          <LeftOutlined /> VOLTAR PARA INFORMAÇÕES DA ACI
        </Button>
        <span className={styles.RgiCode}>ACI N° 000666-0001 / NF 000666-00147.A</span> 
      </div>

      <div className={styles.ContainerHeader}>
        <h1 className={styles.tituloRgi}>000666-00147.A</h1>
        <div className={styles.botoesCabecalho}>
        <Button type="default" className={styles.ButtonDelete}>
            Visualizar Pré-Nota
          </Button>
          <Button type="default" className={styles.ButtonDelete}>
            Excluir
          </Button>
          <Button type="primary" className={styles.ButonToSend}>
            Salvar
          </Button>
        </div>
      </div>
      <hr className={styles.divisor} />
     
      <div className={styles.TitleItens}>
        <h3 className={styles.nfsTitle}>Itens desta NF associados a esta garantia</h3>
        <Button
          className={styles.buttonRed}
          style={{ backgroundColor: "red", borderRadius: "10px", height: "45px", padding: "0px 25px", fontSize: "16px", outline: "none" }}
          type="primary"
          onClick={addNewItem}
        >
          Adicionar Peça
        </Button>
      </div>
      {/* <div className={styles.dialoginfo}>
        <InfoCircleOutlined style={{ color: "#0277BD" }} />
        <span style={{ color: "#0277BD" }}>
          Caso a peça não possua um lote, o campo Lote da peça deve ser preenchido com “Não contém”
        </span>
      </div> */}

      {items.map((item) => (
        <div className={styles.containerInformacoes} key={item.id}>
          <CollapsibleSection
            title={item.title}
            isVisible={visibleSectionId === item.id}
            toggleVisibility={() => toggleSectionVisibility(item.id)}
            showDeleteConfirm={() => showDeleteConfirm(item.id)}
            status={item.status}
          >
            <h3 className={styles.tituloSecao}>Informações Gerais</h3>

            <div className={styles.inputsContainer}>
              <div className={styles.inputsConjun}>
                <div className={styles.inputGroup} style={{ flex: 0.5 }}>
                  <OutlinedInputWithLabel label="Código da peça *" fullWidth value="" />
                </div>
                <div className={styles.inputGroup} style={{ flex: 0.5 }}>
                  <OutlinedInputWithLabel label="Quantidade *"  fullWidth value="" />
                </div>
              </div>
              
            </div>
            <FileAttachment label="Anexo da NF de devolução" backgroundColor="#ffffff" />

           
          </CollapsibleSection>
        </div>
      ))}

      <Modal
        title="Confirmar Exclusão"
        visible={modalDeleteOpen}
        onOk={handleDeleteNF}
        onCancel={() => setModalDeleteOpen(false)}
        okText="Excluir"
        cancelText="Cancelar"
        okButtonProps={{
          style: { backgroundColor: "red", borderColor: "red", color: "white", outline: "none" },
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

export default ScreenDetailsItensTradeAgreement;
