import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './ClientForm.css';
import './Settings.css'; // Reutilizamos estilos de pestañas

const ReconciliationModal = ({ transaction, onClose, onCategorize, onMatch, onDeposit }) => {
    const isIncome = parseFloat(transaction.amount) > 0;
    const [activeTab, setActiveTab] = useState('match');

    // Estados para Gasto
    const [description, setDescription] = useState(transaction.description);
    const [expenseAccounts, setExpenseAccounts] = useState([]);
    const [selectedExpenseAccount, setSelectedExpenseAccount] = useState('');

    // Estados para Ingreso (Match)
    const [unmatchedPayments, setUnmatchedPayments] = useState([]);
    const [selectedPaymentId, setSelectedPaymentId] = useState('');

    // Estados para Ingreso (Categorize)
    const [incomeAccounts, setIncomeAccounts] = useState([]);
    const [selectedCreditAccount, setSelectedCreditAccount] = useState('');

    const API_URL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (isIncome) {
            // Cargar pagos no conciliados para la pestaña 'match'
            fetch(`${API_URL}/api/reconciliation/unmatched-payments`, { headers: { 'x-auth-token': token } })
                .then(res => res.json())
                .then(data => setUnmatchedPayments(data));
            // Cargar cuentas de Ingreso/Pasivo/Patrimonio para la pestaña 'categorize'
            fetch(`${API_URL}/api/accounts?all=true`, { headers: { 'x-auth-token': token } })
                .then(res => res.json())
                .then(data => setIncomeAccounts(data.filter(acc => ['Ingreso', 'Pasivo', 'Patrimonio'].includes(acc.account_type))));
        } else {
            // Cargar cuentas de Gasto
            fetch(`${API_URL}/api/accounts?all=true`, { headers: { 'x-auth-token': token } })
                .then(res => res.json())
                .then(data => setExpenseAccounts(data.filter(acc => acc.account_type === 'Gasto')));
        }
    }, [isIncome, API_URL]);

    const handleCategorize = () => {
        if (!selectedExpenseAccount) return toast.warn('Selecciona una categoría.');
        const account = expenseAccounts.find(acc => acc.account_id === parseInt(selectedExpenseAccount));
        onCategorize({ category: account.account_name, description });
    };

    const handleMatch = () => {
        if (!selectedPaymentId) return toast.warn('Selecciona un pago para vincular.');
        onMatch({ bankTransactionId: transaction.transaction_id, paymentId: selectedPaymentId });
    };

    const handleDeposit = () => {
        if (!selectedCreditAccount) return toast.warn('Selecciona una cuenta para acreditar.');
        onDeposit({ bankTransactionId: transaction.transaction_id, creditAccountId: selectedCreditAccount, description });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3>Conciliar Transacción</h3>
                <p><strong>Fecha:</strong> {new Date(transaction.transaction_date).toLocaleDateString()}</p>
                <p><strong>Descripción del Banco:</strong> {transaction.description}</p>

                {isIncome ? (
                    <div>
                        <p><strong>Monto Recibido:</strong> <span style={{ color: 'green' }}>${parseFloat(transaction.amount).toFixed(2)}</span></p>
                        <div className="settings-tabs">
                            <button className={`tab-button ${activeTab === 'match' ? 'active' : ''}`} onClick={() => setActiveTab('match')}>Vincular Pago de Cliente</button>
                            <button className={`tab-button ${activeTab === 'categorize' ? 'active' : ''}`} onClick={() => setActiveTab('categorize')}>Categorizar Otro Ingreso</button>
                        </div>
                        <div className="tab-content">
                            {activeTab === 'match' && (
                                <div>
                                    <div className="form-group">
                                        <label>Vincular con Pago de Cliente</label>
                                        <select value={selectedPaymentId} onChange={(e) => setSelectedPaymentId(e.target.value)}>
                                            <option value="">Selecciona un pago...</option>
                                            {unmatchedPayments.map(p => (
                                                <option key={p.payment_id} value={p.payment_id}>
                                                    ${p.amount_paid} - {p.client_name} (Factura #{p.invoice_number}) - {new Date(p.payment_date).toLocaleDateString()}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-actions">
                                        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
                                        <button type="button" className="btn-primary" onClick={handleMatch}>Vincular y Conciliar</button>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'categorize' && (
                                <div>
                                    <div className="form-group"><label>Descripción para el Asiento</label><input type="text" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
                                    <div className="form-group">
                                        <label>Acreditar a la cuenta (Ingreso, Pasivo, Patrimonio):</label>
                                        <select value={selectedCreditAccount} onChange={(e) => setSelectedCreditAccount(e.target.value)}>
                                            <option value="">Selecciona cuenta...</option>
                                            {incomeAccounts.map(acc => <option key={acc.account_id} value={acc.account_id}>{acc.account_name}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-actions">
                                        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
                                        <button type="button" className="btn-primary" onClick={handleDeposit}>Guardar y Conciliar</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div>
                        <p><strong>Monto Pagado:</strong> <span style={{ color: 'red' }}>${Math.abs(parseFloat(transaction.amount)).toFixed(2)}</span></p>
                        <div className="form-group"><label>Descripción para el Gasto</label><input type="text" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
                        <div className="form-group">
                            <label>Categorizar como Gasto en:</label>
                            <select value={selectedExpenseAccount} onChange={(e) => setSelectedExpenseAccount(e.target.value)}>
                                <option value="">Selecciona una cuenta de gasto...</option>
                                {expenseAccounts.map(acc => <option key={acc.account_id} value={acc.account_id}>{acc.account_name}</option>)}
                            </select>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
                            <button type="button" className="btn-primary" onClick={handleCategorize}>Guardar y Conciliar</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default ReconciliationModal;