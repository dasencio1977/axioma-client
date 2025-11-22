import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Papa from 'papaparse';
// Eliminamos la importación de './Invoices.css' y './Reports.css'
import axiomaIcon from '../assets/axioma-icon.png'; // Importamos el ícono

const apiUrl = process.env.REACT_APP_API_URL;

const BalanceSheetReport = () => {
    const [profile, setProfile] = useState(null);
    const [bsDate, setBsDate] = useState(new Date().toISOString().slice(0, 10));
    const [balanceSheetData, setBalanceSheetData] = useState(null);
    const [bsLoading, setBsLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(`${apiUrl}/api/profile`, { headers: { 'x-auth-token': token } })
            .then(res => res.json())
            .then(data => setProfile(data))
            .catch(err => toast.error("No se pudo cargar el perfil de la empresa."));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setBsLoading(true);
        setBalanceSheetData(null);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${apiUrl}/api/reports/balance-sheet`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ asOfDate: bsDate }),
            });
            if (!response.ok) throw new Error('Error al generar el Balance General.');
            const data = await response.json();
            setBalanceSheetData(data);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setBsLoading(false);
        }
    };

    const handleExport = async (format) => {
        if (!balanceSheetData) {
            toast.error("Primero genera un reporte para poder exportarlo.");
            return;
        }
        const token = localStorage.getItem('token');
        const filename = `Balance_General_${bsDate}`;

        if (format === 'csv') {
            const dataForCsv = [];
            dataForCsv.push({ Categoria: 'ACTIVOS' });
            balanceSheetData.assets.forEach(item => dataForCsv.push({ Item: item.name, Monto: item.balance.toFixed(2) }));
            dataForCsv.push({ Item: 'Total Activos', Monto: balanceSheetData.totalAssets.toFixed(2) });
            dataForCsv.push({}); // Fila vacía
            dataForCsv.push({ Categoria: 'PASIVOS' });
            balanceSheetData.liabilities.forEach(item => dataForCsv.push({ Item: item.name, Monto: item.balance.toFixed(2) }));
            dataForCsv.push({}); // Fila vacía
            dataForCsv.push({ Categoria: 'PATRIMONIO' });
            balanceSheetData.equity.forEach(item => dataForCsv.push({ Item: item.name, Monto: item.balance.toFixed(2) }));
            dataForCsv.push({ Item: 'Total Pasivos + Patrimonio', Monto: balanceSheetData.totalLiabilitiesAndEquity.toFixed(2) });

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
                const response = await fetch(`${apiUrl}/api/reports/balance-sheet/pdf`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                    body: JSON.stringify({ asOfDate: bsDate }),
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
                        Balance General
                    </h2>
                    <h3 className="text-xl text-gray-600">{profile.company_name}</h3>
                </div>
            )}

            {/* --- Formulario de Fecha --- */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4 mb-4 p-4 bg-white rounded-xl shadow-lg">
                <div className="flex items-center gap-2">
                    <label htmlFor="bsDate" className="text-sm font-bold text-gray-700">Hasta la fecha:</label>
                    <input type="date" value={bsDate} id="bsDate" onChange={(e) => setBsDate(e.target.value)} required
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button type="submit" disabled={bsLoading}
                    className="py-2 px-5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:bg-gray-400">
                    {bsLoading ? 'Generando...' : 'Generar Balance'}
                </button>
            </form>

            {/* --- Botones de Acción y Resultados --- */}
            {bsLoading && <p className="text-center text-gray-600 mt-4">Calculando balances...</p>}

            {balanceSheetData && (
                <>
                    <div className="flex gap-2 my-4">
                        <button className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300" onClick={() => handleExport('csv')}>Exportar a Excel</button>
                        <button className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300" onClick={() => handleExport('pdf')}>Exportar a PDF</button>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">
                            Balance General al {new Date(bsDate).toLocaleDateString()}
                        </h4>
                        {/* Contenedor de Columnas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Columna de Activos */}
                            <div className="flex flex-col space-y-2">
                                <div className="text-lg font-semibold text-gray-800 border-b-2 border-gray-300 pb-2 mb-2">Activos</div>
                                {balanceSheetData.assets.map(asset => (
                                    <div key={asset.name} className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-700">{asset.name}</span>
                                        <span className="font-medium text-gray-800">${asset.balance.toFixed(2)}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between py-3 mt-4 font-bold text-gray-900 text-lg border-t-2 border-gray-400">
                                    <span>Total Activos</span>
                                    <span>${balanceSheetData.totalAssets.toFixed(2)}</span>
                                </div>
                            </div>
                            {/* Columna de Pasivos y Patrimonio */}
                            <div className="flex flex-col space-y-2">
                                <div className="text-lg font-semibold text-gray-800 border-b-2 border-gray-300 pb-2 mb-2">Pasivos</div>
                                {balanceSheetData.liabilities.map(lia => (
                                    <div key={lia.name} className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-700">{lia.name}</span>
                                        <span className="font-medium text-gray-800">${lia.balance.toFixed(2)}</span>
                                    </div>
                                ))}
                                <div className="text-lg font-semibold text-gray-800 border-b-2 border-gray-300 pb-2 mb-2 mt-6">Patrimonio</div>
                                {balanceSheetData.equity.map(eq => (
                                    <div key={eq.name} className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-700">{eq.name}</span>
                                        <span className="font-medium text-gray-800">${eq.balance.toFixed(2)}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between py-3 mt-4 font-bold text-gray-900 text-lg border-t-2 border-gray-400">
                                    <span>Total Pasivos + Patrimonio</span>
                                    <span>${balanceSheetData.totalLiabilitiesAndEquity.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default BalanceSheetReport;