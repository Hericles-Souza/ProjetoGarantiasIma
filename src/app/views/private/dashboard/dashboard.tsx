/* eslint-disable @typescript-eslint/no-unused-vars */
import Chart from "react-apexcharts";
import "./dashboard.css";
import { useEffect, useState } from "react";
import { getACIPorStatus, getRGIPorStatus, getTop10ItemsACI, getTop10ItemsRGI, getTop5DefectItems } from "@shared/services/DashboardService";
import { Spin } from "antd";
import { log } from "console";

type Item = {
    codigoPeca: string;
    quantidade: number;
};

type StatusData = {
    status: string;
    quantidade: number;
    percentual: number;
};

const Dashboard = () => {
    const [itensRGI, setItensRGI] = useState<Item[]>([]);
    const [itensACI, setItensACI] = useState<Item[]>([]);
    const [garantiaOptions, setGarantiaOptions] = useState<any>(null);
    const [garantiaSeries, setGarantiaSeries] = useState<number[]>([]);
    const [acordoOptions, setAcordoOptions] = useState<any>(null);
    const [acordoSeries, setAcordoSeries] = useState<number[]>([]);
    const [motivosOptions, setMotivosOptions] = useState<any>(null);
    const [motivosSeries, setMotivosSeries] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

    const formatChartData = (data: StatusData[]) => {
        const labels = data.map(item => item.status.replace(/^"|"$/g, ''));
        const series = data.map(item => parseFloat(item.percentual.toFixed(2)));
        return { labels, series };
    };

    useEffect(() => {
        const fetchItens = async () => {
            try {
                const [garantiaRes, acordoRes, dataRGI, dataACI, defectRes] = await Promise.all([
                    getRGIPorStatus(),
                    getACIPorStatus(),
                    getTop10ItemsRGI(),
                    getTop10ItemsACI(),
                    getTop5DefectItems()
                ]);

                const garantiaData = formatChartData(garantiaRes);
                const acordoData = formatChartData(acordoRes);

                setGarantiaOptions({
                    labels: garantiaData.labels,
                    responsive: [{
                        breakpoint: 480,
                        options: {
                            chart: { width: '100%' },
                            legend: { position: 'bottom' },
                        }
                    }]
                });
                setGarantiaSeries(garantiaData.series);

                setAcordoOptions({
                    labels: acordoData.labels,
                    responsive: [{
                        breakpoint: 480,
                        options: {
                            chart: { width: '100%' },
                            legend: { position: 'bottom' },
                        }
                    }]
                });
                setAcordoSeries(acordoData.series);

                setItensRGI(dataRGI);
                setItensACI(dataACI);
                setMotivosOptions({
                    chart: {
                        type: "bar"
                    },
                    plotOptions: {
                        bar: {
                            horizontal: true
                        }
                    },
                    xaxis: {
                        categories: defectRes.map(d => d.tipoDefeito) // usa direto aqui
                    },
                    colors: ['#FF0000', '#FF7F7F'],
                    responsive: [{
                        breakpoint: 480,
                        options: {
                            chart: { width: '100%' },
                            legend: { position: 'bottom' },
                        }
                    }]
                });
                setMotivosSeries(defectRes.map(d => Number(d.quantidade)));
            } catch (error) {
                console.error('Erro ao buscar itens RGI:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchItens();
    }, []);

    const barOptionsItemsRGI = {
        chart: {
            type: "bar" as const,
        },
        xaxis: {
            categories: itensRGI?.map(item => item.codigoPeca)
        },
        plotOptions: {
            bar: {
                horizontal: false
            }
        },
        colors: ['#FF0000', '#FF7F7F'],
    };
    const barSeriesItemsRGI = [
        {
            name: "Top 10 produtos mais devolvidos",
            data: itensRGI?.map(item => item.quantidade)
        }
    ];

    const barOptionsItemsACI = {
        chart: {
            type: "bar" as const,
        },
        xaxis: {
            categories: itensACI?.map(item => item.codigoPeca)
        },
        plotOptions: {
            bar: {
                horizontal: false
            }
        },
        colors: ['#FF0000', '#FF7F7F'],
    };
    const barSeriesItemsACI = [
        {
            name: "Top 10 produtos mais devolvidos",
            data: itensACI?.map(item => item.quantidade)
        }
    ];

    const estadosData = {
        series: [{
            name: "Itens Devolvidos",
            data: [320, 210, 280, 150, 100, 190, 220, 180, 160],
        }],
        options: {
            chart: {
                type: "bar" as const,
            },
            plotOptions: {
                bar: {
                    horizontal: true
                }
            },
            xaxis: {
                categories: ["SP", "RJ", "MG", "RS", "SC", "PR", "BA", "PE", "CE"]
            },
            colors: ['#FF0000', '#FF7F7F'],
        },
    };

    const handleFilter = () => {
        const startDate = (document.getElementById("startDate") as HTMLInputElement).value;
        const endDate = (document.getElementById("endDate") as HTMLInputElement).value;
        // Lógica de filtragem será implementada aqui
        // console.log("Filtrando dados de", startDate, "até", endDate);
        // Exemplo: Atualizar os gráficos com base nas datas (adicionar lógica real aqui)
    };

    if (loading) {
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                }}
            >
                <Spin
                    size="large"
                    style={{
                        color: "red",
                        filter: "hue-rotate(0deg) saturate(100%) brightness(0.5)",
                    }}
                />
            </div>
        );
    }

    return (
        <div style={{ padding: "20px", backgroundColor: "#fff", height: "100vh", overflowY: "scroll", color: "black" }}>
            <div className="containerDashboard">
                <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <label htmlFor="startDate">Data Inicial</label>
                        <input type="date" id="startDate" className="inputSearch" />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <label htmlFor="endDate">Data Final</label>
                        <input type="date" id="endDate" className="inputSearch" />
                    </div>
                    <button
                        onClick={handleFilter}
                        style={{
                            padding: "13px 16px",
                            backgroundColor: "#FF0000",
                            color: "white",
                            border: "none",
                            marginTop: "25px",
                            borderRadius: "10px",
                            cursor: "pointer"
                        }}
                    >
                        Realizar Analise
                    </button>
                </div>
            </div>

            <div style={{ display: "flex" }} className="container">
                <div className="graphicPizza">
                    <h3>Requisição de Garantias por Status</h3>
                    <Chart options={garantiaOptions} series={garantiaSeries} type="pie" width={550} />
                </div>
                <div className="graphicPizza">
                    <h3>Acordo Comercial por Status</h3>
                    <Chart options={acordoOptions} series={acordoSeries} type="pie" width={550} />
                </div>
            </div>
            <div className="containerChart">
                <h3>Top 10 produtos mais devolvidos RGI</h3>
                <Chart options={barOptionsItemsRGI} series={barSeriesItemsRGI} type="bar" height={350} />
            </div>
            <div className="containerChart">
                <h3>Top 10 produtos mais devolvidos ACI</h3>
                <Chart options={barOptionsItemsACI} series={barSeriesItemsACI} type="bar" height={350} />
            </div>
            <div className="containerChart">
                <h3>Top 5 Motivos de Devolução</h3>
                <Chart options={motivosOptions} series={[{ name: 'Quantidade', data: motivosSeries }]} type="bar" height={300} />            </div>
        </div>
    );
};

export default Dashboard;