import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
// Eliminamos la importación de './InvoiceDetail.css'
import axiomaIcon from '../assets/axioma-icon.png';

const apiUrl = process.env.REACT_APP_API_URL;

const JournalEntryDetail = () => {
    const [entry, setEntry] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();

    const fetchEntry = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${apiUrl}/api/journal-entries/${id}`, { headers: { 'x-auth-token': token } });
            if (!response.ok) throw new Error('No se pudo cargar el asiento contable.');
            const data = await response.json();
            setEntry(data);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }, [id, apiUrl]);

    useEffect(() => {
        fetchEntry();
    }, [fetchEntry]);

    const { totalDebits, totalCredits } = React.useMemo(() => {
        if (!entry) return { totalDebits: 0, totalCredits: 0 };
        return entry.lines.reduce((totals, line) => {
            const amount = parseFloat(line.amount) || 0;
            if (line.line_type === 'Debito') {
                totals.totalDebits += amount;
            } else if (line.line_type === 'Credito') {
                totals.totalCredits += amount;
            }
            return totals;
        }, { totalDebits: 0, totalCredits: 0 });
    }, [entry]);

    if (loading) return <p>Cargando asiento...</p>;
    if (!entry) return <p>No se encontró el asiento contable.</p>;

    return (
        <div>
            {/* --- Barra de Acciones Superior --- */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
                <button
                    onClick={() => navigate('/journal-entries')}
                    className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                    ← Volver al Diario General
                </button>
                <button
                    onClick={() => navigate(`/journal-entries/edit/${id}`)}
                    className="py-2 px-4 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
                >
                    Editar Asiento
                </button>
            </div>

            {/* --- Contenedor del Asiento --- */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-10 max-w-4xl mx-auto font-sans text-gray-800">
                {/* --- Encabezado --- */}
                <header className="mb-8 pb-6 border-b">
                    <h2 className="flex items-center gap-3 text-3xl font-semibold text-gray-800 mb-2">
                        <img src={axiomaIcon} alt="Axioma Icon" className="w-8 h-8 object-contain" />
                        Asiento Contable
                    </h2>
                    <div className="text-gray-600 space-y-1 mt-4">
                        <p><strong>Fecha:</strong> {new Date(entry.entry_date).toLocaleDateString()}</p>
                        <p><strong>Descripción:</strong> {entry.description || '--'}</p>
                    </div>
                </header>

                {/* --- Tabla de Líneas --- */}
                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[600px] text-left">
                        <thead className="bg-gray-100 border-b border-gray-200">
                            <tr>
                                <th className="p-3 text-sm font-semibold text-gray-600 uppercase">Nº Cuenta</th>
                                <th className="p-3 text-sm font-semibold text-gray-600 uppercase">Nombre Cuenta</th>
                                <th className="p-3 text-right text-sm font-semibold text-gray-600 uppercase">Débito</th>
                                <th className="p-3 text-right text-sm font-semibold text-gray-600 uppercase">Crédito</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {entry.lines.map(line => (
                                <tr key={line.line_id} className="hover:bg-gray-50">
                                    <td className="p-3 text-gray-700">{line.account_number}</td>
                                    <td className="p-3 text-gray-700">{line.account_name}</td>
                                    <td className="p-3 text-green-600 text-right font-medium">
                                        {line.line_type === 'Debito' ? `$${parseFloat(line.amount).toFixed(2)}` : ''}
                                    </td>
                                    <td className="p-3 text-red-600 text-right font-medium">
                                        {line.line_type === 'Credito' ? `$${parseFloat(line.amount).toFixed(2)}` : ''}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-100">
                            <tr className="font-bold text-gray-900 border-t-2 border-gray-300">
                                <td colSpan="2" className="p-4 text-right uppercase">Totales:</td>
                                <td className="p-4 text-right">${totalDebits.toFixed(2)}</td>
                                <td className="p-4 text-right">${totalCredits.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default JournalEntryDetail;