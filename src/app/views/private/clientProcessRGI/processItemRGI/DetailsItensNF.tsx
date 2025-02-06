import { useContext, useState } from "react";
import { Button, Modal } from "antd";
import { DownOutlined, DeleteOutlined, LeftOutlined, InfoCircleOutlined, FileOutlined, RightOutlined } from "@ant-design/icons";
import styles from "./DetailsItensNF.module.css";
import OutlinedInputWithLabel from "@shared/components/input-outlined-with-label/OutlinedInputWithLabel";
import OutlinedSelectWithLabel from "@shared/components/select/OutlinedSelectWithLabel";
import { useNavigate, useParams } from "react-router-dom";
import ColorCheckboxes from "@shared/components/checkBox/checkBox";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";
import { GarantiasStatusEnum2 } from "@shared/enums/GarantiasStatusEnum";
import { GarantiaItem } from "@shared/models/GarantiasModel";
import { updateGarantiaItemByIdAsync } from "@shared/services/GarantiasService";

const FileAttachment = ({ label, itemCount, backgroundColor }: { label: string; itemCount:number, backgroundColor?: string }) => {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      console.log(event.target.files, 'numero de uploads')
      console.log(itemCount+1, 'numero maximo')
      console.log(label, 'label')
      
      return setFileName(event.target.files[0].name);
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
  status: string;
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

const DetailsItensNF: React.FC = () => {
  const [items, setItems] = useState([
    {
      id: 1,
      title: 'Peça 1',
      codigoPeca: '',
      lotePeca: '',
      status: 'Autorizado',
      defeito: undefined,
      modeloVeiculo: '',
      anoVeiculo: '',
      torquePeca: '',
      isReimbursementChecked: false,
      anexos: [],
      anexoNfVenda: [],
      anexoNfReferencia: [],
    }
  ]);
  const [visibleSectionId, setVisibleSectionId] = useState<number | null>(1); 
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null); 
  const [isReimbursementChecked, setIsReimbursementChecked] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const handleInputChange = (itemId, field, value) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, [field]: value }
          : item
      )
    );
  };
  

  const addNewItem = () => {
    const newItemId = items.length + 1;
    const newItemTitle = `000666-00147.A.${newItemId.toString().padStart(2, "0")}`;
    setItems([
      ...items,
      {
        id: newItemId,
        title: newItemTitle,
        status: "Autorizado",
        codigoPeca: "",          // Inicializa com um valor vazio
        lotePeca: "",            // Inicializa com um valor vazio
        defeito: undefined,      // Inicializa com undefined ou o valor que preferir
        modeloVeiculo: "",       // Inicializa com um valor vazio
        anoVeiculo: "",          // Inicializa com um valor vazio
        torquePeca: "",         // Inicializa com um valor vazio
        isReimbursementChecked: false,  // Inicializa com o valor padrão do checkbox
        anexos: [],               // Inicializa com um array vazio para anexos
        anexoNfVenda: [],         
        anexoNfReferencia: [],
      }
    ]);    setVisibleSectionId(newItemId); 
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


  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsReimbursementChecked(e.target.checked);
  };

  const toggleSectionVisibility = (id: number) => {
    if (visibleSectionId === id) {
      setVisibleSectionId(null);
    } else {
      setVisibleSectionId(id);
    }
  };

  const send = () => {
    items.forEach((element) => {
      var item: GarantiaItem = {
        codigoItem: element.codigoPeca,
        codigoStatus: GarantiasStatusEnum2.NAO_ENVIADO,
        nfReferencia: element.anoVeiculo,
        tipoDefeito: "",
        modeloVeiculoAplicado: "",
        torqueAplicado: 0,
        loteItemOficial: "",
        loteItem: "",
        solicitarRessarcimento: false,
        id: "",
        rgi: "",
        status: ""
      }
      updateGarantiaItemByIdAsync(id, item);
    });
    
  }

  return (
    <div className={styles.containerApp} style={{ backgroundColor: "#ffffff" }}>
      <div className={styles.ContainerButtonBack}>
        <Button
          type="link"
          className={styles.ButtonBack}
          onClick={() => navigate(`/garantias/rgi/${id}`)}
        >
          <LeftOutlined /> VOLTAR PARA INFORMAÇÕES DO RGI
        </Button>
        <span className={styles.RgiCode}>RGI N° 000666-0001 / NF 000666-00147.A</span> 
      </div>
      <div className={styles.ContainerHeader}>
        <h1 className={styles.tituloRgi}>000666-00147.A</h1>
        <div className={styles.botoesCabecalho}>
          <Button type="default" className={styles.ButtonDelete}>
            EXCLUIR
          </Button>
          <Button type="primary" className={styles.ButonToSend} onClick={send}>
            SALVAR
          </Button>
        </div>
      </div>
      <hr className={styles.divisor} />
      <FileAttachment label="Anexo da NF de venda" backgroundColor="#f5f5f5" />
      <div className={styles.TitleItens}>
        <h3 className={styles.nfsTitle}>Itens desta NF associados a esta garantia</h3>
        <Button
          className={styles.buttonRed}
          style={{ backgroundColor: "red", borderRadius: "10px", height: "45px", padding: "0px 25px", outline: "none" }}
          type="primary"
          onClick={addNewItem}
        >
          ADICIONAR PEÇA
        </Button>
      </div>
      <div className={styles.dialoginfo}>
        <InfoCircleOutlined style={{ color: "#0277BD" }} />
        <span style={{ color: "#0277BD" }}>
          Caso a peça não possua um lote, o campo Lote da peça deve ser preenchido com “Não contém”
        </span>
      </div>

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
                  <OutlinedInputWithLabel label="Código da peça" fullWidth value={item.codigoPeca} onChange={(e) => handleInputChange(item.id, 'codigoPeca', e.target.value)}
/>
                </div>
                <div className={styles.inputGroup} style={{ flex: 0.5 }}>
                  <OutlinedInputWithLabel label="Lote da peça" fullWidth value={item.lotePeca} onChange={(e) => handleInputChange(item.id, 'lotePeca', e.target.value)} />
                </div>
              </div>

              <div className={styles.inputsConjun}>
                <div className={styles.inputGroup} style={{ flex: 0.4 }}>
                  <OutlinedSelectWithLabel
                    label="Possível defeito"
                    fullWidth
                    options={[
                      { value: "Opção 1", label: "Opção 1" },
                      { value: "Opção 2", label: "Opção 2" },
                      { value: "Opção 3", label: "Opção 3" },
                    ]}
                    value={item.defeito}
                    onChange={(e) => handleInputChange(item.id, 'defeito', e.target.value)}
                    defaultValue={undefined}
                  />
                </div>
                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <OutlinedInputWithLabel label="Modelo do veículo que aplicou" fullWidth value={item.modeloVeiculo} onChange={(e) => handleInputChange(item.id, 'modeloVeiculo', e.target.value)} />
                </div>
                <div className={styles.inputGroup} style={{ flex: 0.3 }}>
                  <OutlinedInputWithLabel label="Ano do veículo" fullWidth value={item.anoVeiculo} onChange={(e) => handleInputChange(item.id, 'anoVeiculo', e.target.value)} />
                </div>
              </div>
              <div className={styles.inputsConjun}>
                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <OutlinedInputWithLabel label="Torque aplicado à peça" fullWidth value={item.torquePeca} onChange={(e) => handleInputChange(item.id, 'torquePeca', e.target.value)} />
                </div>
              </div>
              <div className={styles.checkboxContainer}>
                <ColorCheckboxes onChange={(e) => handleInputChange(item.id, 'isReimbursementChecked', e.target.checked)} checked={item.isReimbursementChecked} />
                <label className={styles.checkboxDanger}>Solicitar ressarcimento</label>
              </div>
            </div>

            {isReimbursementChecked && (
              <div className={styles.contentReimbursement}>
                <h3 className={styles.tituloA}>Anexo de dados adicionais para ressarcimento</h3>
                {["1. Documento de identificação (RG ou CNH):", "2. Documentação do veículo:", "3. NF do guincho:", "4. NF de outras despesa/produtos pertinentes:"].map(
                  (item) => (
                    <FileAttachment label={item} backgroundColor="#f5f5f5" />
                  )
                )}
              </div>
            )}
            <FileAttachment label="Anexo da NF de Referência" backgroundColor="white" />
            <h3 className={styles.tituloA}>Anexos de Imagens</h3>
            {["1. Foto do lado onde está a gravação IMA:", "2. Foto da parte danificada/amassada/quebrada:", "3. Foto marcações suspeitas na peça:", "4. Foto da peça completa:", "5. Outras fotos pertinentes:"].map(
              (item) => (
                <FileAttachment label={item} itemCount={1} backgroundColor="white" />
              )
            )}
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

export default DetailsItensNF;

