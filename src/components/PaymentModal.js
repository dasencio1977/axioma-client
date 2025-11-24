import React, { useState } from 'react';
import { toast } from 'react-toastify';

const apiUrl = process.env.REACT_APP_API_URL;

const PaymentModal = ({ invoice, onClose, onPaymentSuccess }) => {
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);

    const balanceDue = parseFloat(invoice.total_amount) - parseFloat(invoice.amount_paid);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || amount <= 0) {
            toast.error('Por favor ingrese un monto válido');
            return;
        }
        if (amount > balanceDue) {
            toast.error('El monto no puede ser mayor al saldo pendiente');
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${apiUrl}/api/invoices/${invoice.invoice_id}/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    amount_paid: amount,
                    payment_date: date
                })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success('Pago registrado exitosamente');
                onPaymentSuccess();
                onClose();
            } else {
                toast.error(data.msg || 'Error al registrar pago');
            }
        } catch (err) {
            toast.error('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                <div className="bg-gray-800 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">Registrar Pago</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Factura #{invoice.invoice_number}</p>
                        <p className="text-sm text-gray-600 mb-1">Cliente: <span className="font-medium">{invoice.client_name}</span></p>
                        <div className="flex justify-between items-end mt-2">
                            <span className="text-gray-600">Saldo Pendiente:</span>
                            <span className="text-xl font-bold text-gray-900">${balanceDue.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Monto a Pagar</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    max={balanceDue}
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Pago</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? 'Procesando...' : 'Confirmar Pago'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;
