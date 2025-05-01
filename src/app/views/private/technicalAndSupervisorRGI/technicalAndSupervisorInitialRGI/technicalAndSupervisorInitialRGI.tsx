import "./technicalAndSupervisorInitialRGI.module.css";
import { LeftOutlined } from "@ant-design/icons";
import OutlinedInputWithLabel from "@shared/components/input-outlined-with-label/OutlinedInputWithLabel";
import { Button, message, Spin } from "antd";
import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GarantiasModel } from "@shared/models/GarantiasModel";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";
import { UserRoleEnum } from "@shared/enums/UserRoleEnum";
import {
  converterStatusGarantia,
  GarantiasItemStatusEnum,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  const [loading, setLoading] = useState(true);
  const [isAnalysisConcluded, setIsAnalysisConcluded] = useState(false); // New state for front-end mask
  const [displayedStatus, setDisplayedStatus] = useState(""); // New state for front-end mask
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
      // Adicione outros tipos MIME conforme necessário
    };

    return mimeTypes[mimeType] || ""; // Retorna a extensão ou uma string vazia se não encontrado
  }

  function getFileExtensionFromBlob(blob: Blob): string {
    const mimeType = blob.type; // Pega o tipo MIME do Blob
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
        Authorization: `Bearer ${context.user.token}`, // Token de autenticação
      },
    });

    const blob = await response.blob();
    const fileExtension = getFileExtensionFromBlob(blob);
    const fileNameWithExtension = field + fileExtension;
    const imagemUrl = URL.createObjectURL(blob);
    console.log(fileNameWithExtension);

    // handleDownload(fileNameWithExtension);
    // handleDownload(fileNameWithExtension, imagemUrl);

    return { fileNameWithExtension, imagemUrl };
  };

  const handleDownloadFile = (recNota: NotaFiscal) => {
    const link = document.createElement("a");
    link.href = recNota.recSellFile?.imagemUrl || "#";
    link.download = recNota.recSellFile?.fileNameWithExtension || "download";
    link.click();
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
      if (location.state.displayedStatus) {
        setDisplayedStatus(location.state.displayedStatus);
        setIsAnalysisConcluded(false);
      } else if (
        !newAssociatedNfsByGarantia?.some((nota) =>
          nota.itens.some(
            (item) => item.status == GarantiasItemStatusEnum.NAO_ANALISADO
          )
        )
      ) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setIsAnalysisConcluded(true);
        setDisplayedStatus("Avaliação Concluída");
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

        console.log("testeasdasd: ", location.state.displayedStatus);
        if (
          cardData.codigoStatus !=
          GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO
        ) {
          console.log("status garantia: ", cardData);

          if (
            location.state.displayedStatus != undefined &&
            context.user.rule.name == UserRoleEnum.Tecnico
          ) {
            if (location.state.displayedStatus == "Aguardando Avaliação") {
              setIsAnalysisConcluded(false);
              setDisplayedStatus(location.state.displayedStatus);
            } else {
              setIsAnalysisConcluded(true);
              setDisplayedStatus(location.state.displayedStatus);
            }
          } else if (
            !garantiaNfsWithItens?.some((nota) =>
              nota.itens.some(
                (item) => item.status == GarantiasItemStatusEnum.NAO_ANALISADO
              )
            )
          ) {
            console.log("entrou 2");
            setIsAnalysisConcluded(true);
            setDisplayedStatus("Avaliação Concluída");
          } else {
            setIsAnalysisConcluded(false);
            // eslint-disable-next-line react-hooks/exhaustive-deps
            console.log("entrou 1");
            setDisplayedStatus("Aguardando Avaliação");
          }
        } else {
          setDisplayedStatus(cardData?.status);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [location.state, cardData, displayedStatus]);

  const handleUpdateNote = async (notaFiscal: NotaFiscal, refuse: boolean) => {
    if (refuse) notaFiscal.tipo_nota = "Recusada";
    else notaFiscal.tipo_nota = "Aprovada";

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
    };

    console.log("notaFiscalUpdate: ", payloadNotaFiscal);
    const responseUpdate = await api.put(
      `/nota-fiscal/update/${notaFiscal.id}`,
      payloadNotaFiscal
    );

    if (responseUpdate.status === 200) {
      setGarantiaNfsWithItens(garantiaNfsWithItens);

      message.success("Nota " + notaFiscal.tipo_nota + " com sucesso");
    }
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
      nf:
        garantiaNfsWithItens.filter((nota) => nota.tipo_nota == "Aprovada")[0]
          .codigo || garantiaNfsWithItens[0].codigo,
      fornecedor: context.user.fullname,
      codigoStatus:
        garantiaNfsWithItens.filter((nota) => nota.tipo_nota != "Aprovada")
          .length > 0
          ? GarantiasStatusEnum2.PECAS_AVALIADAS_PARCIAMENTE
          : GarantiasStatusEnum2.CONFIRMADO,
      observacao: "teste",
      usuarioAtualizacao: context.user.username,
      status:
        garantiaNfsWithItens.filter((nota) => nota.tipo_nota != "Aprovada")
          .length > 0
          ? GarantiasStatusEnum.PECAS_AVALIADAS_PARCIAMENTE
          : GarantiasStatusEnum.CONFIRMADO,
      dataAtualizacao: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`,
    };

    console.log("updateGarantia: ", garantia);

    const responseHeader = await api.put(
      `/garantias/garantiasHeader/${location.state.garantia.id}/UpdateHeader`,
      garantia
    );

    if (responseHeader.status === 200) {
      message.success("Garantia atualizada com sucesso");
    }
  };

  const handleSave = async (
    statusGarantia: GarantiasStatusEnum2 = GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO
  ) => {
    try {
      if (context.user.rule.name === UserRoleEnum.Supervisor) {
        const garantia: GarantiasModel = {
          razaoSocial: razaoSocial,
          telefone: telefone,
          email: context.user.email,
          nf: cardData.notas[0].codigo,
          codigoRGI: cardData.codigoRGI || cardData.rgi,
          fornecedor: context.user.fullname,
          codigoStatus: statusGarantia,
          observacao: "teste",
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

  const statusColor =
    displayedStatus === "Avaliação Concluída"
      ? "#00FF00"
      : StatusColors[cardData?.codigoStatus];

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
          <span className="RgiCode">RGI {cardData.rgi} </span>
        </div>
        <div className={stylesDetails.headerContainer}>
          <div className={stylesDetails.headerLeft}>
            <h1 className="tituloRgi">RGI {cardData.rgi}</h1>
            <div
              style={{
                color: statusColor,
                backgroundColor: `${statusColor}26`,
              }}
              className={stylesDetails.statusTag}
            >
              {displayedStatus || ""}
            </div>
          </div>
          {context.user.rule.name == UserRoleEnum.Tecnico &&
            cardData.codigoStatus ==
              GarantiasStatusEnum2.EM_ANALISE && (
              <div className="ButtonHeader">
                <Button
                    type="primary"
                    className="ButonToSend"
                    // onClick={handleFinalizeAnalysis}
                    // disabled={!allItemsAnalyzed}
                  >
                    Finalizar Análise
                  </Button>
              </div>
            )}
          {context.user.rule.name !== UserRoleEnum.Tecnico &&
            cardData.codigoStatus ==
              GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO && (
              <div className="ButtonHeader">
                <Button
                  onClick={async () => handleConfirm()}
                  type="primary"
                  className="ButonToSend"
                >
                  Enviar
                </Button>
              </div>
            )}
          {context.user.rule.name === UserRoleEnum.Supervisor &&
            cardData.codigoStatus == GarantiasStatusEnum2.EM_ANALISE &&
            garantiaNfsWithItens.filter((nota) =>
              nota.itens.some(
                (item) => item.status === GarantiasItemStatusEnum.NAO_ANALISADO
              )
            ).length == 0 && (
              <div className="ButtonHeader">
                <div style={{ display: "flex", gap: "10px" }}>
                  <Button
                    onClick={async () =>
                      handleSave(GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO)
                    }
                    type="primary"
                    className={stylesDetails.buttonSendRgi}
                  >
                    Recusar Envio
                  </Button>
                  <Button
                    type="primary"
                    className={stylesDetails.buttonSendRgi}
                    onClick={async () =>
                      handleSave(GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO)
                    }
                  >
                    Autorizar Envio
                  </Button>
                </div>
                <Button
                  type="default"
                  className="ButtonDelete"
                  // onClick={() =>
                  //     navigate("/view-pre-invoice", {
                  //       state: { cardData },
                  //     })
                  //   }
                >
                  Visualizar Pré Nota
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
                  backgroundColor: `${
                    StatusColors[
                      nota.tipo_nota == "Recusada"
                        ? GarantiasStatusEnum2.NF_DEVOLUCAO_RECUSADA
                        : nota.tipo_nota == "Aprovada"
                        ? GarantiasStatusEnum2.CONFIRMADO
                        : "#8C8C8C"
                    ]
                  }15`,
                }}
                className={stylesDetails.statusTag}
              >
                {nota.tipo_nota == "Recusada" || nota.tipo_nota == "Aprovada"
                  ? nota.tipo_nota
                  : "Não analisado"}
              </div>
            </div>
            {context.user.rule.name === UserRoleEnum.Supervisor &&
              cardData.codigoStatus ===
                GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO &&
              nota.recSellFile?.fileNameWithExtension != "" &&
              nota.recSellFile?.imagemUrl != "" &&
              !nota.tipo_nota.includes("Aprovada") &&
              !nota.tipo_nota.includes("Recusada") && (
                <>
                  <label className={stylesDetails.buttonUpdateNfSale}>
                    <button
                      style={{ display: "none" }}
                      onClick={() => handleDownloadFile(nota)}
                    />
                    Baixar Arquivo
                  </label>
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
                        onClick={() => handleUpdateNote(nota, false)}
                      >
                        Autorizar
                      </Button>
                    </div>
                  </div>
                </>
              )}
            <div>
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
    </div>
  );
};

export default TechnicalAndSupervisorInitialRGI;
