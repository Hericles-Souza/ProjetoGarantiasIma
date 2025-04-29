import Chart from "react-apexcharts";
import "./dashboard.modul.css";

const Dashboard = () => {
    const pieOptions = {
        labels: [
            "Não enviado", "Em análise", "Peças avaliadas parcialmente", 
            "Aguardando Validação da NF de Devolução", "Aguardando NF de Devolução", 
            "NF de Devolução Recusada", "Confirmado"
        ],
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: "100%"
                },
                legend: {
                    position: "bottom"
                }
            }
        }]
    };
    const pieSeries = [10, 15, 20, 25, 10, 10, 10];

    const barOptions = {
        chart: { 
            type: "bar" as const,
        },
        xaxis: { 
            categories: ["00004", "000001", "000001", "000001", "000001", "000001", "000001", "000001"] 
        },
        plotOptions: { 
            bar: { 
                horizontal: false 
            }
        },
        colors: ['#FF0000', '#FF7F7F'],  
    };
    const barSeries = [
        { 
            name: "Top 10 produtos mais devolvidos", 
            data: [600, 1000, 1450, 700, 1050, 1450, 700, 1050] 
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

    const motivosDevolucaoData = {
        series: [{
            name: "Quantidade",
            data: [120, 64, 23, 50, 23],
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
                categories: ["Pino quente", "Limpar vidro", "Pino Frio", "Limpar vidro", "Pino Frio"] 
            },
            colors: ['#FF0000', '#FF7F7F'], 
        },
    };

    const handleFilter = () => {
        const startDate = document.getElementById("startDate").value;
        const endDate = document.getElementById("endDate").value;
        // Lógica de filtragem será implementada aqui
        console.log("Filtrando dados de", startDate, "até", endDate);
        // Exemplo: Atualizar os gráficos com base nas datas (adicionar lógica real aqui)
    };

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
                    <Chart options={pieOptions} series={pieSeries} type="pie" width={550} />
                </div>
                <div className="graphicPizza">
                    <h3>Acordo Comercial por Status</h3>
                    <Chart options={pieOptions} series={pieSeries} type="pie" width={550} />
                </div>
            </div>
            <div className="containerChart">
                <h3>Top 10 produtos mais devolvidos</h3>
                <Chart options={barOptions} series={barSeries} type="bar" height={350} />
            </div>
            <div className="containerChart">
                <h3>Top 5 Motivos de Devolução</h3>
                <Chart options={motivosDevolucaoData.options} series={motivosDevolucaoData.series} type="bar" height={300} />
            </div>
            <div className="containerChart">
                <h3>Total de itens devolvidos por estado</h3>
                <Chart options={estadosData.options} series={estadosData.series} type="bar" height={400} />
            </div>
        </div>
    );
};

export default Dashboard;