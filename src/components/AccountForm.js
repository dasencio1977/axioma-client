import React, { useState, useEffect } from 'react';
// Eliminamos la importación de './ClientForm.css'

const AccountForm = ({ onSave, onCancel, currentAccount }) => {
    const [formData, setFormData] = useState({
        account_number: '',
        account_name: '',
        account_type: 'Activo',
        account_subtype: '',
        description: '',
        is_active: true
    });

    useEffect(() => {
        if (currentAccount) {
            setFormData({
                account_number: currentAccount.account_number || '',
                account_name: currentAccount.account_name || '',
                account_type: currentAccount.account_type || 'Activo',
                account_subtype: currentAccount.account_subtype || '',
                description: currentAccount.description || '',
                is_active: currentAccount.is_active === undefined ? true : currentAccount.is_active
            });
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
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg my-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-4">
                {currentAccount ? 'Editar Cuenta' : 'Nueva Cuenta Contable'}
            </h3>
            <form onSubmit={onSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="account_number" className="block text-sm font-bold text-gray-700 mb-2">Número de Cuenta</label>
                        <input id="account_number" type="text" name="account_number" value={formData.account_number} onChange={onChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="account_name" className="block text-sm font-bold text-gray-700 mb-2">Nombre de la Cuenta</label>
                        <input id="account_name" type="text" name="account_name" value={formData.account_name} onChange={onChange} required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="account_type" className="block text-sm font-bold text-gray-700 mb-2">Tipo de Cuenta</label>
                        <select id="account_type" name="account_type" value={formData.account_type} onChange={onChange} required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="Activo">Activo</option>
                            <option value="Pasivo">Pasivo</option>
                            <option value="Patrimonio">Patrimonio</option>
                            <option value="Ingreso">Ingreso</option>
                            <option value="Gasto">Gasto</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="account_subtype" className="block text-sm font-bold text-gray-700 mb-2">Sub-Tipo (Opcional)</label>
                        <input id="account_subtype" type="text" name="account_subtype" value={formData.account_subtype} onChange={onChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">Descripción</label>
                        <textarea id="description" name="description" value={formData.description} onChange={onChange} rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                    <div className="md:col-span-2 flex items-center gap-2">
                        <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={onChange}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Cuenta Activa</label>
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
export default AccountForm;