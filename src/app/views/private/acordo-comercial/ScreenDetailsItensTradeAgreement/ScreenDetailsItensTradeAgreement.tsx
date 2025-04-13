import { useEffect, useState } from "react";
import { Button, Modal } from "antd";
import {
  DownOutlined,
  DeleteOutlined,
  LeftOutlined,
  FileOutlined,
  RightOutlined,
} from "@ant-design/icons";
import styles from "./ScreenDetailsItensTradeAgreement.module.css";
import OutlinedInputWithLabel from "@shared/components/input-outlined-with-label/OutlinedInputWithLabel";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  AcordoComercialItem,
  AcordoComercialModel,
} from "@shared/models/AcordoComercialModel";
import {
  AcordoComercialItemStatusEnum2,
  AcordoItemStatusEnum,
} from "@shared/enums/AcordoComercialStatusEnum";
import {
  getAcordoByIdAsync,
  updateAciHeaderByIdAsync,
} from "@shared/services/AcordoComercialService";

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
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  useEffect(() => {
    if (location.state) {
      SetAcordo(location.state.acordo);
      console.log("acordo: ", acordo);
      SetNf(location.state.nf);
      console.log("nf: ", nf);
    }

    // if(location.state.nf);
    //   console.log(
    //     "123123213123213: ",
    //     location.state.acordo as AcordoComercialModel
    //   );
    //   const acordoOriginal = location.state.acordo as AcordoComercialModel;
    //   const itensFiltrados = acordoOriginal.itens.filter(
    //     (value) => value.nf === nf
    //   );

    //   SetAcordo({
    //     ...acordoOriginal,
    //     itens: itensFiltrados,
    //   });
    //   console.log("acordo: ", acordo);
    //   console.log("nf: ", nf);
  }, [acordo, nf]);

  const addNewItem = async () => {
    const response = await getAcordoByIdAsync(acordo.id);
    console.log("response: ", response);
    
    const recAcordo = await response.data.data as AcordoComercialModel;

    const sequence =
      recAcordo?.itens.filter((value) => value.nf == nf).length + 1;
    const newItemCode = nf + "." + sequence;
    console.log("newItemCode: ", newItemCode);

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
    console.log("payloadAcordoPut: ", payloadAcordoPut)
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
            navigate(`/garantias/aci/${id}`, {
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
        <h1 className={styles.tituloRgi}>{nf}</h1>
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

      {acordo?.itens
        .map((item) => (
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
                    />
                  </div>
                </div>
              </div>
              <FileAttachment
                label="Anexo da NF de devolução"
                backgroundColor="#ffffff"
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
