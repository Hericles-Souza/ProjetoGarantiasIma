import {useEffect, useRef, useState} from 'react';
import {Button, Divider, Form, Tag} from 'antd';
import {FileOutlined} from '@ant-design/icons'; // Importe os ícones necessários
import styles from './new-request-garantias.module.css';
import {Input} from "@shared/components/input/index.tsx";

enum FilterStatus {
  GARANTIAS = 'garantias',
  ACORDO = 'acordo',
}

const NewRequestGarantiasDialog = ({onClose}: { onClose: () => void }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState(FilterStatus.GARANTIAS);
  const [indicatorWidth, setIndicatorWidth] = useState(0);
  const [garantiasFieldsFilled, setGarantiasFieldsFilled] = useState(false);
  const [acordoFieldsFilled, setAcordoFieldsFilled] = useState(false);
  const [fileInputValue, setFileInputValue] = useState<string | null>(null); // Para armazenar o arquivo selecionado
  const garantiaButtonRef = useRef<HTMLButtonElement>(null);
  const acordoButtonRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      console.log('Criando solicitação:', values);
      onClose();
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTabChange = (tab: FilterStatus) => {
    setCurrentTab(tab);
  };

  const handleFieldChange = (changedValues: any, allValues: any) => {
    if (currentTab === FilterStatus.GARANTIAS) {
      const isFilled = !!allValues['N° NF de origem'] && !!allValues['garantiaAnexo'];
      setGarantiasFieldsFilled(isFilled);
    } else if (currentTab === FilterStatus.ACORDO) {
      const isFilled = !!allValues['N° NF de origem'] && !!allValues['acordoAnexo'];
      setAcordoFieldsFilled(isFilled);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
    const file = e.target.files?.[0] || null;
    setFileInputValue(file ? file.name : null); // Atualiza o nome do arquivo selecionado
    form.setFieldsValue({[name]: file}); // Atualiza o campo do formulário com o arquivo selecionado
  };

  const handleDeleteFile = () => {
    setFileInputValue(null); // Reseta o nome do arquivo
    form.setFieldsValue({garantiaAnexo: null}); // Remove o arquivo do campo do formulário
  };

  useEffect(() => {
    const activeButtonRef =
      currentTab === FilterStatus.GARANTIAS ? garantiaButtonRef : acordoButtonRef;

    if (activeButtonRef.current) {
      setIndicatorWidth(activeButtonRef.current.offsetWidth);
    }
  }, [currentTab]);

  return (
    <div className={styles.container}>
      <header style={{display: 'flex', flexDirection: 'column'}}>
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
                width: `${indicatorWidth + 4}px`,
              }}
            >
              <div className={styles.tabsIndicatorInner}></div>
            </div>
          </div>
        </div>
        <Divider style={{margin: '0'}}/>
      </header>
      <main className={styles.main}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            garantiaTipo: 'rgi',
          }}
          onValuesChange={handleFieldChange}
        >
          {currentTab === FilterStatus.GARANTIAS && (
            <div className={styles.requiredFieldsContainer}>
              {currentTab === FilterStatus.GARANTIAS && !garantiasFieldsFilled && (
                <p className={styles.requiredFields}>
                  Preencha todos os campos obrigatórios para salvar
                </p>
              )}
              <h3>RGI N° 000666-00147</h3>
              <Form.Item
                style={{margin: 0}}
                name="N° NF de origem"
                rules={[{required: true, message: 'Este campo é obrigatório'}]}
              >
                <Input
                  size="large"
                  placeholder="N° NF de origem"
                  style={{
                    height: '55px',
                    fontSize: '18px',
                    borderRadius: '15px',
                  }}
                  className={styles.input}
                />
              </Form.Item>
              <Form.Item
                style={{margin: 0}}
                name="garantiaAnexo"
                valuePropName="fileList"
                getValueFromEvent={(e) => e?.fileList}
                rules={[{required: true, message: 'Anexo é obrigatório'}]}
              >
                <div className={styles.anexoVenda}>
                  <p>Anexo da NF de venda</p>
                  {fileInputValue && (
                    <Tag
                      className={styles.tag}
                      icon={<FileOutlined style={{color: "#FF0000"}}/>}
                      closable
                      onClose={handleDeleteFile}
                    >
                      {fileInputValue.length > 20 ? `${fileInputValue.slice(0, 20)}...` : fileInputValue}
                    </Tag>
                  )}
                  <Button
                    className={`${styles.button} ${styles.secondary}`}
                    type="default"
                    onClick={() => document.getElementById('garantiaFileInput')?.click()} // Aciona o clique no input de arquivo
                  >
                    ANEXAR
                  </Button>
                  <input
                    id="garantiaFileInput"
                    type="file"
                    style={{display: 'none'}}
                    accept=".pdf,.png,.jpg"
                    onChange={(e) => handleFileChange(e, 'garantiaAnexo')}
                  />
                </div>
              </Form.Item>
            </div>
          )}

          {currentTab === FilterStatus.ACORDO && (
            <div className={styles.requiredFieldsContainer}>
              {currentTab === FilterStatus.ACORDO && !acordoFieldsFilled && (
                <p className={styles.requiredFields}>
                  Preencha todos os campos obrigatórios para salvar
                </p>
              )}
              <h3>ACI N° 000666-00150</h3>
              <Form.Item
                style={{margin: 0}}
                name="N° NF de origem"
                rules={[{required: true, message: 'Este campo é obrigatório'}]}
              >
                <Input
                  size="large"
                  placeholder="N° NF de origem"
                  style={{
                    height: '55px',
                    fontSize: '18px',
                    borderRadius: '15px',
                  }}
                  className={styles.input}
                />
              </Form.Item>
              <Form.Item
                style={{margin: 0}}
                name="acordoAnexo"
                valuePropName="fileList"
                getValueFromEvent={(e) => e?.fileList}
                rules={[{required: true, message: 'Anexo é obrigatório'}]}
              >
                <div className={styles.anexoVenda}>
                  <p>Anexo da NF de venda</p>
                  {fileInputValue && (
                    <Tag
                      className={styles.tag}
                      icon={<FileOutlined style={{color: "#FF0000"}}/>}
                      closable
                      onClose={handleDeleteFile}
                    >
                      {fileInputValue.length > 20 ? `${fileInputValue.slice(0, 20)}...` : fileInputValue}
                    </Tag>
                  )}
                  <Button
                    className={`${styles.button} ${styles.secondary}`}
                    type="default"
                    onClick={() => document.getElementById('acordoFileInput')?.click()} // Aciona o clique no input de arquivo
                  >
                    ANEXAR
                  </Button>
                  <input
                    id="acordoFileInput"
                    type="file"
                    style={{display: 'none'}}
                    accept=".pdf,.png,.jpg"
                    onChange={(e) => handleFileChange(e, 'acordoAnexo')}
                  />
                </div>
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
