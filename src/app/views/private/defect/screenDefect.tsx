/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Edit, Trash2 } from "lucide-react";
import React, { useState, useEffect, Component } from "react";
import {
  getDefect,
  getTypeDefects,
  createDefect,
  deleteDefect,
  updateDefect,
} from "@shared/services/defectService";
import { Defect, TypeDefect } from "@shared/models/DefectModel";
import { Pagination } from "antd";

class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: "center", padding: "32px", color: "red" }}>
          Ocorreu um erro na renderização. Tente recarregar a página ou contate
          o suporte.
        </div>
      );
    }
    return this.props.children;
  }
}

const ScreenDefect: React.FC = () => {
  const [defects, setDefects] = useState<Defect[]>([]);
  const [typeDefects, setTypeDefects] = useState<TypeDefect[]>([]);
  const [newDefect, setNewDefect] = useState<{
    defeito: string;
    tipoDefeitoId: string;
  }>({
    defeito: "",
    tipoDefeitoId: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"cliente" | "tecnico">("cliente");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [defectToDelete, setDefectToDelete] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDefectId, setEditingDefectId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10); // limite fixo por página
  const pageSize = 10; // Número de itens por página

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [defectsResponse, typeDefectsResponse] = await Promise.all([
        getDefect(1, 1000), // Busca uma lista grande para filtragem no frontend
        getTypeDefects(),
      ]);
      if (!Array.isArray(defectsResponse.data)) {
        console.error("defectsResponse não é um array:", defectsResponse);
        setError("Formato de dados inválido para defeitos.");
        setDefects([]);
        return;
      }
      if (!Array.isArray(typeDefectsResponse)) {
        console.error("typeDefectsResponse não é um array:", typeDefectsResponse);
        setError("Formato de dados inválido para tipos de defeitos.");
        setTypeDefects([]);
        return;
      }

      // Filtra os defeitos pelo tipo ativo
      const filteredDefects = defectsResponse.data.filter(
        (defect: Defect) =>
          defect.tipoDefeito?.tipoDefeito?.toLowerCase() === activeTab
      );

      // Calcula a página atual e os defeitos a serem exibidos
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedDefects = filteredDefects.slice(startIndex, endIndex);

      setDefects(paginatedDefects);
      setTotalItems(filteredDefects.length);
      setTotalPages(Math.ceil(filteredDefects.length / pageSize));
      setTypeDefects(typeDefectsResponse);
      setNewDefect((prev) => ({
        ...prev,
        tipoDefeitoId: typeDefectsResponse[0]?.id?.toString() || "",
      }));
    } catch (err: any) {
      console.error("Erro detalhado no componente:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(
        err.response?.status === 404
          ? "Endpoints não encontrados. Verifique se os caminhos /defeitos e /tipo-defeitos estão corretos na API."
          : err.message || "Erro ao carregar dados. Tente novamente."
      );
      setDefects([]);
      setTypeDefects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1); // Reseta para a primeira página ao mudar a aba
    fetchData();
  }, [activeTab]); // Executa fetchData quando activeTab mudar

  useEffect(() => {
    fetchData();
  }, [currentPage]); // Executa fetchData quando a página mudar

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewDefect((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateDefect = async () => {
    if (!newDefect.defeito || !newDefect.tipoDefeitoId) {
      setError("Preencha todos os campos para criar um defeito.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    try {
      await createDefect({
        defeito: newDefect.defeito,
        tipoDefeito: { id: newDefect.tipoDefeitoId },
      });
      await fetchData(); // Rebusca os dados para atualizar a lista
      setNewDefect({ defeito: "", tipoDefeitoId: typeDefects[0]?.id?.toString() });
      setIsModalOpen(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err: any) {
      setError("Erro ao criar defeito. Verifique o endpoint /defeitos (POST).");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleUpdateDefect = async () => {
    if (!newDefect.defeito || !newDefect.tipoDefeitoId || !editingDefectId) {
      setError("Preencha todos os campos para atualizar o defeito.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    try {
      await updateDefect(editingDefectId, {
        id: editingDefectId,
        defeito: newDefect.defeito,
        tipoDefeito: { id: newDefect.tipoDefeitoId },
      });
      await fetchData(); // Rebusca os dados para atualizar a lista
      setNewDefect({ defeito: "", tipoDefeitoId: typeDefects[0]?.id?.toString() });
      setEditingDefectId(null);
      setIsEditing(false);
      setIsModalOpen(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err: any) {
      setError(
        "Erro ao atualizar defeito. Verifique o endpoint /defeitos/:id (PUT)."
      );
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleEdit = (defect: Defect) => {
    setNewDefect({
      defeito: defect.defeito,
      tipoDefeitoId: defect.tipoDefeito?.id?.toString() || "",
    });
    setEditingDefectId(defect.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDefectToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (defectToDelete) {
      try {
        await deleteDefect(defectToDelete);
        await fetchData(); // Rebusca os dados para atualizar a lista
        setIsDeleteModalOpen(false);
        setDefectToDelete(null);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (err: any) {
        setError(
          "Erro ao excluir defeito. Verifique o endpoint /defeitos/:id (DELETE)."
        );
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDefectToDelete(null);
  };

  const filteredDefects = Array.isArray(defects)
    ? defects.filter((defect) =>
        defect.defeito?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "32px" }}>Carregando...</div>
    );
  }

  return (
    <ErrorBoundary>
      <div
        style={{
          backgroundColor: "#ffffff",
          minHeight: "100vh",
          color: "#333333",
          padding: "32px",
          fontFamily: "Arial, sans-serif",
          position: "relative",
          overflowX: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "right",
            alignItems: "center",
            marginBottom: "32px",
            flexWrap: "wrap",
            paddingBottom: "15px",
            borderBottom: "0.25px solid #DADADA",
            gap: "16px",
          }}
        >
          <input
            type="text"
            placeholder="Pesquisar defeitos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "12px",
              border: "0.25px solid #e0e0e0",
              borderRadius: "8px",
              backgroundColor: "white",
              color: "#333",
              width: "300px",
              fontSize: "14px",
            }}
          />
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              padding: "12px 24px",
              backgroundColor: "red",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Novo Defeito
          </button>
        </div>

        {error && (
          <div
            style={{
              textAlign: "center",
              padding: "16px",
              color: "red",
              backgroundColor: "#fee2e2",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          >
            {error}
            <button
              onClick={fetchData}
              style={{
                marginLeft: "16px",
                padding: "8px 16px",
                backgroundColor: "#10b981",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Tentar Novamente
            </button>
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "16px",
            borderBottom: "1px solid #e0e0e0",
            paddingBottom: "8px",
          }}
        >
          <button
            onClick={() => setActiveTab("cliente")}
            style={{
              padding: "8px 16px",
              backgroundColor: activeTab === "cliente" ? "#C3EFE1" : "transparent",
              color: activeTab === "cliente" ? "#038E60" : "#666",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: activeTab === "cliente" ? "600" : "400",
              transition: "all 0.2s",
            }}
          >
            Cliente
          </button>
          <button
            onClick={() => setActiveTab("tecnico")}
            style={{
              padding: "8px 16px",
              backgroundColor: activeTab === "tecnico" ? "#BDE0F9" : "transparent",
              color: activeTab === "tecnico" ? "#0280DA" : "#666",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: activeTab === "tecnico" ? "600" : "400",
              transition: "all 0.2s",
            }}
          >
            Técnico
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "20px",
            padding: "10px",
            maxWidth: "100%",
            overflowX: "auto",
          }}
        >
          {filteredDefects.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "#888888",
                fontSize: "16px",
                padding: "20px",
                gridColumn: "1 / -1",
              }}
            >
              Nenhum defeito registrado para {activeTab === "cliente" ? "Cliente" : "Técnico"}.
            </p>
          ) : (
            filteredDefects.map((defect) => (
              <div
                key={defect.id}
                style={{
                  backgroundColor: "#ffffff",
                  padding: "16px",
                  borderRadius: "10px",
                  border: "0.25px solid rgba(218, 218, 218, 0.49)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  minWidth: "300px",
                  maxWidth: "100%",
                  wordBreak: "break-word",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    flexGrow: 1,
                  }}
                >
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: "500",
                      margin: "0",
                      color: "#1a1a1a",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "200px",
                    }}
                  >
                    {defect.defeito}
                  </p>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 12px",
                      borderRadius: "5px",
                      fontSize: "12px",
                      color:
                        defect.tipoDefeito?.tipoDefeito === "Cliente"
                          ? "#038E60"
                          : "#0280DA",
                      backgroundColor:
                        defect.tipoDefeito?.tipoDefeito === "Cliente"
                          ? "#C3EFE1"
                          : "#BDE0F9",
                    }}
                  >
                    {defect.tipoDefeito?.tipoDefeito === "Cliente"
                      ? "Cliente"
                      : "Técnico"}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                  }}
                >
                  <button
                    onClick={() => handleEdit(defect)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#0280DA",
                      fontSize: "20px",
                      padding: "4px",
                      borderRadius: "4px",
                      transition: "background-color 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#eff6ff")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <Edit style={{ color: "#0280DA", height: "20px" }} />
                  </button>
                  <button
                    onClick={() => handleDelete(defect.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#ef4444",
                      fontSize: "20px",
                      padding: "4px",
                      borderRadius: "4px",
                      transition: "background-color 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#fef2f2")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <Trash2 style={{ color: "red", height: "20px" }} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Paginação */}
        <Pagination
          className="pagination"
          current={currentPage}
          total={totalItems}
          pageSize={itemsPerPage}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
          style={{ marginTop: 16, textAlign: "center" }}
        />

        {isModalOpen && (
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#ffffff",
              padding: "24px",
              borderRadius: "10px",
              boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
              zIndex: 1000,
              width: "500px",
            }}
          >
            <div
              style={{
                marginBottom: "16px",
                textAlign: "left",
                borderBottom: "solid 0.25px #dadada",
                paddingBottom: "15px",
              }}
            >
              <h3
                style={{
                  margin: "0",
                  fontSize: "16px",
                  fontWeight: "500",
                  color: "#1a1a1a",
                }}
              >
                {isEditing ? "Editar Defeito" : "Novo Defeito"}
              </h3>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "12px",
                  color: "#666666",
                }}
              >
                {isEditing
                  ? "Atualize os detalhes do defeito."
                  : "Crie um novo defeito para utilizar ao analisar uma peça."
                }
              </p>
            </div>
            <label style={{ fontWeight: "bold", fontSize: "13px" }}>Nome</label>
            <input
              type="text"
              name="defeito"
              value={newDefect.defeito}
              onChange={handleInputChange}
              placeholder="Descrição do defeito"
              style={{
                padding: "12px",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                backgroundColor: "transparent",
                color: "#333",
                marginBottom: "12px",
                width: "100%",
                fontSize: "14px",
              }}
            />
            <label style={{ fontWeight: "bold", fontSize: "13px" }}>
              Tipo Defeito
            </label>
            <select
              name="tipoDefeitoId"
              value={newDefect.tipoDefeitoId || typeDefects[0]?.id?.toString()}
              onChange={handleInputChange}
              style={{
                padding: "12px",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                backgroundColor: "transparent",
                color: "#333",
                marginBottom: "30px",
                width: "100%",
                fontSize: "14px",
              }}
            >
              {typeDefects?.length === 0 ? (
                <option value="">Nenhum tipo de defeito disponível</option>
              ) : (
                typeDefects?.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.tipoDefeito}
                  </option>
                ))
              )}
            </select>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "right",
              }}
            >
              <button
                onClick={() => {
                  setNewDefect({
                    defeito: "",
                    tipoDefeitoId: typeDefects[0]?.id?.toString() || "",
                  });
                  setEditingDefectId(null);
                  setIsEditing(false);
                  setIsModalOpen(false);
                }}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "transparent",
                  color: "gray",
                  border: "0.25px solid #dadada",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgb(240, 240, 240)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Cancelar
              </button>
              <button
                onClick={isEditing ? handleUpdateDefect : handleCreateDefect}
                style={{
                  padding: "12px 24px",
                  backgroundColor: isEditing ? "#0280DA" : "#10b981",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "background-color 0.2s",
                }}
              >
                {isEditing ? "Salvar Alterações" : "Criar Defeito"}
              </button>
            </div>
          </div>
        )}

        {isDeleteModalOpen && (
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#ffffff",
              padding: "24px",
              borderRadius: "10px",
              boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
              zIndex: 1000,
              width: "300px",
              textAlign: "center",
            }}
          >
            <h3
              style={{
                margin: "0 0 16px",
                fontSize: "16px",
                fontWeight: "500",
                color: "#1a1a1a",
              }}
            >
              Confirmar Exclusão
            </h3>
            <p
              style={{ margin: "0 0 20px", fontSize: "14px", color: "#666666" }}
            >
              Tem certeza que deseja excluir este defeito?
            </p>
            <div
              style={{ display: "flex", justifyContent: "center", gap: "12px" }}
            >
              <button
                onClick={cancelDelete}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "transparent",
                  color: "gray",
                  border: "0.25px solid #dadada",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgb(240, 240, 240)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#dc2626")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#ef4444")
                }
              >
                Confirmar
              </button>
            </div>
          </div>
        )}

        {showToast && (
          <div
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              backgroundColor: "#10b981",
              color: "#ffffff",
              padding: "12px 24px",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              zIndex: 1000,
              fontSize: "14px",
            }}
          >
            Operação realizada com sucesso!
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ScreenDefect;