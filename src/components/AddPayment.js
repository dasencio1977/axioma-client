import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
// Eliminamos la importación de './InvoiceForm.css'

const apiUrl = process.env.REACT_APP_API_URL;

const AddPayment = () => {
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
    const { id } = useParams();
    const navigate = useNavigate();

    const fetchInvoice = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${apiUrl}/api/invoices/${id}`, {
                headers: { 'x-auth-token': token },
            });
            if (!response.ok) throw new Error('No se pudo cargar la información de la factura.');
            const data = await response.json();
            setInvoice(data);
        } catch (err) {
            toast.error(err.message);
            navigate(`/invoices/${id}`);
        } finally {
            setLoading(false);
        }
    }, [id, navigate, apiUrl]);

    useEffect(() => {
        fetchInvoice();
    }, [fetchInvoice]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${apiUrl}/api/invoices/${id}/payments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ amount_paid: paymentAmount, payment_date: paymentDate }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Error al registrar el pago.');

            toast.success('Pago registrado con éxito');
            navigate(`/invoices/${id}`); // Regresamos al detalle de la factura
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading || !invoice) return <p>Cargando...</p>;

    const totalPaid = invoice.payments.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
    const balanceDue = parseFloat(invoice.total_amount) - totalPaid;

    return (
        // Usamos la misma "tarjeta" que en los otros formularios
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg my-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Registrar Pago para Factura #{invoice.invoice_number}
            </h2>

            {/* Resumen de la factura */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                <p className="text-gray-700"><strong>Cliente:</strong> {invoice.client_name}</p>
                <p className="text-gray-700"><strong>Total Factura:</strong> ${parseFloat(invoice.total_amount).toFixed(2)}</p>
                <p className="text-lg font-bold text-gray-800">Saldo Pendiente: ${balanceDue.toFixed(2)}</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="mb-4">
                        <label htmlFor="paymentAmount" className="block text-sm font-bold text-gray-700 mb-2">
                            Monto a Pagar
                        </label>
                        <input
                            id="paymentAmount"
                            type="number"
                            name="paymentAmount"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            placeholder="Monto"
                            max={balanceDue.toFixed(2)}
                            step="0.01"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="paymentDate" className="block text-sm font-bold text-gray-700 mb-2">
                            Fecha de Pago
                        </label>
                        <input
                            id="paymentDate"
                            type="date"
                            name="paymentDate"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button
                        type="button"
                        className="py-2 px-5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                        onClick={() => navigate(`/invoices/${id}`)}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="py-2 px-5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                    >
                        Añadir Pago
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddPayment;