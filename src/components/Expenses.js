import React, { useState, useEffect } from 'react';
import ExpenseForm from './ExpenseForm';
//import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Expenses.css'; // 1. Importar los nuevos estilos
import './Invoices.css'; // 2. Reutilizamos algunos estilos de botones

const apiUrl = process.env.REACT_APP_API_URL;

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    //const navigate = useNavigate();

    const fetchExpenses = async (page) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${apiUrl}/api/expenses?page=${page}`, {
                headers: { 'x-auth-token': token },
            });
            if (!response.ok) throw new Error('Error al obtener los gastos.');

            const data = await response.json();
            setExpenses(data.expenses);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses(currentPage);
    }, [currentPage]);

    const handleSave = async (expenseData) => {
        const token = localStorage.getItem('token');
        const method = editingExpense ? 'PUT' : 'POST';
        const url = editingExpense
            ? `${apiUrl}/api/expenses/${editingExpense.expense_id}`
            : `${apiUrl}/api/expenses`;
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(expenseData),
            });
            if (!response.ok) throw new Error('Error al guardar el gasto.');
            toast.success(`Gasto ${editingExpense ? 'actualizado' : 'creado'} con éxito.`);
            fetchExpenses();
            setShowForm(false);
            setEditingExpense(null);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDelete = (expenseId) => {
        const performDelete = async () => {
            try {
                const token = localStorage.getItem('token');
                await fetch(`${apiUrl}/api/expenses/${expenseId}`, {
                    method: 'DELETE',
                    headers: { 'x-auth-token': token },
                });
                toast.success('Gasto eliminado con éxito');
                fetchExpenses();
            } catch (err) {
                toast.error('Error al eliminar el gasto.');
            }
        };

        const ConfirmationToast = ({ closeToast }) => (
            <div>
                <p>¿Seguro que quieres eliminar este gasto?</p>
                <button onClick={() => { performDelete(); closeToast(); }}>Sí</button>
                <button onClick={closeToast}>No</button>
            </div>
        );

        toast.warn(<ConfirmationToast />, {
            closeOnClick: false,
            autoClose: false
        });
    };

    const handleEdit = (expense) => {
        setEditingExpense(expense);
        setShowForm(true);
    };

    const filteredExpenses = expenses.filter(expense =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (expense.category && expense.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <p>Cargando gastos...</p>;

    return (
        <div>
            <h2 className="page-header-with-icon">
                <img src="/axioma-icon.png" alt="Axioma Icon" className="page-icon" />
                Mis Gastos
            </h2>
            <div className="expense-toolbar">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Buscar por descripción o categoría..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {!showForm &&
                    <button onClick={() => { setEditingExpense(null); setShowForm(true); }} className="btn-primary">
                        Añadir Gasto
                    </button>
                }
            </div>
            {showForm && <ExpenseForm onSave={handleSave} onCancel={() => setShowForm(false)} currentExpense={editingExpense} />}
            <hr />
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Descripción</th>
                            <th>Suplidor</th>
                            <th>Categoría</th>
                            <th>Monto</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExpenses.map((expense) => (
                            <tr key={expense.expense_id}>
                                <td>{new Date(expense.expense_date).toLocaleDateString()}</td>
                                <td>{expense.description}</td>
                                <td>{expense.vendor_name}</td>
                                <td>{expense.category}</td>
                                <td>${parseFloat(expense.amount).toFixed(2)}</td>
                                {/* 4. Aplicamos los estilos a los botones */}
                                <td className="actions-cell">
                                    <button className="btn-edit" onClick={() => handleEdit(expense)}>Editar</button>
                                    <button className="btn-delete" onClick={() => handleDelete(expense.expense_id)}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="pagination-controls" style={{ marginTop: '20px', textAlign: 'center' }}>
                <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                    Anterior
                </button>
                <span> Página {currentPage} de {totalPages} </span>
                <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages}>
                    Siguiente
                </button>
            </div>
        </div>
    );
};

export default Expenses;