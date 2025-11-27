import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { LandmarkIcon, PlusCircleIcon } from './Icons';

const apiUrl = process.env.REACT_APP_API_URL;

const BankDeposits = () => {
    const [payments, setPayments] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [selectedPayments, setSelectedPayments] = useState([]);
    const [selectedBank, setSelectedBank] = useState('');
    const [depositDate, setDepositDate] = useState(new Date().toISOString().split('T')[0]);
    const [memo, setMemo] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        try {
            const [paymentsRes, accountsRes] = await Promise.all([
                fetch(`${apiUrl}/api/deposits/undeposited`, { headers: { 'x-auth-token': token } }),
                fetch(`${apiUrl}/api/bank-accounts`, { headers: { 'x-auth-token': token } })
            ]);

            const paymentsData = await paymentsRes.json();
            const accountsData = await accountsRes.json();

            setPayments(paymentsData);
            setBankAccounts(accountsData);
        } catch (err) {
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckboxChange = (paymentId) => {
        if (selectedPayments.includes(paymentId)) {
            setSelectedPayments(selectedPayments.filter(id => id !== paymentId));
        } else {
            setSelectedPayments([...selectedPayments, paymentId]);
        }
    };

    const calculateTotal = () => {
        return payments
            .filter(p => selectedPayments.includes(p.payment_id))
            .reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedPayments.length === 0) {
            toast.error('Seleccione al menos un pago para depositar');
            return;
        }
        if (!selectedBank) {
            toast.error('Seleccione una cuenta bancaria');
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${apiUrl}/api/deposits`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    bank_account_id: selectedBank,
                    payment_ids: selectedPayments,
                    deposit_date: depositDate,
                    memo
                })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success('Depósito creado exitosamente');
                setSelectedPayments([]);
                setMemo('');
                fetchData(); // Recargar datos
            } else {
                toast.error(data.msg || 'Error al crear depósito');
            }
        } catch (err) {
            toast.error('Error de conexión');
        }
    };

    if (loading) return <p className="text-center p-8">Cargando...</p>;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <div className="bg-green-100 p-3 rounded-full">
                    <LandmarkIcon className="w-8 h-8 text-green-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Depósitos Bancarios</h1>
                    <p className="text-gray-500">Gestione sus fondos pendientes de depósito</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Lista de Pagos Pendientes */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h2 className="font-semibold text-gray-800">Pagos por Depositar</h2>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                            {payments.length} pendientes
                        </span>
                    </div>

                    {payments.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            No hay pagos pendientes de depósito.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 font-medium border-b">
                                    <tr>
                                        <th className="p-4 w-10">
                                            <input
                                                type="checkbox"
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedPayments(payments.map(p => p.payment_id));
                                                    } else {
                                                        setSelectedPayments([]);
                                                    }
                                                }}
                                                checked={selectedPayments.length === payments.length && payments.length > 0}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </th>
                                        <th className="p-4">Fecha</th>
                                        <th className="p-4">Cliente</th>
                                        <th className="p-4">Factura</th>
                                        <th className="p-4 text-right">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {payments.map((payment) => (
                                        <tr
                                            key={payment.payment_id}
                                            className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedPayments.includes(payment.payment_id) ? 'bg-blue-50' : ''}`}
                                            onClick={() => handleCheckboxChange(payment.payment_id)}
                                        >
                                            <td className="p-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPayments.includes(payment.payment_id)}
                                                    onChange={() => { }} // Manejado por el row click
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
                                                />
                                            </td>
                                            <td className="p-4">{new Date(payment.payment_date).toLocaleDateString()}</td>
                                            <td className="p-4 font-medium text-gray-900">{payment.client_name}</td>
                                            <td className="p-4 text-gray-500">#{payment.invoice_number}</td>
                                            <td className="p-4 text-right font-semibold text-gray-900">${parseFloat(payment.amount_paid).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Formulario de Depósito */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 sticky top-6">
                        <div className="p-6 border-b border-gray-200 bg-gray-900 text-white rounded-t-xl">
                            <h2 className="font-bold text-lg">Nuevo Depósito</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cuenta Bancaria Destino</label>
                                <select
                                    value={selectedBank}
                                    onChange={(e) => setSelectedBank(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    required
                                >
                                    <option value="">Seleccione una cuenta</option>
                                    {bankAccounts.map(acc => (
                                        <option key={acc.account_id} value={acc.account_id}>
                                            {acc.bank_name} - {acc.account_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha del Depósito</label>
                                <input
                                    type="date"
                                    value={depositDate}
                                    onChange={(e) => setDepositDate(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Memo / Referencia</label>
                                <textarea
                                    value={memo}
                                    onChange={(e) => setMemo(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                                    placeholder="Opcional: Notas sobre el depósito..."
                                />
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-gray-600 text-sm">Pagos seleccionados:</span>
                                    <span className="font-medium">{selectedPayments.length}</span>
                                </div>
                                <div className="flex justify-between items-end mt-2 pt-2 border-t border-gray-200">
                                    <span className="text-gray-800 font-semibold">Total a Depositar:</span>
                                    <span className="text-2xl font-bold text-green-600">${calculateTotal().toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={selectedPayments.length === 0}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                <PlusCircleIcon className="w-5 h-5" />
                                Registrar Depósito
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BankDeposits;
