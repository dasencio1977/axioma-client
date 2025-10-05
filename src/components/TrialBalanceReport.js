import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'react-toastify';
import Papa from 'papaparse';
import './Invoices.css';

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
            {profile && <div className="report-header"><h2>{profile.company_name}</h2><h3>Balance de Comprobación</h3></div>}
            <form onSubmit={handleTbSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                <div className='form-group'>
                    <label>Hasta la fecha:</label>
                    <input type="date" name="asOfDate" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} required />
                </div>
                <button type="submit" disabled={tbLoading} className="btn-primary">{tbLoading ? 'Generando...' : 'Generar Balance'}</button>
            </form>
            {trialBalanceData &&
                <div className="report-actions" style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-secondary" onClick={() => handleExport('csv')}>Exportar a Excel</button>
                    <button className="btn-secondary" onClick={() => handleExport('pdf')}>Exportar a PDF</button>
                </div>}
            {tbLoading && <p>Calculando balances...</p>}
            {trialBalanceData && (
                <div className="table-container" style={{ marginTop: '20px' }}>
                    <h4>Balance al {new Date(asOfDate).toLocaleDateString()}</h4>
                    <table>
                        <thead><tr><th>Nº Cuenta</th><th>Nombre de Cuenta</th><th style={{ textAlign: 'right' }}>Débitos</th><th style={{ textAlign: 'right' }}>Créditos</th></tr></thead>
                        <tbody>{trialBalanceData.map(acc => (<tr key={acc.account_id}><td>{acc.account_number}</td><td>{acc.account_name}</td><td style={{ textAlign: 'right' }}>${acc.debit_balance.toFixed(2)}</td><td style={{ textAlign: 'right' }}>${acc.credit_balance.toFixed(2)}</td></tr>))}</tbody>
                        <tfoot><tr style={{ fontWeight: 'bold', borderTop: '2-px solid #333' }}><td colSpan="2" style={{ textAlign: 'right' }}>Totales:</td><td style={{ textAlign: 'right' }}>${trialBalanceTotals.debits.toFixed(2)}</td><td style={{ textAlign: 'right' }}>${trialBalanceTotals.credits.toFixed(2)}</td></tr>
                            {trialBalanceTotals.debits.toFixed(2) !== trialBalanceTotals.credits.toFixed(2) && (<tr><td colSpan="4" style={{ color: 'red', textAlign: 'center' }}>¡LOS TOTALES NO CUADRAN!</td></tr>)}
                        </tfoot>
                    </table>
                </div>
            )}
        </div>
    );
};
export default TrialBalanceReport;