/* eslint-disable @typescript-eslint/no-unused-vars */
import { useContext, useEffect, useState } from "react";
import { Table, Typography, Row, Col, Card, Button, message } from "antd";
import styles from "./ViewPreInvoice.module.css";
import { LeftOutlined } from "@ant-design/icons";
import OutlinedInputWithLabel from "@shared/components/input-outlined-with-label/OutlinedInputWithLabel";
import { PedidoModel, FormPedidoModel } from "@shared/models/PedidosModel";
import environment from "@env/environment";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";
import { useLocation } from "react-router-dom";
import { GarantiaItem } from "@shared/models/GarantiasModel";
import { AcordoComercialItem } from "@shared/models/AcordoComercialModel";

const { Title } = Typography;

// Função para extrair o conteúdo de strings mal formatadas
const unwrap = (raw: string): string =>
  raw.replace(/^{|}$/g, "").replace(/(^"|"$)/g, "");

const InvoicePage = () => {
  const [data, setData] = useState<PedidoModel[]>([]);
  const [notaFiscal, setNotaFiscal] = useState<string>();
  const [notaFiscalId, setNotaFiscalId] = useState<string>();
  const [isAcordo, setIsAcordo] = useState<boolean>(false);
  const authContext = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {

    if (location.state?.notaFiscal?.codigo) {
      setNotaFiscal(location.state.notaFiscal.rgi);
      setNotaFiscalId(location.state.notaFiscal.id);
    } else if (location.state?.acordo) {
      setNotaFiscal("");
      setNotaFiscalId(location.state.codigoNotaFiscal);
      setIsAcordo(true);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (!notaFiscalId) return;


      try {
        if (isAcordo) {

          const resp = await fetch(`${environment.apiUrl}/pedidos/pedidos/by-codigo/${notaFiscalId}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authContext.user.token}`,
              Accept: "application/json",
            },
          });

          if (resp.ok) {
            const json = await resp.json();
            const pedidos: PedidoModel[] = json.data.map((item: PedidoModel) => ({
              id: item.id,
              cdPedido: unwrap(item.cdPedido),
              cdMaterial: unwrap(item.cdMaterial),
              descricao: unwrap(item.descricao),
              cdTipoOperaca: unwrap(item.cdTipoOperaca),
              dtPedido: item.dtPedido,
              cdCliente: item.cdCliente,
              valorICMS: parseFloat(item.valorICMS.toString()),
              valorICMSST: parseFloat(item.valorICMSST.toString()),
              valorBCST: parseFloat(item.valorBCST.toString()),
              valorIRRF: parseFloat(item.valorIRRF.toString()),
              valorISS: parseFloat(item.valorISS.toString()),
              valorIPI: parseFloat(item.valorIPI.toString()),
              baseICMS: parseFloat(item.baseICMS.toString()),
              baseIPI: parseFloat(item.baseIPI.toString()),
              baseISS: parseFloat(item.baseISS.toString()),
              prUnitario: parseFloat(item.prUnitario.toString()),
              quantidade: parseFloat(item.quantidade.toString()),
              vlTotalItemL: parseFloat(item.vlTotalItemL.toString()),
              mva: item.mva,
              nota_fiscal_id: item.nota_fiscal_id,
            }));

            const codigosPeca = location.state.acordo?.itens?.map((i: AcordoComercialItem) => i.codigoPeca) || [];

            const pedidosFiltrados = pedidos.filter(p => codigosPeca.includes(p.cdMaterial));
            setData(pedidosFiltrados);

            const soma = (k: keyof PedidoModel) => pedidosFiltrados.reduce((acc, p) => acc + (p[k] as number), 0);
            setFormData({
              baseICMS: soma("baseICMS").toFixed(2),
              valorICMS: soma("valorICMS").toFixed(2),
              valorICMSST: soma("valorICMSST").toFixed(2),
              valorBCST: soma("valorBCST").toFixed(2),
              baseICMSSubstituicao: soma("baseISS").toFixed(2),
              valorICMSSubstituicao: soma("valorISS").toFixed(2),
              valorProdutos: soma("prUnitario").toFixed(2),
              valorIPI: soma("valorIPI").toFixed(2),
              valorNota: soma("vlTotalItemL").toFixed(2),
              aliquotaInterna: soma("aliquotaInterna").toFixed(2),
              numeroNFOrigem: "",
              dataNFOrigem: "",
            });
            setHasXML(true);
          } else {
            message.error("Falha ao buscar os dados da nota fiscal.");
          }
        }
        else {
          const resp = await fetch(`${environment.apiUrl}/pedidos/pedidos/${notaFiscalId}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authContext.user.token}`,
              Accept: "application/json",
            },
          });

          if (resp.ok) {
            const json = await resp.json();

            const pedidos: PedidoModel[] = json.map((item: PedidoModel) => ({
              id: item.id,
              cdPedido: unwrap(item.cdPedido),
              cdMaterial: unwrap(item.cdMaterial),
              descricao: unwrap(item.descricao),
              cdTipoOperaca: unwrap(item.cdTipoOperaca),
              dtPedido: item.dtPedido,
              cdCliente: item.cdCliente,
              valorICMS: parseFloat(item.valorICMS.toString()) / parseFloat(item.quantidade.toString()),
              valorICMSST: parseFloat(item.valorICMSST.toString()) / parseFloat(item.quantidade.toString()),
              valorBCST: parseFloat(item.valorBCST.toString()) / parseFloat(item.quantidade.toString()),
              valorIRRF: parseFloat(item.valorIRRF.toString()),
              valorISS: parseFloat(item.valorISS.toString()),
              valorIPI: parseFloat(item.valorIPI.toString()) / parseFloat(item.quantidade.toString()),
              baseICMS: parseFloat(item.baseICMS.toString()) / parseFloat(item.quantidade.toString()),
              baseIPI: parseFloat(item.baseIPI.toString()),
              baseISS: parseFloat(item.baseISS.toString()),
              prUnitario: parseFloat(item.prUnitario.toString()),
              quantidade: parseFloat(item.quantidade.toString()) / parseFloat(item.quantidade.toString()),
              vlTotalItemL:
                (parseFloat(item.vlTotalItemL.toString()) / parseFloat(item.quantidade.toString())) +
                (parseFloat(item.valorIPI.toString()) / parseFloat(item.quantidade.toString())) +
                (parseFloat(item.valorICMSST.toString()) / parseFloat(item.quantidade.toString())),
              aliquotaInterna: parseFloat(item.valorPICMS.toString()),
              mva: item.mva,
              nota_fiscal_id: item.nota_fiscal_id,
            }));

            // Extrai os códigos dos itens da nota fiscal
            const codigosPeca = json[0]?.notaFiscal?.itens?.map((i: GarantiaItem) => i.codigoPeca) || [];

            // Filtra pedidos que têm cdMaterial incluído nos códigos de peça
            const pedidosFiltrados = pedidos.filter(p => codigosPeca.includes(p.cdMaterial));
            setData(pedidosFiltrados);

            const soma = (k: keyof PedidoModel) => pedidosFiltrados.reduce((acc, p) => acc + (p[k] as number), 0);
            setFormData({
              baseICMS: soma("baseICMS").toFixed(2),
              valorICMS: soma("valorICMS").toFixed(2),
              valorICMSST: soma("valorICMSST").toFixed(2),
              valorBCST: soma("valorBCST").toFixed(2),
              baseICMSSubstituicao: soma("valorICMSST").toFixed(2),
              valorICMSSubstituicao: soma("valorBCST").toFixed(2),
              valorProdutos: soma("prUnitario").toFixed(2),
              valorIPI: soma("valorIPI").toFixed(2),
              valorNota: parseFloat((soma("vlTotalItemL").toFixed(2) + soma("valorBCST").toFixed(2) + soma("valorIPI").toFixed(2))).toFixed(2),
              aliquotaInterna: soma("aliquotaInterna").toFixed(2),
              numeroNFOrigem: "",
              dataNFOrigem: "",
            });
            setHasXML(true);
          } else {
            message.error("Falha ao buscar os dados da nota fiscal.");
          }
        }

      } catch (err) {
        console.error(err);
        message.error("Erro de rede ao buscar os dados.");
      }
    };

    fetchInvoiceData();
  }, [notaFiscal, authContext.user.token]);

  const formatDecimal = (value: string) => {
    if (!value) return "";
    const num = parseFloat(value.replace(",", "."));
    if (isNaN(num)) return "";
    return num.toFixed(2);
  };

  const [formData, setFormData] = useState<FormPedidoModel>({
    baseICMS: "",
    valorICMS: "",
    valorICMSST: "",
    valorBCST: "",
    baseICMSSubstituicao: "",
    valorICMSSubstituicao: "",
    valorProdutos: "",
    valorIPI: "",
    valorNota: "",
    aliquotaInterna: "",
    numeroNFOrigem: "",
    dataNFOrigem: "",
  });

  const [hasXML, setHasXML] = useState(false);

  const columns = [
    { title: "CÓDIGO", dataIndex: "cdMaterial", key: "cdMaterial" },
    { title: "DESCRIÇÃO", dataIndex: "descricao", key: "descricao" },
    { title: "VL UNITÁRIO", dataIndex: "prUnitario", key: "prUnitario", render: (v: number) => `R$ ${v.toFixed(2)}` },
    { title: "QUANTIDADE", dataIndex: "quantidade", key: "quantidade" },
    { title: "VL TOTAL", dataIndex: "vlTotalItemL", key: "vlTotalItemL", render: (v: number) => `R$ ${v.toFixed(2)}` },
    { title: "BC ICMS", dataIndex: "baseICMS", key: "baseICMS" },
    { title: "VL ICMS", dataIndex: "valorICMS", key: "valorICMS" },
    { title: "VL IPI", dataIndex: "valorIPI", key: "valorIPI" },
    { title: "BC ST", dataIndex: "valorICMSST", key: "valorICMSST" },
    { title: "VL ST", dataIndex: "valorBCST", key: "valorBCST" },
  ];

  return (
    <div className={styles.Container}>
      <Button type="link" style={{ marginTop: 20 }} className={styles.ButtonBack} onClick={() => window.history.back()}>
        <LeftOutlined /> VOLTAR PARA INFORMAÇÕES DA NF {notaFiscal || "N/A"}
      </Button>

      {hasXML && (
        <>
          <Card style={{ backgroundColor: "#f5f5f5", borderRadius: 10, marginTop: 16, margin: 24 }}>
            <Row gutter={16} justify="space-between" style={{ marginBottom: 20 }}>
              {["baseICMS", "valorICMS", "baseICMSSubstituicao", "valorICMSSubstituicao", "valorProdutos"].map((key) => (
                <Col flex={1} key={key} style={{ textAlign: "right" }}>
                  <OutlinedInputWithLabel
                    fullWidth
                    label={key.replace(/([A-Z])/g, " $1").toUpperCase()}
                    value={formData[key as keyof FormPedidoModel]}
                    onChange={(e) =>
                      setFormData({ ...formData, [key]: key.includes("valorICMS") ? formatDecimal(e.target.value) : e.target.value } as FormPedidoModel)
                    }
                  />
                </Col>
              ))}
            </Row>
            <Row gutter={16} justify="end">
              {["valorIPI", "valorNota", "aliquotaInterna"].map((key) => (
                <Col span={5} key={key} style={{ textAlign: "right" }}>
                  <OutlinedInputWithLabel
                    fullWidth
                    label={key.replace(/([A-Z])/g, " $1").toUpperCase()}
                    value={formData[key as keyof FormPedidoModel]}
                    onChange={(e) =>
                      setFormData({ ...formData, [key]: key.includes("valorIPI") ? formatDecimal(e.target.value) : e.target.value } as FormPedidoModel)
                    }
                  />
                </Col>
              ))}
            </Row>
          </Card>

          <Title level={4} style={{ margin: 24, marginTop: 24 }}>
            Itens da NF {notaFiscal || "N/A"}
          </Title>
          <Table columns={columns} dataSource={data} pagination={false} style={{ margin: 16, marginBottom: 24 }} />
        </>
      )}
    </div>
  );
};

export default InvoicePage;
