import React, { useContext, useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Divider, Form, Upload } from 'antd';
import { Input } from "@shared/components/input/index.tsx";
import styles from './new-request-garantias.module.css';
import { GarantiasStatusEnum2 } from '@shared/enums/GarantiasStatusEnum';
import { AuthContext } from '@shared/contexts/Auth/AuthContext';
import { GarantiaItem, GarantiasModel } from '@shared/models/GarantiasModel';
import { createGarantiaAsync, getGarantiaByIdAsync } from '@shared/services/GarantiasService';
import api from '@shared/Interceptors';
import { FileOutlined, InboxOutlined } from '@ant-design/icons';

// Enum para controlar as abas
enum FilterStatus {
  GARANTIAS = 'garantias',
  ACORDO = 'acordo',
}

// Componente FileAttachment – permite selecionar um arquivo
interface FileAttachmentProps {
  label: string;
  backgroundColor?: string;
  onFileSelect?: (file: File) => void;
  required?: boolean;
}
const FileAttachment: React.FC<FileAttachmentProps> = ({ label, backgroundColor, onFileSelect }) => {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setFileName(file.name);
      if (onFileSelect) {
        onFileSelect(file);
      }
    }
  };

  return (
    <div className={styles.fileAttachmentContainer} style={{ backgroundColor }}>
      <span className={styles.labelAnexo}>{label}</span>
      <div className={styles.fileUpdateContent}>
        {fileName && (
          <span className={styles.fileName}>
            <FileOutlined style={{ color: "red", paddingLeft: "5px" }} /> {fileName}
            <button className={styles.buttonRemoveUpload} onClick={() => setFileName(null)}>
              x
            </button>
          </span>
        )}
        <label className={styles.buttonUpdateNfSale}>
          <input type="file" style={{ display: "none" }} onChange={handleFileChange} />
          Adicionar Anexo
        </label>
      </div>
    </div>
  );
};

const NewRequestGarantiasDialog: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState(FilterStatus.GARANTIAS);
  const [indicatorWidth, setIndicatorWidth] = useState(0);
  const [garantiasFieldsFilled, setGarantiasFieldsFilled] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const garantiaButtonRef = useRef<HTMLButtonElement>(null);
  const acordoButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const context = useContext(AuthContext);
  const location = useLocation();
  const garantiaIdFromState =
    location.state && "garantiaId" in location.state
      ? (location.state as { garantiaId: string }).garantiaId
      : null;

  // Gera o próximo RGI baseado nas garantias existentes
  const generateNextRGI = async () => {
    try {
      const response = await api.get("/garantias");
      const allGarantias = response.data.data || [];
      const existingRGIs = allGarantias
        .map((g: any) => g.rgi)
        .filter((rgi: string) => rgi?.startsWith(context.user.codigoCigam))
        .map((rgi: string) => parseInt(rgi.split('-')[1]));
      const lastNumber = Math.max(0, ...existingRGIs);
      const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
      return `${context.user.codigoCigam}-${nextNumber}`;
    } catch (error) {
      console.error('Erro ao gerar RGI:', error);
      return `${context.user.codigoCigam}-0001`;
    }
  };

  // Estado para armazenar o arquivo selecionado
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  let numNota: string = '';

  const handleSubmit = async (values: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      if (currentTab === FilterStatus.ACORDO) {
        navigate('/acordo-commercial', {
          state: { "N° NF de origem": values["N° NF de origem"] }
        });
        return;
      }

      const newRGI = await generateNextRGI();

      // 1. Gere o ID do item de garantia
      const garantiaItemId = crypto.randomUUID();

      // 2. Construa o item de garantia
      const garantiaItem: GarantiaItem = {
        codigoItem: "000920000090",
        tipoDefeito: "Defeito mecânico",
        modeloVeiculoAplicado: "veiculo XYZ",
        torqueAplicado: 100,
        nfReferencia: values["N° NF de origem"],
        loteItemOficial: "LOTE123",
        loteItem: "LOTE456",
        codigoStatus: GarantiasStatusEnum2.NAO_ENVIADO,
        solicitarRessarcimento: false,
        id: garantiaItemId,
        rgi: context.user.codigoCigam,
        status: GarantiasStatusEnum2.NAO_ENVIADO.toString(),
        codigoPeca: ''
      };

      // 3. Construa o objeto garantiaModel
      const garantiaPayload: GarantiasModel = {
        rgi: newRGI,
        razaoSocial: "Empresa XYZ",
        telefone: "+55 11 98765-4321",
        email: "cliente@empresa.com",
        nf: values["N° NF de origem"],
        fornecedor: "Fornecedor ABC",
        codigoStatus: GarantiasStatusEnum2.NAO_ENVIADO,
        observacao: "Garantia válida por 12 meses",
        usuarioInsercao: "66001",
        itens: [garantiaItem],
      };

      console.log('Enviando garantiaModel:', JSON.stringify(garantiaPayload, null, 2));

      // 4. Cria a garantia via API
      const guaranteeResponse = await createGarantiaAsync(garantiaPayload);
      console.log('Garantia criada com sucesso:', guaranteeResponse.data);

      let createdGarantia: any = guaranteeResponse.data.data;
      // Se a resposta for uma string, extraia o id
      if (typeof createdGarantia === 'string') {
        const match = createdGarantia.match(/id:([^\s]+)/);
        if (match && match[1]) {
          createdGarantia = { id: match[1] };
        } else {
          console.error('Invalid response format:', guaranteeResponse);
          throw new Error('Resposta inválida da API ao criar garantia');
        }
      }

      if (!createdGarantia || !createdGarantia.id) {
        console.error('Invalid response:', guaranteeResponse);
        throw new Error('Resposta inválida da API ao criar garantia');
      }

      // 5. Se houver arquivo selecionado, faça o upload
      if (selectedFile) {
        const fileData = new FormData();
        fileData.append("file", selectedFile);
        fileData.append("userId", String(context.user.id));
        fileData.append("garantia_item_id", garantiaItemId);
        const uploadResponse = await api.post("/files/upload-private-file", fileData);
        console.log("Arquivo enviado com sucesso:", uploadResponse.data.fileName);
      }

      // Redireciona para a tela de detalhes, passando os dados via state
      navigate(`/garantias/rgi/details-itens-nf/${createdGarantia.id}`, {
        state: {
          garantiaData: { ...garantiaPayload, id: createdGarantia.id },
          garantiaId: createdGarantia.id,
          currentNf: {
            nf: values["N° NF de origem"],
            itens: garantiaPayload.itens?.length || 0,
            sequence: 1,
          },
          rgiLetter: 'A',
        }
      });
    } catch (error: any) {
      console.error('Erro ao criar garantia:', error.response?.data || error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTabChange = (tab: FilterStatus) => {
    setCurrentTab(tab);
  };

  const handleFieldChange = (changedValues: unknown, allValues: any) => {
    if (currentTab === FilterStatus.GARANTIAS) {
      const isFilled = !!allValues['N° NF de origem'];
      setGarantiasFieldsFilled(isFilled);
    }
  };

  const onChangeValueNumNota = (evt: React.ChangeEvent<HTMLInputElement>) => {
    numNota = evt.target.value;
  };

  useEffect(() => {
    const activeButtonRef = currentTab === FilterStatus.GARANTIAS ? garantiaButtonRef : acordoButtonRef;
    if (activeButtonRef.current) {
      setIndicatorWidth(activeButtonRef.current.offsetWidth);
    }
  }, [currentTab]);

  // Se necessário, carregue dados previamente salvos (opcional)
  useEffect(() => {
    const loadGarantiaData = async () => {
      try {
        let data: GarantiasModel | null = null;
        if (location.state && "garantiaData" in location.state) {
          data = (location.state as { garantiaData: GarantiasModel }).garantiaData;
        } else if (garantiaIdFromState) {
          const response = await getGarantiaByIdAsync(garantiaIdFromState);
          data = response.data;
        }
        if (data) {
          // Se quiser atualizar algum estado com esses dados, faça-o aqui.
        }
      } catch (error) {
        console.error("Error loading garantia data:", error);
      }
    };

    loadGarantiaData();
  }, [location.state, garantiaIdFromState]);

  return (
    <div className={styles.container}>
      <header style={{ display: 'flex', flexDirection: 'column' }}>
        <div className={styles.header}>
          <h2>NOVA SOLICITAÇÃO</h2>
          <div className={styles.tabsContainer}>
            <button
              ref={garantiaButtonRef}
              className={`${styles.tabButton} ${currentTab === FilterStatus.GARANTIAS ? styles.active : ''}`}
              onClick={() => handleTabChange(FilterStatus.GARANTIAS)}
            >
              Garantia
            </button>
            <button
              ref={acordoButtonRef}
              className={`${styles.tabButton} ${currentTab === FilterStatus.ACORDO ? styles.active : ''}`}
              onClick={() => handleTabChange(FilterStatus.ACORDO)}
            >
              Acordo
            </button>
            <div
              className={styles.tabsIndicator}
              style={{
                left: currentTab === FilterStatus.GARANTIAS ? '1.4%' : '54%',
                width: `${indicatorWidth + 4}px`
              }}
            >
              <div className={styles.tabsIndicatorInner}></div>
            </div>
          </div>
        </div>
        <Divider style={{ margin: '0' }} />
      </header>
      <main className={styles.main}>
        <Form
          id="new-request-form"
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ garantiaTipo: 'rgi' }}
          onValuesChange={handleFieldChange}
        >
          {currentTab === FilterStatus.GARANTIAS && (
            <div className={styles.requiredFieldsContainer}>
              {!garantiasFieldsFilled && (
                <p className={styles.requiredFields}>
                  Preencha todos os campos obrigatórios para salvar
                </p>
              )}
              <h3>RGI N° {context.user.codigoCigam}</h3>
              <Form.Item
                style={{ margin: 0 }}
                name="N° NF de origem"
                rules={[{ required: true, message: 'Este campo é obrigatório' }]}
              >
                <Input
                  onChange={onChangeValueNumNota}
                  size="large"
                  placeholder="N° NF de origem"
                  style={{
                    height: '55px',
                    fontSize: '18px',
                    borderRadius: '15px'
                  }}
                  className={styles.input}
                />
              </Form.Item>
              <Upload.Dragger
                name="file"
                multiple={false}
                fileList={fileList}
                showUploadList={{
                  showRemoveIcon: true,
                  showDownloadIcon: false
                }}
                onRemove={() => {
                  setFileList([]);
                  setSelectedFile(null);
                }}
                beforeUpload={(file) => {
                  setSelectedFile(file);
                  setFileList([{
                    uid: '-1',
                    name: file.name,
                    status: 'done',
                    url: URL.createObjectURL(file)
                  }]);
                  return false;
                }}
                style={{
                  background: '#f5f5f5',
                  border: '2px dashed #d9d9d9',
                  borderRadius: '8px',
                  padding: '20px',
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                }}
              >
                {fileList.length === 0 && (
                  <>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined style={{ color: '#ff0000', fontSize: '32px' }} />
                    </p>
                    <p className="ant-upload-text" style={{ color: '#595959' }}>
                      Anexo da NF de venda *
                    </p>
                    <p className="ant-upload-hint" style={{ color: '#8c8c8c' }}>
                      Clique ou arraste o arquivo para esta área
                    </p>
                  </>
                )}
              </Upload.Dragger>
            </div>
          )}
          {currentTab === FilterStatus.ACORDO && (
            <div className={styles.requiredFieldsContainer}>
              <h3>ACI N° 000666-00150</h3>
              <Form.Item
                style={{ margin: 0 }}
                name="N° NF de origem"
                rules={[{ required: true, message: 'Este campo é obrigatório' }]}
              >
                <Input
                  size="large"
                  placeholder="N° NF de origem"
                  style={{
                    height: '55px',
                    fontSize: '18px',
                    borderRadius: '15px'
                  }}
                  className={styles.input}
                />
              </Form.Item>
            </div>
          )}
        </Form>
      </main>
      <footer className={styles.footer}>
        <Button
          className={`${styles.button} ${styles.secondary}`}
          type="default"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          className={`${styles.button} ${styles.primary}`}
          type="primary"
          htmlType="submit"
          form="new-request-form"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enviando...' : 'Criar'}
        </Button>
      </footer>
    </div>
  );
};

export default NewRequestGarantiasDialog;
