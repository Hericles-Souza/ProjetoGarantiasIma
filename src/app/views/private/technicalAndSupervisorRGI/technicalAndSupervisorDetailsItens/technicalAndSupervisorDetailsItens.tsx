/* eslint-disable @typescript-eslint/no-unused-vars */
import { useContext, useEffect, useRef, useState } from "react";
import { Button, message, Spin } from "antd";
import {
  DownOutlined,
  LeftOutlined,
  FileOutlined,
  RightOutlined,
} from "@ant-design/icons";
import styles from "./TechnicalAndSupervisorDetailsItens.module.css";
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
import api from "@shared/Interceptors";
import { updateGarantiaItemByIdAsync } from "@shared/services/GarantiasService";
import {
  GarantiasModel,
  UpdateItemRequest,
} from "@shared/models/GarantiasModel";
import {
  GarantiasItemStatusEnum,
  GarantiasItemStatusEnum2,
  GarantiasStatusEnum,
  GarantiasStatusEnum2,
} from "@shared/enums/GarantiasStatusEnum";
import pako from "pako";
import { ConfigContext } from "antd/es/config-provider";
import environment from "@env/environment.ts";

const FileAttachment = ({
  label,
  backgroundColor,
  itemId,
}: {
  label: string;
  backgroundColor?: string;
  itemId: string;
}) => {
  const [imagemUrl, setImagemUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const context = useContext(AuthContext);

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
      // Adicione outros tipos MIME conforme necessário
    };

    return mimeTypes[mimeType] || ""; // Retorna a extensão ou uma string vazia se não encontrado
  }

  function getFileExtensionFromBlob(blob: Blob): string {
    const mimeType = blob.type; // Pega o tipo MIME do Blob
    const extension = getExtensionFromMimeType(mimeType);
    return extension;
  }

  const fetchImagem = async (itemId: string, field: string) => {
    try {
      let field: string;
      const match = label.match(/^\d+/);
      console.log("label: " + label);

      if (!match && label.includes("venda")) field = "nfVenda";
      else if (!match && label.includes("Referência")) field = "nfRef";
      else if (!match && label.includes("devolução")) field = "nfDev";
      else {
        if (label.includes("Referência")) field = `${match[0]}.res`;
        else field = `${match[0]}.img`;
      }

      console.log("field: " + field);
      const urlGetFile =
        environment.apiUrl +
        `/files/files/download-private-file-item/${itemId}/${field}`;
      console.log(urlGetFile);

      const response = await fetch(urlGetFile, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${context.user.token}`, // Token de autenticação
        },
      }).then((value) => {
        console.log("response: " + JSON.stringify(value.body));
        return value;
      });
      const blob = await response.blob();
      const fileExtension = getFileExtensionFromBlob(blob);
      const labelWithoutSpace = label.replace(/\s+/g, "");
      const fileNameWithExtension = field.replace(".", "_") + fileExtension;
      const imagemUrl = URL.createObjectURL(blob);
      console.log(fileNameWithExtension);
      setImagemUrl(imagemUrl);
      // handleDownload(fileNameWithExtension);
      handleDownload(fileNameWithExtension, imagemUrl);

      // if (response.ok) {
      //   // Receber a imagem em formato binário (blob)
      //   console.log(JSON.stringify(response));
      //   const blob = await response.blob();
      //   // const file = new File([blob], fileName, { type: blob.type });
      //   // const extension = fileName.split('.').pop();
      //   // Gerar URL para a imagem
      //   const imagemUrl = URL.createObjectURL(blob);
      //   const fileExtension = getFileExtensionFromBlob(blob);
      //   const labelWithoutSpace = label.replace(/\s+/g, '');
      //   const fileNameWithExtension = labelWithoutSpace + fileExtension;
      //   setImagemUrl(imagemUrl);
      //   // handleDownload(fileNameWithExtension);
      // } else {
      //   console.error("Erro ao buscar a imagem", response.statusText);
      // }
    } catch (error) {
      console.error("Erro na requisição", error);
    }
  };

  const handleDownload = async (fileName: string, imageUrl: string) => {
    // Criar um link temporário e disparar o download
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = fileName; // Defina o nome do arquivo que será baixado
    link.click(); // Dispara o download
  };

  return (
    <div className={styles.fileAttachmentContainer} style={{ backgroundColor }}>
      <span className={styles.labelAnexo}>{label}</span>
      <div className={styles.fileUpdateContent}>
        <label className={styles.buttonUpdateNfSale}>
          <button
            style={{ backgroundColor: "red", display: "none" }}
            onClick={() => fetchImagem(itemId, label)}
          />
          Baixar Arquivo
        </label>
      </div>
      {/* {loading ? <p>Carregando...</p> : <img src={image} alt="Imagem carregada" />} */}
    </div>
  );
};

const CollapsibleSection = ({
  title,
  isVisible,
  toggleVisibility,
  children,
  handleConfirm,
  statusGarantia,
}: {
  title: string;
  isVisible: boolean;
  toggleVisibility: () => void;
  children: React.ReactNode;
  handleConfirm: () => void;
  statusGarantia: number;
}) => {
  const context = useContext(AuthContext);
  return (
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
};

const TechnicalAndSupervisorDetailsItens: React.FC = () => {
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [envioAutorizado, setEnvioAutorizado] = useState("");
  const [conclusao, setConclusao] = useState("");
  const context = useContext(AuthContext);
  const [items, setItems] = useState<NfItem[]>();
  const [cardData, setCardData] = useState<GarantiasModel>();
  const { id } = useParams<{ id: string }>();
  // const context = useContext(AuthContext);
  const [recRgiLetter, setRecRgiLetter] = useState("");
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorContent, setEditorContent] = useState("");
  const [isReimbursementChecked, setIsReimbursementChecked] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (location.state) {
          await getItemsByNfAsync(location.state.nf.nf).then((value) => {
            console.log("data: " + JSON.stringify(value.data));
            value.data.forEach((item) => {
              if (item.tipoDefeito == null) item.tipoDefeito = "defeito1";
            });
            setItems(value.data);
          });
          setCardData(location.state.garantia);
          setRecRgiLetter(location.state.nf.split(".")[1]);
          console.log("recRgiLetter: ", location.state.nf);
          console.log(
            "location.state.garantia: " +
              JSON.stringify(location.state.garantia)
          );
          // console.log("cardDAta " + JSON.stringify(cardData));
        }
        return;
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [cardData, location.state]);

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

  const handleConfirm = async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

    const garantia: GarantiasModel = {
      razaoSocial: location.state.garantia.razaoSocial,
      telefone: location.state.garantia.telefone,
      email: context.user.email,
      nf: cardData.nf,
      fornecedor: context.user.fullname,
      codigoStatus: GarantiasStatusEnum2.CONFIRMADO,
      observacao: "teste",
      usuarioAtualizacao: context.user.username,
      status: GarantiasStatusEnum.CONFIRMADO,
      dataAtualizacao: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`,
    };

    const responseHeader = await api.put(
      `/garantias/garantiasHeader/${location.state.garantia.id}/UpdateHeader`,
      garantia
    );

    if (responseHeader.status === 200) {
      message.success("Gaantia confirmada com sucesso");
    }
  };

  const handleSave = async () => {
    console.log("itens: ", cardData.itens);
    cardData.itens
      .filter((value) => value.codigoItem?.split(".")[1] === recRgiLetter)
      .map(async (item, index) => {
        const dataToSend = {
          ItemId: item.id,
          conclusao: item.conclusao,
          status: item.status,
          tipoDefeitoOficial: item.tipoDefeito,
        };
        console.log("aqui: " + JSON.stringify(dataToSend));
        try {
          const response = await api.put(
            `/garantias/analisetecnica/`,
            dataToSend
          );

          if (response.status === 200) {
            message.success("Dados salvos com sucesso!");
          } else {
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
          onClick={() =>
            navigate(`/garantias/technical-and-supervisor/${cardData.id}`, {
              state: { item: cardData.itens[0], garantia: cardData },
            })
          }
        >
          <LeftOutlined /> VOLTAR PARA INFORMAÇÕES DA RGI
        </Button>
        <span className={styles.RgiCode}>
          RGI N° {location.state.garantia.itens[0]?.rgi} / NF{" "}
          {location.state.garantia.itens[0].nfReferencia}
        </span>
      </div>

      <div className={styles.ContainerHeader}>
        <h1 className={styles.tituloRgi}>
          {location.state.garantia.itens[0].rgi}
        </h1>
        <div className={styles.botoesCabecalho}>
          {cardData.codigoStatus == GarantiasStatusEnum2.EM_ANALISE && (
            <>
              <Button
                type="default"
                className={styles.ButtonDelete}
                onClick={() =>
                  navigate("/view-pre-invoice", {
                    state: { cardData },
                  })
                }
              >
                Visualizar Pré-Nota
              </Button>
              <Button
                type="primary"
                className={styles.ButonToSend}
                onClick={handleSave}
              >
                Salvar
              </Button>
            </>
          )}
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

      {cardData.itens
        .filter((value) => value.codigoItem?.split(".")[1] === recRgiLetter)
        .map((item) => {
          return (
            <div className={styles.containerInformacoes}>
              <CollapsibleSection
                title={item.codigoItem}
                isVisible={visibleSections[item.id]}
                toggleVisibility={() => toggleContentVisibility(item.id)}
                handleConfirm={handleConfirm}
                statusGarantia={cardData.codigoStatus}
              >
                {/* Anexo da NF de venda (visível apenas para não supervisores) */}
                {context.user.rule.name !== UserRoleEnum.Supervisor && (
                  <div style={{ marginTop: "20px" }}>
                    <FileAttachment
                      label="Anexo da NF de venda"
                      backgroundColor="white"
                      itemId={item.id}
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

                <FileAttachment
                  label="Anexo da NF de Referência"
                  backgroundColor="white"
                  itemId={item.id}
                />
                {cardData.codigoStatus === GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO &&
                  context.user.rule.name == UserRoleEnum.Supervisor && (
                <div style={{ marginTop: "20px" }}>
                  <FileAttachment
                    label="Anexo da NF de devolução"
                    backgroundColor="white"
                    itemId={item.id}
                  />
                </div>
                  )}
                {item.solicitarRessarcimento &&
                  context.user.rule.name !== UserRoleEnum.Supervisor && (
                    <div className={styles.contentReimbursement}>
                      <h3 className={styles.tituloA}>
                        Anexo de dados adicionais para ressarcimento
                      </h3>
                      {[
                        "1. Documento de identificação (RG ou CNH):",
                        "2. Documentação do veículo:",
                        "3. NF do guincho:",
                        "4. NF de outras despesa/produtos pertinentes:",
                      ].map((itemRes, index) => (
                        <FileAttachment
                          key={index}
                          label={itemRes}
                          itemId={item.id}
                          backgroundColor="#f5f5f5"
                        />
                      ))}
                    </div>
                  )}

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
                    ].map((itemQuestion, index) => (
                      <FileAttachment
                        key={index}
                        label={itemQuestion}
                        backgroundColor="white"
                        itemId={item.id}
                      />
                    ))}

                    <hr className={styles.divisor} />
                    <div className={styles.containerSelectDefect}>
                      <OutlinedSelectWithLabel
                        label="Possível defeito"
                        options={[
                          {
                            value: "defeito1",
                            label: "Defeito 1",
                          },
                          {
                            value: "defeito2",
                            label: "Defeito 2",
                          },
                        ]}
                        value={item.tipoDefeito}
                        onChange={(e) => {
                          item.tipoDefeito = e.target.value;
                        }}
                      />
                    </div>
                    <div className={styles.containerSelect}>
                      <OutlinedSelectWithLabel
                        label="Envio Autorizado"
                        options={[
                          {
                            value: "Autorizado",
                            label: "Autorizar envio da NF de devolução",
                          },
                          { value: "Improcedente", label: "Improcedente" },
                        ]}
                        value={envioAutorizado}
                        onChange={(e) => {
                          item.status =
                            e.target.value == "Autorizado"
                              ? GarantiasItemStatusEnum.AUTORIZADO
                              : GarantiasItemStatusEnum.NAO_AUTORIZADO;
                          item.codigoStatus =
                            e.target.value == "Autorizado"
                              ? GarantiasItemStatusEnum2.AUTORIZADO
                              : GarantiasItemStatusEnum2.NAO_AUTORIZADO;
                          setEnvioAutorizado(e.target.value);
                        }}
                      />
                    </div>

                    <h3 className={styles.tituloA}>Conclusão</h3>
                    <MultilineTextFields
                      value={item.conclusao}
                      onChange={(e) => {
                        item.conclusao = e.target.value;
                        console.log(item.conclusao);
                        setConclusao(e.target.value);
                      }}
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

export default TechnicalAndSupervisorDetailsItens;
