import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Invoices.css';
import './Reports.css';
import './Settings.css'; // Reutilizamos los estilos de las pestañas

const apiUrl = process.env.REACT_APP_API_URL;

const Reports = () => {
    // Estados para el Reporte P&L
    const [plDates, setPlDates] = useState({
        startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
    });
    const [plReportData, setPlReportData] = useState(null);
    const [plLoading, setPlLoading] = useState(false);

    // Estados para el Balance de Comprobación
    const [asOfDate, setAsOfDate] = useState(new Date().toISOString().slice(0, 10));
    const [trialBalanceData, setTrialBalanceData] = useState(null);
    const [tbLoading, setTbLoading] = useState(false);

    // Estados para el Balance General
    const [bsDate, setBsDate] = useState(new Date().toISOString().slice(0, 10));
    const [balanceSheetData, setBalanceSheetData] = useState(null);
    const [bsLoading, setBsLoading] = useState(false);

    // Estado para la pestaña activa
    const [activeTab, setActiveTab] = useState('balance-sheet');
    const location = useLocation();
    const navigate = useNavigate();

    // useEffect para cambiar de pestaña según la URL
    useEffect(() => {
        const hash = location.hash.substring(1);
        if (hash === 'profit-loss' || hash === 'trial-balance' || hash === 'balance-sheet') {
            setActiveTab(hash);
        } else {
            setActiveTab('balance-sheet'); // Pestaña por defecto
        }
    }, [location.hash]);

    // --- MANEJADORES DE SUBMIT ---
    const handlePlSubmit = async (e) => {
        e.preventDefault();
        setPlLoading(true);
        setPlReportData(null);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${apiUrl}/api/reports/profit-loss`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(plDates),
            });
            if (!response.ok) throw new Error('Error al generar el reporte P&L.');
            const data = await response.json();
            setPlReportData(data);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setPlLoading(false);
        }
    };

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

    const trialBalanceTotals = useMemo(() => {
        if (!trialBalanceData) return { debits: 0, credits: 0 };
        return trialBalanceData.reduce((totals, account) => {
            totals.debits += parseFloat(account.debit_balance);
            totals.credits += parseFloat(account.credit_balance);
            return totals;
        }, { debits: 0, credits: 0 });
    }, [trialBalanceData]);

    const handleTabClick = (tab, hash) => {
        setActiveTab(tab);
        navigate(`/reports#${hash}`);
    }

    return (
        <div>
            <h2>Reportes Financieros</h2>

            <div className="settings-tabs">
                <button type="button" className={`tab-button ${activeTab === 'balance-sheet' ? 'active' : ''}`} onClick={() => handleTabClick('balance-sheet', 'balance-sheet')}>Balance General</button>
                <button type="button" className={`tab-button ${activeTab === 'profit-loss' ? 'active' : ''}`} onClick={() => handleTabClick('profit-loss', 'profit-loss')}>Ganancias y Pérdidas</button>
                <button type="button" className={`tab-button ${activeTab === 'trial-balance' ? 'active' : ''}`} onClick={() => handleTabClick('trial-balance', 'trial-balance')}>Balance de Comprobación</button>
            </div>

            <div className="tab-content">
                {activeTab === 'balance-sheet' && (
                    <div className="report-section">
                        <h3>Balance General</h3>
                        <form onSubmit={handleBsSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div><label>Hasta la fecha:</label><input type="date" value={bsDate} onChange={(e) => setBsDate(e.target.value)} required /></div>
                            <button type="submit" disabled={bsLoading} className="btn-primary">{bsLoading ? 'Generando...' : 'Generar Balance'}</button>
                        </form>
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
                )}
                {activeTab === 'profit-loss' && (
                    <div className="report-section">
                        <h3>Ganancias y Pérdidas</h3>
                        <form onSubmit={handlePlSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div><label>Desde:</label><input type="date" name="startDate" value={plDates.startDate} onChange={(e) => setPlDates({ ...plDates, startDate: e.target.value })} required /></div>
                            <div><label>Hasta:</label><input type="date" name="endDate" value={plDates.endDate} onChange={(e) => setPlDates({ ...plDates, endDate: e.target.value })} required /></div>
                            <button type="submit" disabled={plLoading} className="btn-primary">{plLoading ? 'Generando...' : 'Generar Reporte'}</button>
                        </form>
                        {plLoading && <p>Generando reporte P&L...</p>}
                        {plReportData && (
                            <div className="report-results" style={{ marginTop: '20px' }}>
                                <h3>Resultados para el período del {new Date(plReportData.startDate).toLocaleDateString()} al {new Date(plReportData.endDate).toLocaleDateString()}</h3>
                                <p><strong>Total de Ingresos:</strong> <span style={{ color: 'green' }}>${plReportData.totalIncome.toFixed(2)}</span></p>
                                <p><strong>Total de Gastos:</strong> <span style={{ color: 'red' }}>${plReportData.totalExpenses.toFixed(2)}</span></p>
                                <p><strong>Ganancia Neta:</strong> <strong>${plReportData.netProfit.toFixed(2)}</strong></p>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'trial-balance' && (
                    <div className="report-section">
                        <h3>Balance de Comprobación</h3>
                        <form onSubmit={handleTbSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div><label>Hasta la fecha:</label><input type="date" name="asOfDate" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} required /></div>
                            <button type="submit" disabled={tbLoading} className="btn-primary">{tbLoading ? 'Generando...' : 'Generar Balance'}</button>
                        </form>
                        {tbLoading && <p>Calculando balances...</p>}
                        {trialBalanceData && (
                            <div className="table-container" style={{ marginTop: '20px' }}>
                                <h4>Balance al {new Date(asOfDate).toLocaleDateString()}</h4>
                                <table>
                                    <thead><tr><th>Nº Cuenta</th><th>Nombre de Cuenta</th><th style={{ textAlign: 'right' }}>Débitos</th><th style={{ textAlign: 'right' }}>Créditos</th></tr></thead>
                                    <tbody>
                                        {trialBalanceData.map(acc => (
                                            <tr key={acc.account_id}><td>{acc.account_number}</td><td>{acc.account_name}</td><td style={{ textAlign: 'right' }}>${acc.debit_balance.toFixed(2)}</td><td style={{ textAlign: 'right' }}>${acc.credit_balance.toFixed(2)}</td></tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr style={{ fontWeight: 'bold', borderTop: '2px solid #333' }}><td colSpan="2" style={{ textAlign: 'right' }}>Totales:</td><td style={{ textAlign: 'right' }}>${trialBalanceTotals.debits.toFixed(2)}</td><td style={{ textAlign: 'right' }}>${trialBalanceTotals.credits.toFixed(2)}</td></tr>
                                        {trialBalanceTotals.debits.toFixed(2) !== trialBalanceTotals.credits.toFixed(2) && (<tr><td colSpan="4" style={{ color: 'red', textAlign: 'center' }}>¡LOS TOTALES NO CUADRAN!</td></tr>)}
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;