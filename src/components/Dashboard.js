import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import CashFlowComboChart from './charts/CashFlowComboChart';
import IncomeExpenseBarChart from './charts/IncomeExpenseBarChart';
import ComparativeChart from './charts/ComparativeChart';
import axiomaIcon from '../assets/axioma-icon.png';

const apiUrl = process.env.REACT_APP_API_URL;

const Dashboard = () => {
    const [incomeExpenseData, setIncomeExpenseData] = useState(null);
    const [comparativeData, setComparativeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [monthsFilter, setMonthsFilter] = useState(12); // Default 12 months

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            setLoading(true);
            try {
                const [ieChartRes, compChartRes] = await Promise.all([
                    fetch(`${apiUrl}/api/dashboard/charts/income-expense?months=${monthsFilter}`, { headers: { 'x-auth-token': token } }),
                    fetch(`${apiUrl}/api/dashboard/charts/comparative`, { headers: { 'x-auth-token': token } })
                ]);

                if (!ieChartRes.ok || !compChartRes.ok) {
                    throw new Error('Error al cargar los datos del dashboard.');
                }

                setIncomeExpenseData(await ieChartRes.json());
                setComparativeData(await compChartRes.json());
            } catch (err) {
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [apiUrl, monthsFilter]);

    if (loading && !incomeExpenseData) {
        return <p className="p-8 text-center text-gray-500">Cargando dashboard...</p>;
    }

    if (!incomeExpenseData || !comparativeData) {
        return <p className="p-8 text-center text-red-500">Error: No se pudieron cargar los datos del dashboard.</p>;
    }

    // --- Cálculo del Cambio Neto para CashFlow ---
    const netChangeData = incomeExpenseData.incomeData.map((income, index) => {
        return income - incomeExpenseData.expenseData[index];
    });

    const cashFlowChartData = {
        labels: incomeExpenseData.labels,
        incomeData: incomeExpenseData.incomeData,
        outflowData: incomeExpenseData.expenseData.map(value => -value),
        netChangeData: netChangeData
    };

    return (
        <div className="p-6">
            <header className="flex justify-between items-center mb-8">
                <h2 className="flex items-center gap-3 text-3xl font-semibold text-gray-800">
                    <img src={axiomaIcon} alt="Axioma Icon" className="w-8 h-8 object-contain" />
                    Dashboard Financiero
                </h2>

                {/* Filtro de Meses */}
                <div className="flex items-center gap-2">
                    <label className="text-gray-600 font-medium">Periodo:</label>
                    <select
                        value={monthsFilter}
                        onChange={(e) => setMonthsFilter(parseInt(e.target.value))}
                        className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value={12}>Últimos 12 Meses</option>
                        <option value={26}>Últimos 26 Meses</option>
                    </select>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Gráfico de Flujo de Caja (Combo) */}
                <div className="bg-white p-6 rounded-xl shadow-lg h-[400px] lg:col-span-2">
                    <CashFlowComboChart chartData={cashFlowChartData} />
                </div>

                {/* 2. Gráfico de Ingresos vs Gastos (Barras) */}
                <div className="bg-white p-6 rounded-xl shadow-lg h-[400px]">
                    <IncomeExpenseBarChart chartData={incomeExpenseData} />
                </div>

                {/* 3. Gráfico Comparativo (Año Actual vs Anterior) */}
                <div className="bg-white p-6 rounded-xl shadow-lg h-[400px]">
                    <ComparativeChart chartData={comparativeData} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;