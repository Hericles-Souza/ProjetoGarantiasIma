import { useContext, useEffect, useState } from "react";
import { Button, message, Modal } from "antd";
import {
  DownOutlined,
  DeleteOutlined,
  LeftOutlined,
  RightOutlined,
  FileOutlined,
} from "@ant-design/icons";
import styles from "./ScreenDetailsItensTradeAgreement.module.css";
import OutlinedInputWithLabel from "@shared/components/input-outlined-with-label/OutlinedInputWithLabel";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AcordoComercialItem,
  AcordoComercialModel,
  UpdateItemResponse,
} from "@shared/models/AcordoComercialModel";
import {
  AcordoComercialItemStatusEnum2,
  AcordoComercialStatusEnum2,
  AcordoItemStatusEnum,
  converterStatusAcordoItem,
  statusStylesACI,
} from "@shared/enums/AcordoComercialStatusEnum";
import {
  getAcordoByIdAsync,
  updateAciHeaderByIdAsync,
  updateAciItemByIdAsync,
} from "@shared/services/AcordoComercialService";
import environment from "@env/environment";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";
import { UserRoleEnum } from "@shared/enums/UserRoleEnum";

interface FileAttachmentProps {
  label: string;
  backgroundColor: string;
  item: AcordoComercialItem;
  acordo: AcordoComercialModel | undefined;
  SetAcordo: React.Dispatch<
    React.SetStateAction<AcordoComercialModel | undefined>
  >;
}

const FileAttachment: React.FC<FileAttachmentProps> = ({
  label,
  backgroundColor,
  item,
  acordo,
  SetAcordo,
}) => {
  const context = useContext(AuthContext);
  const [recFile, setRecFile] = useState<{
    fileNameWithExtension: string;
    imagemUrl: string;
  }>({ fileNameWithExtension: "", imagemUrl: "" });
  const [hasFileError, setHasFileError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    if (item.id && !hasFileError) {
      const fieldFile: string = "nfDev";
      getFieldFile(item.id, fieldFile, controller.signal);
    }

    return () => controller.abort();
  }, [item.id, hasFileError]);

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

  const getFieldFile = async (
    itemId: string,
    field: string,
    signal?: AbortSignal
  ) => {
    try {
      const urlGetFile =
        environment.apiUrl +
        `/files/files/download-private-file-item/${itemId}/${field}`;

      const response = await fetch(urlGetFile, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${context.user.token}`,
        },
        signal,
      });

      if (response.ok) {
        const blob = await response.blob();
        const fileExtension = getFileExtensionFromBlob(blob);
        const fileNameWithExtension = field + fileExtension;
        const imagemUrl = URL.createObjectURL(blob);

        setRecFile({ fileNameWithExtension, imagemUrl });
        setHasFileError(false);
      } else if (response.status === 404) {
        setRecFile({ fileNameWithExtension: "", imagemUrl: "" });
        setHasFileError(true);
      } else {
        setRecFile({ fileNameWithExtension: "", imagemUrl: "" });
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.log("erro: ", error);
      }
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const endpoint = environment.apiUrl + "/files/upload-private-file-item";
      const fileData = new FormData();
      fileData.append("file", file);
      fileData.append("itemId", item.id);
      fileData.append("field", "nfDev");

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
          const blob: Blob = file;
          const imagemUrl = URL.createObjectURL(blob);
          setRecFile({
            fileNameWithExtension: file.name,
            imagemUrl,
          });
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
    }
  };

  const handleRemoveFile = async () => {
    try {
      const endpoint = `${environment.apiUrl}/files/files/delete-private-file-item/${item.id}/nfDev`;
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${context.user.token}`,
        },
      });

      if (response.ok) {
        setRecFile({ fileNameWithExtension: "", imagemUrl: "" });
        message.success("Arquivo deletado com sucesso!");
      } else {
        message.error("Erro ao deletar arquivo.");
      }
    } catch (error) {
      console.log("Erro ao deletar arquivo: ", error);
      message.error("Ocorreu um erro ao deletar o arquivo.");
    }
  };

  const handleSaveClient = async (refused: boolean) => {
    const itemUpdate: UpdateItemResponse = {
      codigoItem: item.codigoItem,
      codigoPeca: item.codigoPeca,
      precoUnitario: item.precoUnitario,
      quantidade: item.quantidade,
      codigoStatus: refused
        ? AcordoComercialItemStatusEnum2.NAO_AUTORIZADO
        : AcordoComercialItemStatusEnum2.AUTORIZADO,
      valorTotalItem: item.valorTotalItem,
      tipoOperacao: item.tipoOperacao,
      baseICMS: item.baseICMS,
      valorICMS: item.valorICMS,
      valorIPI: item.valorIPI,
      ICMS: item.ICMS,
      IPI: item.IPI,
      mva: item.mva,
      nf: item.nf,
      usuarioAtualizacao: context.user.fullname,
    };

    const response = await updateAciItemByIdAsync(itemUpdate, item.id);

    if (response.status === 200 || response.status === 201) {
      item.codigoStatus = refused
        ? AcordoComercialItemStatusEnum2.NAO_AUTORIZADO
        : AcordoComercialItemStatusEnum2.AUTORIZADO;

      SetAcordo((prev) => {
        if (!prev?.itens) return prev;

        const updatedItens = prev.itens.map((prevItem) =>
          prevItem.id === item.id
            ? { ...prevItem, codigoStatus: item.codigoStatus }
            : prevItem
        );

        return {
          ...prev,
          itens: [...updatedItens],
          updatedAt: new Date().toISOString(),
        };
      });

      console.log("item salvo com sucesso: ", response);
    } else {
      console.log("item com erro ao salvar: ", itemUpdate);
    }
  };

  const canRemoveAttachment =
    (item.codigoStatus === AcordoComercialItemStatusEnum2.NAO_ENVIADO ||
      item.codigoStatus === AcordoComercialItemStatusEnum2.NAO_AUTORIZADO) &&
    recFile?.fileNameWithExtension &&
    recFile?.imagemUrl &&
    context.user.rule.name !== UserRoleEnum.Supervisor;

  return (
    <div className={styles.fileAttachmentContainer} style={{ backgroundColor }}>
      <span className={styles.labelAnexo}>{label}</span>
      <div className={styles.fileUpdateContent}>
        {recFile?.fileNameWithExtension === "" &&
          recFile?.imagemUrl === "" &&
          item.codigoStatus !== AcordoComercialItemStatusEnum2.NAO_ENVIADO && (
            <label
              className={styles.buttonUpdateNfSale}
              style={{ cursor: "default", opacity: 0.6 }}
            >
              Nenhum arquivo enviado
            </label>
          )}
        {recFile?.fileNameWithExtension &&
          recFile?.imagemUrl &&
          item.codigoStatus !==
            AcordoComercialItemStatusEnum2.NAO_AUTORIZADO && (
            <div className={styles.fileActions}>
              <span className={styles.fileName}>
                <FileOutlined
                  style={{
                    color: "red",
                    marginRight: "5px",
                    marginLeft: "5px",
                  }}
                />
                {recFile.fileNameWithExtension}
                {canRemoveAttachment && (
                  <Button
                    type="link"
                    onClick={handleRemoveFile}
                    className={styles.deleteButton}
                    icon={<DeleteOutlined />}
                    title="Remover arquivo"
                  />
                )}
              </span>
              <Button
                type="link"
                onClick={handleDownloadFile}
                className={styles.buttonUpdateNfSale}
              >
                Baixar Arquivo
              </Button>
            </div>
          )}
        {recFile?.fileNameWithExtension &&
          recFile?.imagemUrl &&
          acordo?.codigoStatus ===
            AcordoComercialStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO &&
          item.codigoStatus !== AcordoComercialItemStatusEnum2.AUTORIZADO &&
          context.user.rule.name === UserRoleEnum.Supervisor && (
            <div className="ButtonHeader">
              <div style={{ display: "flex", gap: "10px" }}>
                <Button
                  onClick={() => handleSaveClient(true)}
                  type="primary"
                  className={styles.ButonToSend}
                >
                  Recusar NF de Devolução
                </Button>
                <Button
                  type="primary"
                  className={styles.ButonToSend}
                  onClick={() => handleSaveClient(false)}
                >
                  Autorizar
                </Button>
              </div>
            </div>
          )}
        {recFile?.fileNameWithExtension === "" &&
          recFile?.imagemUrl === "" &&
          (item.codigoStatus === AcordoComercialItemStatusEnum2.NAO_ENVIADO ||
            item.codigoStatus ===
              AcordoComercialItemStatusEnum2.NAO_AUTORIZADO) &&
          context.user.rule.name !== UserRoleEnum.Supervisor && (
            <label className={styles.buttonUpdateNfSale}>
              <input
                type="file"
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
              Adicionar Anexo
            </label>
          )}
        {recFile?.fileNameWithExtension === "" &&
          recFile?.imagemUrl === "" &&
          item.codigoStatus === AcordoComercialItemStatusEnum2.NAO_AUTORIZADO &&
          context.user.rule.name !== UserRoleEnum.Supervisor &&
          acordo?.codigoStatus ===
            AcordoComercialStatusEnum2.NF_DEVOLUCAO_RECUSADA && (
            <label className={styles.buttonUpdateNfSale}>
              <input
                type="file"
                style={{ display: "none" }}
                onChange={handleFileUpload}
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
}: {
  title: string;
  isVisible: boolean;
  toggleVisibility: () => void;
  showDeleteConfirm: () => void;
  children: React.ReactNode;
  status: AcordoComercialItemStatusEnum2;
}) => {
  const statusStyle = statusStylesACI[status];
  const context = useContext(AuthContext);
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
            {converterStatusAcordoItem(status)}
          </div>
        </div>
        <div className={styles.iconAndArrow}>
          {status === AcordoComercialItemStatusEnum2.NAO_ENVIADO &&
            context.user.rule.name === UserRoleEnum.Cliente && (
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

const ScreenDetailsItensTradeAgreement: React.FC = () => {
  const [visibleSectionId, setVisibleSectionId] = useState<string | null>();
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const navigate = useNavigate();
  const [nf, SetNf] = useState<string>();
  const [acordo, SetAcordo] = useState<AcordoComercialModel>();
  const location = useLocation();
  const context = useContext(AuthContext);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleInputChange = (itemId: string, field: string, value: any) => {
    SetAcordo((prevNotaFiscal) => {
      if (prevNotaFiscal) {
        return {
          ...prevNotaFiscal,
          itens: prevNotaFiscal.itens.map((item) =>
            item.id === itemId ? { ...item, [field]: value } : item
          ),
        };
      }
    });
  };

  const setAcordoByGet = async (id: string, nfParam: string) => {
    const response = await getAcordoByIdAsync(id);
    if (response.status === 200 || response.status === 201) {
      const recAcordoResponse = (await response.data
        .data) as AcordoComercialModel;
      const itensFiltrados = recAcordoResponse.itens.filter((item) => {
        const [itemBase] = item.codigoItem.split(".");
        const [nfBase, nfLetra] = nfParam.split(".");

        const matchesBase = itemBase === nfBase;
        const matchesLetra = nfLetra === nfLetra;

        return matchesBase && matchesLetra;
      });
      recAcordoResponse.itens = itensFiltrados;
      SetAcordo(recAcordoResponse);
    } else {
      console.log("Erro ao buscar ACI");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (location.state) {
        const nfLocal = location.state.nf;
        SetNf(location.state.nf);

        if (nfLocal !== "") {
          await setAcordoByGet(location.state.acordo.id, nfLocal);
        }
      }
    };

    fetchData();
  }, [location.state]);

  const handleSaveClient = async () => {
    if (!acordo) return;

    try {
      const itensParaAtualizar = acordo.itens.filter(
        (value) =>
          value.codigoStatus === AcordoComercialItemStatusEnum2.NAO_ENVIADO ||
          value.codigoStatus === AcordoComercialItemStatusEnum2.NAO_AUTORIZADO
      );

      for (const item of itensParaAtualizar) {
        const itemUpdate: UpdateItemResponse = {
          codigoItem: item.codigoItem,
          codigoPeca: item.codigoPeca,
          precoUnitario: item.precoUnitario,
          quantidade: item.quantidade,
          codigoStatus: item.codigoStatus, // Mantém o status atual
          valorTotalItem: item.valorTotalItem,
          tipoOperacao: item.tipoOperacao,
          baseICMS: item.baseICMS,
          valorICMS: item.valorICMS,
          valorIPI: item.valorIPI,
          ICMS: item.ICMS,
          IPI: item.IPI,
          mva: item.mva,
          nf: item.nf,
          usuarioAtualizacao: context.user.fullname,
        };

        const response = await updateAciItemByIdAsync(itemUpdate, item.id);

        if (response.status === 200 || response.status === 201) {
          SetAcordo((prev) => {
            if (!prev) return prev;

            return {
              ...prev,
              itens: prev.itens.map((prevItem) =>
                prevItem.id === item.id
                  ? {
                      ...prevItem,
                      codigoPeca: item.codigoPeca,
                      quantidade: item.quantidade,
                    }
                  : prevItem
              ),
              updatedAt: new Date().toISOString(),
            };
          });

          console.log("Item salvo com sucesso: ", item.codigoItem);
        } else {
          console.log("Erro ao salvar item: ", item.codigoItem);
        }
      }
      navigate(`/garantias/aci/${acordo?.id}`, {
        state: { item: acordo },
      });
      message.success("Itens atualizados com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar itens:", error);
      message.error("Ocorreu um erro ao salvar os itens");
    }
  };

  const addNewItem = async () => {
    const response = await getAcordoByIdAsync(acordo?.id);

    const recAcordo = (await response.data.data) as AcordoComercialModel;

    const sequence = acordo?.itens.length + 1;
    const newItemCode = nf + "." + sequence;
    const newItemId = crypto.randomUUID();
    const newItem: AcordoComercialItem = {
      id: newItemId,
      codigoItem: newItemCode,
      codigoPeca: "",
      precoUnitario: 0,
      quantidade: 0,
      codigoStatus: AcordoComercialItemStatusEnum2.NAO_ENVIADO,
      status: AcordoItemStatusEnum.NAO_ENVIADO,
      valorTotalItem: 0,
      tipoOperacao: "CIF",
      baseICMS: 0,
      valorICMS: 0,
      valorIPI: 0,
      ICMS: 0,
      IPI: 0,
      mva: 0,
      nf: nf,
    };

    recAcordo?.itens.push(newItem);

    SetAcordo((prev) => {
      return {
        ...prev,
        itens: [...prev.itens, newItem],
      };
    });

    const payloadAcordoPut: AcordoComercialModel = {
      usuarioAtualizacao: recAcordo.usuarioInsercao,
      razaoSocial: recAcordo.razaoSocial,
      telefone: recAcordo.telefone,
      email: recAcordo.email,
      codigoStatus: recAcordo.codigoStatus,
      observacao: recAcordo.observacao,
      baseICMS: 0,
      ICMS: 0,
      valorIPI: 0,
      ICMSSubstituicao: 0,
      itens: recAcordo.itens,
    };

    await updateAciHeaderByIdAsync(payloadAcordoPut, recAcordo.id);
  };

  const handleDeleteItem = (itemId: string) => {
    SetAcordo((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        itens: prev.itens.filter((item) => item.id !== itemId),
      };
    });
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
          onClick={() =>
            navigate(`/garantias/aci/${acordo?.id}`, {
              state: { item: acordo },
            })
          }
        >
          <LeftOutlined /> VOLTAR PARA INFORMAÇÕES DA ACI
        </Button>
        <span className={styles.RgiCode}>
          ACI N° {acordo?.cdAci} / NF {nf}
        </span>
      </div>
      <div className={styles.ContainerHeader}>
        <h1 className={styles.tituloRgi}>{"NF " + nf}</h1>

        {context.user.rule.name === UserRoleEnum.Cliente &&
          acordo?.itens.some(
            (item) =>
              item.codigoStatus ===
                AcordoComercialItemStatusEnum2.NAO_ENVIADO ||
              (item.codigoStatus ===
                AcordoComercialItemStatusEnum2.NAO_AUTORIZADO &&
                acordo.codigoStatus ===
                  AcordoComercialStatusEnum2.NF_DEVOLUCAO_RECUSADA)
          ) &&
          acordo?.codigoStatus !== AcordoComercialStatusEnum2.CONFIRMADA && (
            <div className={styles.botoesCabecalho}>
              <Button
                type="default"
                className={styles.ButtonDelete}
                onClick={() =>
                  navigate("/view-pre-invoice", {
                    state: { acordo },
                  })
                }
              >
                Visualizar Pré-Nota
              </Button>
              <Button
                type="primary"
                className={styles.ButonToSend}
                onClick={handleSaveClient}
              >
                Salvar
              </Button>
            </div>
          )}
      </div>

      <hr className={styles.divisor} />

      <div className={styles.TitleItens}>
        <h3 className={styles.nfsTitle}>
          Itens desta NF associados a este acordo
        </h3>
        {context.user.rule.name === UserRoleEnum.Cliente &&
          acordo?.itens.some(
            (item) =>
              item.codigoStatus === AcordoComercialItemStatusEnum2.NAO_ENVIADO
          ) && (
            <Button
              className={styles.buttonRed}
              style={{
                backgroundColor: "red",
                borderRadius: "10px",
                height: "45px",
                padding: "0px 25px",
                fontSize: "16px",
                outline: "none",
              }}
              type="primary"
              onClick={addNewItem}
            >
              Adicionar Peça
            </Button>
          )}
      </div>

      {acordo?.itens.map((item) => (
        <div className={styles.containerInformacoes} key={item.id}>
          <CollapsibleSection
            title={item.codigoItem}
            isVisible={visibleSectionId === item.id}
            toggleVisibility={() => toggleSectionVisibility(item.id)}
            showDeleteConfirm={() => showDeleteConfirm(item.id)}
            status={item.codigoStatus}
          >
            <h3 className={styles.tituloSecao}>Informações Gerais</h3>

            <div className={styles.inputsContainer}>
              <div className={styles.inputsConjun}>
                <div className={styles.inputGroup} style={{ flex: 0.5 }}>
                  <OutlinedInputWithLabel
                    label="Código da peça *"
                    fullWidth
                    value={item?.codigoPeca}
                    onChange={(e) => {
                      handleInputChange(item.id, "codigoPeca", e.target.value);
                    }}
                    disabled={
                      item?.codigoStatus !==
                        AcordoComercialItemStatusEnum2.NAO_ENVIADO ||
                      context.user.rule.name === UserRoleEnum.Supervisor
                    }
                  />
                </div>
                <div className={styles.inputGroup} style={{ flex: 0.5 }}>
                  <OutlinedInputWithLabel
                    label="Quantidade *"
                    fullWidth
                    value={item?.quantidade.toString()}
                    onChange={(e) => {
                      handleInputChange(item.id, "quantidade", e.target.value);
                      item.quantidade = Number(e.target.value);
                    }}
                    disabled={
                      item?.codigoStatus !==
                        AcordoComercialItemStatusEnum2.NAO_ENVIADO ||
                      context.user.rule.name === UserRoleEnum.Supervisor
                    }
                  />
                </div>
              </div>
            </div>
          </CollapsibleSection>
          <div style={{ height: "10px" }}></div>
          <FileAttachment
            label="Anexo da NF de devolução"
            backgroundColor="#ffffff"
            item={item}
            acordo={acordo}
            SetAcordo={SetAcordo}
          />
        </div>
      ))}

      <Modal
        open={modalDeleteOpen}
        title="Confirmar Exclusão"
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

export default ScreenDetailsItensTradeAgreement;
