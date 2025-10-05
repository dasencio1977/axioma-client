import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Papa from 'papaparse';
import './Invoices.css';
import './Reports.css';

const apiUrl = process.env.REACT_APP_API_URL;

const BalanceSheetReport = () => {
    const [profile, setProfile] = useState(null);
    const [bsDate, setBsDate] = useState(new Date().toISOString().slice(0, 10));
    const [balanceSheetData, setBalanceSheetData] = useState(null);
    const [bsLoading, setBsLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(`${apiUrl}/api/profile`, { headers: { 'x-auth-token': token } })
            .then(res => res.json()).then(data => setProfile(data));
    }, []);

    const handleBsSubmit = async (e) => {
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
            dataForCsv.push({ Category: 'ACTIVOS' });
            balanceSheetData.assets.forEach(item => dataForCsv.push({ Item: item.name, Amount: item.balance.toFixed(2) }));
            dataForCsv.push({ Item: 'Total Activos', Amount: balanceSheetData.totalAssets.toFixed(2) });
            dataForCsv.push({}); // Empty row
            dataForCsv.push({ Category: 'PASIVOS' });
            balanceSheetData.liabilities.forEach(item => dataForCsv.push({ Item: item.name, Amount: item.balance.toFixed(2) }));
            dataForCsv.push({}); // Empty row
            dataForCsv.push({ Category: 'PATRIMONIO' });
            balanceSheetData.equity.forEach(item => dataForCsv.push({ Item: item.name, Amount: item.balance.toFixed(2) }));
            dataForCsv.push({ Item: 'Total Pasivos + Patrimonio', Amount: balanceSheetData.totalLiabilitiesAndEquity.toFixed(2) });

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
            {profile && <div className="report-header"><h2>{profile.company_name}</h2><h3>Balance General</h3></div>}
            <form onSubmit={handleBsSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                <div className='form-group' style={{ alignItems: 'center' }}>
                    <label>Hasta la fecha:</label>
                    <input type="date" value={bsDate} onChange={(e) => setBsDate(e.target.value)} required />
                </div>
                <button type="submit" disabled={bsLoading} className="btn-primary">{bsLoading ? 'Generando...' : 'Generar Balance'}</button>
            </form>
            {balanceSheetData && <div className="report-actions" style={{ display: 'flex', gap: '10px' }}><button className="btn-secondary" onClick={() => handleExport('csv')}>Exportar a Excel</button><button className="btn-secondary" onClick={() => handleExport('pdf')}>Exportar a PDF</button></div>}
            {bsLoading && <p>Calculando balances...</p>}
            {balanceSheetData && (
                <div className="balance-sheet-container">
                    <h4>Balance General al {new Date(bsDate).toLocaleDateString()}</h4>
                    <div className="balance-sheet-columns">
                        <div className="bs-column">
                            <div className="bs-header">Activos</div>
                            {balanceSheetData.assets.map(asset => (<div key={asset.name} className="bs-row"><span>{asset.name}</span><span>${asset.balance.toFixed(2)}</span></div>))}
                            <div className="bs-total-row"><span>Total Activos</span><span>${balanceSheetData.totalAssets.toFixed(2)}</span></div>
                        </div>
                        <div className="bs-column">
                            <div className="bs-header">Pasivos</div>
                            {balanceSheetData.liabilities.map(lia => (<div key={lia.name} className="bs-row"><span>{lia.name}</span><span>${lia.balance.toFixed(2)}</span></div>))}
                            <div className="bs-header" style={{ marginTop: '20px' }}>Patrimonio</div>
                            {balanceSheetData.equity.map(eq => (<div key={eq.name} className="bs-row"><span>{eq.name}</span><span>${eq.balance.toFixed(2)}</span></div>))}
                            <div className="bs-total-row"><span>Total Pasivos + Patrimonio</span><span>${balanceSheetData.totalLiabilitiesAndEquity.toFixed(2)}</span></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BalanceSheetReport;