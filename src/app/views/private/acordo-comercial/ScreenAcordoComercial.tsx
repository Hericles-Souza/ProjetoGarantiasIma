import '../acordo-comercial/ScreenAcordoComercial.style.css';
import { ArrowLeftOutlined } from '@ant-design/icons';
import OutlinedInputWithLabel from '@shared/components/input-outlined-with-label/OutlinedInputWithLabel';
import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '@shared/Interceptors/index.ts';

const ScreenAcordoComercial = () => {
  const { state } = useLocation();
  const nfOrigem = state?.['N° NF de origem'];
  const userDataFromState = state?.userData;

  // Guarda os dados completos do usuário.
  const [userData, setUserData] = useState({
    fullname: '',
    phone: '',
    email: '',
    cnpj: null,
    codigoCigam: null,
    createdAt: '',
    isActive: true,
    isAdmin: false,
    rule: {},
    shortname: '',
    updatedAt: '',
  });

  // Data da solicitação (data atual)
  const dataSolicitacao = new Date().toLocaleDateString();

  // Se algum dado essencial for null/empty, libera a edição.
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/auth/me');
        const data = response.data;
        setUserData({
          fullname: data.fullname || '',
          phone: data.phone || '',
          email: data.email || '',
          cnpj: data.cnpj || null,
          codigoCigam: data.codigoCigam || null,
          createdAt: data.createdAt || '',
          isActive: data.isActive,
          isAdmin: data.isAdmin,
          rule: data.rule || {},
          shortname: data.shortname || '',
          updatedAt: data.updatedAt || '',
        });
        // Se os dados essenciais forem nulos ou vazios, habilita o modo edição.
        if (!data.fullname || !data.phone) {
          setIsEditing(true);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      }
    };
    if (!userDataFromState) {
      // Só busca dados da API se não vieram do state
      fetchUserData();
    }
  }, []);

  const handleUpdateUserData = async () => {
    try {
      // Envia todos os dados, caso algum campo não tenha sido alterado, enviamos o valor atual.
      const payload = { ...userData };
      const response = await api.patch('/user/users', payload);
      console.log('Dados atualizados:', response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar os dados do usuário:', error);
    }
  };

  return (
    <div className="acordo-container">
      <header className="header">
        <div className="aci-info">
          <Link to="/garantias" className="back-link">
            <ArrowLeftOutlined className="back-arrow" /> &lt; Voltar para o início
          </Link>
          <h2>ACI Nº 000666-00010</h2>
          {nfOrigem && <p>N° NF de Origem: {nfOrigem}</p>}
        </div>
      </header>
      <section className="general-info">
        <h2>Informações Gerais</h2>
        <div className="inputs-general">
          <div className="info-row">
            <OutlinedInputWithLabel
              label="Razão social"
              value={userData.fullname}
              onChange={(e) =>
                setUserData({ ...userData, fullname: e.target.value })
              }
            />
          </div>
          <div className="info-row">
            <OutlinedInputWithLabel
              label="Telefone"
              value={userData.phone}
              onChange={(e) =>
                setUserData({ ...userData, phone: e.target.value })
              }
            />
          </div>
          <div className="info-row">
            <OutlinedInputWithLabel
              label="Data da Solicitação"
              value={dataSolicitacao}
            />
          </div>
          {isEditing && (
            <div className="info-row">
              <button onClick={handleUpdateUserData} className="save-btn">
                Salvar Alterações
              </button>
            </div>
          )}
        </div>
      </section>
      <section className="nf-section">
        <div className="header">
          <h2 className="title">NFs associadas a este acordo</h2>
          <button className="add-nf-btn">ADICIONAR NF DE ORIGEM</button>
        </div>
        <div className="nf-item">
          <span className="nf-number">
            {nfOrigem ? nfOrigem : '000666-00010.A'}
          </span>
          <span className="nf-details">2 ITENS</span>
        </div>
      </section>
    </div>
  );
};

export default ScreenAcordoComercial;