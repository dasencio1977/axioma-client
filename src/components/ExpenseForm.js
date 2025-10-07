// client/src/components/ExpenseForm.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './ExpenseForm.css';
import './ClientForm.css';

const apiUrl = process.env.REACT_APP_API_URL;

const ExpenseForm = ({ onSave, onCancel, currentExpense }) => {
    const [formData, setFormData] = useState({ description: '', amount: '', expense_account_id: '', expense_date: new Date().toISOString().slice(0, 10), vendor_id: '' });
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
        });

        if (currentExpense) { setFormData(currentExpense); }
    }, [currentExpense]);

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const onSubmit = (e) => { e.preventDefault(); onSave(formData); };


    return (
        <div className="expense-form-container">
            <h3>{currentExpense ? 'Editar Gasto' : 'Añadir Nuevo Gasto'}</h3>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label htmlFor="description">Descripción</label>
                    <input id="description" type="text" name="description" value={formData.description} onChange={onChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="amount">Monto</label>
                    <input id="amount" type="number" name="amount" value={formData.amount} onChange={onChange} min="0" step="0.01" required />
                </div>
                <div className="form-group">
                    <label>Categoría (Cuenta de Gasto)</label>
                    <select name="expense_account_id" value={formData.expense_account_id} onChange={onChange} required>
                        <option value="">Selecciona una categoría...</option>
                        {expenseAccounts.map(acc => <option key={acc.account_id} value={acc.account_id}>{acc.account_name}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="vendor_id">Suplidor (Opcional)</label>
                    <select id="vendor_id" name="vendor_id" value={formData.vendor_id} onChange={onChange}>
                        <option value="">-- Sin Suplidor --</option>
                        {vendors.map(vendor => (
                            <option key={vendor.vendor_id} value={vendor.vendor_id}>
                                {vendor.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="category">Categoría</label>
                    <input id="category" type="text" name="category" value={formData.category} onChange={onChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="expense_date">Fecha del Gasto</label>
                    <input id="expense_date" type="date" name="expense_date" value={formData.expense_date} onChange={onChange} required />
                </div>
                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
                    <button type="submit" className="btn-primary">Guardar Gasto</button>
                </div>
            </form>
        </div>
    );
};

export default ExpenseForm;