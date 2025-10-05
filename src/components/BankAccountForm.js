// client/src/components/BankAccountForm.js
import React, { useState, useEffect } from 'react';
import './ClientForm.css'; // Reutilizamos estilos

const apiUrl = process.env.REACT_APP_API_URL;

const BankAccountForm = ({ onSave, onCancel, currentAccount }) => {
    const [formData, setFormData] = useState({
        account_name: '',
        account_type: 'Cuenta Corriente',
        bank_name: '',
        account_number_masked: '',
        current_balance: '',
        gl_account_id: ''
    });

    const [assetAccounts, setAssetAccounts] = useState([]);

    useEffect(() => {
        // Cargar cuentas de tipo Activo para el dropdown
        const token = localStorage.getItem('token');
        fetch(`${apiUrl}/api/accounts?all=true`, { headers: { 'x-auth-token': token } })
            .then(res => res.json())
            .then(data => setAssetAccounts(data.filter(acc => acc.account_type === 'Activo')));

        if (currentAccount) { setFormData(currentAccount); }
    }, [currentAccount]);

    // useEffect(() => {
    //     if (currentAccount) {
    //         setFormData(currentAccount);
    //     } else {
    //         setFormData({
    //             account_name: '',
    //             account_type: 'Cuenta Corriente',
    //             bank_name: '',
    //             account_number_masked: '',
    //             current_balance: ''
    //         });
    //     }
    // }, [currentAccount]);

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const onSubmit = (e) => { e.preventDefault(); onSave(formData); };

    return (
        <div className="client-form-container" style={{ marginTop: '20px' }}>
            <h3>{currentAccount ? 'Editar Cuenta Bancaria' : 'Nueva Cuenta Bancaria'}</h3>
            <form onSubmit={onSubmit}>
                <div className="form-group"><label>Nombre de la Cuenta</label><input type="text" name="account_name" value={formData.account_name} onChange={onChange} required /></div>
                <div className="form-group"><label>Tipo de Cuenta</label><select name="account_type" value={formData.account_type} onChange={onChange} required><option value="Cuenta Corriente">Cuenta Corriente</option><option value="Cuenta de Ahorros">Cuenta de Ahorros</option><option value="Tarjeta de Crédito">Tarjeta de Crédito</option></select></div>
                <div className="form-group"><label>Nombre del Banco</label><input type="text" name="bank_name" value={formData.bank_name} onChange={onChange} /></div>
                <div className="form-group"><label>Últimos 4 Dígitos (Opcional)</label><input type="text" name="account_number_masked" value={formData.account_number_masked} onChange={onChange} maxLength="4" /></div>
                <div className="form-group"><label>Saldo Inicial</label><input type="number" name="current_balance" value={formData.current_balance} onChange={onChange} required /></div>
                <div className="form-group">
                    <label>Cuenta Contable Vinculada (de tipo Activo)</label>
                    <select name="gl_account_id" value={formData.gl_account_id || ''} onChange={onChange} required>
                        <option value="">Selecciona una cuenta...</option>
                        {assetAccounts.map(acc => (
                            <option key={acc.account_id} value={acc.account_id}>{acc.account_name}</option>
                        ))}
                    </select>
                </div>
                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
                    <button type="submit" className="btn-primary">Guardar Cuenta</button>
                </div>
            </form>
        </div>
    );
};
export default BankAccountForm;