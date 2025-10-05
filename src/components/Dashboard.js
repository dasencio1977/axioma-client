// client/src/components/Dashboard.js

import React, { useState, useEffect } from 'react';
//import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import IncomeExpenseChart from './charts/IncomeExpenseChart';
import ExpensePieChart from './charts/ExpensePieChart';
import './Dashboard.css';

const apiUrl = process.env.REACT_APP_API_URL;

const Dashboard = () => {
    // --- ESTADOS ---
    const [summaryData, setSummaryData] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expenseCategoryData, setExpenseCategoryData] = useState(null);

    // --- EFECTOS ---
    // useEffect se ejecuta una vez cuando el componente se carga.
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            try {
                // Hacemos ambas peticiones en paralelo
                const [summaryRes, chartRes, expenseCatRes] = await Promise.all([
                    fetch(`${apiUrl}/api/dashboard/summary`, { headers: { 'x-auth-token': token } }),
                    fetch(`${apiUrl}/api/dashboard/charts/income-expense`, { headers: { 'x-auth-token': token } }),
                    fetch(`${apiUrl}/api/dashboard/charts/expense-by-category`, { headers: { 'x-auth-token': token } })
                ]);

                if (!summaryRes.ok || !chartRes.ok || !expenseCatRes.ok) throw new Error('Error al cargar los datos del dashboard.');

                const summary = await summaryRes.json();
                const chart = await chartRes.json();

                setSummaryData(summary);
                setChartData(chart);
                setExpenseCategoryData(await expenseCatRes.json());

            } catch (err) {
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []); // El array vacío asegura que solo se ejecute al montar.

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    // --- RENDERIZADO ---

    // Mostramos un mensaje mientras los datos están en camino.
    if (loading) return <p>Cargando dashboard...</p>;
    // Mostramos un mensaje si hubo un error.
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="dashboard-container">
            <header>
                <h2 className="page-header-with-icon">
                    <img src="/axioma-icon.png" alt="Axioma Icon" className="page-icon" />
                    Dashboard
                </h2>
            </header>

            {/* Contenedor de las tarjetas de KPI */}
            <div className="kpi-cards-grid">
                <div className="kpi-card">
                    <h3>Ingresos Totales (Pagado)</h3>
                    <p className="value positive">${summaryData.totalRevenue.toLocaleString('es-US', { minimumFractionDigits: 2 })}</p>
                </div>

                <Link to="/invoices?status=Pendiente" className="kpi-card-link">
                    <div className="kpi-card">
                        <h3>Cuentas por Cobrar</h3>
                        <p className="value warning">${summaryData.totalReceivable.toLocaleString('es-US', { minimumFractionDigits: 2 })}</p>
                    </div>
                </Link>

                <Link to="/clients" className="kpi-card-link">
                    <div className="kpi-card">
                        <h3>Clientes Activos</h3>
                        <p className="value">{summaryData.clientCount}</p>
                    </div>
                </Link>

                <Link to="/invoices?status=Vencida" className="kpi-card-link">
                    <div className="kpi-card">
                        <h3>Facturas Vencidas</h3>
                        <p className="value" style={{ color: '#dc3545' }}>{summaryData.overdueCount}</p>
                    </div>
                </Link>
            </div>
            <div className="charts-grid">
                <div className="chart-container" >
                    <IncomeExpenseChart chartData={chartData} /></div>
                <div className="chart-container" >
                    <ExpensePieChart chartData={expenseCategoryData} />
                </div>
            </div>
            <br />
            <button onClick={handleLogout}>Cerrar Sesión</button>
        </div>
    );
};

export default Dashboard;