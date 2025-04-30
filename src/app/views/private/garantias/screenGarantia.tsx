import React, { useContext, useEffect, useRef, useState } from "react";
import { Button, Spin, Tag } from "antd";
import Header from "@shared/components/header/header.tsx";
import CardCategorias from "@shared/components/card_garantia/card_garantias.tsx";
import SearchField from "@shared/components/input_search/input_search.tsx";
import styled from "./screenGarantia.module.css";
import "./carouselAnimations.css";
import "./tabGarantia.css";
import {
  getGarantiasByStatusAsync,
  getGarantiasPaginationAsync,
} from "@shared/services/GarantiasService.ts";
import { GarantiasModel } from "@shared/models/GarantiasModel.ts";
import {
  converterStatusGarantiaInverso,
  converterStringParaStatusGarantia,
  GarantiasStatusEnum,
  GarantiasStatusEnum2,
} from "@shared/enums/GarantiasStatusEnum.ts";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";
import { UserRoleEnum } from "@shared/enums/UserRoleEnum";
import { AcordoComercialModel } from "@shared/models/AcordoComercialModel";
import {
  getAcordosByUser,
  getAllAcordos,
} from "@shared/services/AcordoComercialService";

const Garantias: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("rgi");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const carouselRef = useRef<HTMLDivElement>(null);
  const [cardData, setCardData] = useState<GarantiasModel[]>([]);
  const [acordoData, setAcordoData] = useState<AcordoComercialModel[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const context = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [filteredItems, setFilteredItems] = useState<GarantiasModel[]>([]);
  const [filteredAcordoItems, setFilteredAcordoItems] = useState<
    AcordoComercialModel[]
  >([]);

  useEffect(() => {
    fetchCardData();
  }, [location]);

  const fetchCardData = async () => {
    try {
      if (context.user!.rule!.name === UserRoleEnum.Cliente) {
        const response = await getGarantiasPaginationAsync(1, 300);
        const responseDataACI = await getAcordosByUser(1, 100);
        console.log("Resposta completa da API para cliente:", response);

        if (responseDataACI) {
          setAcordoData(responseDataACI.data.data.data);
        }
        console.log("Acordos retornados:", responseDataACI.data.data.data);
        const data = response.data.data.data;

        console.log("Garantias retornadas para Cliente:", data); // Log detalhado
        if (data) setCardData(data);
      } else {
        let status: number[] = [];
        if (context.user.rule.name === UserRoleEnum.Tecnico) {
          status = [
            GarantiasStatusEnum2.EM_ANALISE,
            GarantiasStatusEnum2.CONFIRMADO,
            GarantiasStatusEnum2.NAO_ENVIADO,
          ];
        } else if (context.user.rule.name === UserRoleEnum.Supervisor) {
          status = [
            GarantiasStatusEnum2.EM_ANALISE,
            GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO,
            GarantiasStatusEnum2.CONFIRMADO,
            GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
            GarantiasStatusEnum2.NAO_ENVIADO,
          ];
          const responseDataACI = await getAllAcordos(1, 100);

          if (responseDataACI) {
            setAcordoData(responseDataACI.data.data.data);
          }
        }

        const promises = status.map(async (element) => {
          const response = await getGarantiasByStatusAsync(1, 100, element);
          const responseData = await response.data.data;
          return responseData;
        });
        const results = await Promise.all(promises);
        const dataArray = results.flat().sort();
        console.log("Garantias retornadas para Técnico/Supervisor:", dataArray);
        setCardData(dataArray);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setCardData([]); // Evita estado indefinido
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "rgi") {
      const filtered = cardData.filter((card) => {
        const convertedStatus = converterStringParaStatusGarantia(filterStatus);
        const invertedStatus = converterStatusGarantiaInverso(convertedStatus);
        const matchesStatus =
          filterStatus === "todos" || card.codigoStatus === invertedStatus;

        const matchesSearch =
          searchTerm === "" ||
          card.rgi.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.itens?.some((item) =>
            item.tipoDefeito?.toLowerCase().includes(searchTerm.toLowerCase())
          );

        console.log(`Filtrando RGI ${card.rgi}:`, {
          filterStatus,
          convertedStatus,
          invertedStatus,
          cardStatus: card.codigoStatus,
          matchesStatus,
          matchesSearch,
        });

        return matchesStatus && matchesSearch;
      });
      console.log("Itens filtrados (RGI):", filtered);
      setFilteredItems(filtered);
    } else if (activeTab === "aci") {
      const filtered = acordoData.filter((card) => {
        const matchesStatus =
          filterStatus === "todos" ||
          card.status.toLowerCase() === filterStatus.toLowerCase();

        const matchesSearch =
          searchTerm === "" ||
          card.cdAci.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.itens?.some((item) =>
            item.codigoItem?.toLowerCase().includes(searchTerm.toLowerCase())
          );

        return matchesStatus && matchesSearch;
      });
      console.log("Itens filtrados (ACI):", filtered);
      setFilteredAcordoItems(filtered);
    }
  }, [cardData, acordoData, filterStatus, searchTerm, activeTab]);

  useEffect(() => {
    setFilterStatus("todos");
    setSearchTerm("");
  }, [activeTab]);

  const statuses = Object.values(GarantiasStatusEnum);

  const handleNext = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 150, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -150, behavior: "smooth" });
    }
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
    <>
      <Header filterStatus={activeTab} handleFilterChange={setActiveTab} />

      {activeTab === "rgi" && (
        <div className={styled.container}>
          <div className={styled.content}>
            <div ref={carouselRef} className="carousel-container">
              <div className="carousel-content">
                {statuses.map((status) => (
                  <Tag
                    key={status}
                    className={`carousel-tag ${styled.tab}`}
                    color={filterStatus === status ? "red" : "default"}
                    onClick={() =>
                      setFilterStatus((prevStatus) =>
                        prevStatus === status ? "todos" : status
                      )
                    }
                  >
                    {status}
                  </Tag>
                ))}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "1rem",
                paddingLeft: "0",
              }}
            >
              <Button
                className={styled.button}
                type="default"
                onClick={handlePrevious}
              >
                {"<"}
              </Button>
              <Button
                className={styled.button}
                type="default"
                onClick={handleNext}
              >
                {">"}
              </Button>
              <SearchField
                onSearchChange={setSearchTerm}
                searchTerm={searchTerm}
                tabKey={activeTab}
              />
            </div>
          </div>
          <div className={styled.containerGrid}>
            {filteredItems.length > 0 ? (
              filteredItems
                .sort((a, b) => a.codigoStatus - b.codigoStatus)
                .map((item) => {
                  const garantia = cardData.find(
                    (card) => card.rgi === item.rgi
                  );
                  return (
                    <CardCategorias
                      key={item.id}
                      data={new Date(garantia?.data)}
                      GarantiaItem={item}
                      codigoFormatado={`RGI ${garantia?.rgi}`}
                      onClick={() => {
                        console.log("use: " + context.user.rule.name);
                        if (
                          context.user.rule.name.includes(UserRoleEnum.Admin) ||
                          context.user.rule.name.includes(UserRoleEnum.Cliente)
                        ) {
                          const garantiaData = garantia;
                          console.log(
                            "garantiaData: " + JSON.stringify(garantiaData)
                          );
                          navigate(`/garantias/rgi/${garantia?.id}`, {
                            state: { item, garantiaData },
                          });
                        } else if (
                          context.user.rule.name.includes(
                            UserRoleEnum.Tecnico
                          ) ||
                          context.user.rule.name.includes(
                            UserRoleEnum.Supervisor
                          )
                        ) {
                          navigate(
                            `/garantias/technical-and-supervisor/${garantia?.id}`,
                            {
                              state: { item, garantia },
                            }
                          );
                        }
                      }}
                      tab="RGI"
                    />
                  );
                })
            ) : (
              <div>Nenhum item encontrado</div>
            )}
          </div>
        </div>
      )}

      {activeTab === "aci" && (
        <div className={styled.container}>
          <div className={styled.content}>
            <div ref={carouselRef} className="carousel-container">
              <div className="carousel-content">
                {statuses.map((status) => (
                  <Tag
                    key={status}
                    className={`carousel-tag ${styled.tab}`}
                    color={filterStatus === status ? "red" : "default"}
                    onClick={() =>
                      setFilterStatus((prevStatus) =>
                        prevStatus === status ? "todos" : status
                      )
                    }
                  >
                    {status}
                  </Tag>
                ))}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "1rem",
                paddingLeft: "0",
              }}
            >
              <Button
                className={styled.button}
                type="default"
                onClick={handlePrevious}
              >
                {"<"}
              </Button>
              <Button
                className={styled.button}
                type="default"
                onClick={handleNext}
              >
                {">"}
              </Button>
              <SearchField
                onSearchChange={setSearchTerm}
                searchTerm={searchTerm}
                tabKey={activeTab}
              />
            </div>
          </div>
          <div className={styled.containerGrid}>
            {filteredAcordoItems.length > 0 ? (
              filteredAcordoItems
                .sort((a, b) => a.codigoStatus - b.codigoStatus)
                .map((item) => (
                  <CardCategorias
                    key={item.id}
                    data={new Date(item.data)}
                    Acordo={item}
                    onClick={() => {
                      console.log("use: ", item);
                      if (
                        context.user.rule.name.includes(UserRoleEnum.Admin) ||
                        context.user.rule.name.includes(UserRoleEnum.Cliente) ||
                        context.user.rule.name.includes(UserRoleEnum.Supervisor)
                      ) {
                        console.log("entro");
                        navigate(`/garantias/aci/${item.id}`, {
                          state: { item },
                        });
                      }
                    }}
                    codigoFormatado={`ACI ${item.cdAci}`}
                    tab="ACI"
                  />
                ))
            ) : (
              <div>Nenhum item encontrado</div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Garantias;