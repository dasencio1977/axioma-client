import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiomaIcon from '../assets/axioma-icon.png';

const apiUrl = process.env.REACT_APP_API_URL;

const ClientStatement = () => {
    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statementData, setStatementData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchClients();
        // Set default dates (current month)
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
        setStartDate(firstDay);
        setEndDate(lastDay);
    }, []);

    const fetchClients = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${apiUrl}/api/clients?all=true`, {
                headers: { 'x-auth-token': token }
            });
            if (!response.ok) throw new Error('Error al cargar clientes');
            const data = await response.json();
            // Handle both array and paginated response format just in case, though ?all=true should return array
            setClients(Array.isArray(data) ? data : data.clients);
        } catch (err) {
            toast.error('No se pudieron cargar los clientes.');
        }
    };

    const generateStatement = async () => {
        if (!selectedClientId) {
            toast.warn('Por favor, selecciona un cliente.');
            return;
        }
        if (!startDate || !endDate) {
            toast.warn('Por favor, selecciona un rango de fechas.');
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${apiUrl}/api/statements/${selectedClientId}?startDate=${startDate}&endDate=${endDate}`, {
                headers: { 'x-auth-token': token }
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.msg || 'Error al generar el estado de cuenta');
            }

            const data = await response.json();
            setStatementData(data);
        } catch (err) {
            toast.error(err.message);
            setStatementData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickDate = (type) => {
        const date = new Date();
        let start, end;

        if (type === 'month') {
            start = new Date(date.getFullYear(), date.getMonth(), 1);
            end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        } else if (type === 'week') {
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
            start = new Date(date.setDate(diff));
            end = new Date(date.setDate(start.getDate() + 6));
        } else if (type === 'year') {
            start = new Date(date.getFullYear(), 0, 1);
            end = new Date(date.getFullYear(), 11, 31);
        }

        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('es-US');
    };

    const downloadPdf = async () => {
        if (!statementData) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${apiUrl}/api/statements/${selectedClientId}/pdf?startDate=${startDate}&endDate=${endDate}`, {
                headers: { 'x-auth-token': token }
            });

            if (!response.ok) throw new Error('Error al descargar el PDF');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `EstadoCuenta_${statementData.client.client_name}_${startDate}_${endDate}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            toast.error('No se pudo descargar el PDF.');
        }
    };

    return (
        <div className="p-6">
            <h2 className="flex items-center gap-3 text-3xl font-semibold text-gray-800 mb-8">
                <img src={axiomaIcon} alt="Axioma Icon" className="w-8 h-8 object-contain" />
                Estado de Cuenta de Cliente
            </h2>

            {/* Filtros */}
            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                        <select
                            value={selectedClientId}
                            onChange={(e) => setSelectedClientId(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Seleccione un cliente...</option>
                            {clients.map(client => (
                                <option key={client.client_id} value={client.client_id}>
                                    {client.client_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={generateStatement}
                            disabled={loading}
                            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                        >
                            {loading ? 'Generando...' : 'Generar'}
                        </button>
                    </div>
                </div>

                {/* Filtros Rápidos */}
                <div className="flex gap-2 mt-4">
                    <button onClick={() => handleQuickDate('week')} className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200">Esta Semana</button>
                    <button onClick={() => handleQuickDate('month')} className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200">Este Mes</button>
                    <button onClick={() => handleQuickDate('year')} className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200">Este Año</button>
                </div>
            </div>

            {/* Resultados */}
            {statementData && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">{statementData.client.client_name}</h3>
                            <p className="text-sm text-gray-500">
                                Periodo: {formatDate(statementData.period.startDate)} - {formatDate(statementData.period.endDate)}
                            </p>
                        </div>
                        <div className="flex items-center gap-6">
                            <button
                                onClick={downloadPdf}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Descargar PDF
                            </button>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Saldo Final</p>
                                <p className={`text-2xl font-bold ${statementData.closingBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(statementData.closingBalance)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600">Fecha</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600">Tipo</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600">Referencia</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600">Descripción</th>
                                    <th className="p-4 text-right text-sm font-semibold text-gray-600">Cargos</th>
                                    <th className="p-4 text-right text-sm font-semibold text-gray-600">Abonos</th>
                                    <th className="p-4 text-right text-sm font-semibold text-gray-600">Saldo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {/* Saldo Inicial */}
                                <tr className="bg-yellow-50 font-medium">
                                    <td className="p-4" colSpan="6">Saldo Inicial</td>
                                    <td className="p-4 text-right">{formatCurrency(statementData.openingBalance)}</td>
                                </tr>

                                {/* Transacciones */}
                                {statementData.transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-gray-500">No hay transacciones en este periodo.</td>
                                    </tr>
                                ) : (
                                    statementData.transactions.map((t, index) => (
                                        <tr key={`${t.type}-${t.id}-${index}`} className="hover:bg-gray-50">
                                            <td className="p-4 text-gray-700">{formatDate(t.date)}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${t.type === 'Factura' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {t.type}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-700">{t.reference || '-'}</td>
                                            <td className="p-4 text-gray-700">{t.description}</td>
                                            <td className="p-4 text-right text-gray-700">{t.debit > 0 ? formatCurrency(t.debit) : '-'}</td>
                                            <td className="p-4 text-right text-gray-700">{t.credit > 0 ? formatCurrency(t.credit) : '-'}</td>
                                            <td className="p-4 text-right font-medium text-gray-800">{formatCurrency(t.balance)}</td>
                                        </tr>
                                    ))
                                )}

                                {/* Saldo Final (Repetido al final para claridad) */}
                                <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                                    <td className="p-4" colSpan="6">Saldo Final</td>
                                    <td className="p-4 text-right">{formatCurrency(statementData.closingBalance)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientStatement;
