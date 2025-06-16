/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import {
    App,
    Button,
    Table,
    Select,
    DatePicker,
    Input,
    Checkbox,
    ConfigProvider,
    Space,
    Card,
    message,
} from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';
import * as XLSX from 'xlsx';
import { SortOrder } from 'antd/es/table/interface';
import 'antd/dist/reset.css';
import { Sheet } from 'lucide-react';
import { getAllGarantiasAsync } from '@shared/services/GarantiasService';

const { RangePicker } = DatePicker;
const { Option } = Select;

type ReportData = Record<string, any>;

const ReportScreen: React.FC = () => {
    const [data, setData] = useState<ReportData[]>([]);
    const [filteredData, setFilteredData] = useState<ReportData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [filters, setFilters] = useState<{
        dateRange: [Date | null, Date | null];
        status?: string;
        search: string;
        statusField?: string;
        dateField?: string;
    }>({
        dateRange: [null, null],
        status: undefined,
        search: '',
        statusField: undefined,
        dateField: undefined,
    });
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const [sortConfig, setSortConfig] = useState<{
        key: string;
        order: SortOrder;
    }>({ key: '', order: null });
    const [showColumnSelector, setShowColumnSelector] = useState<boolean>(false);
    const [columns, setColumns] = useState<TableColumnsType<ReportData>>([]);
    const [statusOptions, setStatusOptions] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        const fetchGarantias = async () => {
            setLoading(true);
            try {
                const response = await getAllGarantiasAsync();
                console.log('Resposta da API:', response);

                if (!response?.data?.data || !Array.isArray(response.data.data)) {
                    message.warning('Nenhum dado retornado pela API.');
                    setData([]);
                    setFilteredData([]);
                    setColumns([]);
                    setSelectedColumns([]);
                    setTotalItems(0);
                    return;
                }

                const garantias: ReportData[] = response.data.data;

                if (garantias.length === 0) {
                    message.warning('Nenhuma garantia encontrada.');
                    setData([]);
                    setFilteredData([]);
                    setColumns([]);
                    setSelectedColumns([]);
                    return;
                }

                const firstItem = garantias[0];
                if (!firstItem || typeof firstItem !== 'object') {
                    message.error('Os dados retornados pela API não são válidos.');
                    setData([]);
                    setFilteredData([]);
                    setColumns([]);
                    setSelectedColumns([]);
                    return;
                }

                const excludedKeys = ['notas'];
                const dynamicColumns: TableColumnsType<ReportData> = Object.keys(firstItem)
                    .filter(key => !excludedKeys.includes(key))
                    .map(key => ({
                        title: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
                        dataIndex: key,
                        key: key,
                        sorter: true,
                        sortOrder: sortConfig.key === key ? sortConfig.order : null,
                        render: (value: any) => {
                            if (typeof value === 'number' && key.toLowerCase().includes('valor')) {
                                return `R$ ${value.toFixed(2)}`;
                            }
                            if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
                                return new Date(value).toLocaleDateString('pt-BR');
                            }
                            return value?.toString() || '-';
                        },
                        width: key === 'email' || key === 'observacao' ? 200 : 120,
                    }));

                setColumns(dynamicColumns);
                setSelectedColumns(Object.keys(firstItem).filter(key => !excludedKeys.includes(key)));

                const statusField = Object.keys(firstItem).find(key =>
                    key.toLowerCase().includes('status')
                ) || 'status';
                const dateField = Object.keys(firstItem).find(key =>
                    key.toLowerCase().includes('createdat') || key.toLowerCase().includes('updatedat') || key.toLowerCase().includes('data')
                ) || 'createdAt';
                setFilters(prev => ({ ...prev, statusField, dateField }));

                const uniqueStatuses = [...new Set(garantias.map(item => item[statusField]).filter(Boolean))];
                setStatusOptions(uniqueStatuses);

                setData(garantias);
                setFilteredData(garantias);
                setTotalItems(garantias.length);
            } catch (error) {
                console.error('Erro ao buscar garantias:', error);
                message.error('Erro ao carregar as garantias. Tente novamente mais tarde.');
            } finally {
                setLoading(false);
            }
        };

        fetchGarantias();
    }, [currentPage, pageSize, filters.search]);

    const applyFilters = () => {
        let result = [...data];

        if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1] && filters.dateField) {
            result = result.filter(item => {
                const itemDate = new Date(item[filters.dateField]);
                const startDate = new Date(filters.dateRange[0]);
                const endDate = new Date(filters.dateRange[1]);
                return itemDate >= startDate && itemDate <= endDate;
            });
        }

        if (filters.status && filters.statusField) {
            result = result.filter(item => item[filters.statusField] === filters.status);
        }

        if (sortConfig.key && sortConfig.order) {
            result.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue === undefined || bValue === undefined) return 0;
                return sortConfig.order === 'ascend'
                    ? aValue > bValue ? 1 : -1
                    : aValue < bValue ? 1 : -1;
            });
        }

        setFilteredData(result);
        setTotalItems(result.length);
    };

    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
        }));
        if (key === 'search') {
            setCurrentPage(1);
        }
    };

    const handleTableChange: TableProps<ReportData>['onChange'] = (pagination, filters, sorter) => {
        if (pagination.current && pagination.pageSize) {
            setCurrentPage(pagination.current);
            setPageSize(pagination.pageSize);
        }
        if (!Array.isArray(sorter)) {
            setSortConfig({
                key: sorter.field as string,
                order: sorter.order,
            });
        }
        applyFilters();
    };

    const displayColumns: TableColumnsType<ReportData> = columns.filter(col =>
        selectedColumns.includes(col.key as string)
    );

    const exportToExcel = () => {
        if (filteredData.length === 0) {
            message.warning('Nenhum dado filtrado para exportar.');
            return;
        }

        // const startIndex = (currentPage - 1) * pageSize;
        // const endIndex = startIndex + pageSize;
        const dataToExport = filteredData;

        if (dataToExport.length === 0) {
            message.warning('Nenhum dado na página atual para exportar.');
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatorio');
        XLSX.writeFile(workbook, 'relatorio.xlsx');
    };


    const resetFilters = () => {
        setFilters({
            dateRange: [null, null],
            status: undefined,
            search: '',
            statusField: filters.statusField,
            dateField: filters.dateField,
        });
        setSortConfig({ key: '', order: null });
        setCurrentPage(1);
        setFilteredData(data);
        setTotalItems(data.length);
    };

    const handleRemoveColumn = (columnKey: string) => {
        setSelectedColumns(prev => prev.filter(key => key !== columnKey));
    };

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
                    className="report-container bg-gray-100 p-6"
                    style={{
                        minHeight: '90vh',
                        overflowY: 'auto',
                        maxHeight: '95vh',
                        paddingBottom: '20px',
                    }}
                >
                    <Card className="shadow-lg">
                        <div className="filters flex flex-wrap gap-4 mb-6">
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                <Space
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'right',
                                        width: '100%',
                                        flexDirection: 'row',
                                    }}
                                    wrap
                                >
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <RangePicker
                                            value={filters.dateRange}
                                            onChange={(dates: RangePickerProps['value']) =>
                                                handleFilterChange('dateRange', dates)
                                            }
                                            className="w-64"
                                            style={{ width: '16vw', height: '45px', borderRadius: '10px' }}
                                        />
                                        {filters.statusField && (
                                            <Select
                                                value={filters.status}
                                                onChange={(value: string) =>
                                                    handleFilterChange('status', value)
                                                }
                                                className="w-48"
                                                placeholder="Selecione o Status"
                                                style={{ width: '12vw', height: '45px', borderRadius: '10px' }}
                                                allowClear
                                            >
                                                {statusOptions.map(status => (
                                                    <Option key={status} value={status}>
                                                        {status}
                                                    </Option>
                                                ))}
                                            </Select>
                                        )}
                                        <Input
                                            value={filters.search}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                handleFilterChange('search', e.target.value)
                                            }
                                            placeholder="Pesquisar em todos os campos"
                                            className="w-64"
                                            style={{ width: '12vw', height: '45px', borderRadius: '10px' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <Button
                                            onClick={() => setShowColumnSelector(!showColumnSelector)}
                                            style={{
                                                marginLeft: '10px',
                                                height: '45px',
                                                borderRadius: '10px',
                                            }}
                                            className="mb-2"
                                        >
                                            {showColumnSelector ? 'Ocultar Seleção de Colunas' : 'Editar Colunas'}
                                        </Button>
                                        <Button
                                            type="primary"
                                            onClick={exportToExcel}
                                            style={{
                                                background: 'green',
                                                height: '45px',
                                                borderRadius: '10px',
                                            }}
                                            className="bg-green-600 hover:bg-green-700 ml-auto"
                                        >
                                            <Sheet style={{ height: '20px' }} />
                                            Baixar Excel
                                        </Button>
                                        <Button
                                            onClick={resetFilters}
                                            style={{ height: '45px', borderRadius: '10px' }}
                                        >
                                            Limpar Filtros
                                        </Button>
                                        <Button
                                            type="primary"
                                            onClick={applyFilters}
                                            style={{
                                                height: '45px',
                                                borderRadius: '10px',
                                                backgroundColor: 'red',
                                                boxShadow: 'none',
                                            }}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            Aplicar Filtros
                                        </Button>
                                    </div>
                                </Space>
                                <div
                                    style={{
                                        display: 'flex',
                                        borderRadius: '10px',
                                        // height: '45px',
                                        marginBottom: '20px',
                                        alignItems: 'center',
                                    }}
                                >

                                    {showColumnSelector && (
                                        <Checkbox.Group
                                            options={columns.map(col => ({
                                                label: col.title as string,
                                                value: col.key as string,
                                            }))}
                                            value={selectedColumns}
                                            onChange={(checkedValues: string[]) =>
                                                setSelectedColumns(checkedValues)
                                            }
                                            style={{border: "solid 0.5px #D9D9D9", alignItems: "center", gap: "10px", display: "flex", padding: "10px", borderRadius: "10px"}}
                                            className="mt-2 flex flex-wrap gap-2 custom-checkbox-group"
                                        >
                                            {selectedColumns.map(columnKey => (
                                                <div key={columnKey} className="flex items-center">
                                                    <Checkbox value={columnKey} />
                                                    <span className="ml-1">
                                                        {columns.find(col => col.key === columnKey)?.title}
                                                    </span>
                                                    <Button
                                                        type="link"
                                                        danger
                                                        onClick={() => handleRemoveColumn(columnKey)}
                                                        className="ml-2"
                                                    >
                                                        Remover
                                                    </Button>
                                                </div>
                                            ))}
                                        </Checkbox.Group>
                                    )}
                                </div>
                            </Space>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <Table
                                columns={displayColumns}
                                dataSource={filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                                loading={loading}
                                rowKey={record => record.id || record._id || Math.random().toString()}
                                pagination={{
                                    current: currentPage,
                                    pageSize: pageSize,
                                    total: totalItems,
                                    showSizeChanger: true,
                                    pageSizeOptions: ['10', '20', '50', '100'],
                                    position: ['bottomRight'],
                                }}
                                onChange={handleTableChange}
                                scroll={{ x: 'max-content' }}
                                className="rounded-lg shadow"
                                size="small"
                                bordered
                            />
                        </div>
                    </Card>
                </div>
            </App>
        </ConfigProvider>
    );
};

export default ReportScreen;