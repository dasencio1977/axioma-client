import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
// Eliminamos la importación de './InvoiceForm.css' y './JournalEntryForm.css'
import axiomaIcon from '../assets/axioma-icon.png';

const apiUrl = process.env.REACT_APP_API_URL;

const JournalEntryForm = () => {
    const [entryData, setEntryData] = useState({
        entry_date: new Date().toISOString().slice(0, 10),
        description: ''
    });
    const [lines, setLines] = useState([
        { account_id: '', line_type: 'Debito', amount: '' },
        { account_id: '', line_type: 'Credito', amount: '' }
    ]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            try {
                const accountsRes = await fetch(`${apiUrl}/api/accounts?all=true`, { headers: { 'x-auth-token': token } });
                if (!accountsRes.ok) throw new Error('No se pudo cargar el plan de cuentas.');
                const accountsData = await accountsRes.json();
                setAccounts(accountsData);

                if (id) {
                    const entryRes = await fetch(`${apiUrl}/api/journal-entries/${id}`, { headers: { 'x-auth-token': token } });
                    if (!entryRes.ok) throw new Error('No se pudo cargar el asiento para editar.');
                    const entryToEdit = await entryRes.json();
                    setEntryData({
                        entry_date: new Date(entryToEdit.entry_date).toISOString().slice(0, 10),
                        description: entryToEdit.description
                    });
                    const formattedLines = entryToEdit.lines.map(line => ({ ...line, amount: parseFloat(line.amount) }));
                    setLines(formattedLines);
                }
            } catch (err) {
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, apiUrl]);

    const { totalDebits, totalCredits } = useMemo(() => {
        return lines.reduce((totals, line) => {
            const amount = parseFloat(line.amount) || 0;
            if (line.line_type === 'Debito') {
                totals.totalDebits += amount;
            } else if (line.line_type === 'Credito') {
                totals.totalCredits += amount;
            }
            return totals;
        }, { totalDebits: 0, totalCredits: 0 });
    }, [lines]);

    const handleHeaderChange = (e) => setEntryData({ ...entryData, [e.target.name]: e.target.value });

    const handleLineChange = (index, e) => {
        const updatedLines = [...lines];
        updatedLines[index][e.target.name] = e.target.value;
        setLines(updatedLines);
    };

    const addLine = () => setLines([...lines, { account_id: '', line_type: 'Debito', amount: '' }]);

    const removeLine = (index) => {
        if (lines.length > 2) { // Debe haber al menos 2 líneas
            setLines(lines.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (totalDebits.toFixed(2) !== totalCredits.toFixed(2) || totalDebits === 0) {
            toast.error('El asiento no está balanceado o los totales son cero.');
            return;
        }
        const token = localStorage.getItem('token');
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${apiUrl}/api/journal-entries/${id}` : `${apiUrl}/api/journal-entries`;
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ ...entryData, lines }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Error al guardar el asiento.');
            toast.success(`Asiento contable ${id ? 'actualizado' : 'creado'} con éxito.`);
            navigate('/journal-entries');
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) return <p>Cargando...</p>;

    return (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg my-8">
            <h2 className="flex items-center gap-3 text-3xl font-semibold text-gray-800 mb-6 border-b pb-4">
                <img src={axiomaIcon} alt="Axioma Icon" className="w-8 h-8 object-contain" />
                {id ? 'Editar Asiento Contable' : 'Nuevo Asiento Contable'}
            </h2>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="mb-4">
                        <label htmlFor="entry_date" className="block text-sm font-bold text-gray-700 mb-2">Fecha del Asiento</label>
                        <input id="entry_date" type="date" name="entry_date" value={entryData.entry_date} onChange={handleHeaderChange} required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="mb-4 md:col-span-2">
                        <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">Descripción</label>
                        <input id="description" type="text" name="description" value={entryData.description} onChange={handleHeaderChange} placeholder="Descripción del asiento"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-4">Líneas del Asiento</h3>
                <div className="w-full overflow-x-auto">
                    <div className="min-w-[700px]">
                        <div className="grid grid-cols-[3fr,2fr,2fr,auto] gap-4 pb-2 border-b-2 border-gray-300 mb-2">
                            <div className="font-bold text-gray-600 text-sm">Cuenta</div>
                            <div className="font-bold text-gray-600 text-sm">Tipo</div>
                            <div className="font-bold text-gray-600 text-sm">Monto</div>
                            <div className="w-8"></div>
                        </div>
                        {lines.map((line, index) => (
                            <div key={index} className="grid grid-cols-[3fr,2fr,2fr,auto] gap-4 items-center mb-2">
                                <select name="account_id" value={line.account_id} onChange={(e) => handleLineChange(index, e)} required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Seleccionar cuenta...</option>
                                    {accounts.map(acc => <option key={acc.account_id} value={acc.account_id}>{acc.account_number} - {acc.account_name}</option>)}
                                </select>
                                <select name="line_type" value={line.line_type} onChange={(e) => handleLineChange(index, e)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="Debito">Débito</option>
                                    <option value="Credito">Crédito</option>
                                </select>
                                <input type="number" name="amount" value={line.amount} onChange={(e) => handleLineChange(index, e)} placeholder="0.00" min="0.01" step="0.01" required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                <button type="button" onClick={() => removeLine(index)} title="Eliminar Línea"
                                    className="text-red-500 hover:text-red-700 text-xl p-1 disabled:text-gray-300"
                                    disabled={lines.length <= 2}>
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <button type="button" onClick={addLine}
                    className="mt-2 py-1 px-3 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition-colors">
                    + Añadir Línea
                </button>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg max-w-sm ml-auto text-right space-y-2">
                    <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">Total Débitos:</span>
                        <span className="font-medium text-gray-900">${totalDebits.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-semibold text-gray-700">Total Créditos:</span>
                        <span className="font-medium text-gray-900">${totalCredits.toFixed(2)}</span>
                    </div>
                    <hr className="my-2" />
                    <div className={`flex justify-between font-bold text-lg ${totalDebits.toFixed(2) === totalCredits.toFixed(2) && totalDebits > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <span>Balance:</span>
                        <span>${(totalDebits - totalCredits).toFixed(2)}</span>
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                    <button type="button" className="py-2 px-5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors" onClick={() => navigate('/journal-entries')}>
                        Cancelar
                    </button>
                    <button type="submit" className="py-2 px-5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                        Guardar Asiento
                    </button>
                </div>
            </form>
        </div>
    );
};

export default JournalEntryForm;