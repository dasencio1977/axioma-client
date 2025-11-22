import React, { useState, useEffect } from 'react';
import ExpenseForm from './ExpenseForm';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
// Eliminamos la importación de './Expenses.css' y './Invoices.css'
import axiomaIcon from '../assets/axioma-icon.png';

const apiUrl = process.env.REACT_APP_API_URL;

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    // --- LÓGICA DE DATOS (sin cambios) ---
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
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Error al guardar el gasto.');
            }
            toast.success(`Gasto ${editingExpense ? 'actualizado' : 'creado'} con éxito.`);
            fetchExpenses(1);
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
                fetchExpenses(1);
            } catch (err) {
                toast.error('Error al eliminar el gasto.');
            }
        };
        const ConfirmationToast = ({ closeToast }) => (
            <div>
                <p>¿Seguro que quieres eliminar este gasto?</p>
                <button onClick={() => { performDelete(); closeToast(); }} className="mr-2 py-1 px-3 bg-red-600 text-white rounded-md">Sí</button>
                <button onClick={closeToast} className="py-1 px-3 bg-gray-200 text-gray-700 rounded-md">No</button>
            </div>
        );
        toast.warn(<ConfirmationToast />, { closeOnClick: false, autoClose: false });
    };

    const handleEdit = (expense) => {
        setEditingExpense(expense);
        setShowForm(true);
    };

    const filteredExpenses = expenses.filter(expense =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (expense.category_name && expense.category_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <p>Cargando gastos...</p>;

    return (
        <div>
            {/* --- Encabezado --- */}
            <h2 className="flex items-center gap-3 text-3xl font-semibold text-gray-800 mb-8">
                <img src={axiomaIcon} alt="Axioma Icon" className="w-8 h-8 object-contain" />
                Mis Gastos
            </h2>

            {/* --- Barra de Herramientas (Toolbar) --- */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <input
                    type="text"
                    className="px-4 py-2 border border-gray-300 rounded-lg w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Buscar por descripción o categoría..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {!showForm &&
                    <button
                        onClick={() => { setEditingExpense(null); setShowForm(true); }}
                        className="py-2 px-5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors w-full md:w-auto"
                    >
                        Añadir Gasto
                    </button>
                }
            </div>

            {/* --- Formulario (se muestra condicionalmente) --- */}
            {showForm && <ExpenseForm onSave={handleSave} onCancel={() => setShowForm(false)} currentExpense={editingExpense} />}

            {/* --- Lista y Paginación (se muestran condicionalmente) --- */}
            {!showForm && (
                <>
                    {/* --- Contenedor de la Tabla --- */}
                    <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Descripción</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Suplidor</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Categoría</th>
                                    <th className="p-4 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">Monto</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredExpenses.map((expense) => (
                                    <tr key={expense.expense_id} className="hover:bg-gray-50">
                                        <td className="p-4 whitespace-nowrap text-gray-700">{new Date(expense.expense_date).toLocaleDateString()}</td>
                                        <td className="p-4 whitespace-nowrap text-gray-700">{expense.description}</td>
                                        <td className="p-4 whitespace-nowrap text-gray-700">{expense.vendor_name || '--'}</td>
                                        <td className="p-4 whitespace-pre-wrap text-gray-700">{expense.category_name || '--'}</td>
                                        <td className="p-4 whitespace-nowrap text-gray-700 text-right">${parseFloat(expense.amount).toFixed(2)}</td>
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="flex gap-2">
                                                <button
                                                    className="py-1 px-3 bg-yellow-500 text-white rounded-md text-sm font-medium hover:bg-yellow-600 transition-colors"
                                                    onClick={() => handleEdit(expense)}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    className="py-1 px-3 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                                                    onClick={() => handleDelete(expense.expense_id)}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* --- Controles de Paginación --- */}
                    <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-xl shadow-lg">
                        <div className="text-sm text-gray-700">
                            Página {currentPage} de {totalPages}
                        </div>
                        <div>
                            <button
                                onClick={() => fetchExpenses(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="py-2 px-4 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => fetchExpenses(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                                className="py-2 px-4 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed ml-2"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Expenses;