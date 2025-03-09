import "./technicalAndSupervisorInitialRGI.module.css";
import { LeftOutlined } from "@ant-design/icons";
import OutlinedInputWithLabel from "@shared/components/input-outlined-with-label/OutlinedInputWithLabel";
import { Button, message, Spin } from "antd";
import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GarantiaItem, GarantiasModel } from "@shared/models/GarantiasModel";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";
import { UserRoleEnum } from "@shared/enums/UserRoleEnum";
import {
  converterStatusGarantia,
  GarantiasStatusEnum,
  GarantiasStatusEnum2,
  StatusColors,
} from "@shared/enums/GarantiasStatusEnum";
import api from "@shared/Interceptors";
import environment from "@env/environment";
import stylesDetails from "../technicalAndSupervisorInitialRGI/technicalAndSupervisorInitialRGI.module.css";

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
  const [groupedItems, setGroupedItems] = useState<string[]>();
  const [associatedNfsWithItens, setAssociatedNfsWithItens] = useState<
    { nf: string; countItems: number }[]
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
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

  const getAssciatedNfs = async (garantiaId: string) => {
    const garantiaItemResponse = await fetch(
      `${environment.apiUrl}/garantias/item/associated-nf/${garantiaId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${context.user.token}`,
        },
      }
    );
    const associatedNfs = await garantiaItemResponse.json();
    setAssociatedNfsWithItens(associatedNfs.data);
  };

  const groupByNfReferencia = (itens: GarantiaItem[]) => {
    const grouped: { codigoItem?: string } = {};
    itens?.forEach((item) => {
      if (!grouped[item.nfReferencia]) {
        const formatCodigoItem = item.codigoItem;
        grouped[item.nfReferencia] =
          formatCodigoItem.split(".")[0] + "." + formatCodigoItem.split(".")[1];
      }
    });
    return Object.values(grouped);
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
          if (data?.itens?.length > 0) {
            const itensAgrupados = groupByNfReferencia(data?.itens);
            setGroupedItems(itensAgrupados);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [location.state]);

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
      message.success("Garantia confirmada com sucesso");
      navigate("/garantias");
    }
  };

  const handleRefuse = async () => {
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
      codigoStatus: GarantiasStatusEnum2.NF_DEVOLUCAO_RECUSADA,
      observacao: "teste",
      usuarioAtualizacao: context.user.username,
      status: GarantiasStatusEnum.NF_DEVOLUCAO_RECUSADA,
      dataAtualizacao: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`,
    };

    const responseHeader = await api.put(
      `/garantias/garantiasHeader/${location.state.garantia.id}/UpdateHeader`,
      garantia
    );

    if (responseHeader.status === 200) {
      message.success("Garantia confirmada com sucesso");
      navigate("/garantias");
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
          nf: cardData.nf,
          fornecedor: context.user.fullname,
          codigoStatus: statusGarantia,
          observacao: "teste",
          usuarioAtualizacao: context.user.username,
          status: converterStatusGarantia(statusGarantia),
          dataAtualizacao: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`,
        };

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

  const handleConcludeAnalysis = async () => {
    // Check if all items have required fields filled
    const allItemsFilled = cardData?.itens?.every(
      (item) =>
        item.tipoDefeito &&
        item.conclusao &&
        item.status &&
        item.codigoStatus &&
        item.modeloVeiculoAplicado &&
        item.torqueAplicado !== null &&
        item.loteItem
    );

    if (!allItemsFilled) {
      message.error("Todos os itens devem estar preenchidos para concluir a análise.");
      return;
    }

    try {
      if (context.user.rule.name === UserRoleEnum.Técnico) {
        setIsAnalysisConcluded(true);
        message.success("Análise concluída com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao concluir a análise:", error);
      message.error("Erro ao concluir a análise");
    }
  };

  const displayedStatus =
    cardData?.codigoStatus === GarantiasStatusEnum2.EM_ANALISE &&
      context.user.rule.name === UserRoleEnum.Técnico &&
      isAnalysisConcluded
      ? "Avaliação Concluída"
      : cardData?.codigoStatus === GarantiasStatusEnum2.EM_ANALISE &&
        (context.user.rule.name === UserRoleEnum.Técnico || context.user.rule.name === UserRoleEnum.Supervisor)
        ? "Aguardando Avaliação"
        : cardData?.status;

  const statusColor =
    displayedStatus === "Avaliação Concluída" ? "#00FF00" : StatusColors[cardData?.codigoStatus];

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
              {displayedStatus}
            </div>
          </div>
          {context.user.rule.name === UserRoleEnum.Técnico && (
            <div className="ButtonHeader">
              <Button
                onClick={handleConcludeAnalysis}
                type="primary"
                className="ButonToSend"
                disabled={isAnalysisConcluded}
              >
                Concluir Análise
              </Button>
            </div>
          )}
          {context.user.rule.name !== UserRoleEnum.Técnico && (
            <div className="ButtonHeader">
              <Button
                onClick={async () => handleSave(GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO)}
                type="primary"
                className="ButonToSend"
              >
                Enviar
              </Button>
            </div>
          )}
          {context.user.rule.name === UserRoleEnum.Supervisor &&
            cardData.codigoStatus !== GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO &&
            cardData.codigoStatus !== GarantiasStatusEnum2.CONFIRMADO && (
              <div className="ButtonHeader">
                <Button type="default" className="ButtonDelete">
                  Visualizar Pré Nota
                </Button>
                <Button
                  onClick={async () => handleSave()}
                  type="primary"
                  className="ButonToSend"
                >
                  Não autorizo
                </Button>
                <Button
                  onClick={async () => handleSave(GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO)}
                  type="primary"
                  className="ButonToSend"
                >
                  Autorizar Envio
                </Button>
              </div>
            )}
          {context.user.rule.name === UserRoleEnum.Supervisor &&
            cardData.codigoStatus === GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO && (
              <>
                <Button onClick={handleRefuse} type="primary" className={stylesDetails.ButonToSend}>
                  Recusar NF de Devolução
                </Button>
                <Button
                  type="primary"
                  className={stylesDetails.ButonToSend}
                  onClick={handleConfirm}
                >
                  Autorizar
                </Button>
              </>
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
          <h2 className={stylesDetails.titleNf}>NFs associadas a este acordo</h2>
        </div>
        {groupedItems?.sort().map((codigoItem, index) => (
          <div key={index} className={stylesDetails.nfsItem}>
            <div>
              <span className={stylesDetails.nfsCode}>{codigoItem}</span>
              <span className="nf-divider"> | </span>
              <span className={stylesDetails.nfsQuantity}>
                {associatedNfsWithItens[index]?.countItems} ITENS
              </span>
            </div>
            <div>
              <Button
                type="text"
                className={stylesDetails.nextButton}
                onClick={() => {
                  navigate("/technical-and-supervisor/details-itens", {
                    state: {
                      nf: codigoItem,
                      garantia: cardData,
                      isAnalysisConcluded: context.user.rule.name === UserRoleEnum.Técnico && isAnalysisConcluded,
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