import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'react-toastify';
import Papa from 'papaparse';
// Eliminamos la importación de './Invoices.css'
import axiomaIcon from '../assets/axioma-icon.png';

const apiUrl = process.env.REACT_APP_API_URL;

const TrialBalanceReport = () => {
    const [profile, setProfile] = useState(null);
    const [asOfDate, setAsOfDate] = useState(new Date().toISOString().slice(0, 10));
    const [trialBalanceData, setTrialBalanceData] = useState(null);
    const [tbLoading, setTbLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(`${apiUrl}/api/profile`, { headers: { 'x-auth-token': token } })
            .then(res => res.json()).then(data => setProfile(data));
    }, []);

    const handleTbSubmit = async (e) => {
        e.preventDefault();
        setTbLoading(true);
        setTrialBalanceData(null);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${apiUrl}/api/reports/trial-balance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ asOfDate }),
            });
            if (!response.ok) throw new Error('Error al generar el Balance de Comprobación.');
            const data = await response.json();
            setTrialBalanceData(data);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setTbLoading(false);
        }
    };

    const trialBalanceTotals = useMemo(() => {
        if (!trialBalanceData) return { debits: 0, credits: 0 };
        return trialBalanceData.reduce((totals, account) => {
            totals.debits += parseFloat(account.debit_balance);
            totals.credits += parseFloat(account.credit_balance);
            return totals;
        }, { debits: 0, credits: 0 });
    }, [trialBalanceData]);

    const handleExport = async (format) => {
        if (!trialBalanceData) {
            toast.error("Primero genera un reporte para poder exportarlo.");
            return;
        }
        const token = localStorage.getItem('token');
        const filename = `Balance_Comprobacion_${asOfDate}`;

        if (format === 'csv') {
            const dataForCsv = trialBalanceData.map(acc => ({
                "Numero de Cuenta": acc.account_number,
                "Nombre de Cuenta": acc.account_name,
                "Débitos": acc.debit_balance.toFixed(2),
                "Créditos": acc.credit_balance.toFixed(2)
            }));
            dataForCsv.push({ "Numero de Cuenta": "", "Nombre de Cuenta": "TOTALES", "Débitos": trialBalanceTotals.debits.toFixed(2), "Créditos": trialBalanceTotals.credits.toFixed(2) });
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
                const response = await fetch(`${apiUrl}/api/reports/trial-balance/pdf`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                    body: JSON.stringify({ asOfDate }),
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
                        Balance de Comprobación
                    </h2>
                    <h3 className="text-xl text-gray-600">{profile.company_name}</h3>
                </div>
            )}

            {/* --- Formulario de Fecha --- */}
            <form onSubmit={handleTbSubmit} className="flex flex-col sm:flex-row items-center gap-4 mb-4 p-4 bg-white rounded-xl shadow-lg">
                <div className="flex items-center gap-2">
                    <label htmlFor="asOfDate" className="text-sm font-bold text-gray-700">Hasta la fecha:</label>
                    <input type="date" name="asOfDate" id="asOfDate" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} required
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button type="submit" disabled={tbLoading}
                    className="py-2 px-5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:bg-gray-400">
                    {tbLoading ? 'Generando...' : 'Generar Balance'}
                </button>
            </form>

            {/* --- Botones de Acción y Resultados --- */}
            {tbLoading && <p className="text-center text-gray-600 mt-4">Calculando balances...</p>}

            {trialBalanceData && (
                <>
                    <div className="flex gap-2 my-4">
                        <button className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300" onClick={() => handleExport('csv')}>Exportar a Excel</button>
                        <button className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300" onClick={() => handleExport('pdf')}>Exportar a PDF</button>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                        <h4 className="text-lg font-semibold text-gray-800 p-4">
                            Balance al {new Date(asOfDate).toLocaleDateString()}
                        </h4>
                        <table className="w-full min-w-[600px]">
                            <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Nº Cuenta</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Nombre de Cuenta</th>
                                    <th className="p-4 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">Débitos</th>
                                    <th className="p-4 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">Créditos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {trialBalanceData.map(acc => (
                                    <tr key={acc.account_id} className="hover:bg-gray-50">
                                        <td className="p-4 whitespace-nowrap text-gray-700">{acc.account_number}</td>
                                        <td className="p-4 whitespace-nowrap text-gray-700">{acc.account_name}</td>
                                        <td className="p-4 whitespace-nowrap text-gray-700 text-right">${acc.debit_balance.toFixed(2)}</td>
                                        <td className="p-4 whitespace-nowrap text-gray-700 text-right">${acc.credit_balance.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50">
                                <tr className="font-bold text-gray-900 border-t-2 border-gray-300">
                                    <td colSpan="2" className="p-4 text-right uppercase">Totales:</td>
                                    <td className="p-4 text-right">${trialBalanceTotals.debits.toFixed(2)}</td>
                                    <td className="p-4 text-right">${trialBalanceTotals.credits.toFixed(2)}</td>
                                </tr>
                                {trialBalanceTotals.debits.toFixed(2) !== trialBalanceTotals.credits.toFixed(2) && (
                                    <tr className="bg-red-100">
                                        <td colSpan="4" className="p-4 text-center text-red-700 font-bold">¡LOS TOTALES NO CUADRAN!</td>
                                    </tr>
                                )}
                            </tfoot>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default TrialBalanceReport;