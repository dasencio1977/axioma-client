import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import TransactionForm from './TransactionForm';
import ReconciliationModal from './ReconciliationModal';
import './Invoices.css';
import './BankTransactions.css';


const BankTransactions = () => {
    const [account, setAccount] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTx, setSelectedTx] = useState(null);
    const { accountId } = useParams();
    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_API_URL;

    const fetchData = useCallback(async (page) => {
        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            const [accRes, transRes] = await Promise.all([
                // Petición para los detalles de la cuenta
                fetch(`${API_URL}/api/bank-accounts/${accountId}`, { headers: { 'x-auth-token': token } }),
                // Petición para las transacciones de esa cuenta
                fetch(`${API_URL}/api/bank-transactions/by-account/${accountId}?page=${page}`, { headers: { 'x-auth-token': token } })

            ]);
            if (!accRes.ok || !transRes.ok) throw new Error('Error al cargar los datos.');

            const accData = await accRes.json();
            const transData = await transRes.json();
            setAccount(accData);
            setTransactions(transData.transactions);
            setTotalPages(transData.totalPages);
            setCurrentPage(transData.currentPage);
            console.log("Transacciones obtenidas:", transData.transactions);

        } catch (err) {
            toast.error(err.message);
            navigate('/bank-accounts');
        } finally {
            setLoading(false);
        }
    }, [accountId, navigate, API_URL]);

    useEffect(() => {
        fetchData(currentPage);
    }, [currentPage, fetchData]);


    const handleReconcileClick = (transaction) => {
        setSelectedTx(transaction);
        setIsModalOpen(true);
    };

    const handleCategorize = async (data) => {
        if (!selectedTx) return;
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/bank-transactions/${selectedTx.transaction_id}/categorize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error("Error al conciliar.");

            toast.success("Transacción conciliada.");
            setIsModalOpen(false);
            setSelectedTx(null);
            fetchData(currentPage); // Recargar
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleMatch = async (data) => {
        if (!selectedTx) return;
        const token = localStorage.getItem('token');
        try {
            await fetch(`http://localhost:5000/api/reconciliation/match-payment`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'x-auth-token': token }, body: JSON.stringify(data)
            });
            toast.success("Transacción vinculada y conciliada.");
            setIsModalOpen(false);
            fetchData(currentPage);
        } catch (err) { toast.error(err.message); }
    };

    const handleSaveTransaction = async (transactionData) => {
        const token = localStorage.getItem('token');

        console.log(transactionData);

        try {
            const url = `${API_URL}/api/bank-transactions/by-account/${accountId}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(transactionData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Error al guardar la transacción.');

            }
            toast.success('Transacción guardada.');
            setShowForm(false);
            fetchData(1); // Recargamos todo desde la página 1
        } catch (err) {
            toast.error(err.message);
        }
    };

    // Nueva función para manejar la categorización de depósitos
    const handleDeposit = async (data) => {
        if (!selectedTx) return;
        const token = localStorage.getItem('token');
        try {
            await fetch(`${API_URL}/api/reconciliation/reconcile-as-deposit`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'x-auth-token': token }, body: JSON.stringify(data)
            });
            toast.success("Depósito conciliado exitosamente.");
            setIsModalOpen(false);
            fetchData(currentPage);
        } catch (err) { toast.error(err.message); }
    };

    if (loading || !account) return <p>Cargando transacciones...</p>;
    //const fmt = (n) => Number.isFinite(+n) ? (+n).toFixed(2) : '0.00';
    return (

        <div>

            <button onClick={() => navigate('/bank-accounts')} className="pagination-button" >← Volver a Cuentas Bancarias</button>
            <div className="transactions-header">
                <h2>{account.account_name}</h2>
                <h3>Saldo Actual: <span className={parseFloat(account.current_balance) >= 0 ? 'balance-positive' : 'balance-negative'}>${parseFloat(account.current_balance).toFixed(2)}</span></h3>
            </div>

            {!showForm && <button className="btn-primary" style={{ marginBottom: '20px' }} onClick={() => setShowForm(true)}>Añadir Transacción Manual</button>}

            {showForm && <TransactionForm onSave={handleSaveTransaction} onCancel={() => setShowForm(false)} accountName={account.account_name} />}

            <div className="table-container" style={{ marginTop: '20px' }}>
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Descripción</th>
                            <th style={{ textAlign: 'right' }}>Monto</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(tx => (
                            <tr key={tx.transaction_id}>
                                <td>{new Date(tx.transaction_date).toLocaleDateString()}</td>
                                <td>{tx.description}</td>
                                <td style={{ textAlign: 'right', color: parseFloat(tx.amount) >= 0 ? 'green' : 'red' }}>
                                    ${parseFloat(tx.amount).toFixed(2)}
                                </td>
                                <td>
                                    <span className={`status-badge ${tx.is_reconciled ? 'status-reconciled' : 'status-pending'}`}>
                                        {tx.is_reconciled ? 'Conciliado' : 'Pendiente'}
                                    </span>
                                </td>
                                <td className="actions-cell">
                                    {!tx.is_reconciled && (
                                        <button className="btn-view" onClick={() => handleReconcileClick(tx)}>Conciliar</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="pagination-container" style={{ marginTop: '20px' }}>
                <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="pagination-button">Anterior</button>
                <span className="pagination-text"> Página {currentPage} de {totalPages} </span>
                <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages} className="pagination-button">Siguiente</button>
            </div>

            {/* {isModalOpen && <ReconciliationModal transaction={selectedTx} onClose={() => setIsModalOpen(false)} onSave={handleCategorize} />} */}
            {isModalOpen && (
                <ReconciliationModal
                    transaction={selectedTx}
                    onClose={() => setIsModalOpen(false)}
                    onCategorize={handleCategorize}
                    onMatch={handleMatch}
                    onDeposit={handleDeposit}
                />
            )}

        </div>
    );
};

export default BankTransactions;