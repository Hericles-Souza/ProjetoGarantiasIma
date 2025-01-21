
import '../acordo-comercial/ScreenAcordoComercial.style.css';
import { ArrowLeftOutlined } from '@ant-design/icons';
import OutlinedInputWithLabel from '@shared/components/input-outlined-with-label/OutlinedInputWithLabel';
import { useState } from 'react';


const ScreenAcordoComercial = () => {
  const [razaoSocial, setRazaoSocial] = useState('Magnetis Consultoria de Investimentos Ltda.');
  const [telefone, setTelefone] = useState('(31) 99847-5278');
  const [dataSolicitacao, setDataSolicitacao] = useState('12/07/2008');
  return (
    <div className="acordo-container">
      <header className="header">
        <div className="aci-info">
          <a href="/" className="back-link"> <ArrowLeftOutlined className="back-arrow" /> VOLTAR PARA O INÍCIO</a>
          <h2 className='code-aci'>ACI Nº 000666-00010</h2>
          <span className="status">Não enviado</span>
        </div>
        <div className="actions">
          <button className="delete-btn">EXCLUIR</button>
          <button className="save-btn">SALVAR</button>
          <button className="send-btn">ENVIAR</button>
        </div>
      </header>

      <section className="general-info">
        <h2 className="title">Informações Gerais</h2>
        <div className="inputs-general">
          <div className="info-row">
            <OutlinedInputWithLabel
              label="Razão social"
              value={razaoSocial}
              onChange={(e) => setRazaoSocial(e.target.value)}
              readOnly
            />
          </div>
          <div className="info-row">
            <OutlinedInputWithLabel
              label="Telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              readOnly
            />
          </div>
          <div className="info-row">
            <OutlinedInputWithLabel
              label="Data da solicitação"
              value={dataSolicitacao}
              onChange={(e) => setDataSolicitacao(e.target.value)}
              readOnly
            />
          </div>
        </div>
      </section>

      <section className="nf-section">
       <div className="header">
        <h2 className="title">NFs associadas a este acordo</h2>
        <button className="add-nf-btn">ADICIONAR NF DE ORIGEM</button>
        </div> 
        <div className="nf-item">
          <span className="nf-number">000666-00010.A</span>
          <span className="nf-details">2 ITENS</span>
        </div>
      
      </section>
    </div>
  );
};

export default ScreenAcordoComercial;
