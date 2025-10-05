// client/src/components/ExpenseForm.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './ExpenseForm.css';
import './ClientForm.css';

const apiUrl = process.env.REACT_APP_API_URL;

const ExpenseForm = ({ onSave, onCancel, currentExpense }) => {
    const [formData, setFormData] = useState({ description: '', amount: '', category: '', expense_date: new Date().toISOString().slice(0, 10), vendor_id: '' });
    const [vendors, setVendors] = useState([]);

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const token = localStorage.getItem('token');
                // 1. Pedimos TODOS los suplidores para el dropdown.
                const response = await fetch(`${apiUrl}/api/vendors?all=true`, {
                    headers: { 'x-auth-token': token }
                });
                if (!response.ok) throw new Error('No se pudo cargar la lista de suplidores.');

                const data = await response.json();
                // 2. Ahora 'data' es un array simple, como esperamos.
                setVendors(data);
            } catch (err) {
                toast.error(err.message);
            }
        };
        fetchVendors();

        if (currentExpense) {
            setFormData({
                description: currentExpense.description || '',
                amount: currentExpense.amount || '',
                category: currentExpense.category || '',
                expense_date: new Date(currentExpense.expense_date).toISOString().slice(0, 10),
                vendor_id: currentExpense.vendor_id || ''
            });
        }
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