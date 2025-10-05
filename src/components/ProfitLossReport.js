import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Papa from 'papaparse';
import './Invoices.css';
import './Reports.css';

const apiUrl = process.env.REACT_APP_API_URL;

const ProfitLossReport = () => {
    const [profile, setProfile] = useState(null);
    const [plDates, setPlDates] = useState({
        startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
    });
    const [plReportData, setPlReportData] = useState(null);
    const [plLoading, setPlLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(`${apiUrl}/api/profile`, { headers: { 'x-auth-token': token } })
            .then(res => res.json())
            .then(data => setProfile(data))
            .catch(err => toast.error("No se pudo cargar el perfil de la empresa."));
    }, []);

    const handlePlSubmit = async (e) => {
        e.preventDefault();
        setPlLoading(true);
        setPlReportData(null);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${apiUrl}/api/reports/profit-loss`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(plDates),
            });
            if (!response.ok) throw new Error('Error al generar el reporte P&L.');
            const data = await response.json();
            setPlReportData(data);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setPlLoading(false);
        }
    };

    const handleExport = async (format) => {
        if (!plReportData) {
            toast.error("Primero genera un reporte para poder exportarlo.");
            return;
        }
        const token = localStorage.getItem('token');
        const filename = `Ganancias_Perdidas_${plDates.endDate}`;

        if (format === 'csv') {
            const dataForCsv = [
                { Rubro: 'Ingresos Totales', Monto: plReportData.totalIncome.toFixed(2) },
                { Rubro: 'Gastos Totales', Monto: plReportData.totalExpenses.toFixed(2) },
                { Rubro: 'Ganancia Neta', Monto: plReportData.netProfit.toFixed(2) }
            ];
            const csv = Papa.unparse(dataForCsv);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.setAttribute("download", `${filename}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (format === 'pdf') {
            try {
                toast.info('Generando PDF...');
                const response = await fetch(`${apiUrl}/api/reports/profit-loss/pdf`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                    body: JSON.stringify(plDates),
                });
                if (!response.ok) throw new Error('No se pudo generar el PDF.');
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${filename}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } catch (err) {
                toast.error(err.message);
            }
        }
    };

    return (
        <div>
            {profile && (
                <div className="report-header">
                    <h2>{profile.company_name}</h2>
                    <h3>Reporte de Ganancias y Pérdidas</h3>
                </div>
            )}
            <form onSubmit={handlePlSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
                <div className='form-group'>
                    <label>Desde:</label>
                    <input type="date" name="startDate" value={plDates.startDate} onChange={(e) => setPlDates({ ...plDates, startDate: e.target.value })} required />
                </div>
                <div className='form-group'>
                    <label>Hasta:</label>
                    <input type="date" name="endDate" value={plDates.endDate} onChange={(e) => setPlDates({ ...plDates, endDate: e.target.value })} required />
                </div>
                <button type="submit" disabled={plLoading} className="btn-primary">{plLoading ? 'Generando...' : 'Generar Reporte'}</button>
            </form>
            {plReportData &&
                <div className="report-actions" style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-secondary" onClick={() => handleExport('csv')}>Exportar a Excel</button>
                    <button className="btn-secondary" onClick={() => handleExport('pdf')}>Exportar a PDF</button>
                </div>}
            {plLoading && <p>Generando reporte...</p>}
            {plReportData && (
                <div className="report-results" style={{ marginTop: '20px' }}>
                    <h4>Resultados para el período del {new Date(plReportData.startDate).toLocaleDateString()} al {new Date(plReportData.endDate).toLocaleDateString()}</h4>
                    <p><strong>Total de Ingresos:</strong> <span style={{ color: 'green' }}>${plReportData.totalIncome.toFixed(2)}</span></p>
                    <p><strong>Total de Gastos:</strong> <span style={{ color: 'red' }}>${plReportData.totalExpenses.toFixed(2)}</span></p>
                    <p><strong>Ganancia Neta:</strong> <strong>${plReportData.netProfit.toFixed(2)}</strong></p>
                </div>
            )}
        </div>
    );
};
export default ProfitLossReport;