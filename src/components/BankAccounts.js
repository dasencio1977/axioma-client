import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import BankAccountForm from './BankAccountForm';
import TransactionForm from './TransactionForm';
// Eliminamos la importación de './Invoices.css'
import axiomaIcon from '../assets/axioma-icon.png';

const apiUrl = process.env.REACT_APP_API_URL;

const BankAccounts = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAccountForm, setShowAccountForm] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [showTransactionForm, setShowTransactionForm] = useState(false);
    const [selectedAccountForTx, setSelectedAccountForTx] = useState(null);
    const navigate = useNavigate();

    const fetchAccounts = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${apiUrl}/api/bank-accounts`, { headers: { 'x-auth-token': token } });
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
        const url = editingAccount ? `${apiUrl}/api/bank-accounts/${editingAccount.account_id}` : `${apiUrl}/api/bank-accounts`;
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
                const response = await fetch(`${apiUrl}/api/bank-accounts/${accountId}`, {
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
                <button onClick={() => { performDelete(); closeToast(); }} className="mr-2 py-1 px-3 bg-red-600 text-white rounded-md">Sí, eliminar</button>
                <button onClick={closeToast} className="py-1 px-3 bg-gray-200 text-gray-700 rounded-md">Cancelar</button>
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
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${apiUrl}/api/bank-transactions/by-account/${selectedAccountForTx.account_id}`, {
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
            fetchAccounts();
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
            <h2 className="flex items-center gap-3 text-3xl font-semibold text-gray-800 mb-8">
                <img src={axiomaIcon} alt="Axioma Icon" className="w-8 h-8 object-contain" />
                Cuentas Bancarias
            </h2>
            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">Gestiona tus cuentas y registra transacciones.</p>
                {!showAccountForm && !showTransactionForm &&
                    <button onClick={() => { setEditingAccount(null); setShowAccountForm(true); }}
                        className="py-2 px-5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                        Añadir Cuenta
                    </button>
                }
            </div>

            {showAccountForm && <BankAccountForm onSave={handleSaveAccount} onCancel={() => setShowAccountForm(false)} currentAccount={editingAccount} />}

            {showTransactionForm && <TransactionForm onSave={handleSaveTransaction} onCancel={() => setShowTransactionForm(false)} accountName={selectedAccountForTx.account_name} />}

            {!showAccountForm && !showTransactionForm && (
                <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                        <thead className="bg-gray-100 border-b border-gray-200">
                            <tr>
                                <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Nombre de Cuenta</th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Banco</th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
                                <th className="p-4 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">Saldo Actual</th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {accounts.map((account) => (
                                <tr key={account.account_id} className="hover:bg-gray-50">
                                    <td className="p-4 whitespace-nowrap text-gray-700 font-medium">{account.account_name}</td>
                                    <td className="p-4 whitespace-nowrap text-gray-700">{account.bank_name}</td>
                                    <td className="p-4 whitespace-nowrap text-gray-700">{account.account_type}</td>
                                    <td className={`p-4 whitespace-nowrap text-right font-medium ${parseFloat(account.current_balance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        ${parseFloat(account.current_balance).toFixed(2)}
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="flex flex-wrap gap-2">
                                            <button className="py-1 px-3 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600" onClick={() => navigate(`/bank-accounts/${account.account_id}`)}>Ver Historial</button>
                                            <button className="py-1 px-3 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600" onClick={() => openTransactionForm(account)}>+ Transacción</button>
                                            <button className="py-1 px-3 bg-yellow-500 text-white rounded-md text-sm font-medium hover:bg-yellow-600" onClick={() => handleEditAccount(account)}>Editar</button>
                                            <button className="py-1 px-3 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700" onClick={() => handleDeleteAccount(account.account_id)}>Eliminar</button>
                                        </div>
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