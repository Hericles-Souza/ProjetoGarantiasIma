/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import {
  App,
  Button,
  Card,
  Checkbox,
  ConfigProvider,
  DatePicker,
  Input,
  Select,
  Space,
  Table,
  message,
} from "antd";
import type { TableColumnsType, TableProps } from "antd";
import { SortOrder } from "antd/es/table/interface";
import * as XLSX from "xlsx";
import { Sheet } from "lucide-react";
import { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

export type ReportData = Record<string, any>;

type Filters = {
  dateRange: [Dayjs | null, Dayjs | null] | null;
  status?: string;
  search: string;
};

const EMPTY_FILTERS: Filters = { dateRange: [null, null], status: undefined, search: "" };

interface DynamicReportProps {
  /** Busca todas as linhas do relatório (a paginação é feita na tela). */
  load: () => Promise<ReportData[]>;
  sheetName: string;
  fileName: string;
  emptyMessage: string;
  errorMessage: string;
}

const isScalar = (value: unknown) =>
  value === null || value === undefined || typeof value !== "object" || value instanceof Date;

const formatTitle = (key: string) => key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");

const renderCell = (key: string) => (value: any) => {
  if (typeof value === "number" && key.toLowerCase().includes("valor")) {
    return `R$ ${value.toFixed(2)}`;
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return new Date(value).toLocaleDateString("pt-BR");
  }
  return value?.toString() || "-";
};

const compare = (a: any, b: any) => {
  if (a === b) return 0;
  if (a === undefined || a === null) return -1;
  if (b === undefined || b === null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "pt-BR", { numeric: true });
};

/**
 * Relatório dinâmico (colunas geradas a partir dos dados) usado pelas telas de relatório.
 * As cinco telas eram cópias de ~450 linhas deste mesmo código. Correções feitas aqui:
 * - trocar de página buscava tudo de novo na API e descartava os filtros aplicados;
 * - a ordenação usava o estado anterior (só funcionava no segundo clique);
 * - o período ignorava registros do último dia depois do horário em que o filtro foi escolhido;
 * - o relatório de garantias ignorava o campo de pesquisa;
 * - o de ACI buscava só a primeira página e as demais apareciam vazias.
 */
const DynamicReport: React.FC<DynamicReportProps> = ({
  load,
  sheetName,
  fileName,
  emptyMessage,
  errorMessage,
}) => {
  const [data, setData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [draftFilters, setDraftFilters] = useState<Filters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<{ key: string; order: SortOrder }>({ key: "", order: null });
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let active = true;
    setLoading(true);

    load()
      .then((rows) => {
        if (!active) return;
        const valid = Array.isArray(rows) ? rows.filter((r) => r && typeof r === "object") : [];
        if (!valid.length) message.warning(emptyMessage);
        setData(valid);
      })
      .catch((error) => {
        console.error(error);
        if (active) message.error(`${errorMessage}: ${error?.message || "Erro desconhecido"}`);
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
    // Carrega uma vez; load é uma função estável definida em cada tela.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Colunas simples (campos com objeto/lista, como "notas" e "itens", ficam de fora). */
  const columnKeys = useMemo(() => {
    const first = data[0];
    return first ? Object.keys(first).filter((key) => isScalar(first[key])) : [];
  }, [data]);

  useEffect(() => setSelectedColumns(columnKeys), [columnKeys]);

  const statusField = useMemo(
    () => columnKeys.find((k) => k.toLowerCase().includes("status")) ?? "status",
    [columnKeys]
  );
  const dateField = useMemo(
    () =>
      columnKeys.find((k) => {
        const key = k.toLowerCase();
        return key.includes("createdat") || key.includes("updatedat") || key.includes("data");
      }) ?? "createdAt",
    [columnKeys]
  );

  const statusOptions = useMemo(
    () => [...new Set(data.map((row) => row[statusField]).filter(Boolean))] as string[],
    [data, statusField]
  );

  const filteredData = useMemo(() => {
    const { dateRange, status, search } = appliedFilters;
    let rows = data;

    if (dateRange?.[0] && dateRange?.[1]) {
      const start = dateRange[0].startOf("day").toDate();
      const end = dateRange[1].endOf("day").toDate();
      rows = rows.filter((row) => {
        const date = new Date(row[dateField]);
        return date >= start && date <= end;
      });
    }

    if (status) {
      rows = rows.filter((row) => row[statusField] === status);
    }

    if (search) {
      const term = search.toLowerCase();
      rows = rows.filter((row) =>
        Object.values(row).some((value) => value?.toString().toLowerCase().includes(term))
      );
    }

    if (sort.key && sort.order) {
      const direction = sort.order === "ascend" ? 1 : -1;
      rows = [...rows].sort((a, b) => compare(a[sort.key], b[sort.key]) * direction);
    }

    return rows;
  }, [data, appliedFilters, sort, dateField, statusField]);

  const columns: TableColumnsType<ReportData> = useMemo(
    () =>
      columnKeys
        .filter((key) => selectedColumns.includes(key))
        .map((key) => ({
          title: formatTitle(key),
          dataIndex: key,
          key,
          sorter: true,
          sortOrder: sort.key === key ? sort.order : null,
          render: renderCell(key),
          width: key === "email" || key === "observacao" ? 200 : 120,
        })),
    [columnKeys, selectedColumns, sort]
  );

  const handleTableChange: TableProps<ReportData>["onChange"] = (pagination, _filters, sorter) => {
    if (pagination.current) setPage(pagination.current);
    if (pagination.pageSize) setPageSize(pagination.pageSize);
    if (!Array.isArray(sorter)) {
      setSort({ key: (sorter.field as string) ?? "", order: sorter.order ?? null });
    }
  };

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    setPage(1);
  };

  const resetFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setSort({ key: "", order: null });
    setPage(1);
  };

  const exportToExcel = () => {
    if (!filteredData.length) {
      message.warning("Nenhum dado para exportar.");
      return;
    }
    // Exporta as colunas visíveis, na ordem da tela.
    const rows = filteredData.map((row) =>
      Object.fromEntries(selectedColumns.map((key) => [formatTitle(key), row[key]]))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), sheetName);
    XLSX.writeFile(workbook, fileName);
  };

  const inputStyle = { height: "45px", borderRadius: "10px" };

  return (
    <ConfigProvider>
      <App>
        <style>
          {`
            .custom-checkbox-group .ant-checkbox-checked .ant-checkbox-inner {
              background-color: #ff0000 !important;
              border-color: #ff0000 !important;
            }
            .custom-checkbox-group .ant-checkbox-checked .ant-checkbox-inner::after {
              border-color: #ffffff !important;
            }
          `}
        </style>
        <div
          className="report-container"
          style={{ minHeight: "90vh", overflowY: "auto", maxHeight: "95vh", paddingBottom: "20px" }}
        >
          <Card>
            <Space direction="vertical" size="middle" style={{ width: "100%", marginBottom: 24 }}>
              <Space style={{ display: "flex", justifyContent: "right", width: "100%" }} wrap>
                <div style={{ display: "flex", gap: "15px" }}>
                  <RangePicker
                    value={draftFilters.dateRange}
                    onChange={(dates) =>
                      setDraftFilters((f) => ({ ...f, dateRange: dates as Filters["dateRange"] }))
                    }
                    style={{ ...inputStyle, width: "16vw" }}
                  />
                  <Select
                    value={draftFilters.status}
                    onChange={(status: string) => setDraftFilters((f) => ({ ...f, status }))}
                    placeholder="Selecione o Status"
                    style={{ ...inputStyle, width: "12vw" }}
                    allowClear
                    options={statusOptions.map((s) => ({ label: s, value: s }))}
                  />
                  <Input
                    value={draftFilters.search}
                    onChange={(e) => setDraftFilters((f) => ({ ...f, search: e.target.value }))}
                    onPressEnter={applyFilters}
                    placeholder="Pesquisar em todos os campos"
                    style={{ ...inputStyle, width: "12vw" }}
                  />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <Button
                    onClick={() => setShowColumnSelector((v) => !v)}
                    style={{ ...inputStyle, marginLeft: "10px" }}
                  >
                    {showColumnSelector ? "Ocultar Seleção de Colunas" : "Editar Colunas"}
                  </Button>
                  <Button
                    type="primary"
                    onClick={exportToExcel}
                    style={{ ...inputStyle, background: "green" }}
                  >
                    <Sheet style={{ height: "20px" }} />
                    Baixar Excel
                  </Button>
                  <Button onClick={resetFilters} style={inputStyle}>
                    Limpar Filtros
                  </Button>
                  <Button
                    type="primary"
                    onClick={applyFilters}
                    style={{ ...inputStyle, backgroundColor: "red", boxShadow: "none" }}
                  >
                    Aplicar Filtros
                  </Button>
                </div>
              </Space>

              {showColumnSelector && (
                <Checkbox.Group
                  options={columnKeys.map((key) => ({ label: formatTitle(key), value: key }))}
                  value={selectedColumns}
                  onChange={(checked) => setSelectedColumns(checked as string[])}
                  className="custom-checkbox-group"
                  style={{
                    border: "solid 0.5px #D9D9D9",
                    gap: "10px",
                    display: "flex",
                    flexWrap: "wrap",
                    padding: "10px",
                    borderRadius: "10px",
                  }}
                />
              )}
            </Space>

            <Table
              columns={columns}
              dataSource={filteredData}
              loading={loading}
              rowKey={(record) => record.id ?? record._id ?? JSON.stringify(record)}
              pagination={{
                current: page,
                pageSize,
                total: filteredData.length,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50", "100"],
                position: ["bottomRight"],
              }}
              onChange={handleTableChange}
              scroll={{ x: "max-content" }}
              size="small"
              bordered
            />
          </Card>
        </div>
      </App>
    </ConfigProvider>
  );
};

export default DynamicReport;
