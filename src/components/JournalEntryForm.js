import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import './InvoiceForm.css'; // Reutilizamos estilos de formulario
import './JournalEntryForm.css'; // Estilos específicos

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
    const { id } = useParams(); // Para saber si estamos editando

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            try {
                // Siempre cargamos el plan de cuentas
                const accountsRes = await fetch(`${apiUrl}/api/accounts?all=true`, { headers: { 'x-auth-token': token } });
                if (!accountsRes.ok) throw new Error('No se pudo cargar el plan de cuentas.');
                const accountsData = await accountsRes.json();
                setAccounts(accountsData);

                // Si hay un ID en la URL, cargamos el asiento a editar
                if (id) {
                    const entryRes = await fetch(`${apiUrl}/api/journal-entries/${id}`, { headers: { 'x-auth-token': token } });
                    if (!entryRes.ok) throw new Error('No se pudo cargar el asiento para editar.');
                    const entryToEdit = await entryRes.json();
                    setEntryData({
                        entry_date: new Date(entryToEdit.entry_date).toISOString().slice(0, 10),
                        description: entryToEdit.description
                    });
                    // Nos aseguramos de que las líneas tengan un 'amount' válido para el input
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
    }, [id]);

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
        if (lines.length > 2) {
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
        <div className="invoice-form-container">
            <h2>{id ? 'Editar Asiento Contable' : 'Nuevo Asiento Contable'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Fecha del Asiento</label>
                        <input type="date" name="entry_date" value={entryData.entry_date} onChange={handleHeaderChange} required />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Descripción</label>
                        <input type="text" name="description" value={entryData.description} onChange={handleHeaderChange} placeholder="Descripción del asiento" />
                    </div>
                </div>

                <h3>Líneas del Asiento</h3>
                <div className="items-grid-container">
                    <div className="journal-entry-grid journal-entry-grid-header">
                        <div>Cuenta</div>
                        <div>Tipo</div>
                        <div>Monto</div>
                        <div></div>
                    </div>
                    {lines.map((line, index) => (
                        <div key={index} className="journal-entry-grid">
                            <div className='form-group'>
                                <select name="account_id" value={line.account_id} onChange={(e) => handleLineChange(index, e)} required>
                                    <option value="">Seleccionar cuenta...</option>
                                    {accounts.map(acc => <option key={acc.account_id} value={acc.account_id}>{acc.account_number} - {acc.account_name}</option>)}
                                </select>
                            </div>
                            <div className='form-group'>
                                <select name="line_type" value={line.line_type} onChange={(e) => handleLineChange(index, e)}>
                                    <option value="Debito">Débito</option>
                                    <option value="Credito">Crédito</option>
                                </select></div>
                            <div className='form-group'>
                                <input type="number" name="amount" value={line.amount} onChange={(e) => handleLineChange(index, e)} placeholder="0.00" min="0.01" step="0.01" required /></div><div className='form-group'>
                                <button type="button" className="btn-remove-item" onClick={() => removeLine(index)} title="Eliminar Línea">🗑️</button>
                            </div>
                        </div>

                    ))}
                </div>
                <button type="button" className="btn-primary" onClick={addLine} style={{ marginTop: '10px' }}>+ Añadir Línea</button>

                <div className="totals-summary">
                    <p>Total Débitos: ${totalDebits.toFixed(2)}</p>
                    <p>Total Créditos: ${totalCredits.toFixed(2)}</p>
                    <p className={totalDebits.toFixed(2) === totalCredits.toFixed(2) && totalDebits > 0 ? 'balance' : 'unbalance'}>
                        {totalDebits.toFixed(2) === totalCredits.toFixed(2) && totalDebits > 0 ? 'BALANCEADO' : 'NO BALANCEADO'}
                    </p>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={() => navigate('/journal-entries')}>Cancelar</button>
                    <button type="submit" className="btn-primary">Guardar Asiento</button>
                </div>
            </form>
        </div>
    );
};

export default JournalEntryForm;