/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Edit, Trash2 } from "lucide-react";
import React, { useState, useEffect, Component } from "react";
import {
  getTransportadoras,
  createTransportadora,
  deleteTransportadora,
  updateTransportadora
} from "@shared/services/transportadorasService";
import { Transportadora } from "@shared/models/TransportadoraModel";

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

const ScreenTransportadora: React.FC = () => {
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([]);
  const [newTransportadora, setNewTransportadora] = useState<Partial<Transportadora>>({});

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [transportadoraToDelete, setTransportadoraToDelete] = useState<
    string | null
  >(null);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransportadora, setSelectedTransportadora] = useState<Transportadora | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTransportadoras();
      if (!Array.isArray(data)) {
        setError("Formato de dados inválido para transportadoras.");
        setTransportadoras([]);
        return;
      }
      setTransportadoras(data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar transportadoras.");
      setTransportadoras([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTransportadora((prev) => ({ ...prev, [name]: value }));
  };


  const handleCreate = async () => {
    if (!newTransportadora.razaoSocial) {
      setError("Preencha a razão social.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    try {
      await createTransportadora({
        razaoSocial: newTransportadora.razaoSocial,
        cnpj: newTransportadora.cnpj,
        rua: newTransportadora.rua,
        numero: newTransportadora.numero,
        bairro: newTransportadora.bairro,
        municipio: newTransportadora.municipio,
        uf: newTransportadora.uf,
        complemento: newTransportadora.complemento,
      });
      await fetchData();
      setNewTransportadora({
        razaoSocial: "",
        cnpj: "",
        rua: "",
        numero: "",
        bairro: "",
        municipio: "",
        uf: "",
        complemento: "",
      });
      setIsModalOpen(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err: any) {
      setError("Erro ao criar transportadora.");
      setTimeout(() => setError(err), 3000);
    }
  };

  const handleEdit = (transportadora: Transportadora) => {
    setSelectedTransportadora(null);
    setNewTransportadora({
      id: transportadora.id,
      razaoSocial: transportadora.razaoSocial,
      cnpj: transportadora.cnpj,
      rua: transportadora.rua,
      numero: transportadora.numero,
      bairro: transportadora.bairro,
      municipio: transportadora.municipio,
      uf: transportadora.uf,
      complemento: transportadora.complemento,
    });
    setIsEditing(true);
    setIsModalOpen(true);

  };

  const handleUpdate = async () => {
    // console.log("newTransportadora: ", newTransportadora);

    if (!newTransportadora.id) return;

    try {
      await updateTransportadora(newTransportadora.id, newTransportadora);
      await fetchData();
      setIsModalOpen(false);
      setSelectedTransportadora(null);
      setIsEditing(false);
      setNewTransportadora({
        razaoSocial: "",
        cnpj: "",
        rua: "",
        numero: "",
        bairro: "",
        municipio: "",
        uf: "",
        complemento: "",
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err: any) {
      setError("Erro ao atualizar transportadora.");
      setTimeout(() => setError(null), 3000);
    }
  };


  const handleDelete = (id: string) => {
    setTransportadoraToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (transportadoraToDelete) {
      try {
        await deleteTransportadora(transportadoraToDelete);
        setTransportadoras((prev) =>
          prev.filter((t) => t.id !== transportadoraToDelete)
        );
        setIsDeleteModalOpen(false);
        setTransportadoraToDelete(null);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (err: any) {
        setError("Erro ao excluir transportadora.");
        setTimeout(() => setError(err), 3000);
      }
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setTransportadoraToDelete(null);
  };




  const handleCardClick = (transportadora: Transportadora) => {
    setNewTransportadora({ // Preenche o formulário
      razaoSocial: transportadora.razaoSocial,
      cnpj: transportadora.cnpj,
      rua: transportadora.rua,
      numero: transportadora.numero,
      bairro: transportadora.bairro,
      municipio: transportadora.municipio,
      uf: transportadora.uf,
      complemento: transportadora.complemento,
    });
    setSelectedTransportadora(transportadora); // Mostra apenas o modal de detalhes
    setIsEditing(false);
    setIsModalOpen(false); // ← Impede abrir o modal de edição
  };

  const closePopup = () => {
    setSelectedTransportadora(null);
  };

  const filteredTransportadoras = Array.isArray(transportadoras)
    ? transportadoras.filter((t) =>
      t.razaoSocial?.toLowerCase().includes(searchTerm.toLowerCase())
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
          padding: "32px",
          backgroundColor: "#fff",
          minHeight: "100vh",
          paddingBottom: "80px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <input
            type="text"
            placeholder="Pesquisar razão social..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              width: "300px",
              backgroundColor: "#fff",
              color: "#000",
            }}
          />
          <button
            onClick={() => {
              setIsModalOpen(true);
              setIsEditing(false);
              setNewTransportadora({
                razaoSocial: "",
                cnpj: "",
                rua: "",
                numero: "",
                bairro: "",
                municipio: "",
                uf: "",
                complemento: "",
              });
            }}
            style={{
              padding: "12px 24px",
              backgroundColor: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Nova Transportadora
          </button>
        </div>

        {error && (
          <div style={{ color: "red", marginBottom: "16px" }}>
            {error}
            <button onClick={fetchData} style={{ marginLeft: "10px" }}>
              Tentar Novamente
            </button>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          {filteredTransportadoras.length === 0 ? (
            <p style={{ textAlign: "center" }}>
              Nenhuma transportadora encontrada.
            </p>
          ) : (
            filteredTransportadoras.map((t) => (
              <div
                key={t.id}
                onClick={() => handleCardClick(t)}
                style={{
                  padding: "16px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={{ fontWeight: "bold" }}>Nome:</label>
                  <span style={{ color: "gray" }}>{t.razaoSocial}</span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Impede abrir os detalhes
                      handleEdit(t);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#3b82f6", // azul
                      cursor: "pointer",
                    }}
                  >
                    <Edit style={{ color: "#0280DA", height: "20px" }} />

                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ef4444",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {isModalOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 999,
            }}
          >
            <div
              style={{
                backgroundColor: "#fff",
                padding: "24px",
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                width: "400px",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <h3 style={{ marginBottom: "16px" }}>
                {isEditing ? "Editar Transportadora" : "Nova Transportadora"}
              </h3>

              {[
                { name: "razaoSocial", placeholder: "Razão Social" },
                { name: "cnpj", placeholder: "CNPJ" },
                { name: "rua", placeholder: "Rua" },
                { name: "numero", placeholder: "Número" },
                { name: "bairro", placeholder: "Bairro" },
                { name: "municipio", placeholder: "Município" },
                { name: "uf", placeholder: "UF (Ex: SP)", maxLength: 2 },
                { name: "complemento", placeholder: "Complemento (opcional)" },
              ].map((field) => (
                <input
                  key={field.name}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={(newTransportadora as any)[field.name] || ""}
                  onChange={handleInputChange}
                  maxLength={field.maxLength}
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    width: "100%",
                    marginBottom: "16px",
                    backgroundColor: "#fff",
                    color: "#000",
                  }}
                />
              ))}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "16px",
                }}
              >
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#fff",
                    color: "#000",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={isEditing ? handleUpdate : handleCreate}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#10b981",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                  }}
                >
                  {isEditing ? "Salvar Alterações" : "Criar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {isDeleteModalOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 999,
            }}
          >
            <div
              style={{
                backgroundColor: "#fff",
                padding: "24px",
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                width: "300px",
                textAlign: "center",
              }}
            >
              <h4>Confirmar Exclusão</h4>
              <p>Deseja excluir esta transportadora?</p>
              <div
                style={{ display: "flex", justifyContent: "center", gap: "12px" }}
              >
                <button
                  onClick={cancelDelete}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#fff",
                    color: "#000",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  style={{
                    backgroundColor: "#ef4444",
                    color: "#fff",
                    padding: "8px 16px",
                  }}
                >
                  Confirmar
                </button>
              </div>
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
              color: "#fff",
              padding: "12px 24px",
              borderRadius: "8px",
              zIndex: 1000,
            }}
          >
            Operação realizada com sucesso!
          </div>
        )}

        {selectedTransportadora && !isModalOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 999,
            }}
          >
            <div
              style={{
                backgroundColor: "#fff",
                padding: "24px",
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                width: "400px",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <h3 style={{ marginBottom: "16px" }}>Detalhes da Transportadora</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ fontWeight: "bold" }}>Nome:</label>
                  <span style={{ color: "gray" }}>{selectedTransportadora.razaoSocial}</span>
                </div>
                <div>
                  <label style={{ fontWeight: "bold" }}>CNPJ:</label>
                  <span style={{ color: "gray" }}>{selectedTransportadora.cnpj}</span>
                </div>
                <div>
                  <label style={{ fontWeight: "bold" }}>Bairro:</label>
                  <span style={{ color: "gray" }}>{selectedTransportadora.bairro}</span>
                </div>
                <div>
                  <label style={{ fontWeight: "bold" }}>Complemento:</label>
                  <span style={{ color: "gray" }}>{selectedTransportadora.complemento}</span>
                </div>
                <div>
                  <label style={{ fontWeight: "bold" }}>Município:</label>
                  <span style={{ color: "gray" }}>{selectedTransportadora.municipio}</span>
                </div>
                <div>
                  <label style={{ fontWeight: "bold" }}>Número:</label>
                  <span style={{ color: "gray" }}>{selectedTransportadora.numero}</span>
                </div>
                <div>
                  <label style={{ fontWeight: "bold" }}>Rua:</label>
                  <span style={{ color: "gray" }}>{selectedTransportadora.rua}</span>
                </div>
                <div>
                  <label style={{ fontWeight: "bold" }}>UF:</label>
                  <span style={{ color: "gray" }}>{selectedTransportadora.uf}</span>
                </div>
              </div>
              <button
                onClick={closePopup}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#fff",
                  color: "#000",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  cursor: "pointer",
                  marginTop: "16px",
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ScreenTransportadora;