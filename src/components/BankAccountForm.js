import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
// Eliminamos la importación de './ClientForm.css'

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
            .then(data => setAssetAccounts(data.filter(acc => acc.account_type === 'Activo')))
            .catch(err => toast.error("Error al cargar el plan de cuentas."));

        if (currentAccount) {
            setFormData({
                account_name: currentAccount.account_name || '',
                account_type: currentAccount.account_type || 'Cuenta Corriente',
                bank_name: currentAccount.bank_name || '',
                account_number_masked: currentAccount.account_number_masked || '',
                current_balance: currentAccount.current_balance || '',
                gl_account_id: currentAccount.gl_account_id || ''
            });
        } else {
            setFormData({
                account_name: '', account_type: 'Cuenta Corriente', bank_name: '',
                account_number_masked: '', current_balance: '', gl_account_id: ''
            });
        }
    }, [currentAccount]);

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const onSubmit = (e) => { e.preventDefault(); onSave(formData); };

    return (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg my-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-4">
                {currentAccount ? 'Editar Cuenta Bancaria' : 'Nueva Cuenta Bancaria'}
            </h3>
            <form onSubmit={onSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="account_name" className="block text-sm font-bold text-gray-700 mb-2">Nombre de la Cuenta</label>
                        <input id="account_name" type="text" name="account_name" value={formData.account_name} onChange={onChange} required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="account_type" className="block text-sm font-bold text-gray-700 mb-2">Tipo de Cuenta</label>
                        <select id="account_type" name="account_type" value={formData.account_type} onChange={onChange} required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="Cuenta Corriente">Cuenta Corriente</option>
                            <option value="Cuenta de Ahorros">Cuenta de Ahorros</option>
                            <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="bank_name" className="block text-sm font-bold text-gray-700 mb-2">Nombre del Banco</label>
                        <input id="bank_name" type="text" name="bank_name" value={formData.bank_name} onChange={onChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="account_number_masked" className="block text-sm font-bold text-gray-700 mb-2">Últimos 4 Dígitos (Opcional)</label>
                        <input id="account_number_masked" type="text" name="account_number_masked" value={formData.account_number_masked} onChange={onChange} maxLength="4"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="current_balance" className="block text-sm font-bold text-gray-700 mb-2">Saldo Inicial</label>
                        <input id="current_balance" type="number" name="current_balance" value={formData.current_balance} onChange={onChange} required step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="gl_account_id" className="block text-sm font-bold text-gray-700 mb-2">Cuenta Contable Vinculada (Activo)</label>
                        <select id="gl_account_id" name="gl_account_id" value={formData.gl_account_id} onChange={onChange} required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Selecciona una cuenta...</option>
                            {assetAccounts.map(acc => (
                                <option key={acc.account_id} value={acc.account_id}>{acc.account_name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
                    <button type="button" className="py-2 px-5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors" onClick={onCancel}>
                        Cancelar
                    </button>
                    <button type="submit" className="py-2 px-5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors">
                        Guardar Cuenta
                    </button>
                </div>
            </form>
        </div>
    );
};
export default BankAccountForm;