/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Divider, Form } from "antd";
import { Input } from "@shared/components/input/index.tsx";
import styles from "./new-request-garantias.module.css";
import {
  GarantiasItemStatusEnum,
  GarantiasItemStatusEnum2,
  GarantiasStatusEnum2,
} from "@shared/enums/GarantiasStatusEnum";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";
import { GarantiasModel, GarantiaItem } from "@shared/models/GarantiasModel";
import {
  createGarantiaAsync,
  getGarantiaByIdAsync,
} from "@shared/services/GarantiasService";
import api from "@shared/Interceptors";
import { FileOutlined, InboxOutlined } from "@ant-design/icons";
import { NotaFiscal } from "@shared/models/NotaFiscalModel";
import environment from "@env/environment";
import {
  AcordoComercialItem,
  AcordoComercialModel,
} from "@shared/models/AcordoComercialModel";
import {
  AcordoComercialItemStatusEnum2,
  AcordoComercialStatusEnum2,
  AcordoComercialItemStatusEnum,
  AcordoStatusEnum,
} from "@shared/enums/AcordoComercialStatusEnum";
import { createAcordoAsync } from "@shared/services/AcordoComercialService";

// Enum para controlar as abas
enum FilterStatus {
  GARANTIAS = "garantias",
  ACORDO = "acordo",
}

const NewRequestGarantiasDialog: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState(FilterStatus.GARANTIAS);
  const [indicatorWidth, setIndicatorWidth] = useState(0);
  const [garantiasFieldsFilled, setGarantiasFieldsFilled] = useState(false);
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
        .map((rgi: string) => parseInt(rgi.split("-")[1]));
      const lastNumber = Math.max(0, ...existingRGIs);
      const nextNumber = (lastNumber + 1).toString().padStart(4, "0");
      return `${context.user.codigoCigam}-${nextNumber}`;
    } catch (error) {
      console.error("Erro ao gerar RGI:", error);
    }
  };

  const generateNextACI = async () => {
    try {
      const data = {
        page: 1,
        limit: 100,
      };
      const response = await api.post("/acordos/ACI/getAll", data);
      
      const allGarantias = response.data.data.data || [];
      let existingACIs = allGarantias
        .map((g: any) => g.cdAci)
        .filter((cdAci: string) => cdAci?.startsWith(context.user.codigoCigam))
      if(existingACIs){
        //console.log("responseACI: ", existingACIs);
        existingACIs = existingACIs.map((cdAci: string) => parseInt(cdAci.split("-")[1]));
      }
        
      
        //console.log("responseACI: ", existingACIs);
        const lastNumber = Math.max(0, ...existingACIs);
      const nextNumber = (lastNumber + 1).toString().padStart(4, "0");
      const newAci = `${context.user.codigoCigam}-${nextNumber}`;
      //console.log(newAci);

      if (newAci.includes("undefined"))
        return `${context.user.codigoCigam}-0001`;
      else return `${context.user.codigoCigam}-${nextNumber}`;
    } catch (error) {
      console.error("Erro ao gerar RGI:", error);
    }
  };

  // Estado para armazenar o arquivo selecionado
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let numNota: string = "";

  const handleSubmit = async (values: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      if (currentTab === FilterStatus.ACORDO) {
        const newACI = await generateNextACI();
        
        //console.log("user: ", context.user.codigoCigam);

        const itemAcordoPost: AcordoComercialItem = {
          id: "",
          codigoItem: newACI + ".A.1",
          codigoPeca: "",
          precoUnitario: 0,
          quantidade: 0,
          codigoStatus: AcordoComercialItemStatusEnum2.NAO_ENVIADO,
          valorTotalItem: 0,
          tipoOperacao: "CIF",
          baseICMS: 0,
          valorICMS: 0,
          valorIPI: 0,
          ICMS: 0,
          IPI: 0,
          mva: 0,
          nf: values["N° NF de origem"],
          tipoDefeitoOficial: ''
        };

        const payloadAcordoPost: AcordoComercialModel = {
          codigoCigam: context.user.codigoCigam,
          razaoSocial: context.user.fullname,
          telefone: context.user.phone,
          email: context.user.email,
          codigoStatus: AcordoComercialStatusEnum2.NAO_ENVIADO,
          observacao: "ACI para tratamento de acordos",
          usuarioInsercao: context.user.username,
          baseICMS: 0,
          ICMS: 0,
          valorIPI: 0,
          ICMSSubstituicao: 0,
          itens: [itemAcordoPost],
          duplicata: ''
        };
        //console.log("payloadAcordoPost:", payloadAcordoPost);

        const aciResponse = await createAcordoAsync(payloadAcordoPost);
        //console.log("ACI criada com sucesso:", aciResponse.data.data);

        let createdAcordo: any = aciResponse.data.data;
        if (typeof createdAcordo === "string") {
          const match = createdAcordo.match(/id:([^\s]+)/);
          if (match && match[1]) {
            createdAcordo = { id: match[1] };
          } else {
            console.error("Invalid response format:", aciResponse);
            throw new Error("Resposta inválida da API ao criar garantia");
          }
        }

        if (!createdAcordo || !createdAcordo.id) {
          console.error("Invalid response:", aciResponse);
          throw new Error("Resposta inválida da API ao criar garantia");
        }

        navigate(`/garantias/aci/${createdAcordo.id}`, {
          state: { item: createdAcordo },
        });
        return;
      } else {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");
        const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

        const newRGI = await generateNextRGI();
        const itemId = crypto.randomUUID();
        const notaFiscalId = crypto.randomUUID();

        const garantiasItem: GarantiaItem[] = [
          {
            id: itemId,
            nota_fiscal_id: notaFiscalId,
            codigoItem: newRGI + ".A.1",
            codigoRGI: newRGI + ".A",
            nfReferencia: values["N° NF de origem"],
            codigoStatus: GarantiasItemStatusEnum2.NAO_ANALISADO,
            status: GarantiasItemStatusEnum.NAO_ANALISADO,
          },
        ];

        const notasFiscais: NotaFiscal[] = [
          {
            id: notaFiscalId,
            garantia_id: itemId,
            codigo: values["N° NF de origem"],
            codigoRGI: newRGI + ".A",
            tipo_nota: "nota fiscal de origem",
            id_referencia: notaFiscalId,
            itens: garantiasItem,
            data_emissao: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`,
            data_atualizacao: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`,
            createdAt: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`,
            updatedAt: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`,
            observacao: ""
          },
        ];

        const garantiaPayload: GarantiasModel = {
          codigoRGI: newRGI,
          razaoSocial: context.user.fullname,
          telefone: context.user.phone,
          email: context.user.email,
          nf: values["N° NF de origem"],
          fornecedor: context.user.codigoCigam,
          codigoStatus: GarantiasStatusEnum2.NAO_ENVIADO,
          observacao: "Garantia válida por 12 meses",
          usuarioInsercao: context.user.username,
          notas: notasFiscais,
          frete: null,
          duplicata: ""
        };

        //console.log(
        //   "Enviando garantiaModel:",
        //   JSON.stringify(garantiaPayload, null, 2)
        // );

        // 4. Cria a garantia via API
        const guaranteeResponse = await createGarantiaAsync(garantiaPayload);
        //console.log("Garantia criada com sucesso:", guaranteeResponse.data);

        let createdGarantia: any = guaranteeResponse.data.data;
        if (typeof createdGarantia === "string") {
          const match = createdGarantia.match(/id:([^\s]+)/);
          if (match && match[1]) {
            createdGarantia = { id: match[1] };
          } else {
            console.error("Invalid response format:", guaranteeResponse);
            throw new Error("Resposta inválida da API ao criar garantia");
          }
        }

        if (!createdGarantia || !createdGarantia.id) {
          console.error("Invalid response:", guaranteeResponse);
          throw new Error("Resposta inválida da API ao criar garantia");
        }

        navigate(`/garantias/rgi/details-itens-nf/${createdGarantia.id}`, {
          state: {
            garantiaData: { ...garantiaPayload, id: createdGarantia.id },
            garantiaId: createdGarantia.id,
            currentNf: {
              nf: newRGI + ".A.1",
              itens: garantiaPayload.notas?.length || 0,
              sequence: 1,
            },
            countItems: 1,
            nfNumber: values["N° NF de origem"],
            rgiLetter: "A",
            nota: garantiaPayload.notas[0],
          },
        });
      }
    } catch (error: any) {
      console.error("Erro ao criar garantia:", error.response?.data || error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTabChange = (tab: FilterStatus) => {
    setCurrentTab(tab);
  };

  const handleFieldChange = (changedValues: unknown, allValues: any) => {
    if (currentTab === FilterStatus.GARANTIAS) {
      const isFilled = !!allValues["N° NF de origem"];
      setGarantiasFieldsFilled(isFilled);
    }
  };

  const onChangeValueNumNota = (evt: React.ChangeEvent<HTMLInputElement>) => {
    numNota = evt.target.value;
  };

  useEffect(() => {
    //console.log(currentTab);
    
    const activeButtonRef =
      currentTab === FilterStatus.GARANTIAS
        ? garantiaButtonRef
        : acordoButtonRef;
    if (activeButtonRef.current) {
      setIndicatorWidth(activeButtonRef.current.offsetWidth);
    }
  }, [currentTab]);

  useEffect(() => {
    const loadGarantiaData = async () => {
      try {
        let data: GarantiasModel | null = null;
        if (location.state && "garantiaData" in location.state) {
          data = (location.state as { garantiaData: GarantiasModel })
            .garantiaData;
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
      <header style={{ display: "flex", flexDirection: "column" }}>
        <div className={styles.header}>
          <h2>NOVA SOLICITAÇÃO</h2>
          <div className={styles.tabsContainer}>
            <button
              ref={garantiaButtonRef}
              className={`${styles.tabButton} ${
                currentTab === FilterStatus.GARANTIAS ? styles.active : ""
              }`}
              onClick={() => handleTabChange(FilterStatus.GARANTIAS)}
            >
              Garantia
            </button>
            <button
              ref={acordoButtonRef}
              className={`${styles.tabButton} ${
                currentTab === FilterStatus.ACORDO ? styles.active : ""
              }`}
              onClick={() => handleTabChange(FilterStatus.ACORDO)}
            >
              Acordo
            </button>
            <div
              className={styles.tabsIndicator}
              style={{
                left: currentTab === FilterStatus.GARANTIAS ? "1.4%" : "54%",
                width: `${indicatorWidth + 4}px`,
              }}
            >
              <div className={styles.tabsIndicatorInner}></div>
            </div>
          </div>
        </div>
        <Divider style={{ margin: "0" }} />
      </header>
      <main className={styles.main}>
        <Form
          id="new-request-form"
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ garantiaTipo: "rgi" }}
          onValuesChange={handleFieldChange}
        >
          {currentTab === FilterStatus.GARANTIAS && (
            <div className={styles.requiredFieldsContainer}>
              {!garantiasFieldsFilled && (
                <p className={styles.requiredFields}>
                  Preencha todos os campos obrigatórios para salvar
                </p>
              )}
              <Form.Item
                style={{ margin: 0 }}
                name="N° NF de origem"
                rules={[
                  { required: true, message: "Este campo é obrigatório" },
                ]}
              >
                <Input
                  onChange={onChangeValueNumNota}
                  size="large"
                  placeholder="N° NF de origem"
                  style={{
                    height: "55px",
                    fontSize: "18px",
                    borderRadius: "15px",
                  }}
                  className={styles.input}
                />
              </Form.Item>
            </div>
          )}
          {currentTab === FilterStatus.ACORDO && (
            <div className={styles.requiredFieldsContainer}>
              <Form.Item
                style={{ margin: 0 }}
                name="N° NF de origem"
                rules={[
                  { required: true, message: "Este campo é obrigatório" },
                ]}
              >
                <Input
                  size="large"
                  placeholder="N° NF de origem"
                  style={{
                    height: "55px",
                    fontSize: "18px",
                    borderRadius: "15px",
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
          {isSubmitting ? "Enviando..." : "Criar"}
        </Button>
      </footer>
    </div>
  );
};

export default NewRequestGarantiasDialog;
