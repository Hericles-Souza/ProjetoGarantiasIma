/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
  GarantiasItemStatusEnum2,
  GarantiasStatusEnum2,
} from "@shared/enums/GarantiasStatusEnum";
import { GarantiasModel } from "@shared/models/GarantiasModel";
import api from "@shared/Interceptors";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";
import environment from "@env/environment";

// Funções para formatação do RGI
// const formatMainRgi = (rgi: string): string => {
//   const cleanRgi = rgi.split('.')[0];
//   return `${cleanRgi}`;
// };

const formatItemRgi = (rgi: string, letter: string, sequence: number) => {
  return `${letter}.${sequence}`;
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
}

const FileAttachment: React.FC<FileAttachmentProps> = ({
  label,
  backgroundColor,
  garantiaItemId,
  initialFileData,
  isRessarcimento,
  onFileSelect,
}) => {
  // Estado que guarda os dados do arquivo (ID e nome)
  const [fileData, setFileData] = useState<FileData | null>(
    initialFileData || null
  );
  // Estado para armazenar o nome do arquivo selecionado
  const [, setFileName] = useState<string | null>(
    initialFileData ? initialFileData.fileName : null
  );
  const authContext = useContext(AuthContext);

  useEffect(() => {
    setFileData(initialFileData || null);
    setFileName(initialFileData ? initialFileData.fileName : null);
  }, [initialFileData]);

  // Função para capturar o nome do arquivo assim que ele for selecionado
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setFileName(file.name);
      if (onFileSelect) {
        onFileSelect(file);
      }
    }
  };

  // Função que realiza o upload do arquivo para o backend
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      // Define temporariamente o estado com o nome do arquivo
      setFileData({ id: "", fileName: file.name });

      const endpoint = environment.apiUrl + "/files/upload-private-file-item";
      const match = label.match(/^\d+/);
      const fileData = new FormData();
      fileData.append("file", file);
      fileData.append("itemId", garantiaItemId);
      console.log("match: " + match);
      if (match) {
        if (isRessarcimento) fileData.append("field", `${match[0]}.res`);
        else fileData.append("field", `${match[0]}.img`);
      } else fileData.append("field", "nfRef");

      fileData.forEach((item, key) => {
        console.log(key + ": " + item);
      });

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
          // Mesmo que o backend não retorne o fileName, usa-se o file.name
          const uploadedFileData: FileData = {
            id: garantiaItemId,
            fileName: file.name,
          };
          setFileData(uploadedFileData);
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

  // Função para remover o arquivo da interface (opcionalmente você pode chamar um endpoint para remover o arquivo no backend)
  const handleRemoveFile = () => {
    setFileData(null);
    setFileName(null);
  };

  return (
    <div className={styles.fileAttachmentContainer} style={{ backgroundColor }}>
      <span className={styles.labelAnexo}>{label}</span>
      <div className={styles.fileUpdateContent}>
        {fileData ? (
          // Se já houver arquivo (upload concluído), exibe o nome e os botões de download e remoção
          <span className={styles.fileName}>
            <FileOutlined style={{ color: "red", paddingLeft: "5px" }} />{" "}
            {fileData.fileName}
            <Button
              type="link"
              onClick={handleRemoveFile}
              icon={<DeleteOutlined />}
              title="Remover arquivo"
            />
          </span>
        ) : (
          // Se nenhum arquivo foi selecionado, exibe o botão para selecionar
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
  isVisible,
  toggleVisibility,
  showDeleteConfirm,
  children,
  status,
  rgi,
}: {
  title: string;
  isVisible: boolean;
  toggleVisibility: () => void;
  showDeleteConfirm: () => void;
  children: React.ReactNode;
  status: string;
  rgi: string;
}) => (
  <div>
    <div className={styles.tituloSecaoContainer}>
      <h3 className={styles.tituloSecaoVermelho}>
        {rgi}{" "}
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
  const { id: guaranteeId } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

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
  const [loading, setLoading] = useState<boolean>(true); // Para controlar o carregamento

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rgiLetter = (location.state as any)?.rgiLetter || "A";

  const handleInputChange = (itemId: string, field: string, value: any) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  // Função para excluir a garantia
  const handleDeleteGuarantee = async () => {
    Modal.confirm({
      title: "Confirmar Exclusão",
      content: "Você tem certeza de que deseja excluir esta garantia?",
      okText: "Excluir",
      cancelText: "Cancelar",
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
          console.log("Dados recebidos via state:", data);
        }
        if (data && location.state) {
          console.log("Anexos da garantia:", data.anexos);
          setGarantia(data);
          const transformedItems = data.itens.map((item) => ({
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
            rgi: item.rgi,
          }));
          setItems(transformedItems);
          if (transformedItems.length > 0) {
            setVisibleSectionId(transformedItems[0].id);
          }
        }
      } catch (error) {
        console.error("Error loading garantia data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadGarantiaData();
  }, [location.state, guaranteeId, rgiLetter]);

  const addNewItem = () => {
    const newItemId = crypto.randomUUID();
    const sequence = garantia.itens.length + 1;
    const newItemRgi = garantia
      ? formatItemRgi(garantia.rgi, rgiLetter, sequence)
      : "";
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
    garantia.itens.push({
      id: newItemId,
      codigoPeca: "",
      loteItem: "",
      status: "Autorizado",
      tipoDefeito: "",
      modeloVeiculoAplicado: "",
      torqueAplicado: 0,
      solicitarRessarcimento: false,
      anexos: "",
      rgi: newItemRgi,
      codigoItem: formatItemRgi(
        garantia?.rgi || "",
        rgiLetter,
        garantia.itens.length + 1
      ),
      nfReferencia: garantia.nf,
      loteItemOficial: "",
      codigoStatus: GarantiasItemStatusEnum2.NAO_ANALISADO,
    });
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
    console.log("salvamento: " + garantia);
    if (!garantia?.id) {
      message.error("ID da garantia não encontrado");
      return;
    }
    const itemId = garantia?.itens?.[0]?.id;
    if (!itemId) {
      message.error("ID do item não encontrado");
      return;
    }
    const payload = {
      codigoItem: items[0].codigoPeca,
      tipoDefeito: items[0].tipoDefeito,
      modeloVeiculoAplicado: items[0].modeloVeiculo,
      torqueAplicado: Number(items[0].torquePeca) || 0,
      nfReferencia: items[0].anoVeiculo,
      loteItemOficial: items[0].lotePeca,
      loteItem: items[0].lotePeca,
      codigoStatus:
        items[0].status === "Autorizado"
          ? GarantiasStatusEnum2.NAO_ENVIADO
          : GarantiasStatusEnum2.EM_ANALISE,
      solicitarRessarcimento: items[0].isReimbursementChecked ? 1 : 0,
    };
    console.log("payload:", payload);
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
    <div className={styles.containerApp} style={{ backgroundColor: "#ffffff" }}>
      <div className={styles.ContainerButtonBack}>
        <Button
          type="link"
          className={styles.ButtonBack}
          onClick={() =>
            navigate(`/garantias/rgi/${guaranteeId}`, {
              state: {
                garantia: garantia,
                item: garantia?.nf,
              },
            })
          }
        >
          <LeftOutlined /> VOLTAR PARA INFORMAÇÕES DO RGI
        </Button>
        <span className={styles.RgiCode}>
          RGI {garantia?.rgi} / NF {garantia?.nf || "----"}
        </span>
      </div>
      <div className={styles.ContainerHeader}>
        <h1 className={styles.tituloRgi}>RGI {garantia?.rgi}</h1>
        <div className={styles.botoesCabecalho}>
          <Button
            type="default"
            className={styles.ButtonDelete}
            onClick={handleDeleteGuarantee}
          >
            EXCLUIR
          </Button>
          <Button type="primary" className={styles.ButonToSend} onClick={send}>
            SALVAR
          </Button>
        </div>
      </div>
      <hr className={styles.divisor} />
      <FileAttachment
        label="Anexo da NF de venda"
        backgroundColor="#f5f5f5"
        garantiaItemId={""}
        isRessarcimento={false}
        initialFileData={
          garantia?.anexos
            ? { id: garantia.anexos, fileName: garantia.anexos }
            : undefined
        }
      />
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
          Caso a peça não possua um lote, o campo Lote da peça deve ser
          preenchido com “Não contém”
        </span>
      </div>
      {garantia.itens.map((item, index) => {
        return (
          <div className={styles.containerInformacoes} key={item.id}>
            <CollapsibleSection
              title={`${item.rgi}.${index + 1}`}
              isVisible={visibleSectionId === item.id}
              toggleVisibility={() => toggleSectionVisibility(item.id)}
              showDeleteConfirm={() => showDeleteConfirm(item.id)}
              status={item.status}
              rgi={item.codigoItem}
            >
              <h3 className={styles.tituloSecao}>Informações Gerais</h3>
              <div className={styles.inputsContainer}>
                <div className={styles.inputsConjun}>
                  <div className={styles.inputGroup} style={{ flex: 0.5 }}>
                    <OutlinedInputWithLabel
                      label="Código da peça"
                      fullWidth
                      value={item.codigoItem}
                      onChange={(e) =>
                        handleInputChange(item.id, "codigoPeca", e.target.value)
                      }
                    />
                  </div>
                  <div className={styles.inputGroup} style={{ flex: 0.5 }}>
                    <OutlinedInputWithLabel
                      label="Lote da peça"
                      fullWidth
                      value={item.loteItem}
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
                        { value: "defeito1", label: "Opção 1" },
                        { value: "defeito2", label: "Opção 2" },
                        { value: "defeito3", label: "Opção 3" },
                      ]}
                      value={item.tipoDefeito}
                      onChange={(e) =>
                        handleInputChange(
                          item.id,
                          "tipoDefeito",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className={styles.inputGroup} style={{ flex: 1 }}>
                    <OutlinedInputWithLabel
                      label="Modelo do veículo que aplicou"
                      fullWidth
                      value={item.modeloVeiculoAplicado}
                      onChange={(e) =>
                        handleInputChange(
                          item.id,
                          "modeloVeiculo",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className={styles.inputGroup} style={{ flex: 0.3 }}>
                    <OutlinedInputWithLabel
                      label="Ano do veículo"
                      fullWidth
                      value={item.modeloVeiculoAplicado}
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
                      value={item.torqueAplicado.toString()}
                      onChange={(e) =>
                        handleInputChange(item.id, "torquePeca", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className={styles.checkboxContainer}>
                  <ColorCheckboxes
                    onChange={(e) => {
                      handleInputChange(
                        item.id,
                        "isReimbursementChecked",
                        e.target.checked
                      );
                      item.solicitarRessarcimento = e.target.checked;
                    }}
                    checked={item.solicitarRessarcimento}
                  />
                  <label className={styles.checkboxDanger}>
                    Solicitar ressarcimento
                  </label>
                </div>
              </div>
              {!item.solicitarRessarcimento && (
                <div className={styles.contentReimbursement}>
                  <h3 className={styles.tituloA}>
                    Anexo de dados adicionais para ressarcimento
                  </h3>
                  {[
                    "1. Documento de identificação (RG ou CNH):",
                    "2. Documentação do veículo:",
                    "3. NF do guincho:",
                    "4. NF de outras despesa/produtos pertinentes:",
                  ].map((itemInside) => (
                    <FileAttachment
                      label={itemInside}
                      garantiaItemId={item.id}
                      isRessarcimento={true}
                      backgroundColor="#f5f5f5"
                    />
                  ))}
                </div>
              )}
              <FileAttachment
                label="Anexo da NF de Referência"
                garantiaItemId={item.id}
                isRessarcimento={false}
                backgroundColor="white"
              />
              <h3 className={styles.tituloA}>Anexos de Imagens</h3>
              {[
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
                />
              ))}
            </CollapsibleSection>
          </div>
        );
      })}
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
