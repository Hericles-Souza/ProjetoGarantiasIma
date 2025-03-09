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
  StatusColors,
} from "@shared/enums/GarantiasStatusEnum";
import { GarantiaItem, GarantiasModel } from "@shared/models/GarantiasModel";
import api from "@shared/Interceptors";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";
import environment from "@env/environment";
import { updateGarantiasHeaderByIdAsync } from "@shared/services/GarantiasService";

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
  const [fileData, setFileData] = useState<FileData | null>(initialFileData || null);
  const [, setFileName] = useState<string | null>(
    initialFileData ? initialFileData.fileName : null
  );
  const authContext = useContext(AuthContext);

  useEffect(() => {
    setFileData(initialFileData || null);
    setFileName(initialFileData ? initialFileData.fileName : null);
  }, [initialFileData]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setFileName(file.name);
      if (onFileSelect) {
        onFileSelect(file);
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setFileData({ id: "", fileName: file.name });

      const endpoint = environment.apiUrl + "/files/upload-private-file-item";
      const match = label.match(/^\d+/);
      const fileData = new FormData();
      fileData.append("file", file);
      fileData.append("itemId", garantiaItemId);

      if (label.includes("devolução")) fileData.append("field", "nfDev");
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

  const handleDownloadFile = () => {
    const link = document.createElement("a");
    link.href = recSellFile.imagemUrl;
    link.download = recSellFile.fileNameWithExtension;
    link.click();
  };

  const handleRemoveFile = () => {
    setFileData(null);
    setFileName(null);
  };

  const canAddAttachment =
    (recGarantia.codigoStatus === GarantiasStatusEnum2.NAO_ENVIADO ||
      label === "Anexo da NF de devolução") &&
    !fileData &&
    !recSellFile.imagemUrl;

  const canRemoveAttachment =
    (recGarantia.codigoStatus === GarantiasStatusEnum2.NAO_ENVIADO ||
      label === "Anexo da NF de devolução") &&
    (fileData || recSellFile.imagemUrl);

  return (
    <div className={styles.fileAttachmentContainer} style={{ backgroundColor }}>
      <span className={styles.labelAnexo}>{label}</span>
      <div className={styles.fileUpdateContent}>
        {(fileData || recSellFile?.imagemUrl) && (
          <span className={styles.fileName}>
            <FileOutlined style={{ color: "red", paddingLeft: "5px" }} />{" "}
            {fileData?.fileName || recSellFile?.fileNameWithExtension}
            {canRemoveAttachment && (
              <Button
                type="link"
                onClick={handleRemoveFile}
                style={{ outline: "none" }}
                icon={<DeleteOutlined style={{ color: "red", border: "none" }} />}
                title="Remover arquivo"
              />
            )}
          </span>
        )}
        {canAddAttachment && (
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
        {recSellFile?.imagemUrl && (
          <label className={styles.buttonUpdateNfSale}>
            <input
              type="file"
              style={{ display: "none" }}
              onClick={handleDownloadFile}
            />
            Baixar Arquivo
          </label>
        )}

        {recGarantia.codigoStatus === GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO || recGarantia.codigoStatus === GarantiasStatusEnum2.NF_DEVOLUCAO_RECUSADA ? (
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

        ) : recGarantia.codigoStatus === GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO ? (
          <label className={styles.buttonUpdateNfSale}>
            <input
              type="file"
              style={{ display: "none" }}
              onClick={handleDownloadFile}
            />
            Baixar Arquivo
          </label>
        ) : <div />
        }
      </div>
    </div>
  );
};

const CollapsibleSection = ({
  isVisible,
  toggleVisibility,
  showDeleteConfirm,
  children,
  title,
  garantia,
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
}) => {
  return (
    <div>
      <div className={styles.tituloSecaoContainer}>
        <h3 className={styles.tituloSecaoVermelho}>{title}</h3>
        <div className={styles.iconAndArrow}>
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
  const { id: guaranteeId } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [items, setItems] = useState<GarantiaItem[]>([]);
  const [visibleSectionId, setVisibleSectionId] = useState<string | null>(null);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [recRgiLetter, setRecRgiLetter] = useState("A");
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [garantia, setGarantia] = useState<GarantiasModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [recSellFile, setRecSellFile] = useState<{
    fileNameWithExtension: string;
    imagemUrl: string;
  }>({ fileNameWithExtension: "", imagemUrl: "" });
  const context = useContext(AuthContext);

  const rgiLetter = (location.state as any)?.rgiLetter || "A";

  const handleInputChange = (itemId: string, field: string, value: any) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? field === "solicitarRessarcimento"
            ? { ...item, solicitarRessarcimento: value }
            : { ...item, [field]: value }
          : item
      )
    );
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
          const response = await api.delete(`/garantias/garantias/${garantia?.id}`);
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
          data = (location.state as { garantiaData: GarantiasModel }).garantiaData;
          const actualNf = location.state.currentNf || { nf: "N/A" };
          setRecRgiLetter(actualNf.nf.split(".")[1] || "A");
        }
        if (data) {
          setGarantia(data);
          const transformedItems = await getItemsByGarantiaId(data.id);
          setRecSellFile(
            location.state?.sellFile || { fileNameWithExtension: "", imagemUrl: "" }
          );
          setItems(transformedItems || []);
          if (transformedItems?.length > 0) {
            setVisibleSectionId(transformedItems[0].id);
          }
        } else {
          setGarantia({ id: "", codigoStatus: GarantiasStatusEnum2.NAO_ENVIADO });
          setItems([]);
          setRecSellFile({ fileNameWithExtension: "", imagemUrl: "" });
        }
      } catch (error) {
        console.error("Error loading garantia data:", error);
        setGarantia({ id: "", codigoStatus: GarantiasStatusEnum2.NAO_ENVIADO });
        setItems([]);
        setRecSellFile({ fileNameWithExtension: "", imagemUrl: "" });
      } finally {
        setLoading(false);
      }
    };

    loadGarantiaData();
  }, [location.state, guaranteeId]);

  const addNewItem = async () => {
    const newItemId = crypto.randomUUID();
    const sequence = (location.state.countItems = location.state.countItems + 1);
    const newItemRgi = garantia
      ? formatItemRgi(location.state.currentNf.nf, sequence)
      : "";

    const payloadPost = {
      id: newItemId,
      garantiaId: garantia?.id,
      codigoItem: newItemRgi,
      nfReferencia: location.state.nfNumber,
      codigoStatus: GarantiasItemStatusEnum2.NAO_ANALISADO,
    };
    const responsePost = await api.post(
      environment.apiUrl + "/garantias/item/create",
      payloadPost
    );
    if (responsePost.status !== 200 && responsePost.status !== 201) {
      message.error("Erro ao criar a garantia.");
    } else {
      message.success("Item criado com sucesso.");
      setItems([
        ...items,
        {
          id: newItemId,
          codigoPeca: "",
          loteItem: "",
          status: GarantiasItemStatusEnum.NAO_ANALISADO,
          tipoDefeito: "",
          anoVeiculo: "",
          modeloVeiculoAplicado: "",
          torqueAplicado: 0,
          solicitarRessarcimento: false,
          anexos: "",
          rgi: newItemRgi,
          codigoItem: newItemRgi,
          nfReferencia: location.state.nfNumber,
          loteItemOficial: "",
          codigoStatus: GarantiasItemStatusEnum2.NAO_ANALISADO,
        },
      ]);
      if (garantia) {
        garantia.itens.push({
          id: newItemId,
          codigoItem: newItemRgi,
          nfReferencia: location.state.nfNumber,
          codigoStatus: GarantiasItemStatusEnum2.NAO_ANALISADO,
        });
      }
      setVisibleSectionId(newItemId);
    }
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
    if (!garantia?.id) {
      message.error("ID da garantia não encontrado");
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
      };
      await updateGarantiasHeaderByIdAsync(garantiaModel);
      message.success("NF de devolução salva com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar a garantia:", error);
      message.error("Erro ao atualizar a garantia.");
    }
  };

  const getItemsByGarantiaId = async (idGarantia: string): Promise<GarantiaItem[]> => {
    const responseGetItens = await api.get(`/garantias/item/by-garantia/${idGarantia}`);
    return responseGetItens.data.data as GarantiaItem[];
  };

  const save = async () => {
    if (!garantia?.id) {
      message.error("ID da garantia não encontrado");
      return;
    }

    let isError: boolean = false;
    const garantiaItensAPI = await getItemsByGarantiaId(garantia.id);

    for (const item of items.filter(
      (value) => value.codigoItem?.split(".")[1] === recRgiLetter
    )) {
      try {
        if (garantiaItensAPI.some((apiItem) => apiItem.codigoItem === item.codigoItem)) {
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
          if (responsePut.status !== 200 && responsePut.status !== 201) {
            message.error("Erro ao atualizar a garantia.");
            isError = true;
          }
        } else {
          const payloadPost = {
            garantiaId: garantia.id,
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
          };
          const responsePost = await api.post(
            environment.apiUrl + "/garantias/item/create",
            payloadPost
          );
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
              state: { garantiaData: garantia, item: garantia?.nf },
            })
          }
        >
          <LeftOutlined /> VOLTAR PARA INFORMAÇÕES DO RGI
        </Button>
        <span className={styles.RgiCode}>RGI {garantia?.rgi || "N/A"}</span>
      </div>
      <div className={styles.ContainerHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.tituloRgi}>
            NF{" "}
            {(location.state as any)?.currentNf?.nf || "Código da NF não disponível"}
          </h1>
          <div
            style={{
              color: StatusColors[garantia?.codigoStatus] || "#000",
              backgroundColor: `${StatusColors[garantia?.codigoStatus] || "#000"}15`,
            }}
            className={styles.statusTag}
          >
            {garantia?.status || "Status não disponível"}
          </div>
        </div>
        <div className={styles.botoesCabecalho}>
          {garantia.codigoStatus !== GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO &&
            garantia.codigoStatus !== GarantiasStatusEnum2.CONFIRMADO &&
            garantia.codigoStatus !== GarantiasStatusEnum2.EM_ANALISE &&
            context.user.rule.name === "cliente" && (
              <>
                <Button
                  type="default"
                  className={styles.ButtonDelete}
                  onClick={handleDeleteGuarantee}
                >
                  EXCLUIR
                </Button>
                <Button type="primary" className={styles.ButonToSend} onClick={save}>
                  SALVAR
                </Button>
              </>
            )}
          {garantia.codigoStatus === GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO &&
            context.user.rule.name !== "cliente" && (
              <div className="ButtonHeader">
                <Button type="default" className="ButtonDelete">
                  Visualizar Pré Nota
                </Button>
                <Button type="primary" className="ButonToSend" onClick={saveNfDevolcao}>
                  Enviar
                </Button>
              </div>
            )}
          {garantia.codigoStatus === GarantiasStatusEnum2.EM_ANALISE && (
            <p>Esta garantia está em análise. Nenhuma ação disponível no momento.</p>
          )}
        </div>
      </div>
      <hr className={styles.divisor} />
      <FileAttachment
        label="Anexo da NF de venda"
        backgroundColor="#f5f5f5"
        garantiaItemId={""}
        isRessarcimento={false}
        initialFileData={
          garantia?.anexos ? { id: garantia.anexos, fileName: garantia.anexos } : undefined
        }
        recGarantia={garantia}
        recSellFile={recSellFile}
      />
      <div className={styles.TitleItens}>
        <h3 className={styles.nfsTitle}>
          Itens desta NF associados a esta garantia
        </h3>
        {garantia.codigoStatus === GarantiasStatusEnum2.NAO_ENVIADO &&
          context.user.rule.name === "cliente" && (
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
          Caso a peça não possua um lote, o campo Lote da peça deve ser preenchido com “Não contém”
        </span>
      </div>
      {items?.length > 0 && recRgiLetter ? (
        items
          .filter((value) => value.codigoItem?.split(".")[1] === recRgiLetter)
          .map((item) => (
            <div className={styles.containerInformacoes} key={item.id}>
              <CollapsibleSection
                title={item.codigoItem || "Item sem código"}
                isVisible={visibleSectionId === item.id}
                toggleVisibility={() => toggleSectionVisibility(item.id)}
                showDeleteConfirm={() => showDeleteConfirm(item.id)}
                status={item.status}
                rgi={item.rgi || ""}
                isEvaluated={
                  garantia?.codigoStatus === GarantiasStatusEnum2.NAO_ENVIADO &&
                    context.user.rule.name === "cliente"
                    ? false
                    : true
                }
                garantia={garantia}
              >
                <h3 className={styles.tituloSecao}>Informações Gerais</h3>
                <div className={styles.inputsContainer}>
                  <div className={styles.inputsConjun}>
                    <div className={styles.inputGroup} style={{ flex: 0.5 }}>
                      <OutlinedInputWithLabel
                        disabled={
                          garantia?.codigoStatus !== GarantiasStatusEnum2.NAO_ENVIADO
                        }
                        label="Código da peça"
                        fullWidth
                        value={item.codigoPeca || ""}
                        onChange={(e) =>
                          handleInputChange(item.id, "codigoPeca", e.target.value)
                        }
                      />
                    </div>
                    <div className={styles.inputGroup} style={{ flex: 0.5 }}>
                      <OutlinedInputWithLabel
                        disabled={
                          garantia?.codigoStatus !== GarantiasStatusEnum2.NAO_ENVIADO
                        }
                        label="Lote da peça"
                        fullWidth
                        value={item.loteItem || ""}
                        onChange={(e) =>
                          handleInputChange(item.id, "loteItem", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className={styles.inputsConjun}>
                    <div className={styles.inputGroup} style={{ flex: 0.4 }}>
                      <OutlinedSelectWithLabel
                        disabled={
                          garantia?.codigoStatus !== GarantiasStatusEnum2.NAO_ENVIADO
                        }
                        label="Defeito"
                        fullWidth
                        options={[
                          { value: "defeito1", label: "Opção 1" },
                          { value: "defeito2", label: "Opção 2" },
                          { value: "defeito3", label: "Opção 3" },
                        ]}
                        value={item.tipoDefeito || ""}
                        onChange={(e) =>
                          handleInputChange(item.id, "tipoDefeito", e.target.value)
                        }
                      />
                    </div>
                    <div className={styles.inputGroup} style={{ flex: 1 }}>
                      <OutlinedInputWithLabel
                        disabled={
                          garantia?.codigoStatus !== GarantiasStatusEnum2.NAO_ENVIADO
                        }
                        label="Modelo do veículo que aplicou"
                        fullWidth
                        value={item.modeloVeiculoAplicado || ""}
                        onChange={(e) =>
                          handleInputChange(
                            item.id,
                            "modeloVeiculoAplicado",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className={styles.inputGroup} style={{ flex: 0.3 }}>
                      <OutlinedInputWithLabel
                        disabled={
                          garantia?.codigoStatus !== GarantiasStatusEnum2.NAO_ENVIADO
                        }
                        label="Ano do veículo"
                        fullWidth
                        value={item.anoVeiculo || ""}
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
                          garantia?.codigoStatus !== GarantiasStatusEnum2.NAO_ENVIADO
                        }
                        type="number"
                        label="Torque aplicado à peça"
                        fullWidth
                        value={item.torqueAplicado?.toString() || ""}
                        onChange={(e) =>
                          handleInputChange(
                            item.id,
                            "torqueAplicado",
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>
                  </div>
                  {garantia?.codigoStatus === GarantiasStatusEnum2.NAO_ENVIADO && (
                    <div className={styles.checkboxContainer}>
                      <ColorCheckboxes
                        checked={item.solicitarRessarcimento || false}
                        onChange={(e) =>
                          handleInputChange(
                            item.id,
                            "solicitarRessarcimento",
                            e.target.checked
                          )
                        }
                        disabled={
                          garantia?.codigoStatus !== GarantiasStatusEnum2.NAO_ENVIADO
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
                      "3. NF do guincho:",
                      "4. NF de outras despesa/produtos pertinentes:",
                    ].map((itemInside, idx) => (
                      <FileAttachment
                        key={idx}
                        label={itemInside}
                        garantiaItemId={item.id}
                        isRessarcimento={true}
                        backgroundColor="#f5f5f5"
                        recGarantia={garantia}
                        recSellFile={{ fileNameWithExtension: "", imagemUrl: "" }}
                      />
                    ))}
                  </div>
                )}
                {item.solicitarRessarcimento === false &&
                  garantia?.codigoStatus !== GarantiasStatusEnum2.NAO_ENVIADO && (
                    <div className={styles.dialoginfoRessarcimento}>
                      <InfoCircleOutlined style={{ color: "#bd0502" }} />
                      <span style={{ color: "#bd0502" }}>
                        Item Não Possui Ressarcimento.
                      </span>
                    </div>
                  )}
                {context.user.rule.name === "cliente" && (
                  <FileAttachment
                    label="Anexo da NF de Referência"
                    garantiaItemId={item.id}
                    isRessarcimento={false}
                    backgroundColor="white"
                    recGarantia={garantia}
                    recSellFile={{ fileNameWithExtension: "", imagemUrl: "" }}
                  />
                )}
                {context.user.rule.name === "cliente" && (
                  <h3 className={styles.tituloA}>Anexos de Imagens</h3>
                )}
                {context.user.rule.name === "cliente" &&
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
                    />
                  ))}
              </CollapsibleSection>
              {garantia?.codigoStatus ===
                GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO &&
                context.user.rule.name === "cliente" && (
                  <div style={{ marginTop: "15px" }}>
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
                      recGarantia={garantia}
                      recSellFile={{ fileNameWithExtension: "", imagemUrl: "" }}
                    />
                  </div>
                )}
            </div>
          ))
      ) : (
        <p>Nenhum item disponível para esta NF.</p>
      )}
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