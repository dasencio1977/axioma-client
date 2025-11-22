import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Papa from 'papaparse';
import axiomaIcon from '../assets/axioma-icon.png';

const apiUrl = process.env.REACT_APP_API_URL;

const GeneralLedger = () => {
    const [profile, setProfile] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [dates, setDates] = useState({
        startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
    });
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        // Cargar perfil y cuentas
        Promise.all([
            fetch(`${apiUrl}/api/profile`, { headers: { 'x-auth-token': token } }),
            fetch(`${apiUrl}/api/accounts?all=true`, { headers: { 'x-auth-token': token } })
        ]).then(async ([profileRes, accountsRes]) => {
            if (!profileRes.ok) throw new Error("No se pudo cargar el perfil de la empresa.");
            if (!accountsRes.ok) throw new Error("No se pudo cargar el plan de cuentas.");
            setProfile(await profileRes.json());
            setAccounts(await accountsRes.json());
        }).catch(err => toast.error(err.message));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAccountId) {
            toast.warn('Por favor, selecciona una cuenta.');
            return;
        }
        setLoading(true);
        setReportData(null);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${apiUrl}/api/reports/general-ledger`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ accountId: selectedAccountId, ...dates }),
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
        const filename = `Libro_Mayor_${reportData.accountName.split(' - ')[0]}_${dates.endDate}`;
        const payload = { accountId: selectedAccountId, ...dates };

        if (format === 'csv') {
            const dataForCsv = [
                // Encabezados del CSV
                { Cuenta: reportData.accountName },
                { Desde: dates.startDate, Hasta: dates.endDate },
                {}, // Fila vacía
                { Fecha: '', Descripcion: 'Saldo Inicial', Debito: '', Credito: '', Saldo: reportData.openingBalance.toFixed(2) }
            ];
            // Filas de transacciones
            reportData.transactions.forEach(t => {
                dataForCsv.push({
                    Fecha: new Date(t.entry_date).toLocaleDateString(),
                    Descripcion: t.description,
                    Debito: t.line_type === 'Debito' ? t.amount : '',
                    Credito: t.line_type === 'Credito' ? t.amount : '',
                    Saldo: t.runningBalance.toFixed(2)
                });
            });
            // Fila de total
            dataForCsv.push({}); // Fila vacía
            dataForCsv.push({ Fecha: '', Descripcion: 'Saldo Final', Debito: '', Credito: '', Saldo: reportData.closingBalance.toFixed(2) });

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
                const response = await fetch(`${apiUrl}/api/reports/general-ledger/pdf`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                    body: JSON.stringify(payload),
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
                        Libro Mayor General
                    </h2>
                    <h3 className="text-xl text-gray-600">{profile.company_name}</h3>
                </div>
            )}

            {/* --- Formulario de Filtros --- */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row flex-wrap items-center gap-4 mb-4 p-4 bg-white rounded-xl shadow-lg">
                <div className="flex-1 min-w-[200px]">
                    <label htmlFor="accountId" className="text-sm font-bold text-gray-700">Cuenta</label>
                    <select id="accountId" value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)} required
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Selecciona una cuenta...</option>
                        {accounts.map(acc => <option key={acc.account_id} value={acc.account_id}>{acc.account_number} - {acc.account_name}</option>)}
                    </select>
                </div>
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

                    <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                        <h3 className="text-xl font-semibold text-gray-800 p-4">{reportData.accountName}</h3>
                        <table className="w-full min-w-[700px]">
                            <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Descripción</th>
                                    <th className="p-4 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">Débito</th>
                                    <th className="p-4 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">Crédito</th>
                                    <th className="p-4 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">Saldo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr className="font-medium bg-gray-50">
                                    <td colSpan="4" className="p-4 text-gray-700">Saldo Inicial</td>
                                    <td className="p-4 text-right text-gray-700">${reportData.openingBalance.toFixed(2)}</td>
                                </tr>
                                {reportData.transactions.map((t, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="p-4 whitespace-nowrap text-gray-700">{new Date(t.entry_date).toLocaleDateString()}</td>
                                        <td className="p-4 whitespace-nowrap text-gray-700">{t.description}</td>
                                        <td className="p-4 whitespace-nowrap text-green-600 text-right">{t.line_type === 'Debito' ? `$${parseFloat(t.amount).toFixed(2)}` : ''}</td>
                                        <td className="p-4 whitespace-nowrap text-red-600 text-right">{t.line_type === 'Credito' ? `$${parseFloat(t.amount).toFixed(2)}` : ''}</td>
                                        <td className="p-4 whitespace-nowrap text-gray-900 font-medium text-right">${t.runningBalance.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-100">
                                <tr className="font-bold text-gray-900 border-t-2 border-gray-300">
                                    <td colSpan="4" className="p-4 text-right uppercase">Saldo Final:</td>
                                    <td className="p-4 text-right">${reportData.closingBalance.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default GeneralLedger;