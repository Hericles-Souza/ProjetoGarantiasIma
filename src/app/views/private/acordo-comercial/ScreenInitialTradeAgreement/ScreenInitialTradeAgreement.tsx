import "./ScreenInitiaTradeAgreement.style.css";
import { DeleteOutlined, LeftOutlined } from '@ant-design/icons';
import OutlinedInputWithLabel from '@shared/components/input-outlined-with-label/OutlinedInputWithLabel';
import { Button, Modal } from 'antd';
import { useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NFModal from "../../clientProcessRGI/addNewNF/modalAddNewNF";
import { updateGarantiasHeaderByIdAsync } from "@shared/services/GarantiasService";
import { GarantiasModel } from "@shared/models/GarantiasModel";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";
import api from '@shared/Interceptors/index.ts';

const ScreenAcordoComercial = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const nfOrigem: string = location.state && location.state["N° NF de origem"] ? location.state["N° NF de origem"] : "";

  // Vamos buscar os dados do /auth/me e atualizar os estados de razão social e telefone.
  const [razaoSocial, setRazaoSocial] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataSolicitacao, setDataSolicitacao] = useState('');
  const [nfs, setNfs] = useState<{ nf: string; itens: number }[]>(nfOrigem ? [{ nf: nfOrigem, itens: 0 }] : []);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [nfToDelete, setNfToDelete] = useState<string>("");
  const context = useContext(AuthContext);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/auth/me');
        const user = response.data;
        setRazaoSocial(user.razaoSocial);
        setTelefone(user.phone);
        // Define a data de solicitação como a data atual.
        setDataSolicitacao(new Date().toLocaleDateString());
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      }
    };
    fetchUserData();
  }, []);

  const handleAddNF = (nfNumber: string) => {
    setNfs((prevNfs) => [...prevNfs, { nf: nfNumber, itens: 0 }]);
    setModalOpen(false);
  };

  const handleDeleteNF = () => {
    setNfs((prevNfs) => prevNfs.filter((nf) => nf.nf !== nfToDelete));
    setModalDeleteOpen(false);
  };

  const showDeleteConfirm = (nfNumber: string) => {
    setNfToDelete(nfNumber);
    setModalDeleteOpen(true);
  };

  const handleSave = () => {
    const now = new Date();
    const currentDate = now.toLocaleDateString();

    const garantiaModel: GarantiasModel = {
      email: context.user.email,
      razaoSocial: razaoSocial || (context.user as any).razaoSocial || context.user.fullname,
      createdAt: context.user.createdAt,
      dataAtualizacao: currentDate,
      data: currentDate,
      updatedAt: context.user.updatedAt || currentDate,
      usuarioAtualizacao: context.user.fullname,
      usuarioInsercao: context.user.fullname,
      telefone: telefone || context.user.phone
    };

    updateGarantiasHeaderByIdAsync(garantiaModel)
      .then((value) => console.log(value))
      .catch((error) => console.error('Erro ao atualizar dados:', error));
  };

  return (
    <div className="acordo-container">
      <header className="header">
        <div className="ContainerButtonBack">
          <Button
            type="link"
            className="ButtonBack"
            onClick={() => navigate()}
          >
            <LeftOutlined /> VOLTAR PARA INFORMAÇÕES DO RGI
          </Button>
          <span className="RgiCode">
            RGI N° 000666-0001 / {nfOrigem ? `NF de Origem ${nfOrigem}` : 'NF não informada'}
          </span>
        </div>
        <div className="ContainerHeader">
          <h1 className="tituloRgi">000666-00147.A</h1>
          <div className="ButtonHeader">
            <Button type="default" className="ButtonDelete">
              EXCLUIR
            </Button>
            <Button onClick={handleSave} type="primary" className="ButonToSend">
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
            />
          </div>
          <div className="info-row">
            <OutlinedInputWithLabel
              label="Telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              fullWidth
            />
          </div>
          <div className="info-row">
            <OutlinedInputWithLabel
              label="Data da solicitação"
              value={dataSolicitacao}
              onChange={(e) => setDataSolicitacao(e.target.value)}
              fullWidth
            />
          </div>
        </div>
      </section>

      <section className="nf-section">
        <div className="headerNF">
          <h2 className="title-nf">NFs associadas a este acordo</h2>
          <button className="add-nf-btn" onClick={() => setModalOpen(true)}>
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
              <Button
                type="text"
                className="nextButton"
                onClick={() =>
                  navigate("/technical-and-supervisor/details-itens", { state: { nfs } })
                }
              >
                &gt;
              </Button>
            </div>
          </div>
        ))}
      </section>

      <NFModal open={modalOpen} onOpenChange={setModalOpen} onAddNF={handleAddNF} />
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