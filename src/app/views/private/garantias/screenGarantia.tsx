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
import { GarantiaItem, GarantiasModel } from "@shared/models/GarantiasModel.ts";
import {
  converterStatusGarantiaInverso,
  converterStringParaStatusGarantia,
  GarantiasStatusEnum,
  GarantiasStatusEnum2,
} from "@shared/enums/GarantiasStatusEnum.ts";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@shared/contexts/Auth/AuthContext";

const Garantias: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("rgi");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const carouselRef = useRef<HTMLDivElement>(null);
  const [cardData, setCardData] = useState<GarantiasModel[]>([]);
  const navigate = useNavigate();
  const context = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [filteredItems, setFilteredItems] = useState<GarantiaItem[]>([]);


  useEffect(() => {
    const fetchCardData = async () => {
      try {
        if (context.user.rule.name === "cliente") {
          const response = await getGarantiasPaginationAsync(1, 10);
          const data = await response.data.data.data;
          setCardData(data);
        } else {
          let status: number[] = [];
          if (context.user.rule.name === "tecnico") {
            status = [
              GarantiasStatusEnum2.EM_ANALISE,
              GarantiasStatusEnum2.CONFIRMADO,
            ];
          } else if (context.user.rule.name === "supervisor") {
            status = [
              GarantiasStatusEnum2.EM_ANALISE,
              GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO,
              GarantiasStatusEnum2.CONFIRMADO,
            ];
          };
          const promises = status.map(async (element) => {
            const response = await getGarantiasByStatusAsync(1, 10, element);
            const responseData = await response.data.data;
            return responseData;
          });

          const results = await Promise.all(promises);
          const dataArray = results.flat(); // Concatena todos os arrays em um único array
          setCardData(dataArray);
        // console.log("cardDAta: " + JSON.stringify(cardData));

        }
      } catch (error) {
        console.error("Error fetching card data:", error);
      } finally {
        setFilteredItems(cardData.flatMap((card) => {
          // console.log("TESTE CARDDATA: " + JSON.stringify(cardData));
          // console.log("TESTE CARD: " + JSON.stringify(card));
          return card.itens.filter((item) => {
            const matchesStatus =
              filterStatus === "todos" ||
              item.codigoStatus ===
                converterStatusGarantiaInverso(
                  converterStringParaStatusGarantia(filterStatus)
                );
            const matchesSearch =
              searchTerm === "" ||
              item.rgi.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.codigoItem.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.tipoDefeito.toLowerCase().includes(searchTerm.toLowerCase());
                 
            return matchesStatus && matchesSearch;
          });
        }));
        // console.log("filteredItems finally: " + JSON.stringify(filteredItems));
        setLoading(false);
      }
    };

    fetchCardData();
  });

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
                const garantia = cardData.find(
                  (card) => card.rgi === item.rgi
                );
                return (
                  <CardCategorias
                    key={item.id}
                    data={new Date(garantia.data)}
                    GarantiaItem={item}
                    codigoFormatado={`RGI ${item.rgi}`}
                    onClick={() => {
                      console.log('use: ' + context.user.rule.name);
                      if (
                        context.user.rule.name.includes("admin") ||
                        context.user.rule.name.includes("cliente")
                      )
                        navigate(`/garantias/rgi/${garantia.id}`, {
                          state: { item, garantia },
                        });
                      else if (
                        context.user.rule.name.includes("tecnico") ||
                        context.user.rule.name.includes("supervisor")
                      )
                      {
                        console.log('item: ' + JSON.stringify(item));
                        console.log('associatedCardData: ' + JSON.stringify(garantia));

                        navigate(
                          `/garantias/technical-and-supervisor/visor-inital/${garantia.id}`,
                          { 
                            state: { item, garantia},
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
                const garantia = cardData.find(
                  (card) => card.rgi === item.rgi
                );

                return (
                  <CardCategorias
                    key={item.id}
                    data={new Date(garantia.data)}
                    GarantiaItem={item}
                    onClick={() => {
                      console.log('use: ' + context.user.rule.name);
                      if (
                        context.user.rule.name.includes("admin") ||
                        context.user.rule.name.includes("cliente")
                      )
                        navigate(`/garantias/rgi/${garantia.id}`, {
                          state: { item, garantia },
                        });
                      else if (
                        context.user.rule.name.includes("tecnico") ||
                        context.user.rule.name.includes("supervisor")
                      )
                      {
                        console.log('item: ' + JSON.stringify(item));
                        console.log('associatedCardData: ' + JSON.stringify(garantia));

                        navigate(
                          `/garantias/technical-and-supervisor/visor-inital/${garantia.id}`,
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
