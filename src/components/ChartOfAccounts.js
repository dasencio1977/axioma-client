import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AccountForm from './AccountForm';
// Eliminamos la importación de './Invoices.css'
import axiomaIcon from '../assets/axioma-icon.png';

const apiUrl = process.env.REACT_APP_API_URL;

const ChartOfAccounts = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchAccounts = async (page) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${apiUrl}/api/accounts?page=${page}`, { headers: { 'x-auth-token': token } });
            if (!response.ok) throw new Error('Error al obtener las cuentas.');
            const data = await response.json();
            setAccounts(data.accounts);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts(currentPage);
    }, [currentPage]);

    const handleSave = async (accountData) => {
        const token = localStorage.getItem('token');
        const method = editingAccount ? 'PUT' : 'POST';
        const url = editingAccount
            ? `${apiUrl}/api/accounts/${editingAccount.account_id}`
            : `${apiUrl}/api/accounts`;
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(accountData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Error al guardar la cuenta.');
            toast.success('Cuenta guardada.');
            fetchAccounts(1);
            setShowForm(false);
            setEditingAccount(null);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDelete = (accountId) => {
        const performDelete = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${apiUrl}/api/accounts/${accountId}`, {
                    method: 'DELETE',
                    headers: { 'x-auth-token': token }
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.msg || 'Error al eliminar la cuenta.');
                toast.success('Cuenta eliminada.');
                fetchAccounts(1);
            } catch (err) {
                toast.error(err.message);
            }
        };

        const ConfirmationToast = ({ closeToast }) => (
            <div>
                <p>¿Seguro que quieres eliminar esta cuenta?</p>
                <p className="text-sm text-gray-600 mt-1">Nota: Solo se puede eliminar si no tiene transacciones asociadas.</p>
                <div className="flex justify-end gap-2 mt-3">
                    <button onClick={closeToast} className="py-1 px-3 bg-gray-200 text-gray-700 rounded-md">Cancelar</button>
                    <button onClick={() => { performDelete(); closeToast(); }} className="py-1 px-3 bg-red-600 text-white rounded-md">Sí, eliminar</button>
                </div>
            </div>
        );
        toast.warn(<ConfirmationToast />, { closeOnClick: false, autoClose: false });
    };

    const handleEdit = (account) => {
        setEditingAccount(account);
        setShowForm(true);
    };

    if (loading) return <p>Cargando Plan de Cuentas...</p>;

    return (
        <div>
            <h2 className="flex items-center gap-3 text-3xl font-semibold text-gray-800 mb-8">
                <img src={axiomaIcon} alt="Axioma Icon" className="w-8 h-8 object-contain" />
                Plan de Cuentas
            </h2>
            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">Gestiona tu catálogo de cuentas contables.</p>
                {!showForm && <button onClick={() => { setEditingAccount(null); setShowForm(true); }}
                    className="py-2 px-5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                    Añadir Cuenta
                </button>}
            </div>
            {showForm && <AccountForm onSave={handleSave} onCancel={() => setShowForm(false)} currentAccount={editingAccount} />}
            {!showForm && (
                <>
                    <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Número</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Sub-Tipo</th>
                                    <th className="p-4 text-center text-sm font-semibold text-gray-600 uppercase tracking-wider">Activa</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {accounts.map((account) => (
                                    <tr key={account.account_id} className="hover:bg-gray-50">
                                        <td className="p-4 whitespace-nowrap text-gray-700 font-medium">{account.account_number}</td>
                                        <td className="p-4 whitespace-nowrap text-gray-700">{account.account_name}</td>
                                        <td className="p-4 whitespace-nowrap text-gray-700">{account.account_type}</td>
                                        <td className="p-4 whitespace-nowrap text-gray-700">{account.account_subtype}</td>
                                        <td className="p-4 whitespace-nowrap text-center">
                                            <span className={`py-1 px-3 rounded-full text-xs font-medium ${account.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {account.is_active ? 'Sí' : 'No'}
                                            </span>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="flex gap-2">
                                                <button className="py-1 px-3 bg-yellow-500 text-white rounded-md text-sm font-medium hover:bg-yellow-600" onClick={() => handleEdit(account)}>Editar</button>
                                                <button className="py-1 px-3 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700" onClick={() => handleDelete(account.account_id)}>Eliminar</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-xl shadow-lg">
                        <div></div>
                        <div className="text-sm text-gray-700 font-medium">
                            <span> Página {currentPage} de {totalPages} </span>
                        </div>
                        <div>
                            <button onClick={() => fetchAccounts(currentPage - 1)} disabled={currentPage === 1} className="py-2 px-4 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed">Anterior</button>
                            <button onClick={() => fetchAccounts(currentPage + 1)} disabled={currentPage >= totalPages} className="py-2 px-4 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed ml-2">Siguiente</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
export default ChartOfAccounts;