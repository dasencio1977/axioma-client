import React, { useState } from 'react';
// Eliminamos la importación de './ClientForm.css'

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
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg my-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-4">
                Nueva Transacción para: {accountName}
            </h3>
            <form onSubmit={handleSubmit}>
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
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="transaction_date" className="block text-sm font-bold text-gray-700 mb-2">
                            Fecha
                        </label>
                        <input
                            id="transaction_date"
                            type="date"
                            name="transaction_date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.transaction_date}
                            onChange={handleChange}
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
                            onChange={handleChange}
                            min="0.01"
                            step="0.01"
                            placeholder="Ej: 50.00"
                            required
                        />
                    </div>
                    <div className="md:col-span-2 mb-4">
                        <label htmlFor="type" className="block text-sm font-bold text-gray-700 mb-2">
                            Tipo de Transacción
                        </label>
                        <select
                            id="type"
                            name="type"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.type}
                            onChange={handleChange}
                        >
                            <option value="outflow">Salida / Gasto</option>
                            <option value="inflow">Entrada / Depósito</option>
                        </select>
                    </div>
                </div>
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
                        Guardar Transacción
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TransactionForm;