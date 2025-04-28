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
import { getItemsByNfAsync } from "@shared/services/AcordoComercialService";
import { NfItem } from "@shared/models/AcordoComercialModel";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";
import { UserRoleEnum } from "@shared/enums/UserRoleEnum";
import OutlinedSelectWithLabel from "@shared/components/select/OutlinedSelectWithLabel";
import ColorCheckboxes from "@shared/components/checkBox/checkBox";
import MultilineTextFields from "@shared/components/multline/multLine";
import api from "@shared/Interceptors";
import { GarantiasModel } from "@shared/models/GarantiasModel";
import {
  GarantiasItemStatusEnum,
  GarantiasItemStatusEnum2,
  GarantiasStatusEnum,
  GarantiasStatusEnum2,
  StatusColors,
} from "@shared/enums/GarantiasStatusEnum";
import environment from "@env/environment.ts";
import { NotaFiscal } from "@shared/models/NotaFiscalModel";
import React from "react";

// Componente FileAttachment (mantido igual)
const FileAttachment = React.memo(
  ({
    label,
    backgroundColor,
    itemId,
    isRessarcimento,
  }: {
    label: string;
    backgroundColor?: string;
    itemId: string;
    isRessarcimento: boolean;
  }) => {
    const [imagemUrl, setImagemUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const context = useContext(AuthContext);
    const [recFile, setRecFile] = useState<{
      fileNameWithExtension: string;
      imagemUrl: string;
    }>();

    useEffect(() => {
      if (itemId) {
        let fieldFile: string = "";
        const matchField = label.match(/^\d+/);

        if (label.includes("devolução")) fieldFile = "nfDev";
        else if (matchField) {
          if (isRessarcimento) fieldFile = `${matchField[0]}.res`;
          else fieldFile = `${matchField[0]}.img`;
        } else fieldFile = "nfRef";

        fetchImagem(itemId, fieldFile);
      }
    }, [itemId, label, isRessarcimento]);

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

    const fetchImagem = async (itemId: string, field: string) => {
      try {
        const urlGetFile =
          environment.apiUrl +
          `/files/files/download-private-file-item/${itemId}/${field}`;

        const response = await fetch(urlGetFile, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${context.user.token}`,
          },
        });

        if (response.ok) {
          const blob = await response.blob();
          const fileExtension = getFileExtensionFromBlob(blob);
          const fieldNameFormatted = field.replace(".", "_");
          const fileNameWithExtension = `${fieldNameFormatted}${fileExtension}`;
          const imagemUrl = URL.createObjectURL(blob);
          setImagemUrl(imagemUrl);
          setRecFile({ fileNameWithExtension, imagemUrl });
        } else {
          setRecFile({ fileNameWithExtension: "", imagemUrl: "" });
        }
      } catch (error) {
        console.error("Erro na requisição", error);
      }
    };

    const handleDownload = async (fileName: string, imageUrl: string) => {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = fileName;
      link.click();
    };

    return (
      <div
        className={styles.fileAttachmentContainer}
        style={{ backgroundColor }}
      >
        <span className={styles.labelAnexo}>{label}</span>
        {recFile?.fileNameWithExtension === "" && recFile?.imagemUrl === "" && (
          <label
            className={styles.buttonUpdateNfSale}
            style={{ cursor: "default", opacity: 0.6 }}
          >
            Nenhum arquivo enviado
          </label>
        )}
        {recFile?.fileNameWithExtension != "" && recFile?.imagemUrl != "" && (
          <div className={styles.fileUpdateContent}>
            <label className={styles.buttonUpdateNfSale}>
              <button
                style={{ backgroundColor: "red", display: "none" }}
                onClick={() =>
                  handleDownload(
                    recFile.fileNameWithExtension,
                    recFile.imagemUrl
                  )
                }
              />
              Baixar Arquivo
            </label>
          </div>
        )}
      </div>
    );
  }
);

// Componente CollapsibleSection (mantido igual)
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
  const [isContentVisible, setIsContentVisible] = useState<{
    [key: string]: boolean;
  }>({});
  const [envioAutorizado, setEnvioAutorizado] = useState("");
  const [conclusao, setConclusao] = useState("");
  const context = useContext(AuthContext);
  const [items, setItems] = useState<NfItem[]>();
  const [cardData, setCardData] = useState<GarantiasModel | null>(null);
  const [notaFiscal, setNotaFiscal] = useState<NotaFiscal>();
  const { id } = useParams<{ id: string }>();
  const [recRgiLetter, setRecRgiLetter] = useState("");
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [isAnalysisConcluded, setIsAnalysisConcluded] = useState(
    location.state?.isAnalysisConcluded || false
  ); // Estado para máscara de análise concluída
  const [displayedStatus, setDisplayedStatus] = useState(""); // New state for front-end mask

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (location.state) {
          const itemsResponse = await getItemsByNfAsync(location.state.nota.id);
          itemsResponse.data.forEach((item) => {
            if (item.tipoDefeito == null) item.tipoDefeito = "";
          });
          setItems(itemsResponse.data);

          const updatedCardData = { ...location.state.garantia };
          setCardData(updatedCardData);
          setNotaFiscal(location.state.nota);
          console.log("nota fiscal received: ", notaFiscal);

          if (
            notaFiscal?.itens.some(
              (item) =>
                item.status == GarantiasItemStatusEnum.NAO_ENVIADO
            )
          ) {
            
            setIsAnalysisConcluded(false);
            setDisplayedStatus("Aguardando Avaliação");
            console.log("entrou 2");
            
          } else {
            setIsAnalysisConcluded(true);
            setDisplayedStatus("Avaliação Concluída");
            console.log("entrou 1");
          }

          setRecRgiLetter(location.state.nf.split(".")[1]);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [location.state, notaFiscal]);

  const toggleContentVisibility = (itemId: string) => {
    setIsContentVisible((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
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
      nf: cardData?.nf || "",
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
      message.success("Garantia confirmada com sucesso");
    }
  };
  const handleSave = async () => {
    if (!cardData?.notas) return;

    const hasInvalidDefect = notaFiscal.itens.some(
      (item) =>
        item.codigoItem?.split(".")[1] === recRgiLetter && !item.tipoDefeito
    );

    if (hasInvalidDefect) {
      message.error("Selecione um defeito antes de salvar.");
      return;
    }

    const promises = notaFiscal.itens.map(async (item) => {
      const dataToSend = {
        ItemId: item.id,
        conclusao: item.conclusao,
        status: item.status,
        tipoDefeitoOficial: item.tipoDefeitoOficial,
      };
      try {
        const response = await api.put(
          `/garantias/analisetecnica/`,
          dataToSend
        );

        console.log("response: ", response);

        if (response.status === 200) {
          message.success("Dados salvos com sucesso!");
          setIsAnalysisConcluded(true); // Atualiza o estado para "Avaliação Concluída"
          setDisplayedStatus("Avaliação Concluída");
        } else {
          message.error("Falha ao salvar os dados.");
        }
      } catch (error) {
        console.error("Erro ao tentar salvar:", error);
        message.error("Erro ao tentar salvar.");
      }
    });
    await Promise.all(promises);
    const notAuthorizeItems = notaFiscal.itens.filter(
      (value) =>
        value.codigoItem?.split(".")[1] === recRgiLetter &&
        value.codigoStatus == GarantiasItemStatusEnum2.NAO_AUTORIZADO
    );
  };

  const updateItemDefect = (itemId: string, newDefect: string) => {
    if (cardData) {
      const updatedItems = notaFiscal.itens.map((item) =>
        item.id === itemId ? { ...item, tipfoDefeito: newDefect } : item
      );
      setCardData({ ...cardData, itens: updatedItems });
    }
  };

  const statusColor =
    displayedStatus === "Avaliação Concluída"
      ? "#00FF00" // Verde para "Avaliação Concluída"
      : StatusColors[cardData?.codigoStatus || GarantiasStatusEnum2.EM_ANALISE];

  if (loading || !items || !cardData) {
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
          style={{ color: "grey" }}
          type="link"
          className={styles.ButtonBack}
          onClick={() =>
            navigate(`/garantias/technical-and-supervisor/${cardData.id}`, {
              state: { item: cardData.notas[0].itens[0], garantia: cardData, displayedStatus },
            })
          }
        >
          <LeftOutlined /> VOLTAR PARA INFORMAÇÕES DA RGI
        </Button>
        <span className={styles.RgiCode}>
          RGI N° {location.state.nota.codigoRGI || location.state.nota.rgi}
        </span>
      </div>

      <div className={styles.ContainerHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.tituloRgi}>NF {location.state.nf}</h1>
          <div
            style={{
              color: statusColor,
              backgroundColor: `${statusColor}26`,
            }}
            className={styles.statusTag}
          >
            {displayedStatus || "Carregando..."}
          </div>
        </div>
        <div className={styles.botoesCabecalho}>
          {cardData.codigoStatus === GarantiasStatusEnum2.EM_ANALISE && (
            <>
              {context.user.rule.name === UserRoleEnum.Tecnico && (
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
            </>
          )}
        </div>
      </div>
      {cardData.codigoStatus >=
        GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO && (
        <>
          <hr className={styles.divisor} />
          <FileAttachment
            label="Anexo da NF de devolução"
            backgroundColor="#f5f5f5"
            isRessarcimento={false}
            itemId={location.state.nota.id}
          />
          <div className={styles.TitleItens}>
            <h3 className={styles.nfsTitle}>
              Itens desta NF associados a esta garantia
            </h3>
          </div>
        </>
      )}
      {notaFiscal.itens.map((item) => (
        <div className={styles.containerInformacoes} key={item.id}>
          <CollapsibleSection
            title={item.codigoItem}
            isVisible={isContentVisible[item.id] || false}
            toggleVisibility={() => toggleContentVisibility(item.id)}
            handleConfirm={handleConfirm}
            statusGarantia={cardData.codigoStatus}
          >
            <h3 className={styles.tituloSecao}>Informações Gerais</h3>
            <div className={styles.inputsContainer}>
              <div className={styles.inputsConjun}>
                <div className={styles.inputGroup} style={{ flex: 0.5 }}>
                  <OutlinedInputWithLabel
                    label="Código da peça"
                    value={item?.codigoPeca || ""}
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
              <div className={styles.inputGroup} style={{ flex: 0.5 }}>
                  <OutlinedInputWithLabel
                    label="Defeito"
                    value={item?.tipoDefeito || ""}
                    fullWidth
                    disabled
                  />
                </div>
                {context.user.rule.name === UserRoleEnum.Supervisor && (
                  <div className={styles.inputGroup} style={{ flex: 0.5 }}>
                  <OutlinedInputWithLabel
                    label="Defeito Oficial"
                    value={item?.tipoDefeitoOficial?.replace(/_/g, ' ') || ""}
                    fullWidth
                    disabled
                  />
                </div>
                )}
              <div className={styles.inputsConjun}>
                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <OutlinedInputWithLabel
                    label="Torque aplicado à peça"
                    value={item?.torqueAplicado?.toString()}
                    fullWidth
                    disabled
                  />
                </div>
              </div>
            </div>

            <FileAttachment
              label="Anexar NF de compra com IMA"
              backgroundColor="white"
              itemId={item?.id}
              isRessarcimento={item?.solicitarRessarcimento}
            />

            {item.solicitarRessarcimento &&
              context.user.rule.name !== UserRoleEnum.Supervisor && (
                <div className={styles.contentReimbursement}>
                  <h3 className={styles.tituloA}>
                    Anexo de dados adicionais para ressarcimento
                  </h3>
                  {[
                    "1. Documento de identificação (RG ou CNH):",
                    "2. Documentação do veículo:",
                    "3. NFs de serviço:",
                    "4. NF de outras despesa/produtos pertinentes:",
                  ].map((itemRes, index) => (
                    <FileAttachment
                      key={index}
                      label={itemRes}
                      itemId={item.id}
                      backgroundColor="#f5f5f5"
                      isRessarcimento={item.solicitarRessarcimento}
                    />
                  ))}
                </div>
              )}

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
                    isRessarcimento={item.solicitarRessarcimento}
                  />
                ))}

                <hr className={styles.divisor} />
                <div className={styles.containerSelectDefect}>
                  <OutlinedSelectWithLabel
                    placeholder="Selecione um defeito"
                    label="Defeito"
                    options={[
                      {
                        value: "CONJUNTO_NAO_FOI_AJUSTADO_CORRETAMENTE",
                        label: "CONJUNTO NÃO FOI AJUSTADO CORRETAMENTE",
                      },
                      {
                        value: "DIVERGENCIA_ENTRE_PECA_FISICA_E_NF",
                        label: "DIVERGÊNCIA ENTRE PEÇA FÍSICA E NF",
                      },
                      {
                        value: "FORA_DO_PRAZO_DE_GARANTIA",
                        label: "FORA DO PRAZO DE GARANTIA",
                      },
                      {
                        value: "MANCAL_COLOCADO_FORA_DO_ESQUADRO",
                        label: "MANCAL COLOCADO FORA DO ESQUADRO",
                      },
                      {
                        value: "MONTADO_COM_ROLD_DIAMETRO_INCORRETO",
                        label: "MONTADO C/ ROLD. DIÂMETRO INCORRETO",
                      },
                      {
                        value: "MONTADO_COM_ROLAMENTO_DEFEITUOSO",
                        label: "MONTADO COM ROLAMENTO DEFEITUOSO",
                      },
                      {
                        value: "NAO_E_DE_NOSSA_FABRICACAO",
                        label: "NÃO É DE NOSSA FABRICAÇÃO",
                      },
                      {
                        value: "PECA_MODIFICADA_PELO_CLIENTE",
                        label: "PEÇA MODIFICADA PELO CLIENTE",
                      },
                      {
                        value: "PECA_NAO_FOI_AJUSTADA_CORRETAMENTE",
                        label: "PEÇA NÃO FOI AJUSTADA CORRETAMENTE",
                      },
                      {
                        value: "ROLAMENTO_COLOCADO_FORA_DO_ESQUADRO",
                        label: "ROLAMENTO COLOCADO FORA DO ESQUADRO",
                      },
                      {
                        value: "ROLAMENTO_RONCANDO_TRAVOU_ROLAMENTO",
                        label: "ROLAMENTO RONCANDO (TRAVOU ROLAMENTO)",
                      },
                      {
                        value: "ROLAMENTO_RONCANDO_SUPERAQUECIMENTO",
                        label: "ROLAMENTO RONCANDO (SUPERAQUECIMENTO)",
                      },
                      {
                        value: "SUPER_DEFEITO_DE_FABRICACAO",
                        label: "SUPER DEFEITO DE FABRICAÇÃO",
                      },
                      {
                        value: "TRABALHOU_SEM_LUBRIFICACAO",
                        label: "TRABALHOU SEM LUBRIFICAÇÃO",
                      },
                      {
                        value: "TRABALHOU_SEM_O_CHICOTE_ABS",
                        label: "TRABALHOU SEM O CHICOTE ABS",
                      },
                    ]}
                    value={item.tipoDefeitoOficial || ""}
                    
                    defaultValue=""
                    onChange={(e) => {
                      console.log("defeito: ", e.target.value);

                      item.tipoDefeitoOficial = e.target.value;
                      updateItemDefect(item.id, e.target.value);
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
                        e.target.value === "Autorizado"
                          ? GarantiasItemStatusEnum.AUTORIZADO
                          : GarantiasItemStatusEnum.NAO_AUTORIZADO;
                      item.codigoStatus =
                        e.target.value === "Autorizado"
                          ? GarantiasItemStatusEnum2.AUTORIZADO
                          : GarantiasItemStatusEnum2.NAO_AUTORIZADO;
                      setEnvioAutorizado(e.target.value);
                    }}
                  />
                </div>

                <h3 className={styles.tituloA}>Conclusão</h3>
                <MultilineTextFields
                  value={item?.conclusao}
                  onChange={(e) => {
                    item.conclusao = e.target.value;
                    setConclusao(e.target.value);
                  }}
                  label="Conclusão"
                  placeholder="Digite a conclusão aqui..."
                />
              </>
            )}
          </CollapsibleSection>
        </div>
      ))}
    </div>
  );
};

export default TechnicalAndSupervisorDetailsItens;
