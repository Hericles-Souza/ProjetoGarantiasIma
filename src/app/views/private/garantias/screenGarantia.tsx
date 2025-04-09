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
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";
import { UserRoleEnum } from "@shared/enums/UserRoleEnum";
import { AcordoComercialModel } from "@shared/models/AcordoComercialModel";
import { getAcordosComerciaisByStatusAsync } from "@shared/services/AcordoComercialService";
import {
  AcordoStatusEnum,
  converterStatusAcordoInverso,
} from "@shared/enums/AcordoComercialStatusEnum";

const Garantias: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("rgi");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const carouselRef = useRef<HTMLDivElement>(null);
  const [cardData, setCardData] = useState<GarantiasModel[]>([]);
  const [acordoData, setAcordoData] = useState<AcordoComercialModel[]>([]);
  const navigate = useNavigate();
  const context = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [filteredItems, setFilteredItems] = useState<GarantiasModel[]>([]);
  const [, setFilteredIAcordo1tems] = useState<
    AcordoComercialModel[]
  >([]);

  useEffect(() => {
    fetchCardData();
  }, []); // [] para garantir que só execute uma vez

  const fetchCardData = async () => {
    try {
      if (context.user!.rule!.name === UserRoleEnum.Cliente) {
        const response = await getGarantiasPaginationAsync(1, 100);
        const responseACI = await getAcordosComerciaisByStatusAsync(
          Number(context.user!.codigoCigam),
          1,
          1,
          100
        );
        const data = await response.data.data.data;
        const dataACI = await responseACI?.data?.data?.data;

        if(dataACI != undefined)
          setAcordoData(dataACI);
        
        if(data)
          setCardData(data);
      } else {
        let status: number[] = [];
        if (context.user.rule.name === UserRoleEnum.Tecnico) {
          status = [
            GarantiasStatusEnum2.EM_ANALISE,
            GarantiasStatusEnum2.CONFIRMADO,
          ];
        } else if (context.user.rule.name === UserRoleEnum.Supervisor) {
          status = [
            GarantiasStatusEnum2.EM_ANALISE,
            GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO,
            GarantiasStatusEnum2.CONFIRMADO,
            GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
          ];
        }

        const promises = status.map(async (element) => {
          const response = await getGarantiasByStatusAsync(1, 100, element);
          const responseData = await response.data.data;
          return responseData;
        });
        const results = await Promise.all(promises);
        const dataArray = results.flat().sort();
        setCardData(dataArray); // Atualiza o cardData com os resultados

        const promisesACI = status.map(async (element) => {
          const responseACI = await getAcordosComerciaisByStatusAsync(
            Number(context.user!.codigoCigam),
            element,
            1,
            100
          );
          const responseDataACI = await responseACI?.data?.data;
          return responseDataACI;
        });
        const resultsACI = await Promise.all(promisesACI);
        if(resultsACI){
          const dataArrayACI = resultsACI.flat().sort();
          setAcordoData(dataArrayACI);
          console.log("acordos: ", acordoData);

        }

      }
    } catch (error) {
      console.error("Error fetching card data:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Filtrar os dados sempre que `cardData`, `filterStatus` ou `searchTerm` mudar
  useEffect(() => {
    const newFilteredItems = cardData.filter((card) => {
      const matchesStatus =
        filterStatus === "todos" ||
        card.codigoStatus ===
          converterStatusGarantiaInverso(
            converterStringParaStatusGarantia(filterStatus)
          );
      const matchesSearch =
        searchTerm === "" ||
        card.rgi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.itens[0].tipoDefeito
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    });
    setFilteredItems(newFilteredItems); // Atualiza o estado com os itens filtrados
    const newFilteredAcordoItems = acordoData.filter((card) => {
      const matchesStatus =
        filterStatus === "todos" ||
        card.codigoStatus ===
          converterStatusAcordoInverso(AcordoStatusEnum.NAO_ENVIADO);
      const matchesSearch =
        searchTerm === "" ||
        card.cdAci.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.itens[0].codigoItem
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    });
    setFilteredIAcordo1tems(newFilteredAcordoItems); // Atualiza o estado com os itens filtrados
  }, [cardData, filterStatus, searchTerm, acordoData]);

  const statuses = Object.values(GarantiasStatusEnum);

  const handleNext = () => {
    if (carouselRef.current) {
      const container = carouselRef.current;
      container.scrollBy({ left: 150, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (carouselRef.current) {
      const container = carouselRef.current;
      container.scrollBy({ left: -150, behavior: "smooth" });
    }
  };

  if (loading || !cardData) {
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
                &lt;
              </Button>
              <Button
                className={styled.button}
                type="default"
                onClick={handleNext}
              >
                &gt;
              </Button>
              <SearchField onSearchChange={setSearchTerm} />
            </div>
          </div>
          <div className={styled.containerGrid}>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const garantia = cardData.find((card) => card.rgi === item.rgi);
                return (
                  <CardCategorias
                    key={item.id}
                    data={new Date(garantia.data)}
                    GarantiaItem={item}
                    codigoFormatado={`RGI ${garantia.rgi}`}
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
                        navigate(`/garantias/rgi/${garantia.id}`, {
                          state: { item, garantiaData },
                        });
                      } else if (
                        context.user.rule.name.includes(UserRoleEnum.Tecnico) ||
                        context.user.rule.name.includes(UserRoleEnum.Supervisor)
                      ) {
                        navigate(
                          `/garantias/technical-and-supervisor/${garantia.id}`,
                          {
                            state: { item, garantia },
                          }
                        );
                      }
                    }}
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
                &lt;
              </Button>
              <Button
                className={styled.button}
                type="default"
                onClick={handleNext}
              >
                &gt;
              </Button>
              <SearchField onSearchChange={setSearchTerm} />
            </div>
          </div>
          <div className={styled.containerGrid}>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const garantia = cardData.find((card) => card.rgi === item.rgi);

                return (
                  <CardCategorias
                    key={item.id}
                    data={new Date(garantia.data)}
                    GarantiaItem={item}
                    onClick={() => {
                      console.log("use: " + context.user.rule.name);
                      if (
                        context.user.rule.name.includes(UserRoleEnum.Admin) ||
                        context.user.rule.name.includes(UserRoleEnum.Cliente)
                      )
                        navigate(`garantias/aci/:id`, {
                          state: { item, garantia },
                        });
                      else if (
                        context.user.rule.name.includes(UserRoleEnum.Tecnico) ||
                        context.user.rule.name.includes(UserRoleEnum.Supervisor)
                      ) {
                        navigate(
                          `/garantias/technical-and-supervisor/${garantia.id}`,
                          {
                            state: { item, garantia },
                          }
                        );
                      }
                    }}
                    codigoFormatado={""}
                  />
                );
              })
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
