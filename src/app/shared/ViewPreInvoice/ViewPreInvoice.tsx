import React, { useState } from "react";
import { Table, Input, Typography, Row, Col, Card, Button } from "antd";
import styles from "./ViewPreInvoice.module.css";
import { LeftOutlined } from "@ant-design/icons";
import OutlinedInputWithLabel from "@shared/components/input-outlined-with-label/OutlinedInputWithLabel";

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
        numeroNFOrigem: "", // Novo campo para o número da NF de origem
        dataNFOrigem: "", // Novo campo para a data da NF de origem
    });

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

    const data = [
        {
            key: "1",
            codigo: "AL-1206",
            vlUnitario: "R$ 0,00",
            quantidade: "0",
            vlTotal: "R$ 0,00",
            bcICMS: "0",
            vlICMS: "0",
            vlIPI: "0",
            icms: "0%",
            ipi: "0%",
            mva: "0%",
            bcST: "0",
            vlST: "0",
        },
    ];

    return (
        <div style={{ padding: 24, backgroundColor: "#fff" }}>
            <div className={styles.ContainerButtonBack}>
                <Button type="link" className={styles.ButtonBack} onClick={() => navigate("/garantias")}>
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