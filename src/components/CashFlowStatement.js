import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Papa from 'papaparse';
// Eliminamos la importación de './Invoices.css' y './Reports.css'
import axiomaIcon from '../assets/axioma-icon.png'; // Importamos el ícono

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
            .then(res => res.json())
            .then(data => setProfile(data))
            .catch(err => toast.error("No se pudo cargar el perfil de la empresa."));
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
            {/* --- Encabezado --- */}
            {profile && (
                <div className="mb-6">
                    <h2 className="text-3xl font-semibold text-gray-800">{profile.company_name}</h2>
                    <h3 className="text-xl text-gray-600">Estado de Flujo de Caja</h3>
                </div>
            )}

            {/* --- Formulario de Fecha --- */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4 mb-4 p-4 bg-white rounded-xl shadow-lg">
                <div className="flex items-center gap-2">
                    <label htmlFor="startDate" className="text-sm font-bold text-gray-700">Desde:</label>
                    <input type="date" name="startDate" id="startDate" value={dates.startDate} onChange={(e) => setDates({ ...dates, startDate: e.target.value })} required
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="endDate" className="text-sm font-bold text-gray-700">Hasta:</label>
                    <input type="date" name="endDate" id="endDate" value={dates.endDate} onChange={(e) => setDates({ ...dates, endDate: e.target.value })} required
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button type="submit" disabled={loading}
                    className="py-2 px-5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:bg-gray-400">
                    {loading ? 'Generando...' : 'Generar Reporte'}
                </button>
            </form>

            {/* --- Botones de Acción y Resultados --- */}
            {loading && <p className="text-center text-gray-600 mt-4">Generando reporte...</p>}

            {reportData && (
                <>
                    <div className="flex gap-2 my-4">
                        <button className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300" onClick={() => handleExport('csv')}>Exportar a Excel</button>
                        <button className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300" onClick={() => handleExport('pdf')}>Exportar a PDF</button>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">
                            Resultados para el período del {new Date(reportData.startDate).toLocaleDateString()} al {new Date(reportData.endDate).toLocaleDateString()}
                        </h4>

                        <div className="max-w-2xl">
                            <div className="text-lg font-semibold text-gray-800 border-b-2 border-gray-300 pb-2 mb-4">Actividades de Operación</div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-700">Entradas de Efectivo (Cobros a Clientes)</span>
                                <span className="font-medium text-green-600">${reportData.operatingActivities.inflows.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-700">Salidas de Efectivo (Pagos y Gastos)</span>
                                <span className="font-medium text-red-600">(${reportData.operatingActivities.outflows.toFixed(2)})</span>
                            </div>
                            <div className="flex justify-between py-3 mt-4 font-bold text-gray-900 text-lg border-t-2 border-gray-400">
                                <span>Flujo de Caja Neto de Operaciones</span>
                                <span>${reportData.operatingActivities.net.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CashFlowStatement;