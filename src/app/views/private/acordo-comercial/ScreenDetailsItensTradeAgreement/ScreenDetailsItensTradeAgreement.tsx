import { useContext, useEffect, useState } from "react";
import { Button, message, Modal } from "antd";
import {
  DownOutlined,
  DeleteOutlined,
  LeftOutlined,
  FileOutlined,
  RightOutlined,
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
} from "@shared/enums/AcordoComercialStatusEnum";
import {
  getAcordoByIdAsync,
  updateAciHeaderByIdAsync,
  updateAciItemByIdAsync,
} from "@shared/services/AcordoComercialService";
import environment from "@env/environment";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";
import { UserRoleEnum } from "@shared/enums/UserRoleEnum";

const FileAttachment = ({
  label,
  backgroundColor,
  itemId,
}: {
  label: string;
  backgroundColor?: string;
  itemId: string;
}) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const context = useContext(AuthContext);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      const endpoint = environment.apiUrl + "/files/upload-private-file-item";
      const fileData = new FormData();
      fileData.append("file", file);
      fileData.append("itemId", itemId);
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
          message.success("Arquivo enviado com sucesso!");
        } else {
          message.error("Erro ao enviar arquivo.");
        }
      } catch (error) {
        console.log("ocorreu um erro ao enviar o arquivo: ", error);
      }
    }
  };

  return (
    <div className={styles.fileAttachmentContainer} style={{ backgroundColor }}>
      <span className={styles.labelAnexo}>{label}</span>
      <div className={styles.fileUpdateContent}>
        {fileName && (
          <span className={styles.fileName}>
            <FileOutlined style={{ color: "red", paddingLeft: "5px" }} />{" "}
            {fileName}
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
          itens: prevNotaFiscal.itens.map(
            (item) =>
              item.id === itemId
                ? { ...item, [field]: value } // Atualiza o campo dinâmico
                : item // Mantém o item intacto se não for o correto
          ),
        };
      }
    });
  };

  const setAcordoByGet = async (id: string, nfParam: string) => {
    const response = await getAcordoByIdAsync(id);
    if (response.status == 200 || response.status == 201) {
      const recAcordoResponse = (await response.data
        .data) as AcordoComercialModel;
      const itensFiltrados = recAcordoResponse.itens.filter((item) => {
        const [itemBase, itemLetra] = item.codigoItem.split(".");
        const [nfBase, nfLetra] = nfParam.split(".");

        const matchesBase = itemBase === nfBase;
        const matchesLetra = itemLetra === nfLetra;

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
    acordo?.itens.forEach(async (item) => {
      const itemUpdate: UpdateItemResponse = {
        codigoItem: item.codigoItem,
        precoUnitario: 0,
        quantidade: item.quantidade,
        codigoStatus: AcordoComercialItemStatusEnum2.NAO_ANALISADO,
        valorTotalItem: 0,
        tipoOperacao: item.tipoOperacao,
        baseICMS: 0,
        valorICMS: 0,
        valorIPI: 0,
        ICMS: 0,
        IPI: 0,
        mva: 0,
        nf: item.nf,
        usuarioAtualizacao: context.user.fullname,
      };

      const response = await updateAciItemByIdAsync(itemUpdate, item.id);

      if (response.status == 200 || response.status == 201) {
        console.log("item salvo com sucesso: ", itemUpdate);
      } else {
        console.log("item com erro ao salvar: ", itemUpdate);
      }
    });
  };

  const addNewItem = async () => {
    const response = await getAcordoByIdAsync(acordo.id);

    const recAcordo = (await response.data.data) as AcordoComercialModel;

    const sequence = acordo?.itens.length + 1;
    const newItemCode = nf + "." + sequence;

    const newItem: AcordoComercialItem = {
      id: "",
      codigoItem: newItemCode,
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      itens: recAcordo.itens,
    };
    console.log("payloadAcordoPut: ", payloadAcordoPut);
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

      {context.user.rule.name == UserRoleEnum.Cliente && 
      acordo?.codigoStatus == AcordoComercialStatusEnum2.NAO_ENVIADO &&  <div className={styles.ContainerHeader}>
      <h1 className={styles.tituloRgi}>{nf}</h1>
      <div className={styles.botoesCabecalho}>
        <Button type="default" className={styles.ButtonDelete}>
          Visualizar Pré-Nota
        </Button>
        <Button type="default" className={styles.ButtonDelete}>
          Excluir
        </Button>
        <Button
          type="primary"
          className={styles.ButonToSend}
          onClick={handleSaveClient}
        >
          Salvar
        </Button>
      </div>
    </div>}
     
      <hr className={styles.divisor} />

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
            fontSize: "16px",
            outline: "none",
          }}
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

      {acordo?.itens.map((item) => (
        <div className={styles.containerInformacoes} key={item.id}>
          <CollapsibleSection
            title={item.codigoItem}
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
                    label="Código da peça *"
                    fullWidth
                    value={item?.codigoItem}
                  />
                </div>
                <div className={styles.inputGroup} style={{ flex: 0.5 }}>
                  <OutlinedInputWithLabel
                    label="Quantidade *"
                    fullWidth
                    value={item?.quantidade.toString()}
                    onChange={(e) => {
                      handleInputChange(
                        item.id,
                        "quantidade",
                        e.target.value
                      );
                      item.quantidade = Number(e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>
            <FileAttachment
              label="Anexo da NF de devolução"
              backgroundColor="#ffffff"
              itemId={item.id}
            />
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

export default ScreenDetailsItensTradeAgreement;
