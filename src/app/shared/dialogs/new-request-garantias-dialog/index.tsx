import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Divider, Form } from 'antd';
import { Input } from "@shared/components/input/index.tsx";
import styles from './new-request-garantias.module.css';
import api from '@shared/Interceptors/index.ts';

enum FilterStatus {
  GARANTIAS = 'garantias',
  ACORDO = 'acordo',
}

const NewRequestGarantiasDialog = ({ onClose }: { onClose: () => void }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState(FilterStatus.GARANTIAS);
  const [indicatorWidth, setIndicatorWidth] = useState(0);
  const [garantiasFieldsFilled, setGarantiasFieldsFilled] = useState(false);
  const garantiaButtonRef = useRef<HTMLButtonElement>(null);
  const acordoButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const handleSubmit = async (values: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      console.log('Criando solicitação:', values);
      if (currentTab === FilterStatus.ACORDO) {
        // Recupera o valor digitado no input "N° NF de origem" e envia para a tela de Acordo Comercial
        navigate('/acordo-comercial', { state: { 'N° NF de origem': values['N° NF de origem'] } });
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTabChange = (tab: FilterStatus) => {
    setCurrentTab(tab);
  };

  const handleFieldChange = (changedValues: unknown, allValues: unknown) => {
    if (currentTab === FilterStatus.GARANTIAS) {
      const isFilled = !!allValues['N° NF de origem'] && !!allValues['garantiaAnexo'];
      setGarantiasFieldsFilled(isFilled);
    }
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
                width: `${indicatorWidth + 4}px`,
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
          id="new-request-form" // adicionado id para vinculação do botão submit
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
                    borderRadius: '15px',
                  }}
                  className={styles.input}
                />
              </Form.Item>
              <Form.Item
                style={{ margin: 0 }}
                name="garantiaAnexo"
                valuePropName="fileList"
                getValueFromEvent={(e) => e?.fileList}
                rules={[{ required: true, message: 'Anexo é obrigatório' }]}
              >
                <div className={styles.anexoVenda}>
                  <p>Anexo da NF de venda</p>
                  <Button
                    className={`${styles.button} ${styles.secondary}`}
                    type="default"
                    onClick={() => document.getElementById('garantiaFileInput')?.click()}
                  >
                    ANEXAR
                  </Button>
                  <input
                    id="garantiaFileInput"
                    type="file"
                    style={{ display: 'none' }}
                    accept=".pdf,.png,.jpg"
                  />
                </div>
              </Form.Item>
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
                    borderRadius: '15px',
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
          form="new-request-form" // vincula o botão ao formulário pelo id
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
