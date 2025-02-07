import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, message, Modal } from "antd";
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
import { GarantiasStatusEnum2 } from "@shared/enums/GarantiasStatusEnum";
import { GarantiaItem, GarantiasModel } from "@shared/models/GarantiasModel";
import { updateGarantiaItemByIdAsync, getGarantiaByIdAsync } from "@shared/services/GarantiasService";
import api from "@shared/Interceptors";

const FileAttachment = ({
  label,
  backgroundColor,
}: {
  label: string;
  backgroundColor?: string;
}) => {
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
            <button
              className={styles.buttonRemoveUpload}
              onClick={() => setFileName(null)}
            >
              x
            </button>
          </span>
        )}
        <label className={styles.buttonUpdateNfSale}>
          <input
            type="file"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          Adicionar Anexo
        </label>
      </div>
    </div>
  );
};

const formatRgiWithSequence = (rgi: string, letter: string, sequence: number) => {
  return `${rgi}.${letter}.${sequence.toString().padStart(2, "0")}`;
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
        <span
          className={
            status === "Autorizado"
              ? styles.statusAuthorized
              : styles.statusRejected
          }
        >
          {status}
        </span>
      </h3>
      <div className={styles.iconAndArrow}>
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
  // Extraímos o ID da garantia da URL
  const { id: guaranteeId } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Estado para os itens da garantia
  const [items, setItems] = useState<
    Array<{
      id: string;
      title: string;
      codigoPeca: string;
      lotePeca: string;
      status: string;
      tipoDefeito: string;
      modeloVeiculo: string;
      anoVeiculo: string;
      torquePeca: string;
      isReimbursementChecked: boolean;
      anexos: string;
      rgi: string;
    }>
  >([]);
  const [visibleSectionId, setVisibleSectionId] = useState<string | null>(null);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [garantia, setGarantia] = useState<GarantiasModel | null>(null);

  // Obtém a letra do RGI do state ou define "A" como padrão
  const rgiLetter = (location.state as any)?.rgiLetter || "A";

  const handleInputChange = (itemId: string, field: string, value: any) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  useEffect(() => {
    const loadGarantiaData = async () => {
      try {
        let data: GarantiasModel | null = null;
        if (location.state && "garantiaData" in location.state) {
          data = (location.state as { garantiaData: GarantiasModel }).garantiaData;
        } else if (guaranteeId) {
          const response = await getGarantiaByIdAsync(guaranteeId);
          data = response.data;
        }
        if (data) {
          setGarantia(data);
          const transformedItems = data.itens.map((item, idx) => ({
            id: item.id,
            title: item.codigoItem || "",
            codigoPeca: item.codigoItem || "",
            lotePeca: item.loteItem || "",
            status: item.codigoStatus ? item.codigoStatus.toString() : "",
            tipoDefeito: item.tipoDefeito || "",
            modeloVeiculo: item.modeloVeiculoAplicado || "",
            anoVeiculo: item.nfReferencia || "",
            torquePeca: item.torqueAplicado?.toString() || "",
            isReimbursementChecked: item.solicitarRessarcimento === false,
            anexos: item.anexos || "",
            // Caso o item não tenha rgi, define-o com base na sequência (index + 1)
            rgi: item.rgi || formatRgiWithSequence(data.rgi, rgiLetter, idx + 1),
          }));
          setItems(transformedItems);
          if (transformedItems.length > 0) {
            setVisibleSectionId(transformedItems[0].id);
          }
        }
      } catch (error) {
        console.error("Error loading garantia data:", error);
      }
    };

    loadGarantiaData();
  }, [location.state, guaranteeId, rgiLetter]);

  const addNewItem = () => {
    const newItemId = crypto.randomUUID();
    const sequence = items.length + 1;
    const newItemRgi = garantia ? formatRgiWithSequence(garantia.rgi, rgiLetter, sequence) : "";
    setItems([
      ...items,
      {
        id: newItemId,
        title: "",
        codigoPeca: "",
        lotePeca: "",
        status: "Autorizado",
        tipoDefeito: "",
        modeloVeiculo: "",
        anoVeiculo: "",
        torquePeca: "",
        isReimbursementChecked: false,
        anexos: "",
        rgi: newItemRgi,
      },
    ]);
    setVisibleSectionId(newItemId);
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId));
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

  const send = async () => {
    if (!garantia?.id) {
      message.error("ID da garantia não encontrado");
      return;
    }
  
    // Utiliza o ID do primeiro item da garantia para atualizar
    const itemId = garantia?.itens?.[0]?.id;
    if (!itemId) {
      message.error("ID do item não encontrado");
      return;
    }
  
    // Payload com os campos conforme o exemplo (apenas os campos, sem os valores reais)
    const payload = {
      codigoItem: items[0].codigoPeca,
      tipoDefeito: items[0].tipoDefeito,
      modeloVeiculoAplicado: items[0].modeloVeiculo,
      torqueAplicado: Number(items[0].torquePeca) || 0,
      nfReferencia: items[0].anoVeiculo,
      loteItemOficial: items[0].lotePeca,
      loteItem: items[0].lotePeca,
      codigoStatus: items[0].status === "Autorizado" ? GarantiasStatusEnum2.NAO_ENVIADO : GarantiasStatusEnum2.EM_ANALISE,
      solicitarRessarcimento: items[0].isReimbursementChecked ? 1 : 0,
    };
  
    try {
      const response = await api.put(
        `/garantias/garantiasItem/${itemId}/UpdateItem`,
        payload
      );
  
      if (response.status === 200) {
        message.success("Garantia atualizada com sucesso!");
        navigate("/garantias");
      } else {
        message.error("Erro ao atualizar a garantia.");
      }
    } catch (error) {
      console.error("Erro ao atualizar a garantia:", error);
      message.error("Erro ao atualizar a garantia.");
    }
  };
  

  return (
    <div className={styles.containerApp} style={{ backgroundColor: "#ffffff" }}>
      <div className={styles.ContainerButtonBack}>
        <Button
          type="link"
          className={styles.ButtonBack}
          onClick={() =>
            navigate(`/garantias/rgi/${guaranteeId}`, {
              state: {
                garantiaData: garantia,
                nf: garantia?.nf,
              },
            })
          }
        >
          <LeftOutlined /> VOLTAR PARA INFORMAÇÕES DO RGI
        </Button>
        <span className={styles.RgiCode}>
          RGI N° {garantia?.rgi} / NF {garantia?.nf || "----"}
        </span>
      </div>
      <div className={styles.ContainerHeader}>
        <h1 className={styles.tituloRgi}>
          RGI {garantia?.rgi}.{rgiLetter}
        </h1>
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
        <h3 className={styles.nfsTitle}>
          Itens desta NF associados a esta garantia
        </h3>
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
      </div>
      <div className={styles.dialoginfo}>
        <InfoCircleOutlined style={{ color: "#0277BD" }} />
        <span style={{ color: "#0277BD" }}>
          Caso a peça não possua um lote, o campo Lote da peça deve ser preenchido com “Não contém”
        </span>
      </div>
      {items.map((item, index) => (
        <div className={styles.containerInformacoes} key={item.id}>
          <CollapsibleSection
            title={formatRgiWithSequence(garantia?.rgi || "", rgiLetter, index + 1)}
            isVisible={visibleSectionId === item.id}
            toggleVisibility={() => toggleSectionVisibility(item.id)}
            showDeleteConfirm={() => showDeleteConfirm(item.id)}
            status={item.status}
          >
            <h3 className={styles.tituloSecao}>Informações Gerais</h3>
            <div className={styles.inputsContainer}>
              <div className={styles.inputsConjun}>
                <div className={styles.inputGroup} style={{ flex: 0.5 }}>
                  <OutlinedInputWithLabel
                    label="Código da peça"
                    fullWidth
                    value={item.codigoPeca}
                    onChange={(e) =>
                      handleInputChange(item.id, "codigoPeca", e.target.value)
                    }
                  />
                </div>
                <div className={styles.inputGroup} style={{ flex: 0.5 }}>
                  <OutlinedInputWithLabel
                    label="Lote da peça"
                    fullWidth
                    value={item.lotePeca}
                    onChange={(e) =>
                      handleInputChange(item.id, "lotePeca", e.target.value)
                    }
                  />
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
                    value={item.tipoDefeito}
                    onChange={(e) =>
                      handleInputChange(item.id, "tipoDefeito", e.target.value)
                    }
                  />
                </div>
                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <OutlinedInputWithLabel
                    label="Modelo do veículo que aplicou"
                    fullWidth
                    value={item.modeloVeiculo}
                    onChange={(e) =>
                      handleInputChange(item.id, "modeloVeiculo", e.target.value)
                    }
                  />
                </div>
                <div className={styles.inputGroup} style={{ flex: 0.3 }}>
                  <OutlinedInputWithLabel
                    label="Ano do veículo"
                    fullWidth
                    value={item.anoVeiculo}
                    onChange={(e) =>
                      handleInputChange(item.id, "anoVeiculo", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className={styles.inputsConjun}>
                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <OutlinedInputWithLabel
                    label="Torque aplicado à peça"
                    fullWidth
                    value={item.torquePeca}
                    onChange={(e) =>
                      handleInputChange(item.id, "torquePeca", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className={styles.checkboxContainer}>
                <ColorCheckboxes
                  onChange={(e) =>
                    handleInputChange(item.id, "isReimbursementChecked", e.target.checked)
                  }
                  checked={item.isReimbursementChecked}
                />
                <label className={styles.checkboxDanger}>
                  Solicitar ressarcimento
                </label>
              </div>
            </div>
            <FileAttachment label="Anexo da NF de Referência" backgroundColor="white" />
            <h3 className={styles.tituloA}>Anexos de Imagens</h3>
            {[
              "1. Foto do lado onde está a gravação IMA:",
              "2. Foto da parte danificada/amassada-quebrada:",
              "3. Foto marcações suspeitas na peça:",
              "4. Foto da peça completa:",
              "5. Outras fotos pertinentes:",
            ].map((label, idx) => (
              <FileAttachment key={idx} label={label} backgroundColor="white" />
            ))}
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
