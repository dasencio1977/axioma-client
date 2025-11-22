// client/src/components/ExpenseForm.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
// Eliminamos la importación de './ExpenseForm.css' y './ClientForm.css'

const apiUrl = process.env.REACT_APP_API_URL;

const ExpenseForm = ({ onSave, onCancel, currentExpense }) => {
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        expense_account_id: '',
        expense_date: new Date().toISOString().slice(0, 10),
        vendor_id: ''
    });
    const [expenseAccounts, setExpenseAccounts] = useState([]);
    const [vendors, setVendors] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        // Cargar cuentas de Gasto y Suplidores
        Promise.all([
            fetch(`${apiUrl}/api/accounts?all=true`, { headers: { 'x-auth-token': token } }),
            fetch(`${apiUrl}/api/vendors?all=true`, { headers: { 'x-auth-token': token } })
        ]).then(async ([accRes, venRes]) => {
            const accData = await accRes.json();
            const venData = await venRes.json();
            setExpenseAccounts(accData.filter(a => a.account_type === 'Gasto'));
            setVendors(venData);
        }).catch(err => toast.error("Error al cargar datos auxiliares."));

        if (currentExpense) {
            setFormData({
                description: currentExpense.description || '',
                amount: currentExpense.amount || '',
                expense_account_id: currentExpense.expense_account_id || '',
                expense_date: currentExpense.expense_date ? new Date(currentExpense.expense_date).toISOString().slice(0, 10) : '',
                vendor_id: currentExpense.vendor_id || ''
            });
        } else {
            setFormData({
                description: '', amount: '', expense_account_id: '',
                expense_date: new Date().toISOString().slice(0, 10), vendor_id: ''
            });
        }
    }, [currentExpense]);

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const onSubmit = (e) => { e.preventDefault(); onSave(formData); };

    return (
        // Contenedor del formulario: tarjeta blanca con sombra
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg my-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-4">
                {currentExpense ? 'Editar Gasto' : 'Añadir Nuevo Gasto'}
            </h3>
            <form onSubmit={onSubmit}>
                {/* Usamos un grid para un layout responsivo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">
                            Descripción
                        </label>
                        <input
                            id="description"
                            type="text"
                            name="description"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.description}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="amount" className="block text-sm font-bold text-gray-700 mb-2">
                            Monto
                        </label>
                        <input
                            id="amount"
                            type="number"
                            name="amount"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.amount}
                            onChange={onChange}
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="expense_date" className="block text-sm font-bold text-gray-700 mb-2">
                            Fecha del Gasto
                        </label>
                        <input
                            id="expense_date"
                            type="date"
                            name="expense_date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.expense_date}
                            onChange={onChange}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="expense_account_id" className="block text-sm font-bold text-gray-700 mb-2">
                            Categoría (Cuenta de Gasto)
                        </label>
                        <select
                            id="expense_account_id"
                            name="expense_account_id"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.expense_account_id}
                            onChange={onChange}
                            required
                        >
                            <option value="">Selecciona una categoría...</option>
                            {expenseAccounts.map(acc => <option key={acc.account_id} value={acc.account_id}>{acc.account_name}</option>)}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="vendor_id" className="block text-sm font-bold text-gray-700 mb-2">
                            Suplidor (Opcional)
                        </label>
                        <select
                            id="vendor_id"
                            name="vendor_id"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.vendor_id || ''}
                            onChange={onChange}
                        >
                            <option value="">-- Sin Suplidor --</option>
                            {vendors.map(vendor => (
                                <option key={vendor.vendor_id} value={vendor.vendor_id}>
                                    {vendor.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                {/* Botones de acción */}
                <div className="flex justify-end gap-4 mt-6">
                    <button
                        type="button"
                        className="py-2 px-5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                        onClick={onCancel}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="py-2 px-5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                    >
                        Guardar Gasto
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ExpenseForm;