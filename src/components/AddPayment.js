// client/src/components/AddPayment.js

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './InvoiceForm.css'; // Reutilizamos los estilos del formulario de factura

const apiUrl = process.env.REACT_APP_API_URL;

const AddPayment = () => {
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
    const { id } = useParams(); // Obtiene el ID de la factura de la URL
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
            navigate(`/invoices/${id}`); // Si hay error, volvemos al detalle
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

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
        <div className="invoice-form-container">
            <h2>Registrar Pago para Factura #{invoice.invoice_number}</h2>
            <div style={{ marginBottom: '20px' }}>
                <p><strong>Cliente:</strong> {invoice.client_name}</p>
                <p><strong>Total Factura:</strong> ${parseFloat(invoice.total_amount).toFixed(2)}</p>
                <p><strong>Saldo Pendiente:</strong> ${balanceDue.toFixed(2)}</p>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="paymentAmount">Monto a Pagar</label>
                    <input
                        id="paymentAmount"
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="Monto"
                        max={balanceDue.toFixed(2)}
                        step="0.01"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="paymentDate">Fecha de Pago</label>
                    <input
                        id="paymentDate"
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        required
                    />
                </div>
                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={() => navigate(`/invoices/${id}`)}>Cancelar</button>
                    <button type="submit" className="btn-primary">Añadir Pago</button>
                </div>
            </form>
        </div>
    );
};

export default AddPayment;