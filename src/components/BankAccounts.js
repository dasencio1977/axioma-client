import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import BankAccountForm from './BankAccountForm';
import TransactionForm from './TransactionForm';
import './Invoices.css'; // Reutilizamos estilos

const BankAccounts = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- ESTADOS QUE FALTABAN ---
    const [showAccountForm, setShowAccountForm] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [showTransactionForm, setShowTransactionForm] = useState(false);
    const [selectedAccountForTx, setSelectedAccountForTx] = useState(null);

    const navigate = useNavigate();

    const fetchAccounts = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/bank-accounts`, { headers: { 'x-auth-token': token } });
            if (!response.ok) throw new Error('Error al obtener las cuentas bancarias.');
            const data = await response.json();
            setAccounts(data);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAccounts(); }, []);

    const handleSaveAccount = async (accountData) => {
        const token = localStorage.getItem('token');
        const method = editingAccount ? 'PUT' : 'POST';
        const url = editingAccount ? `${process.env.REACT_APP_API_URL}/api/bank-accounts/${editingAccount.account_id}` : `${process.env.REACT_APP_API_URL}/api/bank-accounts`;
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(accountData),
            });
            if (!response.ok) throw new Error('Error al guardar la cuenta.');
            toast.success('Cuenta bancaria guardada.');
            fetchAccounts();
            setShowAccountForm(false);
            setEditingAccount(null);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDeleteAccount = (accountId) => {
        const performDelete = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/bank-accounts/${accountId}`, {
                    method: 'DELETE',
                    headers: { 'x-auth-token': token },
                });
                if (!response.ok) throw new Error('Error al eliminar la cuenta.');
                toast.success('Cuenta eliminada con éxito.');
                fetchAccounts();
            } catch (err) {
                toast.error(err.message);
            }
        };
        const ConfirmationToast = ({ closeToast }) => (
            <div>
                <p>¿Seguro que quieres eliminar esta cuenta?</p>
                <button onClick={() => { performDelete(); closeToast(); }}>Sí, eliminar</button>
                <button onClick={closeToast}>Cancelar</button>
            </div>
        );
        toast.warn(<ConfirmationToast />, { closeOnClick: false, autoClose: false });
    };

    const handleEditAccount = (account) => {
        setEditingAccount(account);
        setShowAccountForm(true);
    };

    const handleSaveTransaction = async (transactionData) => {
        if (!selectedAccountForTx) return;


        console.log("Frontend: Intentando guardar transacción para la cuenta:", selectedAccountForTx);
        console.log("Frontend: El ID de cuenta que se usará en la URL es:", selectedAccountForTx.account_id);


        const token = localStorage.getItem('token');
        try {
            // LA CORRECCIÓN: Usamos la ruta separada y explícita para las transacciones
            const url = `${process.env.REACT_APP_API_URL}/api/bank-transactions/by-account/${selectedAccountForTx.account_id}`;

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
            setShowTransactionForm(false);
            setSelectedAccountForTx(null);
            fetchAccounts(); // Recargamos la lista para ver el nuevo saldo
        } catch (err) {
            toast.error(err.message);
        }
    };

    const openTransactionForm = (account) => {
        setSelectedAccountForTx(account);
        setShowTransactionForm(true);
    };

    if (loading) return <p>Cargando cuentas...</p>;

    return (
        <div>
            <h2>Cuentas Bancarias</h2>
            <div className="invoice-toolbar">
                <p>Gestiona tus cuentas y registra transacciones.</p>
                {!showAccountForm && !showTransactionForm &&
                    <button onClick={() => { setEditingAccount(null); setShowAccountForm(true); }} className="btn-primary">Añadir Cuenta</button>
                }
            </div>

            {showAccountForm && <BankAccountForm onSave={handleSaveAccount} onCancel={() => setShowAccountForm(false)} currentAccount={editingAccount} />}

            {showTransactionForm && <TransactionForm onSave={handleSaveTransaction} onCancel={() => setShowTransactionForm(false)} accountName={selectedAccountForTx.account_name} />}

            {!showAccountForm && !showTransactionForm && (
                <div className="table-container">
                    <table>
                        <thead><tr><th>Nombre de Cuenta</th><th>Banco</th><th>Tipo</th><th>Saldo Actual</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {accounts.map((account) => (
                                <tr key={account.account_id}>
                                    <td>{account.account_name}</td>
                                    <td>{account.bank_name}</td>
                                    <td>{account.account_type}</td>
                                    <td className={parseFloat(account.current_balance) >= 0 ? 'balance-positive' : 'balance-negative'}>
                                        ${parseFloat(account.current_balance).toFixed(2)}
                                    </td>
                                    <td className="actions-cell">
                                        <button className="btn-view" onClick={() => openTransactionForm(account)}>Añadir Transacción</button>
                                        <button className="btn-view" onClick={() => navigate(`/bank-accounts/${account.account_id}`)}>Ver Transacciones</button>
                                        <button className="btn-edit" onClick={() => handleEditAccount(account)}>Editar</button>
                                        <button className="btn-delete" onClick={() => handleDeleteAccount(account.account_id)}>Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default BankAccounts;