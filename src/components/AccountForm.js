// client/src/components/AccountForm.js
import React, { useState, useEffect } from 'react';
import './ClientForm.css'; // Reutilizamos estilos

const AccountForm = ({ onSave, onCancel, currentAccount }) => {
    const [formData, setFormData] = useState({
        account_number: '', account_name: '', account_type: 'Activo',
        account_subtype: '', description: '', is_active: true
    });

    useEffect(() => {
        if (currentAccount) {
            setFormData(currentAccount);
        } else {
            setFormData({
                account_number: '', account_name: '', account_type: 'Activo',
                account_subtype: '', description: '', is_active: true
            });
        }
    }, [currentAccount]);

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    const onSubmit = (e) => { e.preventDefault(); onSave(formData); };

    return (
        <div className="client-form-container" style={{ marginTop: '20px' }}>
            <h3>{currentAccount ? 'Editar Cuenta' : 'Nueva Cuenta Contable'}</h3>
            <form onSubmit={onSubmit}>
                <div className="form-group"><label>Número de Cuenta</label><input type="text" name="account_number" value={formData.account_number} onChange={onChange} /></div>
                <div className="form-group"><label>Nombre de la Cuenta</label><input type="text" name="account_name" value={formData.account_name} onChange={onChange} required /></div>
                <div className="form-group"><label>Tipo de Cuenta</label><select name="account_type" value={formData.account_type} onChange={onChange} required><option value="Activo">Activo</option><option value="Pasivo">Pasivo</option><option value="Patrimonio">Patrimonio</option><option value="Ingreso">Ingreso</option><option value="Gasto">Gasto</option></select></div>
                <div className="form-group"><label>Sub-Tipo</label><input type="text" name="account_subtype" value={formData.account_subtype} onChange={onChange} /></div>
                <div className="form-group"><label>Descripción</label><textarea name="description" value={formData.description} onChange={onChange}></textarea></div>
                <div className="checkbox-group"><input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={onChange} /><label htmlFor="is_active">Activa</label></div>
                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
                    <button type="submit" className="btn-primary">Guardar Cuenta</button>
                </div>
            </form>
        </div>
    );
};
export default AccountForm;