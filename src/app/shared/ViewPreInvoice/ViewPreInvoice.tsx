import { useEffect, useState } from "react";
import { Table, Typography, Row, Col, Card, Button, message } from "antd";
import styles from "./ViewPreInvoice.module.css";
import { LeftOutlined } from "@ant-design/icons";
import OutlinedInputWithLabel from "@shared/components/input-outlined-with-label/OutlinedInputWithLabel";
import api from "@shared/Interceptors";
import { useLocation, useNavigate } from "react-router-dom";
import { GarantiasModel } from "@shared/models/GarantiasModel";
import { FormPedidoModel, PedidoModel } from "@shared/models/PedidosModel";
import { NotaFiscal } from "@shared/models/NotaFiscalModel";
import { GarantiasItemStatusEnum2 } from "@shared/enums/GarantiasStatusEnum";

const { Title } = Typography;

const InvoicePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormPedidoModel>({
    baseICMS: "1000,00",
    valorICMS: "180,00",
    baseICMSSubstituicao: "1200,00",
    valorICMSSubstituicao: "216,00",
    valorProdutos: "5000,00",
    valorIPI: "250,00",
    valorNota: "5250,00",
    aliquotaInterna: "18%",
    numeroNFOrigem: "",
    dataNFOrigem: "",
  });

  const [data, setData] = useState<PedidoModel[]>([]);
  const [cardData, setCardData] = useState<GarantiasModel>();

  const columns = [
    { title: "CÓDIGO", dataIndex: "codigo", key: "codigo" },
    { title: "VL UNITÁRIO", dataIndex: "vlUnitario", key: "vlUnitario" },
    { title: "QUANTIDADE", dataIndex: "quantidade", key: "quantidade" },
    { title: "VL TOTAL", dataIndex: "vlTotal", key: "vlTotal" },
    { title: "BC ICMS", dataIndex: "bcICMS", key: "bcICMS" },
    { title: "VL ICMS", dataIndex: "vlICMS", key: "vlICMS" },
    { title: "VL IPI", dataIndex: "vlIPI", key: "vlIPI" },
    { title: "ICMS", dataIndex: "icms", key: "icms" },
    { title: "IPI", dataIndex: "ipi", key: "ipi" },
    { title: "MVA", dataIndex: "mva", key: "mva" },
    { title: "BC ST", dataIndex: "bcST", key: "bcST" },
    { title: "VL ST", dataIndex: "vlST", key: "vlST" },
  ];
  const fetchData = async () => {
    try {
      if (location.state) {

        console.log("garantia: " + location.state.cardData);
        setCardData(location.state.cardData);
        const response = await api.get(`/pedidos/pedidos/cliente?cdCliente=000103&page=1&limit=10`); // Coloque a URL da sua API aqui
        const apiData = await response.data.data.data as PedidoModel[];
        console.log("pedidos: " , apiData);
        const responseGetItens = await api.get(
          `/nota-fiscal/by-garantia/${cardData.id}`
        );
        const notasFiscaisAPI = responseGetItens.data.data as NotaFiscal[];
        
        const notaFiscalOrigem = notasFiscaisAPI.find((notaFiscal) => notaFiscal.codigo === cardData.nf);

        if(notaFiscalOrigem == undefined){
          setFormData({
            baseICMS: "Não encontrado",
            valorICMS: "Não encontrado",
            baseICMSSubstituicao: "Não encontrado",
            valorICMSSubstituicao: "Não encontrado",
            valorProdutos: "Não encontrado",
            valorIPI: "Não encontrado",
            valorNota: "Não encontrado",
            aliquotaInterna: "Não encontrado",
            numeroNFOrigem: "Não encontrado",
            dataNFOrigem: "Não encontrado",
          })
          message.error("Nota Fiscal não encontrada!");

        }
        else{
          
          const itensAutorized = notaFiscalOrigem.itens.filter((item) => item.codigoStatus === GarantiasItemStatusEnum2.AUTORIZADO);
          const codigosAutorizados = new Set<string>(
            itensAutorized
              .map(item => item.codigoPeca)
              .filter((codigo): codigo is string => !!codigo) // Garante que é string e não undefined/null
          );
          const todosCodigos = new Set<string>(
            itensAutorized
              .map(item => item.codigoPeca) // Garante que é string e não undefined/null
          );
          console.log("itensAutorized: " , itensAutorized);
  
          // Preenchendo o formData com os dados da API
          setFormData({
            baseICMS: "1000,00",
            valorICMS: "180,00",
            baseICMSSubstituicao: "1200,00",
            valorICMSSubstituicao: "216,00",
            valorProdutos: apiData?.filter(item => codigosAutorizados.has(item.cdMaterial)).reduce((acc, pedido) => {
              const valor = Number(pedido.prUnitario);
              return acc + (isNaN(valor) ? 0 : valor);
            }, 0).toString(),
            valorIPI: "250,00",
            valorNota: apiData?.filter(item => todosCodigos.has(item.cdMaterial)).reduce((acc, pedido) => acc + pedido.prUnitario, 0).toString(),
            aliquotaInterna: "18%",
            numeroNFOrigem: "",
            dataNFOrigem: "",
          });
  
          // Preenchendo a tabela com os dados dos pedidos
          const tableData = apiData?.filter(item => codigosAutorizados.has(item.cdMaterial)).map((item, index) => ({
            key: index,
            codigo: item.cdMaterial,
            vlUnitario: `R$ ${item.vlTotalItemL}`,
            quantidade: item.quantidade,
            vlTotal: `R$ ${apiData.filter(item => codigosAutorizados.has(item.cdMaterial)).reduce((acc, pedido) => acc + pedido.vlTotalItemL, 0).toString()}`,
            bcICMS: item.baseICMS,
            vlICMS: item.valorICMS,
            vlIPI: item.valorIPI,
            icms: "180,00", // Exemplo de como você pode formatar o valor
            ipi: "18%", // Isso pode ser dinâmico também
            mva: "0%", // Isso pode ser dinâmico
            bcST: item.baseISS,
            vlST: item.valorISS,
          })) as unknown as PedidoModel[];
  
          setData(tableData);
          console.log("formData: " , formData);
          console.log("data: " , tableData);
        }



      }
    } catch (error) {
      console.error("Erro ao carregar dados da API:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [location.state]);

  return (
    <div className={styles.Container}>
      <div className={styles.ContainerButtonBack}>
        <Button
          type="link"
          className={styles.ButtonBack}
          onClick={() =>
            navigate(`/garantias/rgi/${location.state.cardData.id}`, {
              state: {
                garantiaData: location.state.cardData,
                item: location.state.cardData.nf,
              },
            })
          }
        >
          <LeftOutlined /> VOLTAR PARA O INÍCIO
        </Button>
        <span className={styles.RgiCode}>RGI N° {location.state.cardData.rgi}</span>
      </div>

      <div className={styles.headerContainer}>
        <div className={styles.headerLeft}>
          <h1 className={styles.rgiTitle}>RGI {location.state.cardData.rgi}</h1>
          <div className={styles.statusTag}>Aguardando avaliação</div>
        </div>
      </div>
      <Card style={{ backgroundColor: "#f5f5f5", borderRadius: "10px" }}>
        <Row
          gutter={16}
          justify="space-between"
          style={{ marginBottom: "20px" }}
        >
          {[
            "baseICMS",
            "valorICMS",
            "baseICMSSubstituicao",
            "valorICMSSubstituicao",
            "valorProdutos",
          ].map((key) => (
            <Col flex={1} key={key} style={{ textAlign: "right" }}>
              <OutlinedInputWithLabel
                fullWidth
                label={key.replace(/([A-Z])/g, " $1").toUpperCase()}
                value={formData[key]}
                onChange={(e) =>
                  setFormData({ ...formData, [key]: e.target.value })
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
                value={formData[key]}
                onChange={(e) =>
                  setFormData({ ...formData, [key]: e.target.value })
                }
              />
            </Col>
          ))}
        </Row>
      </Card>

      <Title className={styles.titleNF} level={4}>
        NF {cardData?.nf}
      </Title>
      <Row gutter={16}>
        <Col span={12}>
          <OutlinedInputWithLabel
            fullWidth
            label="Nº NF DE ORIGEM"
            value={formData.numeroNFOrigem}
            onChange={(e) =>
              setFormData({ ...formData, numeroNFOrigem: e.target.value })
            }
          />
        </Col>
        <Col span={12}>
          <OutlinedInputWithLabel
            fullWidth
            label="DATA DA NF DE ORIGEM"
            value={formData.dataNFOrigem}
            onChange={(e) =>
              setFormData({ ...formData, dataNFOrigem: e.target.value })
            }
          />
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        style={{ marginTop: 16 }}
      />
    </div>
  );
};

export default InvoicePage;
