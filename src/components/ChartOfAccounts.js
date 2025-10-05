// client/src/components/ChartOfAccounts.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AccountForm from './AccountForm';
import './Invoices.css'; // Reutilizamos estilos

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
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAccounts(currentPage); }, [currentPage]);

    const handleSave = async (accountData) => {
        const token = localStorage.getItem('token');
        const method = editingAccount ? 'PUT' : 'POST';

        const url = editingAccount
            ? `${apiUrl}/api/accounts/${editingAccount.account_id}`
            : `${apiUrl}/api/accounts`; // <-- Aquí estaba el error

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

    const handleDelete = (accountId) => { /* Lógica de eliminación con toast ... */ };
    const handleEdit = (account) => { setEditingAccount(account); setShowForm(true); };

    if (loading) return <p>Cargando Plan de Cuentas...</p>;

    return (
        <div>
            <h2 className="page-header-with-icon">
                <img src="/axioma-icon.png" alt="Axioma Icon" className="page-icon" />
                Plan de Cuentas</h2>
            <div className="invoice-toolbar">
                <p>Gestiona tu catálogo de cuentas contables.</p>
                {!showForm && <button onClick={() => { setEditingAccount(null); setShowForm(true); }} className="btn-primary">Añadir Cuenta</button>}
            </div>
            {showForm && <AccountForm onSave={handleSave} onCancel={() => setShowForm(false)} currentAccount={editingAccount} />}
            {!showForm && (
                <>
                    <div className="table-container">
                        <table>
                            <thead><tr><th>Número</th><th>Nombre</th><th>Tipo</th><th>Sub-Tipo</th><th>Activa</th><th>Acciones</th></tr></thead>
                            <tbody>
                                {accounts.map((account) => (
                                    <tr key={account.account_id}>
                                        <td>{account.account_number}</td>
                                        <td>{account.account_name}</td>
                                        <td>{account.account_type}</td>
                                        <td>{account.account_subtype}</td>
                                        <td>{account.is_active ? 'Sí' : 'No'}</td>
                                        <td className="actions-cell">
                                            <button className="btn-edit" onClick={() => handleEdit(account)}>Editar</button>
                                            {/* <button className="btn-delete" onClick={() => handleDelete(account.account_id)}>Eliminar</button> */}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="pagination-container">
                        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="pagination-button">Anterior</button>
                        <span> Página {currentPage} de {totalPages} </span>
                        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages} className="pagination-button">Siguiente</button>
                    </div>
                </>
            )}
        </div>
    );
};
export default ChartOfAccounts;