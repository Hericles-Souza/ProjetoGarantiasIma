import { useEffect, useState } from "react";
import { Table, Typography, Row, Col, Card, Button, message } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import styles from "./ViewPreInvoice.module.css";
import OutlinedInputWithLabel from "@shared/components/input-outlined-with-label/OutlinedInputWithLabel";
import { PedidoModel, FormPedidoModel } from "@shared/models/PedidosModel";
import { GarantiaItem } from "@shared/models/GarantiasModel";
import { AcordoComercialItem } from "@shared/models/AcordoComercialModel";
import api from "@shared/Interceptors";

const { Title } = Typography;

const EMPTY_FORM: FormPedidoModel = {
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
};

/** Remove "{...}" e aspas que o XML às vezes deixa nos campos de texto. */
const unwrap = (raw: string): string => (raw ?? "").replace(/^{|}$/g, "").replace(/(^"|"$)/g, "");

const num = (value: unknown): number => {
  const n = parseFloat(String(value ?? 0));
  return isNaN(n) ? 0 : n;
};

const formatDecimal = (value: string) => {
  if (!value) return "";
  const n = parseFloat(value.replace(",", "."));
  return isNaN(n) ? "" : n.toFixed(2);
};

const sumBy = (pedidos: PedidoModel[], key: keyof PedidoModel) =>
  pedidos.reduce((acc, p) => acc + num(p[key]), 0).toFixed(2);

/** Pedidos importados de uma ACI: valores do item inteiro. */
const mapAcordoPedido = (item: PedidoModel): PedidoModel => ({
  ...item,
  cdPedido: unwrap(item.cdPedido),
  cdMaterial: unwrap(item.cdMaterial),
  descricao: unwrap(item.descricao),
  cdTipoOperaca: unwrap(item.cdTipoOperaca),
  valorICMS: num(item.valorICMS),
  valorICMSST: num(item.valorICMSST),
  valorBCST: num(item.valorBCST),
  valorIRRF: num(item.valorIRRF),
  valorISS: num(item.valorISS),
  valorIPI: num(item.valorIPI),
  baseICMS: num(item.baseICMS),
  baseIPI: num(item.baseIPI),
  baseISS: num(item.baseISS),
  prUnitario: num(item.prUnitario),
  quantidade: num(item.quantidade),
  vlTotalItemL: num(item.vlTotalItemL),
  aliquotaInterna: String(num(item.valorPICMS)),
});

/** Pedidos de uma RGI: a pré-nota de devolução é montada por unidade da peça. */
const mapRgiPedido = (item: PedidoModel): PedidoModel => {
  // Quantidade 0 gerava divisão por zero (Infinity/NaN na tela).
  const qtd = num(item.quantidade) || 1;
  const perUnit = (v: unknown) => num(v) / qtd;

  return {
    ...item,
    cdPedido: unwrap(item.cdPedido),
    cdMaterial: unwrap(item.cdMaterial),
    descricao: unwrap(item.descricao),
    cdTipoOperaca: unwrap(item.cdTipoOperaca),
    valorICMS: perUnit(item.valorICMS),
    valorICMSST: perUnit(item.valorICMSST),
    valorBCST: perUnit(item.valorBCST),
    valorIRRF: num(item.valorIRRF),
    valorISS: num(item.valorISS),
    valorIPI: perUnit(item.valorIPI),
    baseICMS: perUnit(item.baseICMS),
    baseIPI: num(item.baseIPI),
    baseISS: num(item.baseISS),
    prUnitario: num(item.prUnitario),
    quantidade: 1,
    vlTotalItemL: perUnit(item.vlTotalItemL) + perUnit(item.valorIPI) + perUnit(item.valorICMSST),
    aliquotaInterna: String(num(item.valorPICMS)),
  };
};

/**
 * Totais da pré-nota.
 * - BC ST e Valor ST estavam trocados (a base aparecia como valor e vice-versa).
 * - O valor da nota era montado concatenando textos ("12.00" + "3.00"...) e o parseFloat
 *   descartava tudo depois do primeiro número; o vlTotalItemL já inclui IPI e ST.
 */
const buildTotals = (pedidos: PedidoModel[]): FormPedidoModel => ({
  ...EMPTY_FORM,
  baseICMS: sumBy(pedidos, "baseICMS"),
  valorICMS: sumBy(pedidos, "valorICMS"),
  valorICMSST: sumBy(pedidos, "valorICMSST"),
  valorBCST: sumBy(pedidos, "valorBCST"),
  baseICMSSubstituicao: sumBy(pedidos, "valorBCST"),
  valorICMSSubstituicao: sumBy(pedidos, "valorICMSST"),
  valorProdutos: sumBy(pedidos, "prUnitario"),
  valorIPI: sumBy(pedidos, "valorIPI"),
  valorNota: sumBy(pedidos, "vlTotalItemL"),
  aliquotaInterna: sumBy(pedidos, "aliquotaInterna"),
});

const money = (v: number) => `R$ ${num(v).toFixed(2)}`;
const decimal = (v: number) => num(v).toFixed(2);

const columns = [
  { title: "CÓDIGO", dataIndex: "cdMaterial", key: "cdMaterial" },
  { title: "DESCRIÇÃO", dataIndex: "descricao", key: "descricao" },
  { title: "VL UNITÁRIO", dataIndex: "prUnitario", key: "prUnitario", render: money },
  { title: "QUANTIDADE", dataIndex: "quantidade", key: "quantidade" },
  { title: "VL TOTAL", dataIndex: "vlTotalItemL", key: "vlTotalItemL", render: money },
  { title: "BC ICMS", dataIndex: "baseICMS", key: "baseICMS", render: decimal },
  { title: "VL ICMS", dataIndex: "valorICMS", key: "valorICMS", render: decimal },
  { title: "VL IPI", dataIndex: "valorIPI", key: "valorIPI", render: decimal },
  { title: "BC ST", dataIndex: "valorBCST", key: "valorBCST", render: decimal },
  { title: "VL ST", dataIndex: "valorICMSST", key: "valorICMSST", render: decimal },
];

const FIRST_ROW: (keyof FormPedidoModel)[] = [
  "baseICMS",
  "valorICMS",
  "baseICMSSubstituicao",
  "valorICMSSubstituicao",
  "valorProdutos",
];
const SECOND_ROW: (keyof FormPedidoModel)[] = ["valorIPI", "valorNota", "aliquotaInterna"];

const fieldLabel = (key: string) => key.replace(/([A-Z])/g, " $1").toUpperCase();

const InvoicePage = () => {
  const location = useLocation();
  const [data, setData] = useState<PedidoModel[]>([]);
  const [formData, setFormData] = useState<FormPedidoModel>(EMPTY_FORM);
  const [hasXML, setHasXML] = useState(false);

  const isAcordo = !location.state?.notaFiscal?.codigo && !!location.state?.acordo;
  const notaFiscalLabel: string = isAcordo ? "" : location.state?.notaFiscal?.rgi;
  const lookupId: string | undefined = isAcordo
    ? location.state?.codigoNotaFiscal
    : location.state?.notaFiscal?.id;

  useEffect(() => {
    if (!lookupId) return;

    const load = async () => {
      try {
        let pedidos: PedidoModel[];
        let codigosPeca: string[];

        if (isAcordo) {
          const { data: body } = await api.get(`/pedidos/pedidos/by-codigo/${lookupId}`);
          pedidos = (body.data ?? []).map(mapAcordoPedido);
          codigosPeca =
            location.state.acordo?.itens?.map((i: AcordoComercialItem) => i.codigoPeca) ?? [];
        } else {
          const { data: body } = await api.get(`/pedidos/pedidos/${lookupId}`);
          pedidos = (body ?? []).map(mapRgiPedido);
          codigosPeca = body?.[0]?.notaFiscal?.itens?.map((i: GarantiaItem) => i.codigoPeca) ?? [];
        }

        const filtrados = pedidos.filter((p) => codigosPeca.includes(p.cdMaterial));
        setData(filtrados);
        setFormData(buildTotals(filtrados));
        setHasXML(true);
      } catch (err) {
        console.error(err);
        message.error("Falha ao buscar os dados da nota fiscal.");
      }
    };

    load();
  }, [lookupId, isAcordo, location.state]);

  const handleChange = (key: keyof FormPedidoModel, value: string, decimalField: boolean) =>
    setFormData((prev) => ({ ...prev, [key]: decimalField ? formatDecimal(value) : value }));

  return (
    <div className={styles.Container}>
      <Button
        type="link"
        style={{ marginTop: 20 }}
        className={styles.ButtonBack}
        onClick={() => window.history.back()}
      >
        <LeftOutlined /> VOLTAR PARA INFORMAÇÕES DA NF {notaFiscalLabel || "N/A"}
      </Button>

      {hasXML && (
        <>
          <Card style={{ backgroundColor: "#f5f5f5", borderRadius: 10, margin: 24 }}>
            <Row gutter={16} justify="space-between" style={{ marginBottom: 20 }}>
              {FIRST_ROW.map((key) => (
                <Col flex={1} key={key} style={{ textAlign: "right" }}>
                  <OutlinedInputWithLabel
                    fullWidth
                    label={fieldLabel(key)}
                    value={formData[key]}
                    onChange={(e) => handleChange(key, e.target.value, key.includes("valorICMS"))}
                  />
                </Col>
              ))}
            </Row>
            <Row gutter={16} justify="end">
              {SECOND_ROW.map((key) => (
                <Col span={5} key={key} style={{ textAlign: "right" }}>
                  <OutlinedInputWithLabel
                    fullWidth
                    label={fieldLabel(key)}
                    value={formData[key]}
                    onChange={(e) => handleChange(key, e.target.value, key.includes("valorIPI"))}
                  />
                </Col>
              ))}
            </Row>
          </Card>

          <Title level={4} style={{ margin: 24 }}>
            Itens da NF {notaFiscalLabel || "N/A"}
          </Title>
          <Table
            rowKey={(row) => String(row.id ?? `${row.cdPedido}-${row.cdMaterial}`)}
            columns={columns}
            dataSource={data}
            pagination={false}
            style={{ margin: 16, marginBottom: 24 }}
          />
        </>
      )}
    </div>
  );
};

export default InvoicePage;
