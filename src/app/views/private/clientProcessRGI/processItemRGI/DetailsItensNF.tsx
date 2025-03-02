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
  GarantiasItemStatusEnum,
  GarantiasItemStatusEnum2,
  GarantiasStatusEnum2,
} from "@shared/enums/GarantiasStatusEnum";
import { GarantiaItem, GarantiasModel } from "@shared/models/GarantiasModel";
import api from "@shared/Interceptors";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";
import environment from "@env/environment";
import { updateGarantiasHeaderByIdAsync } from "@shared/services/GarantiasService";

// Funções para formatação do RGI
// const formatMainRgi = (rgi: string): string => {
//   const cleanRgi = rgi.split('.')[0];s
//   return `${cleanRgi}`;
// };

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

      if (label.includes("devolução")) fileData.append("field", "nfDev");
      else if (match) {
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
  title,
  isEvaluated,
}: {
  title: string;
  isVisible: boolean;
  toggleVisibility: () => void;
  showDeleteConfirm: () => void;
  children: React.ReactNode;
  status: string;
  rgi: string;
  isEvaluated: boolean;
}) => {
  return <div>
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
        {isEvaluated && (
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
};

const DetailsItensNF: React.FC = () => {
  const { id: guaranteeId } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [items, setItems] = useState<GarantiaItem[]>([]);
  const [visibleSectionId, setVisibleSectionId] = useState<string | null>(null);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [recRgiLetter, setRecRgiLetter] = useState("false");
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [garantia, setGarantia] = useState<GarantiasModel>();
  const [loading, setLoading] = useState<boolean>(true); // Para controlar o carregamento
  const context = useContext(AuthContext);

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
          const actualNf = location.state.currentNf;
          setRecRgiLetter(actualNf.nf.split(".")[1]);
          console.log("garantia: ", JSON.stringify(garantia?.codigoStatus));

        }
        if (data && location.state) {
          console.log("Anexos da garantia:", data.anexos);
          setGarantia(data);
          const transformedItems = data.itens.map((item) => ({
            id: item.id,
            title: item.codigoItem || "",
            codigoPeca: item.codigoPeca || "",
            lotePeca: item.loteItem || "",
            status: item.codigoStatus ? item.codigoStatus.toString() : "",
            tipoDefeito: item.tipoDefeito || "",
            modeloVeiculo: item.modeloVeiculoAplicado || "",
            anoVeiculo: item.nfReferencia || "",
            torquePeca: item.torqueAplicado?.toString() || "",
            isReimbursementChecked: item.solicitarRessarcimento === false,
            anexos: item.anexos || "",
            rgi: item.rgi,
            codigoItem: item.codigoItem,
            codigoStatus: item.codigoStatus 
          }));
          console.log("garantia: ", JSON.stringify(garantia?.codigoStatus));

          setItems(data.itens);
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
    const sequence = items.length + 1;
    const newItemRgi = garantia
      ? formatItemRgi(location.state.currentNf.nf, sequence)
      : "";
    console.log("newItemRgi: " + newItemRgi);
    setItems([
      ...items,
      {
        id: newItemId,
        codigoPeca: "",
        loteItem: "",
        status: GarantiasItemStatusEnum.NAO_ANALISADO,
        tipoDefeito: "",
        modeloVeiculoAplicado: "",
        torqueAplicado: 0,
        solicitarRessarcimento: false,
        anexos: "",
        rgi: newItemRgi,
        codigoItem: newItemRgi,
        nfReferencia: "",
        loteItemOficial: "",
        codigoStatus: GarantiasItemStatusEnum2.NAO_ANALISADO
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

  const saveNfDevolcao = async () => {
    console.log("salvamento: " + garantia);
    if (!garantia?.id) {
      message.error("ID da garantia não encontrado");
      return;
    }

    const now = new Date();
    const currentDate = now.toLocaleDateString();
    try {
      const garantiaModel: GarantiasModel = {
        id: location.state.garantia.id,
        email: context.user.email,
        razaoSocial: garantia.razaoSocial,
        createdAt: context.user.createdAt,
        dataAtualizacao: currentDate,
        data: currentDate,
        updatedAt: context.user.updatedAt || currentDate,
        usuarioAtualizacao: context.user.fullname,
        usuarioInsercao: context.user.fullname,
        telefone: context.user.phone,
        codigoStatus: GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO
      };
      console.log("garantiayupldasd: " + JSON.stringify(garantiaModel));
      updateGarantiasHeaderByIdAsync(garantiaModel)
        .then((value) => console.log(value))
        .catch((error) => console.error("Erro ao atualizar dados:", error));
    } catch (error) {
      console.error("Erro ao atualizar a garantia:", error);
      message.error("Erro ao atualizar a garantia.");
    }
  };

  const save = async () => {
    let error: boolean = false;
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

    const responseGetItens = await api.get(
      `/garantias/item/by-garantia/${garantia.id}`
    );
    const garantiaItensAPI = responseGetItens.data.data as GarantiaItem[];
    console.log("garantiaItensAPI: ", garantiaItensAPI);
    

    items.filter((value) => value.codigoItem?.split(".")[1] === recRgiLetter).forEach(async (item, index) => {
      console.log("itemsequal: ", item);
      try {
        if (
          garantiaItensAPI.filter((value) => value.codigoItem == item.codigoItem).length > 0
        ) {
          const paylaodPut = {
            codigoItem: item.codigoItem,
            tipoDefeito: item.tipoDefeito,
            modeloVeiculoAplicado: item.modeloVeiculoAplicado,
            torqueAplicado: Number(item.torqueAplicado) || 0,
            nfReferencia: garantia.nf,
            codigoPeca: item.codigoPeca,
            loteItemOficial: item.loteItem,
            loteItem: item.loteItem,
            codigoStatus: GarantiasItemStatusEnum2.NAO_ANALISADO,
            solicitarRessarcimento: item.solicitarRessarcimento ? 1 : 0,
          };
          console.log("paylaodPut: ", JSON.stringify(paylaodPut));

          const responsePut = await api.put(
            `/garantias/garantiasItem/${item.id}/UpdateItem`,
            paylaodPut
          );
          if (responsePut.status === 200 || responsePut.status === 201 ) {
            message.success("Garantia atualizada com sucesso!");
          } else {
            message.error("Erro ao atualizar a garantia.");
            error = true;
          }
        } else {
          const paylaodPost = {
            garantiaId: garantia.id,
            codigoItem: item.codigoItem,
            tipoDefeito: item.tipoDefeito,
            modeloVeiculoAplicado: item.modeloVeiculoAplicado,
            torqueAplicado: item.torqueAplicado,
            nfReferencia: garantia.nf,
            codigoPeca: item.codigoPeca,
            loteItemOficial: item.loteItem,
            loteItem: item.loteItem,
            codigoStatus: GarantiasItemStatusEnum2.NAO_ANALISADO,
            solicitarRessarcimento: item.solicitarRessarcimento ? 1 : 0,
            index: index.toString(),
          };
          console.log("paylaodPost: ", JSON.stringify(paylaodPost));
          const endpoint = environment.apiUrl + "/garantias/item/create";

          const responsePost = await api.post(endpoint, paylaodPost);

          if (responsePost.status === 200 || responsePost.status === 201 ) {
            message.success("Garantia atualizada com sucesso!");
            
          } else {
            message.error("Erro ao atualizar a garantia.");
            error = true
          }
        } 
      } catch (error) {
        console.error("Erro ao atualizar a garantia:", error);
        message.error("Erro ao atualizar a garantia.");
      } finally {
        if(!error)
          navigate(`/garantias/rgi/${garantia.id}`, {
            state: {
              garantiaData: garantia,
              item: garantia?.nf,
            },
          });
      }
    });
  };

  if (loading && !garantia) {
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
              state: {
                garantiaData: garantia,
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
          {garantia.codigoStatus !=
            GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO &&
            context.user.rule.name == "cliente" && (
              <>
                <Button
                  type="default"
                  className={styles.ButtonDelete}
                  onClick={handleDeleteGuarantee}
                >
                  EXCLUIR
                </Button>
                <Button
                  type="primary"
                  className={styles.ButonToSend}
                  onClick={save}
                >
                  SALVAR
                </Button>
              </>
            )}
          {garantia.codigoStatus ==
            GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO &&
            context.user.rule.name != "cliente" && (
              <div className="ButtonHeader">
                <Button type="default" className="ButtonDelete">
                  Visualizar Pré Nota
                </Button>
                <Button type="primary" className="ButonToSend" onClick={saveNfDevolcao}>
                  Enviar
                </Button>
              </div>
            )}

          {garantia.codigoStatus ==
            GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO &&
            context.user.rule.name != "cliente" && (
              <>
                <Button
                  type="default"
                  className={styles.ButtonDelete}
                  onClick={handleDeleteGuarantee}
                >
                  Visualizar Pré Nota
                </Button>
                <Button
                  type="primary"
                  className={styles.ButonToSend}
                  onClick={save}
                >
                  Enviar
                </Button>
              </>
            )}
        </div>
      </div>
      <hr className={styles.divisor} />
      {garantia?.codigoStatus != GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO &&
        context.user.rule.name == "cliente" && (
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
        )}
      <div className={styles.TitleItens}>
        <h3 className={styles.nfsTitle}>
          Itens desta NF associados a esta garantia
        </h3>
        {garantia?.codigoStatus !=
          GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO &&
          context.user.rule.name == "cliente" && (
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
      {garantia?.codigoStatus != GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO &&
        context.user.rule.name == "cliente" && (
          <div className={styles.dialoginfo}>
            <InfoCircleOutlined style={{ color: "#0277BD" }} />
            <span style={{ color: "#0277BD" }}>
              Caso a peça não possua um lote, o campo Lote da peça deve ser
              preenchido com “Não contém”
            </span>
          </div>
        )}
      {items.filter((value) => value.codigoItem?.split(".")[1] === recRgiLetter).map((item) => {
        return (
          <div className={styles.containerInformacoes} key={item.id}>
            <CollapsibleSection
              title={item.codigoItem}
              isVisible={visibleSectionId === item.id}
              toggleVisibility={() => toggleSectionVisibility(item.id)}
              showDeleteConfirm={() => showDeleteConfirm(item.id)}
              status={item.status}
              rgi={item.rgi}
              isEvaluated={
                garantia?.codigoStatus ==
                  GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO &&
                context.user.rule.name == "cliente"
                  ? false
                  : true
              }
            >
              { garantia?.codigoStatus ==
                  GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO &&
                context.user.rule.name == "cliente" && (
                  <FileAttachment
                label="Anexo da NF de devolução"
                backgroundColor="white"
                garantiaItemId={item.id}
                isRessarcimento={false}
                initialFileData={
                  garantia?.anexos
                    ? { id: garantia.anexos, fileName: garantia.anexos }
                    : undefined
                }
              />
                )}
              
              <h3 className={styles.tituloSecao}>Informações Gerais</h3>
              <div className={styles.inputsContainer}>
                <div className={styles.inputsConjun}>
                  <div className={styles.inputGroup} style={{ flex: 0.5 }}>
                    <OutlinedInputWithLabel
                      disabled={
                        garantia?.codigoStatus !=
                          GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO &&
                        context.user.rule.name == "cliente"
                          ? false
                          : true
                      }
                      label="Código da peça"
                      fullWidth
                      value={item.codigoPeca}
                      onChange={(e) => {
                        item.codigoPeca = e.target.value;
                        handleInputChange(
                          item.id,
                          "codigoPeca",
                          e.target.value
                        );
                        console.log("codigoPeca: " + e.target.value);
                      }}
                    />
                  </div>
                  <div className={styles.inputGroup} style={{ flex: 0.5 }}>
                    <OutlinedInputWithLabel
                      disabled={
                        garantia?.codigoStatus !=
                          GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO &&
                        context.user.rule.name == "cliente"
                          ? false
                          : true
                      }
                      label="Lote da peça"
                      fullWidth
                      value={item.loteItem}
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
                        garantia?.codigoStatus !=
                          GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO &&
                        context.user.rule.name == "cliente"
                          ? false
                          : true
                      }
                      label="Possível defeito"
                      fullWidth
                      options={[
                        { value: "defeito1", label: "Opção 1" },
                        { value: "defeito2", label: "Opção 2" },
                        { value: "defeito3", label: "Opção 3" },
                      ]}
                      value={item.tipoDefeito}
                      onChange={(e) => {
                        item.tipoDefeito = e.target.value;
                        handleInputChange(
                          item.id,
                          "tipoDefeito",
                          e.target.value
                        );
                      }}
                    />
                  </div>
                  <div className={styles.inputGroup} style={{ flex: 1 }}>
                    <OutlinedInputWithLabel
                      disabled={
                        garantia?.codigoStatus !=
                          GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO &&
                        context.user.rule.name == "cliente"
                          ? false
                          : true
                      }
                      label="Modelo do veículo que aplicou"
                      fullWidth
                      value={item.modeloVeiculoAplicado}
                      onChange={(e) => {
                        item.modeloVeiculoAplicado = e.target.value;
                        handleInputChange(
                          item.id,
                          "modeloVeiculoAplicado",
                          e.target.value
                        );
                      }}
                    />
                  </div>
                  <div className={styles.inputGroup} style={{ flex: 0.3 }}>
                    <OutlinedInputWithLabel
                      disabled={
                        garantia?.codigoStatus !=
                          GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO &&
                        context.user.rule.name == "cliente"
                          ? false
                          : true
                      }
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
                      disabled={
                        garantia?.codigoStatus !=
                          GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO &&
                        context.user.rule.name == "cliente"
                          ? false
                          : true
                      }
                      type="number"
                      label="Torque aplicado à peça"
                      fullWidth
                      value={item.torqueAplicado?.toString() || ""}
                      onChange={(e) => {
                        item.torqueAplicado = Number(e.target.value);
                        handleInputChange(
                          item.id,
                          "torqueAplicado",
                          e.target.value
                        );
                      }}
                    />
                  </div>
                </div>

                {garantia?.codigoStatus !=
                  GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO &&
                  context.user.rule.name == "cliente" && (
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
                  )}
              </div>
              {item.solicitarRessarcimento &&
                garantia?.codigoStatus !=
                  GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO &&
                context.user.rule.name == "cliente" && (
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
              {garantia?.codigoStatus !=
                GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO &&
                context.user.rule.name == "cliente" && (
                  <FileAttachment
                    label="Anexo da NF de Referência"
                    garantiaItemId={item.id}
                    isRessarcimento={false}
                    backgroundColor="white"
                  />
                )}

              {garantia?.codigoStatus !=
                GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO &&
                context.user.rule.name == "cliente" && (
                  <h3 className={styles.tituloA}>Anexos de Imagens</h3>
                )}

              {garantia?.codigoStatus !=
                GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO &&
                context.user.rule.name == "cliente" &&
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
