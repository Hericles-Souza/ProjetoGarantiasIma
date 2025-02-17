import "./ScreenInitiaTradeAgreement.style.css";
import { LeftOutlined } from "@ant-design/icons";
import OutlinedInputWithLabel from "@shared/components/input-outlined-with-label/OutlinedInputWithLabel";
import { Button, Spin } from "antd";
import { useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { updateGarantiasHeaderByIdAsync } from "@shared/services/GarantiasService";
import { GarantiasModel } from "@shared/models/GarantiasModel";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";
import { AuthModel } from "@shared/models/AuthModel";

const ScreenAcordoComercial = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const nfOrigem: string =
    location.state && location.state["N° NF de origem"]
      ? location.state["N° NF de origem"]
      : "";

  // Vamos buscar os dados do /auth/me e atualizar os estados de razão social e telefone.
  const [razaoSocial, setRazaoSocial] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataSolicitacao, setDataSolicitacao] = useState("");
  const [nfs, setNfs] = useState<{ itemId: string; nf: string; itens: number ; sequence: number}[]>(
    nfOrigem ? [{ itemId: location.state.item.id, nf: nfOrigem, itens: 0 , sequence: 0}] : []
  );
  const [cardData, setCardData] = useState<GarantiasModel>();
  const context = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

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
          // Define a data de solicitação como a data atual.
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
  }, [location.state]);

  const handleSave = () => {
    const now = new Date();
    const currentDate = now.toLocaleDateString();

    const garantiaModel: GarantiasModel = {
      email: context.user.email,
      razaoSocial:
        razaoSocial ||
        (context.user as AuthModel).username ||
        context.user.fullname,
      createdAt: context.user.createdAt,
      dataAtualizacao: currentDate,
      data: currentDate,
      updatedAt: context.user.updatedAt || currentDate,
      usuarioAtualizacao: context.user.fullname,
      usuarioInsercao: context.user.fullname,
      telefone: telefone || context.user.phone,
    };

    updateGarantiasHeaderByIdAsync(garantiaModel)
      .then((value) => console.log(value))
      .catch((error) => console.error("Erro ao atualizar dados:", error));
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
          <span className="RgiCode">
            RGI {cardData.rgi}/{" "}
            
          </span>
        </div>
        <div className="ContainerHeader">
          <h1 className="tituloRgi">RGI {cardData.rgi}</h1>
          <div className="ButtonHeader">
            <Button type="default" className="ButtonDelete">
              Salvar
            </Button>
            <Button onClick={handleSave} type="primary" className="ButonToSend">
              Enviar
            </Button>
          </div>
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
                onClick={() =>
                  navigate("/technical-and-supervisor/details-itens", {
                    state: { nf, cardData },
                  })
                }
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

export default ScreenAcordoComercial;
