// client/src/components/TransactionForm.js
import React, { useState } from 'react';
import './ClientForm.css'; // Reutilizamos estilos

const TransactionForm = ({ onSave, onCancel, accountName }) => {
    const [formData, setFormData] = useState({
        transaction_date: new Date().toISOString().slice(0, 10),
        description: '',
        amount: '',
        type: 'outflow' // Para manejar si es entrada o salida
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Convertimos a negativo si es una salida de dinero
        const finalAmount = formData.type === 'outflow' ? -Math.abs(formData.amount) : Math.abs(formData.amount);
        onSave({
            transaction_date: formData.transaction_date,
            description: formData.description,
            amount: finalAmount
        });
    };

    return (
        <div className="client-form-container" style={{ marginTop: '20px' }}>
            <h3>Nueva Transacción para: {accountName}</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group"><label>Fecha</label><input type="date" name="transaction_date" value={formData.transaction_date} onChange={handleChange} required /></div>
                <div className="form-group"><label>Descripción</label><input type="text" name="description" value={formData.description} onChange={handleChange} required /></div>
                <div className="form-group"><label>Monto</label><input type="number" name="amount" value={formData.amount} onChange={handleChange} min="0.01" step="0.01" placeholder="Ej: 50.00" required /></div>
                <div className="form-group">
                    <label>Tipo</label>
                    <select name="type" value={formData.type} onChange={handleChange}>
                        <option value="outflow">Salida / Gasto</option>
                        <option value="inflow">Entrada / Depósito</option>
                    </select>
                </div>
                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
                    <button type="submit" className="btn-primary">Guardar Transacción</button>
                </div>
            </form>
        </div>
    );
};

export default TransactionForm;