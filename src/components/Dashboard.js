import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom'; // Ya no se necesita para los KPIs
import { toast } from 'react-toastify';
// Importamos el nuevo gráfico combinado
import CashFlowComboChart from './charts/CashFlowComboChart';
// Eliminamos la importación de ExpensePieChart
import axiomaIcon from '../assets/axioma-icon.png';

const apiUrl = process.env.REACT_APP_API_URL;

const Dashboard = () => {
    // Eliminamos los estados para 'summaryData' y 'expenseCategoryData'
    const [incomeExpenseData, setIncomeExpenseData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            try {
                // Ahora solo necesitamos una petición a la API
                const ieChartRes = await fetch(`${apiUrl}/api/dashboard/charts/income-expense`, { headers: { 'x-auth-token': token } });

                if (!ieChartRes.ok) {
                    throw new Error('Error al cargar los datos del dashboard.');
                }

                setIncomeExpenseData(await ieChartRes.json());
            } catch (err) {
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [apiUrl]);

    // --- RENDERIZADO ---

    if (loading) {
        return <p>Cargando dashboard...</p>;
    }

    if (!incomeExpenseData) {
        return <p>Error: No se pudieron cargar los datos del dashboard. Intenta recargar la página.</p>;
    }

    // --- Cálculo del Cambio Neto ---
    // Calculamos el 'netChangeData' restando gastos de ingresos para cada mes
    const netChangeData = incomeExpenseData.incomeData.map((income, index) => {
        return income - incomeExpenseData.expenseData[index];
    });

    // Preparamos los datos para el nuevo gráfico
    const cashFlowChartData = {
        labels: incomeExpenseData.labels,
        incomeData: incomeExpenseData.incomeData,
        // --- LA CORRECCIÓN ESTÁ AQUÍ ---
        // Convertimos los datos de 'expenseData' a valores negativos usando .map()
        outflowData: incomeExpenseData.expenseData.map(value => -value),
        netChangeData: netChangeData
    };

    return (
        <div>
            <header>
                <h2 className="flex items-center gap-3 text-3xl font-semibold text-gray-800 mb-8">
                    <img src={axiomaIcon} alt="Axioma Icon" className="w-8 h-8 object-contain" />
                    Dashboard
                </h2>
            </header>

            {/* --- Tarjetas KPI Eliminadas --- */}

            {/* --- Gráfico de Flujo de Caja --- */}
            {/* Hacemos que este gráfico ocupe todo el ancho */}
            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg h-[60vh] relative">
                    <CashFlowComboChart chartData={cashFlowChartData} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;