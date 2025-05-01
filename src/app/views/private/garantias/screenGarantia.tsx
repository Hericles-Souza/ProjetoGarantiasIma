import React, { useContext, useEffect, useRef, useState } from "react";
import { Button, Spin, Tag, Pagination } from "antd";
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
  const context = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [filteredItems, setFilteredItems] = useState<GarantiasModel[]>([]);
  const [filteredAcordoItems, setFilteredAcordoItems] = useState<
    AcordoComercialModel[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Verifica se o usuário é técnico ou supervisor
  const isTechnicalUser = [UserRoleEnum.Tecnico, UserRoleEnum.Supervisor].includes(
    context.user?.rule?.name as UserRoleEnum
  );

  useEffect(() => {
    fetchCardData();
  }, []);

  const fetchCardData = async () => {
    try {
      if (context.user!.rule!.name === UserRoleEnum.Cliente) {
        const response = await getGarantiasPaginationAsync(1, 400);
        const responseDataACI = await getAcordosByUser(1, 400);

        if (responseDataACI) {
          setAcordoData(responseDataACI.data.data.data);
        }
        const data = await response.data.data.data;

        if (data) setCardData(data);
      } else {
        let status: number[] = [];
        if (context.user.rule.name === UserRoleEnum.Tecnico) {
          status = [GarantiasStatusEnum2.EM_ANALISE];
        } else if (context.user.rule.name === UserRoleEnum.Supervisor) {
          status = [
            GarantiasStatusEnum2.EM_ANALISE,
            GarantiasStatusEnum2.AGUARDANDO_NF_DEVOLUCAO,
            GarantiasStatusEnum2.CONFIRMADO,
            GarantiasStatusEnum2.AGUARDANDO_VALIDACAO_NF_DEVOLUCAO,
          ];
          const responseDataACI = await getAllAcordos(1, 400);

          if (responseDataACI) {
            setAcordoData(responseDataACI.data.data.data);
          }
        }

        const promises = status.map(async (element) => {
          const response = await getGarantiasByStatusAsync(1, 300, element);
          const responseData = await response.data.data;
          return responseData;
        });
        const results = await Promise.all(promises);
        const dataArray = results.flat();
        setCardData(dataArray);
      }
    } catch (error) {
      console.error("Error fetching card data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "rgi") {
      const filtered = cardData.filter((card) => {
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
          card.itens?.some((item) =>
            item.tipoDefeito?.toLowerCase().includes(searchTerm.toLowerCase())
          );

        return matchesStatus && matchesSearch;
      });
      setFilteredItems(filtered);
      setCurrentPage(1);
    } else if (activeTab === "aci") {
      const filtered = acordoData.filter((card) => {
        const matchesStatus =
          filterStatus === "todos" ||
          card.status.toLowerCase() === filterStatus.toLowerCase();

        const matchesSearch =
          searchTerm === "" ||
          card.cdAci.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.itens?.some(item =>
            item.codigoItem?.toLowerCase().includes(searchTerm.toLowerCase())
          );

        return matchesStatus && matchesSearch;
      });
      setFilteredAcordoItems(filtered);
      setCurrentPage(1);
    }
  }, [cardData, acordoData, filterStatus, searchTerm, activeTab]);

  useEffect(() => {
    setFilterStatus("todos");
    setSearchTerm("");
    setCurrentPage(1);
  }, [activeTab]);

  // Get current items for pagination - ordenado por data decrescente
  const getCurrentItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    if (activeTab === "rgi") {
      return [...filteredItems]
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
        .slice(startIndex, endIndex);
    } else {
      return [...filteredAcordoItems]
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
        .slice(startIndex, endIndex);
    }
  };

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
            {!isTechnicalUser && (
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
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "1rem",
                paddingLeft: "0",
              }}
            >
              {!isTechnicalUser && (
                <>
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
                </>
              )}
              <div style={{ paddingLeft: "20px" }} >
                <SearchField
                  onSearchChange={setSearchTerm}
                  searchTerm={searchTerm}
                  tabKey={activeTab}
                />
              </div>
            </div>
          </div>
          <div className={styled.containerGrid}>
            {getCurrentItems().length > 0 ? (
              getCurrentItems().map((item) => {
                const garantia = cardData.find(
                  (card) => card.rgi === item.rgi
                );
                return (
                  <CardCategorias
                    key={item.id}
                    data={new Date(garantia.data)}
                    GarantiaItem={item}
                    codigoFormatado={`RGI ${garantia.rgi}`}
                    onClick={() => {
                      if (
                        context.user.rule.name.includes(UserRoleEnum.Admin) ||
                        context.user.rule.name.includes(UserRoleEnum.Cliente)
                      ) {
                        navigate(`/garantias/rgi/${garantia.id}`, {
                          state: { item, garantiaData: garantia },
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
                          `/garantias/technical-and-supervisor/${garantia.id}`,
                          { state: { item, garantia } }
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
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
            <Pagination
              className={styled.pagination}
              current={currentPage}
              total={filteredItems.length}
              pageSize={itemsPerPage}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
            />
          </div>
        </div>
      )}

      {activeTab === "aci" && (
        <div className={styled.container}>
          <div className={styled.content}>
            {!isTechnicalUser && (
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
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "1rem",
                paddingLeft: "0",
              }}
            >
              {!isTechnicalUser && (
                <>
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
                </>
              )}
              <div style={{ paddingLeft: "20px" }} >
                <SearchField
                  onSearchChange={setSearchTerm}
                  searchTerm={searchTerm}
                  tabKey={activeTab}
                />
              </div>
            </div>
          </div>
          <div className={styled.containerGrid}>
            {getCurrentItems().length > 0 ? (
              getCurrentItems().map((item) => {
                return (
                  <CardCategorias
                    key={item.id}
                    data={new Date(item.data)}
                    Acordo={item}
                    onClick={() => {
                      if (
                        context.user.rule.name.includes(UserRoleEnum.Admin) ||
                        context.user.rule.name.includes(UserRoleEnum.Cliente) ||
                        context.user.rule.name.includes(UserRoleEnum.Supervisor)
                      ) {
                        navigate(`/garantias/aci/${item.id}`, {
                          state: { item },
                        });
                      }
                    }}
                    codigoFormatado={`ACI ${item.cdAci}`}
                    tab="ACI"
                  />
                );
              })
            ) : (
              <div>Nenhum item encontrado</div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
            <Pagination
              className={styled.pagination}
              current={currentPage}
              total={filteredAcordoItems.length}
              pageSize={itemsPerPage}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Garantias;