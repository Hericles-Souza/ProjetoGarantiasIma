/* eslint-disable @typescript-eslint/no-unused-vars */
import { useContext, useEffect, useRef, useState } from "react";
import { Button, message, Spin } from "antd";
import {
  DownOutlined,
  LeftOutlined,
  FileOutlined,
  RightOutlined,
} from "@ant-design/icons";
import styles from "./ScreenDetailsItensTradeAgreement.module.css";
import OutlinedInputWithLabel from "@shared/components/input-outlined-with-label/OutlinedInputWithLabel";
import { useLocation, useNavigate, useParams } from "react-router-dom";
// import { AuthContext } from "@shared/contexts/Auth/AuthContext";
import { getItemsByNfAsync } from "@shared/services/AcordoComercialService";
import { NfItem } from "@shared/models/AcordoComercialModel";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";
import { UserRoleEnum } from "@shared/enums/UserRoleEnum";
import OutlinedSelectWithLabel from "@shared/components/select/OutlinedSelectWithLabel";
import ColorCheckboxes from "@shared/components/checkBox/checkBox";
import MultilineTextFields from "@shared/components/multline/multLine";
import Quill from "quill";
import api from "@shared/Interceptors";
import { updateGarantiaItemByIdAsync } from "@shared/services/GarantiasService";
import { UpdateItemRequest } from "@shared/models/GarantiasModel";
import {
  GarantiasItemStatusEnum,
  GarantiasItemStatusEnum2,
} from "@shared/enums/GarantiasStatusEnum";
// import { GarantiasModel } from "@shared/models/GarantiasModel";
// Componente QuillEditor
interface QuillEditorProps {
  editorRef: React.RefObject<HTMLDivElement>;
  setEditorContent: (value: string) => void;
}

const QuillEditor: React.FC<QuillEditorProps> = ({
  editorRef,
  setEditorContent,
}) => {
  const quillInstance = useRef<Quill | null>(null);

  useEffect(() => {
    if (editorRef.current && !quillInstance.current) {
      quillInstance.current = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["blockquote", "code-block"],
            [{ align: [] }],
            [{ color: [] }, { background: [] }],
            ["image", "video", "link"],
            ["clean"],
          ],
        },
      });

      quillInstance.current.on("text-change", () => {
        const content = quillInstance.current?.root.innerHTML || "";
        setEditorContent(content);
      });
    }

    return () => {
      if (quillInstance.current) {
        quillInstance.current = null;
      }
    };
  }, [editorRef, setEditorContent]);

  return <div ref={editorRef} style={{ height: "300px" }} />;
};

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
            style={{ display: "none", borderColor: "red" }}
            onChange={handleFileChange}
          />
          Visualizar
        </label>
        <label className={styles.buttonUpdateNfSale}>
          <input
            type="file"
            style={{ backgroundColor: "red", display: "none" }}
            onChange={handleFileChange}
          />
          Baixar Arquivo
        </label>
      </div>
    </div>
  );
};

const CollapsibleSection = ({
  title,
  isVisible,
  toggleVisibility,
  children,
}: {
  title: string;
  isVisible: boolean;
  toggleVisibility: () => void;
  children: React.ReactNode;
}) => (
  <div>
    <div className={styles.tituloSecaoContainer}>
      <h3 className={styles.tituloSecaoVermelho}>{title}</h3>
      <Button
        type="text"
        icon={isVisible ? <DownOutlined /> : <RightOutlined />}
        onClick={toggleVisibility}
        className={styles.toggleButton}
      />
    </div>
    {isVisible && <div className={styles.hiddenContent}>{children}</div>}
  </div>
);

const ScreenDetailsItensTradeAgreement: React.FC = () => {
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [envioAutorizado, setEnvioAutorizado] = useState("");
  const [conclusao, setConclusao] = useState("");
  const context = useContext(AuthContext);
  const [items, setItems] = useState<NfItem[]>();
  // const [cardData, setCardData] = useState<GarantiasModel>();
  const { id } = useParams<{ id: string }>();
  // const context = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorContent, setEditorContent] = useState("");
  const [isReimbursementChecked, setIsReimbursementChecked] = useState(false);

  const fetchUserData = async () => {
    try {
      if (location.state) {
        await getItemsByNfAsync(location.state.nf.nf).then((value) => {
          console.log("data: " + JSON.stringify(value.data));
          setItems(value.data);
        });
      }
      return;
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [location.state]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsReimbursementChecked(e.target.checked);
  };

  const [visibleSections, setVisibleSections] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleContentVisibility = (itemId: string) => {
    console.log("item Id: " + itemId);
    setVisibleSections((prevState) => ({
      ...prevState,
      [itemId]: !prevState[itemId],
    }));
  };

  const handleSave = async () => {
    items.map(async (item, index) => {
      const dataToSend = {
        ItemId: item.id,
        analiseTecnica: item.analiseTecnica,
        conclusao: item.conclusao,
      };
      console.log("aqui: " + JSON.stringify(item.id));
      try {
        const response = await api.put(
          `/garantias/analisetecnica/`,
          dataToSend
        );

        const updateRequest: UpdateItemRequest = {
          garantiaId: item.garantia_id,
          codigoItem: item.codigoItem,
          tipoDefeito: item.tipoDefeito,
          modeloVeiculoAplicado: item.modeloVeiculoAplicado,
          torqueAplicado: item.torqueAplicado,
          nfReferencia: item.nfReferencia,
          loteItemOficial: item.loteItemOficial,
          loteItem: item.loteItem,
          codigoStatus: item.codigoStatus,
          solicitarRessarcimento: item.solicitarRessarcimento == true ? 1 : 0,
          index: index.toString(),
        };

        console.log("data to send: " + JSON.stringify(updateRequest));
        const ressponseItem = await updateGarantiaItemByIdAsync(
          item.id,
          updateRequest
        );

        if (response.status === 200 && ressponseItem.status === 200) {
          // Handle success (pode ser uma mensagem de sucesso, redirecionamento, etc)
          message.success("Dados salvos com sucesso!");
          navigate(`/garantias/acordo-commercial`);
          
        } else {
          // Handle error
          message.error("Falha ao salvar os dados.");
        }
      } catch (error) {
        console.error("Erro ao tentar salvar:", error);
        message.error("Erro ao tentar salvar.");
      }
    });
  };

  if (loading || !items) {
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
          onClick={() => navigate(`/garantias/rgi/${id}`)}
        >
          <LeftOutlined /> VOLTAR PARA INFORMAÇÕES DA ACI
        </Button>
        <span className={styles.RgiCode}>
          RGI N° {location.state.cardData.rgi} / NF {items[0].nfReferencia}
        </span>
      </div>

      <div className={styles.ContainerHeader}>
        <h1 className={styles.tituloRgi}>{location.state.cardData.rgi}</h1>
        <div className={styles.botoesCabecalho}>
          {context.user.rule.name != UserRoleEnum.Técnico && (
            <Button
              type="default"
              className={styles.ButtonDelete}
              onClick={() => navigate("/view-pre-invoice")}
            >
              Visualizar Pré-Nota
            </Button>
          )}

          <Button type="default" className={styles.ButtonDelete}>
            Excluir
          </Button>
          <Button
            type="primary"
            className={styles.ButonToSend}
            onClick={handleSave}
          >
            Salvar
          </Button>
        </div>
      </div>
      <hr className={styles.divisor} />

      <div className={styles.TitleItens}>
        <h3 className={styles.nfsTitle}>
          Itens desta NF associados a esta garantia
        </h3>
      </div>
      {/* <div className={styles.dialoginfo}>
        <InfoCircleOutlined style={{ color: "#0277BD" }} />
        <span style={{ color: "#0277BD" }}>
          Caso a peça não possua um lote, o campo Lote da peça deve ser preenchido com “Não contém”
        </span>
      </div> */}

      {items.map((item) => {
        return (
          <div className={styles.containerInformacoes}>
            <CollapsibleSection
              title={item.codigoItem}
              isVisible={visibleSections[item.id]}
              toggleVisibility={() => toggleContentVisibility(item.id)}
            >
              {/* Anexo da NF de venda (visível apenas para não supervisores) */}
              {context.user.rule.name !== UserRoleEnum.Supervisor && (
                <div style={{ marginTop: "20px" }}>
                  <FileAttachment
                    label="Anexo da NF de venda"
                    backgroundColor="white"
                  />
                </div>
              )}

              <h3 className={styles.tituloSecao}>Informações Gerais</h3>

              <div className={styles.inputsContainer}>
                <div className={styles.inputsConjun}>
                  <div className={styles.inputGroup} style={{ flex: 0.5 }}>
                    <OutlinedInputWithLabel
                      label="Código da peça"
                      value={item.codigoItem}
                      fullWidth
                      disabled
                    />
                  </div>
                  <div className={styles.inputGroup} style={{ flex: 0.5 }}>
                    <OutlinedInputWithLabel
                      label="Lote da peça"
                      value={item.loteItem}
                      fullWidth
                      disabled
                    />
                  </div>
                </div>

                <div className={styles.inputsConjun}>
                  <div className={styles.inputGroup} style={{ flex: 0.4 }}>
                    <OutlinedSelectWithLabel
                      label="Possível defeito"
                      disabled
                      fullWidth
                      options={[
                        { value: "Opção 1", label: "Opção 1" },
                        { value: "Opção 2", label: "Opção 2" },
                        { value: "Opção 3", label: "Opção 3" },
                      ]}
                      defaultValue={undefined}
                    />
                  </div>
                  <div className={styles.inputGroup} style={{ flex: 1 }}>
                    <OutlinedInputWithLabel
                      label="Modelo do veículo que aplicou"
                      fullWidth
                      disabled
                      value={item.modeloVeiculoAplicado}
                    />
                  </div>
                  <div className={styles.inputGroup} style={{ flex: 0.3 }}>
                    <OutlinedInputWithLabel
                      label="Ano do veículo"
                      disabled
                      value={item.modeloVeiculoAplicado}
                      fullWidth
                    />
                  </div>
                </div>
                <div className={styles.inputsConjun}>
                  <div className={styles.inputGroup} style={{ flex: 1 }}>
                    <OutlinedInputWithLabel
                      label="Torque aplicado à peça"
                      value={item.torqueAplicado.toString()}
                      fullWidth
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Anexo da NF de Referência (visível para todos) */}
              <FileAttachment
                label="Anexo da NF de Referência"
                backgroundColor="white"
              />

              {/* Anexos de Imagens (visível apenas para não supervisores) */}
              {context.user.rule.name !== UserRoleEnum.Supervisor && (
                <>
                  <h3 className={styles.tituloA}>Anexos de Imagens</h3>
                  {[
                    "1. Foto do lado onde está a gravação IMA:",
                    "2. Foto da parte danificada/amassada/quebrada:",
                    "3. Foto marcações suspeitas na peça:",
                    "4. Foto da peça completa:",
                    "5. Outras fotos pertinentes:",
                  ].map((item, index) => (
                    <FileAttachment
                      key={index}
                      label={item}
                      backgroundColor="white"
                    />
                  ))}

                  <hr className={styles.divisor} />
                  <div className={styles.containerSelect}>
                    <OutlinedSelectWithLabel
                      label="Envio Autorizado"
                      options={[
                        { value: "Procedente", label: "Procedente" },
                        { value: "Improcedente", label: "Improcedente" },
                      ]}
                      value={envioAutorizado}
                      onChange={(e) => {
                        item.status =
                          envioAutorizado == "Procedente"
                            ? GarantiasItemStatusEnum.AUTORIZADO
                            : GarantiasItemStatusEnum.NAO_AUTORIZADO;
                        item.codigoStatus =
                          envioAutorizado == "Procedente"
                            ? GarantiasItemStatusEnum2.AUTORIZADO
                            : GarantiasItemStatusEnum2.NAO_AUTORIZADO;
                        setEnvioAutorizado(e.target.value);
                      }}
                    />
                  </div>

                  <h3 className={styles.tituloA}>Análise Técnica Visual</h3>
                  <QuillEditor
                    editorRef={editorRef}
                    setEditorContent={setEditorContent}
                  />

                  <h3 className={styles.tituloA}>Conclusão</h3>
                  <MultilineTextFields
                    value={item.conclusao}
                    onChange={(e) => setConclusao(e.target.value)}
                    label="Conclusão"
                    placeholder="Digite a conclusão aqui..."
                  />
                </>
              )}
            </CollapsibleSection>
          </div>
        );
      })}
    </div>
  );
};

export default ScreenDetailsItensTradeAgreement;
