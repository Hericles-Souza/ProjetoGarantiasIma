import "./technicalAndSupervisorInitialRGI.module.css";
import { LeftOutlined } from "@ant-design/icons";
import OutlinedInputWithLabel from "@shared/components/input-outlined-with-label/OutlinedInputWithLabel";
import { Button, message, Spin, Modal, Input } from "antd";
import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GarantiasModel } from "@shared/models/GarantiasModel";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";
import { UserRoleEnum } from "@shared/enums/UserRoleEnum";
import {
  converterStatusGarantia,
  GarantiasItemStatusEnum,
  GarantiasItemStatusEnum2,
  GarantiasStatusEnum,
  GarantiasStatusEnum2,
  StatusColors,
} from "@shared/enums/GarantiasStatusEnum";
import api from "@shared/Interceptors";
import environment from "@env/environment";
import stylesDetails from "../technicalAndSupervisorInitialRGI/technicalAndSupervisorInitialRGI.module.css";
import { NotaFiscal } from "@shared/models/NotaFiscalModel";

const TechnicalAndSupervisorInitialRGI = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const context = useContext(AuthContext);
  const nfOrigem: string =
    location.state && location.state["N° NF de origem"]
      ? location.state["N° NF de origem"]
      : "";

  const [razaoSocial, setRazaoSocial] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataSolicitacao, setDataSolicitacao] = useState("");
  const [garantiaNfsWithItens, setGarantiaNfsWithItens] = useState<
    NotaFiscal[]
  >([]);
  const [, setNfs] = useState<
    { itemId: string; nf: string; itens: number; sequence: number }[]
  >(
    nfOrigem
      ? [
        {
          itemId: location.state.item.id,
          nf: nfOrigem,
          itens: 0,
          sequence: 0,
        },
      ]
      : []
  );
  const [cardData, setCardData] = useState<GarantiasModel>();
  const [newStatus, setNewStatus] = useState<GarantiasStatusEnum2>();
  const [loading, setLoading] = useState(true);
  const [isAnalysisConcluded, setIsAnalysisConcluded] = useState(false);
  const [modalRefuseOpen, setModalRefuseOpen] = useState(false); // State for refusal modal
  const [currentNota, setCurrentNota] = useState<NotaFiscal | null>(null); // Track the nota being refused
  const [conclusion, setConclusion] = useState(""); // State for conclusion input

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

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

  const getSellFile = async (itemId: string, field: string) => {
    const urlGetFile =
      environment.apiUrl +
      `/files/files/download-private-file-item/${itemId}/${field}`;
    console.log(urlGetFile);

    const response = await fetch(urlGetFile, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${context.user.token}`,
      },
    });

    const blob = await response.blob();
    const fileExtension = getFileExtensionFromBlob(blob);
    const fileNameWithExtension = field + fileExtension;
    const imagemUrl = URL.createObjectURL(blob);
    console.log(fileNameWithExtension);

    return { fileNameWithExtension, imagemUrl };
  };

  const getAssciatedNfs = async (garantiaId: string) => {
    const garantiaItemResponse = await fetch(
      `${environment.apiUrl}/nota-fiscal/by-garantia/${garantiaId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${context.user.token}`,
        },
      }
    );
    const associatedNfsByGarantia = await garantiaItemResponse.json();

    const newAssociatedNfsByGarantia: NotaFiscal[] = [];

    associatedNfsByGarantia.data.map(async (nfAssociated, index) => {
      newAssociatedNfsByGarantia[index] = nfAssociated;
      const returnedSellFile = await getSellFile(nfAssociated.id, "nfDev");
      newAssociatedNfsByGarantia[index].recSellFile = returnedSellFile;
    });
    console.log("newAssociatedNfsByGarantia: ", newAssociatedNfsByGarantia);
    setGarantiaNfsWithItens(associatedNfsByGarantia.data);
    if (
      cardData.status != GarantiasStatusEnum.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO
    ) {
      console.log("status garantia: ", cardData);
      if (
        cardData.codigoStatus == GarantiasStatusEnum2.EM_ANALISE_SUPERVISOR ||
        cardData.codigoStatus ==
        GarantiasStatusEnum2.PECAS_AVALIADAS_PARCIAMENTE
      ) {
        setIsAnalysisConcluded(true);
      } else if (cardData.codigoStatus == GarantiasStatusEnum2.EM_ANALISE) {
        setIsAnalysisConcluded(true);
      }
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        let data: GarantiasModel = null;
        if (location.state) {
          data = location.state.garantia;
        }
        if (data != null) {
          setRazaoSocial(data.razaoSocial);
          setTelefone(data.telefone);
          setDataSolicitacao(data.data);
          setCardData(data);
          setNewStatus(data.codigoStatus);
          await getAssciatedNfs(data.id);
          setNfs([
            {
              itemId: location.state.item.id,
              nf: data.nf,
              itens: data.itens ? data.itens.length : 0,
              sequence: 1,
            },
          ]);
        }

        console.log("status garantia: ", cardData);

        if (cardData.codigoStatus == GarantiasStatusEnum2.EM_ANALISE) {
          setIsAnalysisConcluded(false);
        } else if (
          cardData.codigoStatus == GarantiasStatusEnum2.EM_ANALISE_SUPERVISOR ||
          cardData.codigoStatus ==
          GarantiasStatusEnum2.PECAS_AVALIADAS_PARCIAMENTE
        ) {
          setIsAnalysisConcluded(true);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [location.state, cardData]);

  const handleUpdateNote = async (notaFiscal: NotaFiscal, refuse: boolean) => {
    if (refuse) {
      // Open the modal for conclusion input
      notaFiscal.tipo_nota = "Recusada";
      setCurrentNota(notaFiscal);
      setModalRefuseOpen(true);
      return;
    }
    else{
      notaFiscal.tipo_nota = "Aprovada";
      const payloadNotaFiscal: NotaFiscal = {
        garantiaId: notaFiscal.garantia_id,
        codigo: notaFiscal.codigo,
        codigoRGI: notaFiscal.rgi,
        tipo_nota: notaFiscal.tipo_nota,
        data_emissao: notaFiscal.data_emissao,
        id_referencia: notaFiscal.id_referencia,
        data_atualizacao: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`,
        itens: notaFiscal.itens,
        id: notaFiscal.id,
        observacao: "",
      };
  
      console.log("notaFiscalUpdate: ", payloadNotaFiscal);
      const responseUpdate = await api.put(
        `/nota-fiscal/update/${notaFiscal.id}`,
        payloadNotaFiscal
      );
  
      if (responseUpdate.status === 200) {
        setGarantiaNfsWithItens([...garantiaNfsWithItens]); // Refresh UI
        message.success("Nota Aprovada com sucesso");
      }

    }
    // If approving, proceed without modal
  };

  const handleConfirmRefusal = async () => {
    if (!currentNota) return;

    const notaFiscal = { ...currentNota };
    notaFiscal.tipo_nota = "Recusada";
    // notaFiscal.conclusao = conclusion; // Add the conclusion to the payload

    const payloadNotaFiscal: NotaFiscal = {
      garantiaId: notaFiscal.garantia_id,
      codigo: notaFiscal.codigo,
      codigoRGI: notaFiscal.rgi,
      tipo_nota: notaFiscal.tipo_nota,
      data_emissao: notaFiscal.data_emissao,
      id_referencia: notaFiscal.id_referencia,
      data_atualizacao: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`,
      itens: notaFiscal.itens,
      id: notaFiscal.id,
      observacao: conclusion,
    };

    console.log("notaFiscalUpdate (Refused): ", payloadNotaFiscal);
    const responseUpdate = await api.put(
      `/nota-fiscal/update/${notaFiscal.id}`,
      payloadNotaFiscal
    );

    if (responseUpdate.status === 200) {
      setGarantiaNfsWithItens([...garantiaNfsWithItens]); // Refresh UI
      message.success("Nota Recusada com sucesso");
    } else {
      message.error("Erro ao recusar a nota");
    }

    // Reset states and close modal
    setModalRefuseOpen(false);
    setConclusion("");
    setCurrentNota(null);
  };

  const handleConfirm = async (envio: boolean) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

    let statusGarantia: GarantiasStatusEnum2;

    if (envio) {
      statusGarantia = garantiaNfsWithItens.filter((nota) => nota.tipo_nota != "Aprovada")
        .length == garantiaNfsWithItens.length
        ? GarantiasStatusEnum2.RECUSADA
        : GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO;
    }
    else {
      statusGarantia = garantiaNfsWithItens.filter((nota) => nota.tipo_nota != "Aprovada")
        .length == garantiaNfsWithItens.length
        ? GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO
        : GarantiasStatusEnum2.CONFIRMADO;

    }


    const garantia: GarantiasModel = {
      razaoSocial: location.state.garantia.razaoSocial,
      telefone: location.state.garantia.telefone,
      email: context.user.email,
      nf:
        garantiaNfsWithItens?.filter((nota) => nota.tipo_nota == "Aprovada")[0]
          ?.codigo || garantiaNfsWithItens[0].codigo,
      fornecedor: context.user.fullname,
      codigoStatus: statusGarantia,
      observacao: "teste",
      usuarioAtualizacao: context.user.username,
      status: converterStatusGarantia(statusGarantia),
      dataAtualizacao: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`,
    };

    console.log("updateGarantia: ", garantia);

    const responseHeader = await api.put(
      `/garantias/garantiasHeader/${location.state.garantia.id}/UpdateHeader`,
      garantia
    );

    if (responseHeader.status === 200) {
      message.success("Garantia atualizada com sucesso");
      navigate("/garantias");
    }
  };

  const handleSaveTec = async () => {
    try {
      if (context.user.rule.name === UserRoleEnum.Tecnico) {
        let statusGarantia;
        if (
          garantiaNfsWithItens?.some((nota) =>
            nota.itens.some(
              (item) => item.status != GarantiasItemStatusEnum.NAO_AUTORIZADO
            )
          )
        ) {
          statusGarantia = GarantiasStatusEnum2.EM_ANALISE_SUPERVISOR;
        } else {
          statusGarantia = GarantiasStatusEnum2.RECUSADA;
        }
        const garantia: GarantiasModel = {
          razaoSocial: razaoSocial,
          telefone: telefone,
          email: context.user.email,
          nf: cardData.notas[0].codigo,
          codigoRGI: cardData.codigoRGI || cardData.rgi,
          fornecedor: context.user.fullname,
          codigoStatus: statusGarantia,
          observacao: "Em análise supervisor",
          usuarioAtualizacao: context.user.username,
          status: converterStatusGarantia(statusGarantia),
          dataAtualizacao: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`,
        };

        console.log("garantiaupdate: ", garantia);

        const responseHeader = await api.put(
          `/garantias/garantiasHeader/${cardData.id}/UpdateHeader`,
          garantia
        );

        if (responseHeader.status === 200) {
          message.success("Garantia atualizada com sucesso!");
          navigate("/garantias");
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar a garantia:", error);
      message.error("Erro ao atualizar a garantia");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSave = async (
    statusGarantia: GarantiasStatusEnum2 = GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO
  ) => {
    try {
      if (context.user.rule.name === UserRoleEnum.Supervisor) {
        let finalStatusGarantia = statusGarantia;

        if (statusGarantia === GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO) {
          const hasAuthorizedItems = garantiaNfsWithItens.some((nota) =>
            nota.itens.some(
              (item) =>
                item.codigoStatus === GarantiasItemStatusEnum2.AUTORIZADO
            )
          );
          const hasNonAuthorizedItems = garantiaNfsWithItens.some((nota) =>
            nota.itens.some(
              (item) =>
                item.codigoStatus !== GarantiasItemStatusEnum2.AUTORIZADO
            )
          );

          if (hasAuthorizedItems && hasNonAuthorizedItems) {
            finalStatusGarantia =
              GarantiasStatusEnum2.PECAS_AVALIADAS_PARCIAMENTE;
          }
        }

        const garantia: GarantiasModel = {
          razaoSocial: razaoSocial,
          telefone: telefone,
          email: context.user.email,
          nf: cardData.notas[0].codigo,
          codigoRGI: cardData.codigoRGI || cardData.rgi,
          fornecedor: context.user.fullname,
          codigoStatus: finalStatusGarantia,
          observacao: "teste",
          usuarioAtualizacao: context.user.username,
          status: converterStatusGarantia(finalStatusGarantia),
          dataAtualizacao: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`,
        };

        console.log("garantiaupdate: ", garantia);

        const responseHeader = await api.put(
          `/garantias/garantiasHeader/${cardData.id}/UpdateHeader`,
          garantia
        );

        if (responseHeader.status === 200) {
          message.success("Garantia atualizada com sucesso!");
          navigate("/garantias");
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar a garantia:", error);
      message.error("Erro ao atualizar a garantia");
    }
  };

  if (loading || !cardData) {
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
    <div className="acordo-container">
      <header className="header">
        <div className={stylesDetails.ContainerButtonBack}>
          <Button
            type="link"
            className={stylesDetails.ButtonBack}
            onClick={() => navigate("/garantias")}
          >
            <LeftOutlined /> VOLTAR PARA O INÍCIO
          </Button>
          <span className="RgiCode">RGI {cardData?.rgi || cardData?.codigoRGI} </span>
        </div>
        <div className={stylesDetails.headerContainer}>
          <div className={stylesDetails.headerLeft}>
            <h1 className="tituloRgi">RGI {cardData?.rgi || cardData?.codigoRGI}</h1>
            <div
              style={{
                color: StatusColors[cardData?.codigoStatus],
                backgroundColor: `${StatusColors[cardData?.codigoStatus]}26`,
              }}
              className={stylesDetails.statusTag}
            >
              {cardData?.status || ""}
            </div>
          </div>
          {context.user.rule.name == UserRoleEnum.Tecnico &&
            cardData.codigoStatus == GarantiasStatusEnum2.EM_ANALISE && (
              <div className="ButtonHeader">
                <Button
                  type="primary"
                  className="ButonToSend"
                  onClick={handleSaveTec}
                >
                  Finalizar Análise
                </Button>
              </div>
            )}
          {context.user.rule.name !== UserRoleEnum.Tecnico &&
            (cardData.codigoStatus ==
              GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO ||
              cardData.codigoStatus ==
              GarantiasStatusEnum2.PECAS_AVALIADAS_PARCIAMENTE
              || cardData.codigoStatus == GarantiasStatusEnum2.EM_ANALISE_SUPERVISOR) && (
              <div className="ButtonHeader">
                <Button
                  onClick={async () => {
                    if (cardData.codigoStatus != GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO)
                      handleConfirm(true)
                    else
                      handleConfirm(false)
                  }}
                  type="primary"
                  className="ButonToSend"
                >
                  Enviar
                </Button>
              </div>
            )}
        </div>
      </header>

      <section className={stylesDetails.infoContainer}>
        <h2 className={stylesDetails.infoTitle}>Informações Gerais</h2>
        <div className={stylesDetails.inputsContainer}>
          <div className="info-row">
            <OutlinedInputWithLabel
              label="Razão social"
              value={razaoSocial}
              onChange={(e) => setRazaoSocial(e.target.value)}
              fullWidth
              disabled
            />
          </div>
          <div className="info-row">
            <OutlinedInputWithLabel
              label="Telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              fullWidth
              disabled
            />
          </div>
          <div className="info-row">
            <OutlinedInputWithLabel
              label="Data da solicitação"
              value={dataSolicitacao}
              onChange={(e) => setDataSolicitacao(e.target.value)}
              fullWidth
              disabled
            />
          </div>
        </div>
      </section>

      <section className="nf-section">
        <div className="headerNF">
          <h2 className={stylesDetails.titleNf}>NFs associadas a esta RGI</h2>
        </div>
        {garantiaNfsWithItens?.sort().map((nota, index) => (
          <div key={index} className={stylesDetails.nfsItem}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div>
                <span className={stylesDetails.nfsCode}>
                  {nota.codigoRGI || nota.rgi}
                </span>
                <span className="nf-divider"> | </span>
                <span className={stylesDetails.nfsQuantity}>
                  {nota.itens.length} ITENS
                </span>
              </div>
            <div
              style={{
                color:
                  StatusColors[
                  nota.tipo_nota == "Recusada"
                    ? GarantiasStatusEnum2.NF_DEVOLUCAO_RECUSADA
                    : nota.tipo_nota == "Aprovada"
                      ? GarantiasStatusEnum2.CONFIRMADO
                      : "#8C8C8C"
                  ],
                backgroundColor: `${StatusColors[
                  nota.tipo_nota == "Recusada"
                    ? GarantiasStatusEnum2.NF_DEVOLUCAO_RECUSADA
                    : nota.tipo_nota == "Aprovada"
                      ? GarantiasStatusEnum2.CONFIRMADO
                      : "#8C8C8C"
                ]
                  }15`,
              }}
              className={stylesDetails.statusTag}
            >{nota.tipo_nota.toLocaleLowerCase() == "nota fiscal de origem" ? "" : nota.tipo_nota}</div>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {context.user.rule.name === UserRoleEnum.Supervisor &&
                cardData.codigoStatus ===
                GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO &&
                nota.recSellFile?.fileNameWithExtension != "" &&
                nota.recSellFile?.imagemUrl != "" &&
                !nota.tipo_nota.includes("Recusada") && 
                newStatus == GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO &&(
                  <>

                    <div className="ButtonHeader">
                      <div style={{ display: "flex", gap: "10px" }}>
                        <Button
                          onClick={() => handleUpdateNote(nota, true)}
                          type="primary"
                          className={stylesDetails.buttonSendRgi}
                        >
                          Recusar NF de Devolução
                        </Button>
                        <Button
                          type="primary"
                          className={stylesDetails.buttonSendRgi}
                          onClick={() => {
                            handleUpdateNote(nota, false);
                            setNewStatus(GarantiasStatusEnum2.CONFIRMADO);
                          }}
                        >
                          Autorizar
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              {context.user.rule.name === UserRoleEnum.Supervisor &&
                (cardData.codigoStatus ==
                  GarantiasStatusEnum2.EM_ANALISE_SUPERVISOR ||
                  cardData.codigoStatus ==
                  GarantiasStatusEnum2.PECAS_AVALIADAS_PARCIAMENTE) &&
                !nota.tipo_nota.includes("Aprovada") &&
                !nota.tipo_nota.includes("Recusada") && (
                  <>
                    <div className="ButtonHeader">
                      <div style={{ display: "flex", gap: "10px" }}>
                        <Button
                          onClick={() => handleUpdateNote(nota, true)}
                          type="primary"
                          className={stylesDetails.buttonSendRgi}
                        >
                          Recusar Envio
                        </Button>
                        <Button
                          type="primary"
                          className={stylesDetails.buttonSendRgi}
                          onClick={() => handleUpdateNote(nota, false)}
                        >
                          Autorizar Envio
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              <Button
                type="text"
                className={stylesDetails.nextButton}
                onClick={() => {
                  console.log("nota: ", nota);
                  navigate("/technical-and-supervisor/details-itens", {
                    state: {
                      nf: nota.codigoRGI || nota.rgi,
                      garantia: cardData,
                      isAnalysisConcluded:
                        context.user.rule.name === UserRoleEnum.Tecnico &&
                        isAnalysisConcluded,
                      nota: nota,
                    },
                  });
                }}
              >
                &gt;
              </Button>
            </div>
          </div>
        ))}
      </section>

      {/* Modal for Refusal Conclusion */}
      <Modal
        title="Motivo da Recusa"
        open={modalRefuseOpen}
        onOk={handleConfirmRefusal}
        onCancel={() => {
          setModalRefuseOpen(false);
          setConclusion("");
          setCurrentNota(null);
        }}
        okText="Confirmar Recusa"
        cancelText="Cancelar"
        okButtonProps={{
          style: { backgroundColor: "red", borderColor: "red", color: "white" },
        }}
        cancelButtonProps={{
          style: { borderColor: "#dadada", color: "#5F5A56" },
        }}
      >
        <p>Por favor, informe o motivo da recusa da NF de devolução:</p>
        <Input.TextArea
          rows={4}
          value={conclusion}
          onChange={(e) => setConclusion(e.target.value)}
          placeholder="Digite a conclusão aqui..."
        />
      </Modal>
    </div>
  );
};

export default TechnicalAndSupervisorInitialRGI;
