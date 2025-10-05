import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './Invoices.css'; // Reutilizamos estilos

const apiUrl = process.env.REACT_APP_API_URL;

const GeneralLedger = () => {
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
        fetch(`${apiUrl}/api/accounts?all=true`, { headers: { 'x-auth-token': token } })
            .then(res => res.json())
            .then(data => setAccounts(data))
            .catch(err => toast.error("No se pudo cargar el plan de cuentas."));
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

    return (
        <div>
            <h2 className="page-header-with-icon">
                <img src="/axioma-icon.png" alt="Axioma Icon" className="page-icon" />
                Libro Mayor General</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
                <div className="form-group">
                    <label>Cuenta</label>
                    <select value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)} required>
                        <option value="">Selecciona una cuenta...</option>
                        {accounts.map(acc => <option key={acc.account_id} value={acc.account_id}>{acc.account_number} - {acc.account_name}</option>)}
                    </select>
                </div>
                <div className='form-group'>
                    <label>Desde:</label>
                    <input type="date" value={dates.startDate} onChange={(e) => setDates({ ...dates, startDate: e.target.value })} required />
                </div>
                <div className='form-group'>
                    <label>Hasta:</label>
                    <input type="date" value={dates.endDate} onChange={(e) => setDates({ ...dates, endDate: e.target.value })} required />
                </div>
                <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Generando...' : 'Generar Reporte'}</button>
            </form>

            {loading && <p>Generando reporte...</p>}

            {reportData && (
                <div className="table-container">
                    <h3>{reportData.accountName}</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Descripción</th>
                                <th style={{ textAlign: 'right' }}>Débito</th>
                                <th style={{ textAlign: 'right' }}>Crédito</th>
                                <th style={{ textAlign: 'right' }}>Saldo</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ fontWeight: 'bold' }}>
                                <td colSpan="4">Saldo Inicial</td>
                                <td style={{ textAlign: 'right' }}>${reportData.openingBalance.toFixed(2)}</td>
                            </tr>
                            {reportData.transactions.map((t, index) => (
                                <tr key={index}>
                                    <td>{new Date(t.entry_date).toLocaleDateString()}</td>
                                    <td>{t.description}</td>
                                    <td style={{ textAlign: 'right' }}>{t.line_type === 'Debito' ? `$${parseFloat(t.amount).toFixed(2)}` : ''}</td>
                                    <td style={{ textAlign: 'right' }}>{t.line_type === 'Credito' ? `$${parseFloat(t.amount).toFixed(2)}` : ''}</td>
                                    <td style={{ textAlign: 'right' }}>${t.runningBalance.toFixed(2)}</td>
                                </tr>
                            ))}
                            <tr style={{ fontWeight: 'bold', borderTop: '2px solid #333' }}>
                                <td colSpan="4">Saldo Final</td>
                                <td style={{ textAlign: 'right' }}>${reportData.closingBalance.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default GeneralLedger;