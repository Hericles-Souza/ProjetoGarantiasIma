import "./ScreenInitiaTradeAgreement.style.css";
import { DeleteOutlined, LeftOutlined } from "@ant-design/icons";
import OutlinedInputWithLabel from "@shared/components/input-outlined-with-label/OutlinedInputWithLabel";
import { Button, Modal } from "antd";
import { useEffect, useState } from "react";
import NFModal from "../../clientProcessRGI/addNewNF/modalAddNewNF";
import { ModalModel } from "../../clientProcessRGI/RGIDetailsInitial/RGIDetailsInitial";
import { useLocation, useNavigate } from "react-router-dom";
import { AcordoComercialModel } from "@shared/models/AcordoComercialModel";

const ScreenAcordoComercial: React.FC = () => {
  const [razaoSocial, setRazaoSocial] = useState(
    "Magnetis Consultoria de Investimentos Ltda."
  );
  const [telefone, setTelefone] = useState("(31) 99847-5278");
  const [acordo, setAcordo] = useState<AcordoComercialModel>();
  const [dataSolicitacao, setDataSolicitacao] = useState("12/07/2008");
  const [nfs, setNfs] = useState<{ nf: string; itens: number }[]>([]);
  const [modalOpen, setModalOpen] = useState<ModalModel>({
    isOpen: false,
    isSell: false,
  });

  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [nfToDelete, setNfToDelete] = useState<string>("");
  const location = useLocation();
  const navigate = useNavigate();

  const handleAddNF = (nfNumber: string) => {
    setNfs((prevNfs) => [...prevNfs, { nf: nfNumber, itens: 0 }]);
    setModalOpen({ isOpen: false, isSell: false });
  };

  const handleDeleteNF = () => {
    setNfs((prevNfs) => prevNfs.filter((nf) => nf.nf !== nfToDelete));
    setModalDeleteOpen(false);
  };

  const showDeleteConfirm = (nfNumber: string) => {
    setNfToDelete(nfNumber);
    setModalDeleteOpen(true);
  };

  useEffect(() => {
    console.log("new page: ", location.state);

    console.log(location.state.item);

    if (location.state) {
      console.log("location state: ", location.state);
      const recNfs = location.state.item.itens
      .map(value => value.nf ?? value.codigoItem.split(".")[0] + "." + value.codigoItem.split(".")[1]) // substitui null/undefined por 'sem_nf'
      .filter(nf => nf !== '')      
      console.log("correctedNfs: ", recNfs);

      // Contar as ocorrências
      const nfCountMap = recNfs.reduce((acc, nf) => {
        acc[nf] = (acc[nf] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Gerar o array de objetos com nf e quantidade
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const nfsFormatted = Object.entries(nfCountMap).map(([nf, itens]) => ({
        nf: nf,
        itens: 1,
      }));
      setNfs(nfsFormatted);
      setAcordo(location.state.item);
      console.log(nfsFormatted);
    }
  }, [location.state]);

  return (
    <div className="acordo-container">
      <header className="header">
        <div className="ContainerButtonBack">
          <Button
            type="link"
            className="ButtonBack"
            onClick={() => navigate(`/garantias`)}
          >
            <LeftOutlined /> VOLTAR PARA INFORMAÇÕES DO ACI
          </Button>
          <span className="RgiCode">
            ACI N° {acordo?.cdAci}
          </span>
        </div>
        <div className="ContainerHeader">
          <h1 className="tituloRgi"> ACI {acordo?.cdAci}</h1>
          <div className="ButtonHeader">
            <Button type="default" className="ButtonDelete">
              EXCLUIR
            </Button>
            <Button type="primary" className="ButonToSend">
              SALVAR
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
          <button
            className="add-nf-btn"
            onClick={() => setModalOpen({ isOpen: true, isSell: false })}
          >
            ADICIONAR NF DE ORIGEM
          </button>
        </div>
        {nfs.map((nf, index) => (
          <div key={index} className="nf-item">
            <div>
              <span className="nf-number">{nf.nf}</span>
              <span className="nf-divider"> | </span>
              <span className="nf-details">{nf.itens} ITENS</span>
            </div>
            <div>
              <DeleteOutlined
                style={{ color: "#555", fontSize: "22px" }}
                onClick={() => showDeleteConfirm(nf.nf)}
              />
              <Button type="text" className="nextButton"
              onClick={() => {
                navigate("/garantias/aci/details-itens", {
                  state: {acordo, nf}
                })
              }}>
                &gt;
              </Button>
            </div>
          </div>
        ))}
      </section>

      <NFModal
        open={modalOpen.isOpen}
        onOpenChange={setModalOpen}
        onAddNF={handleAddNF}
        isSell={false}
        itemId={""}
        garantiaId={""}
      />
      <Modal
        title="Confirmar Exclusão"
        visible={modalDeleteOpen}
        onOk={handleDeleteNF}
        onCancel={() => setModalDeleteOpen(false)}
        okText="Excluir"
        cancelText="Cancelar"
        okButtonProps={{
          style: { backgroundColor: "red", borderColor: "red", color: "white" },
        }}
        cancelButtonProps={{
          style: { borderColor: "#dadada", color: "#5F5A56" },
        }}
      >
        <p>Você tem certeza de que deseja excluir esta NF?</p>
      </Modal>
    </div>
  );
};

export default ScreenAcordoComercial;
