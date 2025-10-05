import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Papa from 'papaparse';
import './Invoices.css';
import './Reports.css';

const apiUrl = process.env.REACT_APP_API_URL;

const CashFlowStatement = () => {
    const [profile, setProfile] = useState(null);
    const [dates, setDates] = useState({
        startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
    });
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(`${apiUrl}/api/profile`, { headers: { 'x-auth-token': token } })
            .then(res => res.json()).then(data => setProfile(data));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setReportData(null);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${apiUrl}/api/reports/cash-flow`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(dates),
            });
            if (!response.ok) throw new Error('Error al generar el reporte.');
            const data = await response.json();
            setReportData(data);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };


    const handleExport = async (format) => {
        if (!reportData) {
            toast.error("Primero genera un reporte para poder exportarlo.");
            return;
        }
        const token = localStorage.getItem('token');
        const filename = `Flujo_de_Caja_${dates.endDate}`;

        if (format === 'csv') {
            const dataForCsv = [
                { Actividad: "Entradas de Efectivo (Cobros a Clientes)", Monto: reportData.operatingActivities.inflows.toFixed(2) },
                { Actividad: "Salidas de Efectivo (Pagos y Gastos)", Monto: reportData.operatingActivities.outflows.toFixed(2) },
                { Actividad: "Flujo de Caja Neto de Operaciones", Monto: reportData.operatingActivities.net.toFixed(2) }
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
                const response = await fetch(`${apiUrl}/api/reports/cash-flow/pdf`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                    body: JSON.stringify(dates),
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
                    <h3>Estado de Flujo de Caja</h3>
                </div>
            )}
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
                <div><label>Desde:</label><input type="date" name="startDate" value={dates.startDate} onChange={(e) => setDates({ ...dates, startDate: e.target.value })} required /></div>
                <div><label>Hasta:</label><input type="date" name="endDate" value={dates.endDate} onChange={(e) => setDates({ ...dates, endDate: e.target.value })} required /></div>
                <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Generando...' : 'Generar Reporte'}</button>
            </form>

            {reportData && (
                <div className="report-actions" style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-secondary" onClick={() => handleExport('csv')}>Exportar a Excel</button>
                    <button className="btn-secondary" onClick={() => handleExport('pdf')}>Exportar a PDF</button>
                </div>
            )}

            {loading && <p>Generando reporte...</p>}

            {reportData && (
                <div className="report-results">
                    <h4>Resultados para el período del {new Date(reportData.startDate).toLocaleDateString()} al {new Date(reportData.endDate).toLocaleDateString()}</h4>
                    <div className="balance-sheet-container">
                        <div className="bs-column">
                            <div className="bs-header">Actividades de Operación</div>
                            <div className="bs-row"><span>Entradas de Efectivo (Cobros a Clientes)</span><span style={{ color: 'green' }}>${reportData.operatingActivities.inflows.toFixed(2)}</span></div>
                            <div className="bs-row"><span>Salidas de Efectivo (Pagos a Suplidores/Gastos)</span><span style={{ color: 'red' }}>- ${reportData.operatingActivities.outflows.toFixed(2)}</span></div>
                            <div className="bs-total-row"><span>Flujo de Caja Neto de Operaciones</span><span>${reportData.operatingActivities.net.toFixed(2)}</span></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default CashFlowStatement;