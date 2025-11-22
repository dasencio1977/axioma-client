import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Papa from 'papaparse';
// Eliminamos la importación de './Invoices.css' y './Reports.css'
import axiomaIcon from '../assets/axioma-icon.png'; // Importamos el ícono

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
            {/* --- Encabezado --- */}
            {profile && (
                <div className="mb-6">
                    <h2 className="flex items-center gap-3 text-3xl font-semibold text-gray-800 mb-2">
                        <img src={axiomaIcon} alt="Axioma Icon" className="w-8 h-8 object-contain" />
                        Reporte de Ganancias y Pérdidas
                    </h2>
                    <h3 className="text-xl text-gray-600">{profile.company_name}</h3>
                </div>
            )}

            {/* --- Formulario de Fecha --- */}
            <form onSubmit={handlePlSubmit} className="flex flex-col sm:flex-row items-center gap-4 mb-4 p-4 bg-white rounded-xl shadow-lg">
                <div className="flex items-center gap-2">
                    <label htmlFor="startDate" className="text-sm font-bold text-gray-700">Desde:</label>
                    <input type="date" name="startDate" id="startDate" value={plDates.startDate} onChange={(e) => setPlDates({ ...plDates, startDate: e.target.value })} required
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="endDate" className="text-sm font-bold text-gray-700">Hasta:</label>
                    <input type="date" name="endDate" id="endDate" value={plDates.endDate} onChange={(e) => setPlDates({ ...plDates, endDate: e.target.value })} required
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button type="submit" disabled={plLoading}
                    className="py-2 px-5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:bg-gray-400">
                    {plLoading ? 'Generando...' : 'Generar Reporte'}
                </button>
            </form>

            {/* --- Botones de Acción y Resultados --- */}
            {plLoading && <p className="text-center text-gray-600 mt-4">Generando reporte...</p>}

            {plReportData && (
                <>
                    <div className="flex gap-2 my-4">
                        <button className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300" onClick={() => handleExport('csv')}>Exportar a Excel</button>
                        <button className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300" onClick={() => handleExport('pdf')}>Exportar a PDF</button>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">
                            Resultados para el período del {new Date(plReportData.startDate).toLocaleDateString()} al {new Date(plReportData.endDate).toLocaleDateString()}
                        </h4>

                        <div className="max-w-md space-y-3">
                            <div className="flex justify-between text-lg">
                                <span className="font-medium text-gray-700">Total de Ingresos:</span>
                                <span className="font-bold text-green-600">${plReportData.totalIncome.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg">
                                <span className="font-medium text-gray-700">Total de Gastos:</span>
                                <span className="font-bold text-red-600">(${plReportData.totalExpenses.toFixed(2)})</span>
                            </div>
                            <hr className="my-2" />
                            <div className="flex justify-between text-xl font-bold text-gray-900 border-t-2 border-gray-300 pt-3">
                                <span>Ganancia Neta:</span>
                                <span>${plReportData.netProfit.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ProfitLossReport;