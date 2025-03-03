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
  GarantiasStatusEnum2,
} from "@shared/enums/GarantiasStatusEnum";
import api from "@shared/Interceptors";

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
  const [nfs, setNfs] = useState<
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
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

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
          setNfs([
            {
              itemId: location.state.item.id,
              nf: data.nf,
              itens: data.itens ? data.itens.length : 0,
              sequence: 1,
            },
          ]);
          return;
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      } finally {
        setLoading(false);

        console.log("cardDAta: " + JSON.stringify(cardData));
      }
    };
    fetchUserData();
  }, [location.state, cardData]);

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
    // const now = new Date();
    // const currentDate = now.toLocaleDateString();

    // const garantiaUpload: GarantiasModel = {
    //   razaoSocial: razaoSocial ||
    //   (context.user as AuthModel).username ||
    //   context.user.fullname,
    //   telefone: telefone || context.user.phone,
    //   email: context.user.email,
    //   nf: location.state.garantia.nf,
    //   fornecedor: location.state.garantia.fornecedor,
    //   codigoStatus: GarantiasStatusEnum2.EM_ANALISE,
    //   observacao: "Garantia válida por 12 meses",
    //   usuarioAtualizacao: "60003",
    //   dataAtualizacao: "\"2024-12-08 14:54:23.507261\""
    // }

    // const garantiaModel: GarantiasModel = {
    //   id: location.state.garantia.id,
    //   email: context.user.email,
    //   razaoSocial:
    //     razaoSocial ||
    //     (context.user as AuthModel).username ||
    //     context.user.fullname,
    //   createdAt: context.user.createdAt,
    //   dataAtualizacao: currentDate,
    //   data: currentDate,
    //   updatedAt: context.user.updatedAt || currentDate,
    //   usuarioAtualizacao: context.user.fullname,
    //   usuarioInsercao: context.user.fullname,
    //   telefone: telefone || context.user.phone,
    // };
    // console.log("garantiayupldasd: " + JSON.stringify(garantiaModel));
    // updateGarantiasHeaderByIdAsync(garantiaModel)
    //   .then((value) => console.log(value))
    //   .catch((error) => console.error("Erro ao atualizar dados:", error));
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
        <div className="ContainerButtonBack">
          <Button
            type="link"
            className="ButtonBack"
            onClick={() => navigate("/garantias")}
          >
            <LeftOutlined /> VOLTAR PARA INFORMAÇÕES DO RGI
          </Button>
          <span className="RgiCode">RGI {cardData.rgi}/ </span>
        </div>
        <div className="ContainerHeader">
          <h1 className="tituloRgi">RGI {cardData.rgi}</h1>
          {/* {context.user.rule.name != UserRoleEnum.Técnico && (
            <div className="ButtonHeader">
              <Button type="default" className="ButtonDelete">
                Salvar
              </Button>
              <Button
                onClick={async () => handleSave(GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO)}
                type="primary"
                className="ButonToSend"
              >
                Enviar
              </Button>
            </div>
          )} */}
          {context.user.rule.name === UserRoleEnum.Supervisor &&
            cardData.codigoStatus !=
              GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO &&
            cardData.codigoStatus !=
              GarantiasStatusEnum2.CONFIRMADO && (
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
                  onClick={async () =>
                    handleSave(GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO)
                  }
                  type="primary"
                  className="ButonToSend"
                >
                  Autorizar Envio
                </Button>
              </div>
            )}
        </div>
      </header>

      <section className="general-info">
        <h2 className="title-infos-general">Informações Gerais</h2>
        <div className="inputs-general">
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
          <h2 className="title-nf">NFs associadas a este acordo</h2>
        </div>
        {nfs.map((nf, index) => (
          <div key={index} className="nf-item">
            <div>
              <span className="nf-number">{nf.nf}</span>
              <span className="nf-divider"> | </span>
              <span className="nf-details">{nf.itens} ITENS</span>
            </div>
            <div>
              <Button
                type="text"
                className="nextButton"
                onClick={() => {
                  console.log(
                    "asdasdasdsa: " + JSON.stringify(location.state.garantia)
                  );
                  navigate("/technical-and-supervisor/details-itens", {
                    state: { nf, garantia: location.state.garantia },
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
