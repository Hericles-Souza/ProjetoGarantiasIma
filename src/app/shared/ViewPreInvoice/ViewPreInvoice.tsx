import React, { useEffect, useState } from "react";
import { Table, Typography, Row, Col, Card, Button } from "antd";
import styles from "./ViewPreInvoice.module.css";
import { LeftOutlined } from "@ant-design/icons";
import OutlinedInputWithLabel from "@shared/components/input-outlined-with-label/OutlinedInputWithLabel";
import api from "@shared/Interceptors";

const { Title } = Typography;

const InvoicePage = () => {
    const [formData, setFormData] = useState({
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

    const [data, setData] = useState([]);

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
            const response = await api.get("/pedidos/pedidos"); // Coloque a URL da sua API aqui
            const apiData = await response.data.data;
            console.log("pedidos: " + JSON.stringify(apiData));
            // Preenchendo o formData com os dados da API
            setFormData({
                baseICMS: apiData.baseICMS,
                valorICMS: apiData.valorICMS,
                baseICMSSubstituicao: apiData.baseICMSSubstituicao,
                valorICMSSubstituicao: apiData.valorICMSSubstituicao,
                valorProdutos: apiData.valorProdutos,
                valorIPI: apiData.valorIPI,
                valorNota: apiData.valorNota,
                aliquotaInterna: apiData.aliquotaInterna,
                numeroNFOrigem: apiData.numeroNFOrigem,
                dataNFOrigem: apiData.dataNFOrigem,
            });

            // Preenchendo a tabela com os dados dos pedidos
            const tableData = apiData.data.garantiaPedidos.map((item) => ({
                key: item.cdPedido,
                codigo: item.cdMaterial,
                vlUnitario: `R$ ${item.precoUnitario}`,
                quantidade: item.quantidade,
                vlTotal: `R$ ${item.valorTotalItem}`,
                bcICMS: item.baseICMS,
                vlICMS: item.valorICMS,
                vlIPI: item.valorIPI,
                icms: item.cdTipoOperacao === "ICMS" ? "18%" : "0%", // Exemplo de como você pode formatar o valor
                ipi: "18%", // Isso pode ser dinâmico também
                mva: "0%", // Isso pode ser dinâmico
                bcST: item.baseISS,
                vlST: item.valorISS,
            }));

            setData(tableData);
        } catch (error) {
            console.error("Erro ao carregar dados da API:", error);
        } finally{

        }
    };

    useEffect(() => {
        fetchData();
    }, [data]);

    return (
        <div style={{ padding: 24, backgroundColor: "#fff" }}>
            <div className={styles.ContainerButtonBack}>
                <Button type="link" className={styles.ButtonBack} 
                // onClick={() => navigate("/garantias")}
                >
                    <LeftOutlined /> VOLTAR PARA O INÍCIO
                </Button>
                <span className={styles.RgiCode}>RGI N° 000666-0001</span>
            </div>

            <div className={styles.headerContainer}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.rgiTitle}>RGI 000666-0001</h1>
                    <div className={styles.statusTag}>Aguardando avaliação</div>
                </div>
            </div>

           {data}
            <Card style={{ backgroundColor: "#f5f5f5", borderRadius: "10px", }}>
                <Row gutter={16} justify="space-between" style={{ marginBottom: "20px" }}>
                    {["baseICMS", "valorICMS", "baseICMSSubstituicao", "valorICMSSubstituicao", "valorProdutos"].map((key) => (
                        <Col flex={1} key={key} style={{ textAlign: "right" }}>
                            <OutlinedInputWithLabel
                                fullWidth
                                label={key.replace(/([A-Z])/g, " $1").toUpperCase()}
                                value={formData[key]}
                                onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
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
                                onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                            />
                        </Col>
                    ))}
                </Row>
            </Card>

            <Title className={styles.titleNF} level={4}>NF 0006-00010.A</Title>
            <Row gutter={16}>
                <Col span={12}>
                    <OutlinedInputWithLabel
                        fullWidth
                        label="Nº NF DE ORIGEM"
                        value={formData.numeroNFOrigem}
                        onChange={(e) => setFormData({ ...formData, numeroNFOrigem: e.target.value })}
                    />
                </Col>
                <Col span={12}>
                    <OutlinedInputWithLabel
                        fullWidth
                        label="DATA DA NF DE ORIGEM"
                        value={formData.dataNFOrigem}
                        onChange={(e) => setFormData({ ...formData, dataNFOrigem: e.target.value })}
                    />
                </Col>
            </Row>

            <Table columns={columns} dataSource={data} pagination={false} style={{ marginTop: 16 }} />
        </div>
    );
};

export default InvoicePage;