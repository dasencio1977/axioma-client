// client/src/components/JournalEntryDetail.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './InvoiceDetail.css'; // Reutilizamos estilos

const apiUrl = process.env.REACT_APP_API_URL;

const JournalEntryDetail = () => {
    const [entry, setEntry] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    const fetchEntry = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${apiUrl}/api/journal-entries/${id}`, { headers: { 'x-auth-token': token } });
            if (!response.ok) throw new Error('No se pudo cargar el asiento.');
            const data = await response.json();
            setEntry(data);
        } catch (err) { toast.error(err.message); }
    }, [id]);

    useEffect(() => { fetchEntry(); }, [fetchEntry]);

    if (!entry) return <p>Cargando asiento...</p>;

    return (
        <div>
            <button onClick={() => navigate(-1)}>← Regresar</button>
            <div className="invoice-box" style={{ marginTop: '20px' }}>
                <header className="invoice-header">
                    <div>
                        <h2>Asiento Contable</h2>
                        <p><strong>Fecha:</strong> {new Date(entry.entry_date).toLocaleDateString()}</p>
                        <p><strong>Descripción:</strong> {entry.description}</p>
                    </div>
                </header>
                <table className="items-table">
                    <thead><tr><th>Nº Cuenta</th><th>Nombre Cuenta</th><th style={{ textAlign: 'right' }}>Débito</th><th style={{ textAlign: 'right' }}>Crédito</th></tr></thead>
                    <tbody>
                        {entry.lines.map(line => (
                            <tr key={line.line_id}>
                                <td>{line.account_number}</td>
                                <td>{line.account_name}</td>
                                <td style={{ textAlign: 'right' }}>{line.line_type === 'Debito' ? `$${parseFloat(line.amount).toFixed(2)}` : ''}</td>
                                <td style={{ textAlign: 'right' }}>{line.line_type === 'Credito' ? `$${parseFloat(line.amount).toFixed(2)}` : ''}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default JournalEntryDetail;